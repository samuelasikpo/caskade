import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const MOCK_SBTC = "mock-sbtc";
const VAULT_CONTRACT = "sbtc-vault";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

/** Mint mock sBTC to a wallet for testing */
function mintSbtc(amount: number, recipient: string) {
  simnet.callPublicFn(MOCK_SBTC, "mint", [Cl.uint(amount), Cl.principal(recipient)], deployer);
}

// ---------------------------------------------------------
// Vault Trait — Read-Only Functions
// ---------------------------------------------------------
describe("Caskade Vault — Read-Only Functions", () => {
  it("should report zero total assets initially", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-assets", [], deployer);
    expect(result.result).toBeOk(Cl.uint(0));
  });

  it("should report zero total shares initially", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-shares", [], deployer);
    expect(result.result).toBeOk(Cl.uint(0));
  });

  it("should return full deposit cap as max deposit initially", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-max-deposit", [Cl.principal(wallet1)], deployer);
    expect(result.result).toBeOk(Cl.uint(21000000000000));
  });

  it("should return zero max withdraw for user with no shares", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-max-withdraw", [Cl.principal(wallet1)], deployer);
    expect(result.result).toBeOk(Cl.uint(0));
  });

  it("convert-to-shares returns 1:1 when vault is empty", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "convert-to-shares", [Cl.uint(1000)], deployer);
    expect(result.result).toBeOk(Cl.uint(1000));
  });

  it("convert-to-assets returns 0 when vault is empty", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "convert-to-assets", [Cl.uint(1000)], deployer);
    expect(result.result).toBeOk(Cl.uint(0));
  });
});

// ---------------------------------------------------------
// Vault — Deposit Flow
// ---------------------------------------------------------
describe("Caskade Vault — Deposit", () => {
  it("should reject zero-amount deposit", () => {
    const result = simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(0)], wallet1);
    expect(result.result).toBeErr(Cl.uint(100));
  });

  it("should accept sBTC deposit and mint shares 1:1 on first deposit", () => {
    // Fund wallet1 with mock sBTC
    mintSbtc(100000, wallet1);

    // Deposit 5000 sats into vault
    const depositResult = simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(5000)], wallet1);
    expect(depositResult.result).toBeOk(Cl.uint(5000)); // 1:1 shares on first deposit

    // Check shares
    const shares = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet1)], deployer);
    expect(shares.result).toBeOk(Cl.uint(5000));

    // Check total assets
    const totalAssets = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(5000));
  });

  it("should mint proportional shares on subsequent deposits", () => {
    // Fund both wallets
    mintSbtc(100000, wallet1);
    mintSbtc(100000, wallet2);

    // First deposit: wallet1 deposits 10000
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);

    // Second deposit: wallet2 deposits 5000
    const depositResult = simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(5000)], wallet2);
    // With 10000 assets / 10000 shares, 5000 assets => 5000 shares
    expect(depositResult.result).toBeOk(Cl.uint(5000));

    // Total assets should now be 15000
    const totalAssets = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(15000));
  });
});

// ---------------------------------------------------------
// Vault — Withdraw Flow
// ---------------------------------------------------------
describe("Caskade Vault — Withdraw", () => {
  it("should reject zero-share withdrawal", () => {
    const result = simnet.callPublicFn(VAULT_CONTRACT, "withdraw", [Cl.uint(0)], wallet1);
    expect(result.result).toBeErr(Cl.uint(100));
  });

  it("should reject withdrawal exceeding share balance", () => {
    const result = simnet.callPublicFn(VAULT_CONTRACT, "withdraw", [Cl.uint(9999)], wallet1);
    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should withdraw proportional assets for burned shares", () => {
    // Fund wallet1
    mintSbtc(100000, wallet1);

    // Setup: deposit 10000 (wallet pre-funded with sBTC)
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);

    // Withdraw 5000 shares
    const withdrawResult = simnet.callPublicFn(VAULT_CONTRACT, "withdraw", [Cl.uint(5000)], wallet1);
    expect(withdrawResult.result).toBeOk(Cl.uint(5000)); // 1:1 in simple case

    // Remaining shares
    const shares = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet1)], deployer);
    expect(shares.result).toBeOk(Cl.uint(5000));

    // Remaining assets
    const totalAssets = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(5000));
  });

  it("should allow full withdrawal", () => {
    // Fund wallet1
    mintSbtc(100000, wallet1);

    // Setup
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(8000)], wallet1);

    // Full withdraw
    const withdrawResult = simnet.callPublicFn(VAULT_CONTRACT, "withdraw", [Cl.uint(8000)], wallet1);
    expect(withdrawResult.result).toBeOk(Cl.uint(8000));

    // Zero state
    const totalAssets = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(0));

    const totalShares = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-shares", [], deployer);
    expect(totalShares.result).toBeOk(Cl.uint(0));
  });
});

