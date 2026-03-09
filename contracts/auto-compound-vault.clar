;; Caskade Auto-Compound Vault
;; Example yield vault that implements vault-trait.
;; Demonstrates composability: wraps the base sbtc-vault and adds
;; simulated yield accrual via an admin-callable harvest function.
;;
;; How it works:
;; 1. Users deposit sBTC into this vault (which forwards to the underlying sbtc-vault)
;; 2. An operator calls (harvest) to add yield (simulated via mock-sbtc mint)
;; 3. Share price increases -- existing shareholders get more assets per share
;; 4. Users withdraw and receive their original deposit + proportional yield
;;
;; This proves the vault-trait is composable: any protocol can build
;; a new strategy on top of the same interface.

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
(define-constant ERR_NOT_AUTHORIZED (err u403))

;; ---------------------------------------------------------
;; Vault Share Token
;; ---------------------------------------------------------
(define-fungible-token caskade-auto-share)

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------
(define-data-var total-managed-assets uint u0)
(define-data-var deposit-cap uint u21000000000000)
(define-data-var total-yield-harvested uint u0)

;; ---------------------------------------------------------
;; SIP-010 Trait Implementation for Vault Shares
;; ---------------------------------------------------------
(define-read-only (get-name)
  (ok "Caskade Auto-Compound Share")
)

(define-read-only (get-symbol)
  (ok "casBTC")
)

(define-read-only (get-decimals)
  (ok u8)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance caskade-auto-share who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply caskade-auto-share))
)

(define-read-only (get-token-uri)
  (ok (some u"https://caskade.dev/vault/auto-compound"))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    ;; #[filter(amount, recipient)]
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) (err u1))
    (try! (ft-transfer? caskade-auto-share amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; ---------------------------------------------------------
;; Internal Helpers
;; ---------------------------------------------------------
(define-private (calc-shares-for-deposit (assets uint))
  (let
    (
      (supply (ft-get-supply caskade-auto-share))
      (total-assets (var-get total-managed-assets))
    )
    (if (is-eq supply u0)
      assets
      (/ (* assets supply) total-assets)
    )
  )
)

(define-private (calc-assets-for-withdraw (shares uint))
  (let
    (
      (supply (ft-get-supply caskade-auto-share))
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
    (asserts! (> amount u0) ERR_ZERO_AMOUNT)
    (asserts! (> shares-to-mint u0) ERR_ZERO_SHARES)
    (asserts! (<= (+ current-assets amount) (var-get deposit-cap)) ERR_DEPOSIT_LIMIT)

    ;; Transfer sBTC from caller to this vault
    (try! (contract-call? .mock-sbtc
      transfer amount tx-sender current-contract none))

    ;; Mint vault shares
    (try! (ft-mint? caskade-auto-share shares-to-mint tx-sender))

    ;; Update total managed assets
    (var-set total-managed-assets (+ current-assets amount))

    (print {event: "auto-deposit", sender: tx-sender, assets: amount, shares: shares-to-mint})
    (ok shares-to-mint)
  )
)

;; Withdraw sBTC by burning vault shares
(define-public (withdraw (shares uint))
  (let
    (
      (caller tx-sender)
      (assets-to-return (calc-assets-for-withdraw shares))
      (caller-shares (ft-get-balance caskade-auto-share tx-sender))
      (current-assets (var-get total-managed-assets))
    )
    (asserts! (> shares u0) ERR_ZERO_AMOUNT)
    (asserts! (>= caller-shares shares) ERR_INSUFFICIENT_SHARES)
    (asserts! (> assets-to-return u0) ERR_ZERO_ASSETS)

    ;; Burn vault shares
    (try! (ft-burn? caskade-auto-share shares caller))

    ;; Transfer sBTC back to caller
    (try! (transfer-sbtc-out assets-to-return caller))

    ;; Update total managed assets
    (var-set total-managed-assets (- current-assets assets-to-return))

    (print {event: "auto-withdraw", sender: caller, assets: assets-to-return, shares: shares})
    (ok assets-to-return)
  )
)

;; ---------------------------------------------------------
;; Yield Harvesting (Auto-Compound Strategy)
;; ---------------------------------------------------------

;; Simulate yield accrual: operator mints new sBTC into the vault,
;; increasing total-managed-assets without minting new shares.
;; This raises the share price for all existing holders.
(define-public (harvest (yield-amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (> yield-amount u0) ERR_ZERO_AMOUNT)

    ;; Mint simulated yield directly into the vault
    (try! (contract-call? .mock-sbtc mint yield-amount current-contract))

    ;; Increase total managed assets (shares stay the same => price goes up)
    (var-set total-managed-assets (+ (var-get total-managed-assets) yield-amount))
    (var-set total-yield-harvested (+ (var-get total-yield-harvested) yield-amount))

    (print {event: "harvest", yield: yield-amount, total-assets: (var-get total-managed-assets)})
    (ok yield-amount)
  )
)

;; ---------------------------------------------------------
;; Read-Only Vault Functions
;; ---------------------------------------------------------

(define-read-only (get-shares-of (who principal))
  (ok (ft-get-balance caskade-auto-share who))
)

(define-read-only (get-total-assets)
  (ok (var-get total-managed-assets))
)

(define-read-only (get-total-shares)
  (ok (ft-get-supply caskade-auto-share))
)

(define-read-only (convert-to-shares (assets uint))
  (let
    (
      (supply (ft-get-supply caskade-auto-share))
      (total-assets (var-get total-managed-assets))
    )
    (ok (if (is-eq supply u0) assets (/ (* assets supply) total-assets)))
  )
)

(define-read-only (convert-to-assets (shares uint))
  (let
    (
      (supply (ft-get-supply caskade-auto-share))
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
  (ok (ft-get-balance caskade-auto-share who))
)

;; Read the total yield harvested so far
(define-read-only (get-total-yield-harvested)
  (ok (var-get total-yield-harvested))
)

;; ---------------------------------------------------------
;; Admin Functions
;; ---------------------------------------------------------
(define-public (set-deposit-cap (new-cap uint))
  (begin
    ;; #[filter(new-cap)]
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set deposit-cap new-cap)
    (ok true)
  )
)
