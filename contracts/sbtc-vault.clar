;; Caskade sBTC Base Vault
;; Reference implementation of the Caskade vault-trait for sBTC.
;; Accepts sBTC deposits, mints proportional vault shares, and handles withdrawals.
;;
;; NOTE: For local testing, this references .mock-sbtc.
;; For production deployment, replace .mock-sbtc with:
;;   'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token

(impl-trait .vault-trait.vault-trait)
(use-trait ft-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; ---------------------------------------------------------
;; Constants & Errors
;; ---------------------------------------------------------
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_ZERO_AMOUNT (err u100))
(define-constant ERR_INSUFFICIENT_SHARES (err u101))
(define-constant ERR_TRANSFER_FAILED (err u102))
(define-constant ERR_DEPOSIT_LIMIT (err u103))
(define-constant ERR_ZERO_SHARES (err u104))
(define-constant ERR_ZERO_ASSETS (err u105))

;; ---------------------------------------------------------
;; Vault Share Token (SIP-010 compliant fungible token)
;; ---------------------------------------------------------
(define-fungible-token caskade-sbtc-share)

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------
(define-data-var total-managed-assets uint u0)
(define-data-var deposit-cap uint u21000000000000)  ;; 210,000 BTC in sats (hard cap)

;; ---------------------------------------------------------
;; SIP-010 Trait Implementation for Vault Shares
;; ---------------------------------------------------------
(define-read-only (get-name)
  (ok "Caskade sBTC Vault Share")
)

(define-read-only (get-symbol)
  (ok "csBTC")
)

(define-read-only (get-decimals)
  (ok u8)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance caskade-sbtc-share who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply caskade-sbtc-share))
)

(define-read-only (get-token-uri)
  (ok (some u"https://caskade.dev/vault/sbtc"))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    ;; #[filter(amount, recipient)]
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) (err u1))
    (try! (ft-transfer? caskade-sbtc-share amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; ---------------------------------------------------------
;; Internal Helpers
;; ---------------------------------------------------------

;; Calculate shares to mint for a given asset deposit.
;; If no shares exist yet, 1:1 ratio. Otherwise, proportional.
(define-private (calc-shares-for-deposit (assets uint))
  (let
    (
      (supply (ft-get-supply caskade-sbtc-share))
      (total-assets (var-get total-managed-assets))
    )
    (if (is-eq supply u0)
      assets
      (/ (* assets supply) total-assets)
    )
  )
)

;; Calculate assets to return for a given share redemption.
(define-private (calc-assets-for-withdraw (shares uint))
  (let
    (
      (supply (ft-get-supply caskade-sbtc-share))
      (total-assets (var-get total-managed-assets))
    )
    (if (is-eq supply u0)
      u0
      (/ (* shares total-assets) supply)
    )
  )
)

;; ---------------------------------------------------------
;; Private Asset Transfer Helpers
;; ---------------------------------------------------------

;; Transfer sBTC from vault to recipient (Clarity 4 as-contract? with FT allowance)
(define-private (transfer-sbtc-out (amount uint) (recipient principal))
  (as-contract?
    ((with-ft .mock-sbtc "sbtc-token" amount))
    (try! (contract-call? .mock-sbtc
      transfer amount current-contract recipient none))
  )
)

;; ---------------------------------------------------------
;; Vault Trait Implementation
;; ---------------------------------------------------------

;; Deposit sBTC and receive vault shares
(define-public (deposit (amount uint))
  (let
    (
      (shares-to-mint (calc-shares-for-deposit amount))
      (current-assets (var-get total-managed-assets))
    )
    ;; Validate
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (> shares-to-mint u0) ERR_ZERO_SHARES)
    (asserts! (<= (+ current-assets amount) (var-get deposit-cap)) ERR_DEPOSIT_LIMIT)

    ;; Transfer sBTC from caller to vault (current-contract = vault principal)
    (try! (contract-call? .mock-sbtc
      transfer amount tx-sender current-contract none))

    ;; Mint vault shares
    (try! (ft-mint? caskade-sbtc-share shares-to-mint tx-sender))

    ;; Update total managed assets
    (var-set total-managed-assets (+ current-assets amount))

    (print {event: "deposit", sender: tx-sender, assets: amount, shares: shares-to-mint})
    (ok shares-to-mint)
  )
)

;; Withdraw sBTC by burning vault shares
(define-public (withdraw (shares uint))
  (let
    (
      (caller tx-sender)
      (assets-to-return (calc-assets-for-withdraw shares))
      (caller-shares (ft-get-balance caskade-sbtc-share tx-sender))
      (current-assets (var-get total-managed-assets))
    )
    ;; Validate
    (asserts! (> shares u0) ERR_ZERO_AMOUNT)
    (asserts! (>= caller-shares shares) ERR_INSUFFICIENT_SHARES)
    (asserts! (> assets-to-return u0) ERR_ZERO_ASSETS)

    ;; Burn vault shares
    (try! (ft-burn? caskade-sbtc-share shares caller))

    ;; Transfer sBTC back to caller
    (try! (transfer-sbtc-out assets-to-return caller))

    ;; Update total managed assets
    (var-set total-managed-assets (- current-assets assets-to-return))

    (print {event: "withdraw", sender: caller, assets: assets-to-return, shares: shares})
    (ok assets-to-return)
  )
)

;; ---------------------------------------------------------
;; Read-Only Vault Functions
;; ---------------------------------------------------------

(define-read-only (get-shares-of (who principal))
  (ok (ft-get-balance caskade-sbtc-share who))
)

(define-read-only (get-total-assets)
  (ok (var-get total-managed-assets))
)

(define-read-only (get-total-shares)
  (ok (ft-get-supply caskade-sbtc-share))
)

(define-read-only (convert-to-shares (assets uint))
  (let
    (
      (supply (ft-get-supply caskade-sbtc-share))
      (total-assets (var-get total-managed-assets))
    )
    (ok (if (is-eq supply u0) assets (/ (* assets supply) total-assets)))
  )
)

(define-read-only (convert-to-assets (shares uint))
  (let
    (
      (supply (ft-get-supply caskade-sbtc-share))
      (total-assets (var-get total-managed-assets))
    )
    (ok (if (is-eq supply u0) u0 (/ (* shares total-assets) supply)))
  )
)

(define-read-only (get-max-deposit (who principal))
  (let
    (
      (current-assets (var-get total-managed-assets))
      (cap (var-get deposit-cap))
    )
    (ok (if (>= current-assets cap) u0 (- cap current-assets)))
  )
)

(define-read-only (get-max-withdraw (who principal))
  (ok (ft-get-balance caskade-sbtc-share who))
)

;; ---------------------------------------------------------
;; Admin Functions
;; ---------------------------------------------------------

;; Allows the owner to adjust the deposit cap
(define-public (set-deposit-cap (new-cap uint))
  (begin
    ;; #[filter(new-cap)]
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (var-set deposit-cap new-cap)
    (ok true)
  )
)