// ---------------------------------------------------------
// Vault Share Token — SIP-010 Metadata
// ---------------------------------------------------------
describe("Caskade Vault Share — SIP-010 Metadata", () => {
  it("should return correct token name", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-name", [], deployer);
    expect(result.result).toBeOk(Cl.stringAscii("Caskade sBTC Vault Share"));
  });

  it("should return correct symbol", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-symbol", [], deployer);
    expect(result.result).toBeOk(Cl.stringAscii("csBTC"));
  });

  it("should return 8 decimals", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-decimals", [], deployer);
    expect(result.result).toBeOk(Cl.uint(8));
  });
});

// ---------------------------------------------------------
// Admin — Deposit Cap
// ---------------------------------------------------------
describe("Caskade Vault — Admin", () => {
  it("should allow owner to set deposit cap", () => {
    const result = simnet.callPublicFn(VAULT_CONTRACT, "set-deposit-cap", [Cl.uint(500000)], deployer);
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should reject non-owner from setting deposit cap", () => {
    const result = simnet.callPublicFn(VAULT_CONTRACT, "set-deposit-cap", [Cl.uint(500000)], wallet1);
    expect(result.result).toBeErr(Cl.uint(403));
  });
});

// ---------------------------------------------------------
// Edge Cases — Deposit Cap Enforcement
// ---------------------------------------------------------
describe("Caskade Vault — Deposit Cap", () => {
  it("should reject deposit exceeding cap", () => {
    mintSbtc(1000000, wallet1);
    // Set cap to 5000
    simnet.callPublicFn(VAULT_CONTRACT, "set-deposit-cap", [Cl.uint(5000)], deployer);
    // Try depositing 6000 — should fail with ERR_DEPOSIT_LIMIT
    const result = simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(6000)], wallet1);
    expect(result.result).toBeErr(Cl.uint(103));
  });

  it("should allow deposit exactly at cap", () => {
    mintSbtc(1000000, wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "set-deposit-cap", [Cl.uint(10000)], deployer);
    const result = simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);
    expect(result.result).toBeOk(Cl.uint(10000));
  });

  it("should reject second deposit that would exceed cap", () => {
    mintSbtc(1000000, wallet1);
    mintSbtc(1000000, wallet2);
    simnet.callPublicFn(VAULT_CONTRACT, "set-deposit-cap", [Cl.uint(8000)], deployer);
    // First deposit fits
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(5000)], wallet1);
    // Second deposit would push total to 10000 > 8000 cap
    const result = simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(5000)], wallet2);
    expect(result.result).toBeErr(Cl.uint(103));
  });

  it("get-max-deposit reflects remaining cap after deposits", () => {
    mintSbtc(1000000, wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "set-deposit-cap", [Cl.uint(20000)], deployer);
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(7500)], wallet1);
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-max-deposit", [Cl.principal(wallet2)], deployer);
    expect(result.result).toBeOk(Cl.uint(12500));
  });
});

