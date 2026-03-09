;; Mock sBTC Token (for unit testing only)
;; This implements a simple SIP-010 token with a public mint function
;; to simulate sBTC in the Clarinet simnet environment.
;; NOT FOR DEPLOYMENT -- testing purposes only.

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token sbtc-token)

(define-constant ERR_NOT_TOKEN_OWNER (err u1))

(define-read-only (get-name)
  (ok "sBTC")
)

(define-read-only (get-symbol)
  (ok "sBTC")
)

(define-read-only (get-decimals)
  (ok u8)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance sbtc-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply sbtc-token))
)

(define-read-only (get-token-uri)
  (ok (some u"https://sbtc.tech"))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR_NOT_TOKEN_OWNER)
    (try! (ft-transfer? sbtc-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Public mint for testing -- anyone can call
(define-public (mint (amount uint) (recipient principal))
  (ft-mint? sbtc-token amount recipient)
)
