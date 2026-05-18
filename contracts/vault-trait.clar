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