// ---------------------------------------------------------
// Edge Cases — Multi-User Share Math & Rounding
// ---------------------------------------------------------
describe("Caskade Vault — Multi-User Share Math", () => {
  it("should track shares independently per user", () => {
    mintSbtc(1000000, wallet1);
    mintSbtc(1000000, wallet2);

    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(3000)], wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(7000)], wallet2);

    const shares1 = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet1)], deployer);
    const shares2 = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet2)], deployer);
    expect(shares1.result).toBeOk(Cl.uint(3000));
    expect(shares2.result).toBeOk(Cl.uint(7000));

    const totalShares = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-shares", [], deployer);
    expect(totalShares.result).toBeOk(Cl.uint(10000));
  });

  it("should handle integer division rounding (floor) on share calculation", () => {
    mintSbtc(1000000, wallet1);
    mintSbtc(1000000, wallet2);

    // wallet1 deposits 10000 => gets 10000 shares (1:1)
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);

    // wallet2 deposits 3 sats with 10000 assets / 10000 shares
    // shares = (3 * 10000) / 10000 = 3 (exact in this case)
    const result = simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(3)], wallet2);
    expect(result.result).toBeOk(Cl.uint(3));
  });

  it("should allow one user to withdraw without affecting another", () => {
    mintSbtc(1000000, wallet1);
    mintSbtc(1000000, wallet2);

    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(5000)], wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(5000)], wallet2);

    // wallet1 withdraws everything
    simnet.callPublicFn(VAULT_CONTRACT, "withdraw", [Cl.uint(5000)], wallet1);

    // wallet2 still has shares
    const shares2 = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet2)], deployer);
    expect(shares2.result).toBeOk(Cl.uint(5000));

    // wallet1 has zero shares
    const shares1 = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet1)], deployer);
    expect(shares1.result).toBeOk(Cl.uint(0));

    // Total assets = only wallet2's deposit
    const totalAssets = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(5000));
  });

  it("convert-to-shares and convert-to-assets are consistent after deposits", () => {
    mintSbtc(1000000, wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);

    // 5000 assets => 5000 shares (1:1 ratio)
    const shares = simnet.callReadOnlyFn(VAULT_CONTRACT, "convert-to-shares", [Cl.uint(5000)], deployer);
    expect(shares.result).toBeOk(Cl.uint(5000));

    // 5000 shares => 5000 assets (1:1 ratio)
    const assets = simnet.callReadOnlyFn(VAULT_CONTRACT, "convert-to-assets", [Cl.uint(5000)], deployer);
    expect(assets.result).toBeOk(Cl.uint(5000));
  });
});

// ---------------------------------------------------------
// Edge Cases — Share Transfers
// ---------------------------------------------------------
describe("Caskade Vault — Share Transfers", () => {
  it("should allow transferring vault shares between users", () => {
    mintSbtc(1000000, wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);

    // wallet1 transfers 4000 shares to wallet2
    const result = simnet.callPublicFn(
      VAULT_CONTRACT, "transfer",
      [Cl.uint(4000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));

    const shares1 = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet1)], deployer);
    expect(shares1.result).toBeOk(Cl.uint(6000));

    const shares2 = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-shares-of", [Cl.principal(wallet2)], deployer);
    expect(shares2.result).toBeOk(Cl.uint(4000));
  });

  it("should reject share transfer from unauthorized sender", () => {
    mintSbtc(1000000, wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);

    // wallet2 tries to transfer wallet1's shares without authorization
    const result = simnet.callPublicFn(
      VAULT_CONTRACT, "transfer",
      [Cl.uint(1000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet2
    );
    expect(result.result).toBeErr(Cl.uint(1));
  });

  it("recipient can withdraw after receiving transferred shares", () => {
    mintSbtc(1000000, wallet1);
    simnet.callPublicFn(VAULT_CONTRACT, "deposit", [Cl.uint(10000)], wallet1);

    // Transfer 5000 shares to wallet2
    simnet.callPublicFn(
      VAULT_CONTRACT, "transfer",
      [Cl.uint(5000), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
      wallet1
    );

    // wallet2 withdraws those shares
    const result = simnet.callPublicFn(VAULT_CONTRACT, "withdraw", [Cl.uint(5000)], wallet2);
    expect(result.result).toBeOk(Cl.uint(5000));

    // Vault assets should be halved
    const totalAssets = simnet.callReadOnlyFn(VAULT_CONTRACT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(5000));
  });
});
