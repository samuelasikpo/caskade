;; Caskade Vault Trait
;; A composable vault standard for sBTC on Stacks (inspired by ERC-4626).
;; This trait defines the interface that all Caskade-compatible vaults must implement.
;; Any protocol can build yield strategies on top of this trait.

(define-trait vault-trait
  (
    ;; Deposit underlying assets (sBTC) and mint vault shares to the sender.
    ;; Returns the number of shares minted.
    (deposit (uint) (response uint uint))

    ;; Withdraw underlying assets by burning the caller's vault shares.
    ;; Takes the number of shares to redeem.
    ;; Returns the amount of underlying assets returned.
    (withdraw (uint) (response uint uint))

    ;; Returns the vault share balance for a given principal.
    (get-shares-of (principal) (response uint uint))

    ;; Returns the total underlying assets held by the vault.
    (get-total-assets () (response uint uint))

    ;; Returns the total vault shares in circulation.
    (get-total-shares () (response uint uint))

    ;; Converts an amount of underlying assets to the equivalent vault shares.
    (convert-to-shares (uint) (response uint uint))

    ;; Converts an amount of vault shares to the equivalent underlying assets.
    (convert-to-assets (uint) (response uint uint))

    ;; Returns the maximum amount of underlying assets a principal can deposit.
    (get-max-deposit (principal) (response uint uint))

    ;; Returns the maximum number of shares a principal can redeem.
    (get-max-withdraw (principal) (response uint uint))
  )
)
