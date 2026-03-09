import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const MOCK_SBTC = "mock-sbtc";
const AUTO_VAULT = "auto-compound-vault";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

function mintSbtc(amount: number, recipient: string) {
  simnet.callPublicFn(MOCK_SBTC, "mint", [Cl.uint(amount), Cl.principal(recipient)], deployer);
}

// ---------------------------------------------------------
// Auto-Compound Vault — Basic Vault Trait Compliance
// ---------------------------------------------------------
describe("Auto-Compound Vault — Trait Compliance", () => {
  it("should report zero state initially", () => {
    const assets = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-assets", [], deployer);
    expect(assets.result).toBeOk(Cl.uint(0));

    const shares = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-shares", [], deployer);
    expect(shares.result).toBeOk(Cl.uint(0));
  });

  it("should return correct SIP-010 metadata", () => {
    const name = simnet.callReadOnlyFn(AUTO_VAULT, "get-name", [], deployer);
    expect(name.result).toBeOk(Cl.stringAscii("Caskade Auto-Compound Share"));

    const symbol = simnet.callReadOnlyFn(AUTO_VAULT, "get-symbol", [], deployer);
    expect(symbol.result).toBeOk(Cl.stringAscii("casBTC"));

    const decimals = simnet.callReadOnlyFn(AUTO_VAULT, "get-decimals", [], deployer);
    expect(decimals.result).toBeOk(Cl.uint(8));
  });

  it("should accept deposits and mint 1:1 shares on first deposit", () => {
    mintSbtc(500000, wallet1);
    const result = simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(10000)], wallet1);
    expect(result.result).toBeOk(Cl.uint(10000));

    const assets = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-assets", [], deployer);
    expect(assets.result).toBeOk(Cl.uint(10000));
  });

  it("should reject zero-amount deposit", () => {
    const result = simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(0)], wallet1);
    expect(result.result).toBeErr(Cl.uint(100));
  });

  it("should allow full withdrawal", () => {
    mintSbtc(500000, wallet1);
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(8000)], wallet1);

    const result = simnet.callPublicFn(AUTO_VAULT, "withdraw", [Cl.uint(8000)], wallet1);
    expect(result.result).toBeOk(Cl.uint(8000));

    const assets = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-assets", [], deployer);
    expect(assets.result).toBeOk(Cl.uint(0));
  });
});

// ---------------------------------------------------------
// Auto-Compound Vault — Harvest & Yield
// ---------------------------------------------------------
describe("Auto-Compound Vault — Yield Harvesting", () => {
  it("should allow owner to harvest yield", () => {
    mintSbtc(500000, wallet1);
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(10000)], wallet1);

    const result = simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(2000)], deployer);
    expect(result.result).toBeOk(Cl.uint(2000));

    // Total assets should increase by yield amount
    const assets = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-assets", [], deployer);
    expect(assets.result).toBeOk(Cl.uint(12000));

    // Shares should NOT increase (that's the point of auto-compounding)
    const shares = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-shares", [], deployer);
    expect(shares.result).toBeOk(Cl.uint(10000));
  });

  it("should reject harvest from non-owner", () => {
    const result = simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(1000)], wallet1);
    expect(result.result).toBeErr(Cl.uint(403));
  });

  it("should reject zero-amount harvest", () => {
    const result = simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(0)], deployer);
    expect(result.result).toBeErr(Cl.uint(100));
  });

  it("should track total yield harvested", () => {
    mintSbtc(500000, wallet1);
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(10000)], wallet1);

    simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(1000)], deployer);
    simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(500)], deployer);

    const yieldTotal = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-yield-harvested", [], deployer);
    expect(yieldTotal.result).toBeOk(Cl.uint(1500));
  });
});

// ---------------------------------------------------------
// Auto-Compound Vault — Share Price Appreciation
// ---------------------------------------------------------
describe("Auto-Compound Vault — Share Price After Harvest", () => {
  it("share price increases after harvest", () => {
    mintSbtc(500000, wallet1);
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(10000)], wallet1);

    // Before harvest: 1 share = 1 asset
    const before = simnet.callReadOnlyFn(AUTO_VAULT, "convert-to-assets", [Cl.uint(10000)], deployer);
    expect(before.result).toBeOk(Cl.uint(10000));

    // Harvest 5000 yield
    simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(5000)], deployer);

    // After harvest: 10000 shares backed by 15000 assets
    // 10000 shares => 15000 assets
    const after = simnet.callReadOnlyFn(AUTO_VAULT, "convert-to-assets", [Cl.uint(10000)], deployer);
    expect(after.result).toBeOk(Cl.uint(15000));
  });

  it("user withdraws more than deposited after yield harvest", () => {
    mintSbtc(500000, wallet1);

    // Deposit 10000
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(10000)], wallet1);

    // Harvest 2000 yield
    simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(2000)], deployer);

    // Withdraw all 10000 shares => should get 12000 assets (10000 + 2000 yield)
    const result = simnet.callPublicFn(AUTO_VAULT, "withdraw", [Cl.uint(10000)], wallet1);
    expect(result.result).toBeOk(Cl.uint(12000));
  });

  it("new depositor after harvest gets fewer shares per asset", () => {
    mintSbtc(500000, wallet1);
    mintSbtc(500000, wallet2);

    // wallet1 deposits 10000 => 10000 shares
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(10000)], wallet1);

    // Harvest 10000 yield (doubles the vault assets)
    // Now: 20000 assets / 10000 shares => each share worth 2 assets
    simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(10000)], deployer);

    // wallet2 deposits 10000 assets
    // shares = (10000 * 10000) / 20000 = 5000 shares
    const result = simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(10000)], wallet2);
    expect(result.result).toBeOk(Cl.uint(5000));

    // Verify: wallet1 has 10000 shares, wallet2 has 5000 shares
    const shares1 = simnet.callReadOnlyFn(AUTO_VAULT, "get-shares-of", [Cl.principal(wallet1)], deployer);
    expect(shares1.result).toBeOk(Cl.uint(10000));

    const shares2 = simnet.callReadOnlyFn(AUTO_VAULT, "get-shares-of", [Cl.principal(wallet2)], deployer);
    expect(shares2.result).toBeOk(Cl.uint(5000));

    // Total assets: 30000 (10000 deposit + 10000 yield + 10000 deposit)
    const totalAssets = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(30000));
  });

  it("proportional yield distribution between multiple users", () => {
    mintSbtc(500000, wallet1);
    mintSbtc(500000, wallet2);

    // wallet1 deposits 6000, wallet2 deposits 4000
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(6000)], wallet1);
    simnet.callPublicFn(AUTO_VAULT, "deposit", [Cl.uint(4000)], wallet2);
    // 10000 assets, 10000 shares

    // Harvest 5000 yield => 15000 assets, 10000 shares
    simnet.callPublicFn(AUTO_VAULT, "harvest", [Cl.uint(5000)], deployer);

    // wallet1 has 6000 shares => (6000 * 15000) / 10000 = 9000 assets
    const w1assets = simnet.callReadOnlyFn(AUTO_VAULT, "convert-to-assets", [Cl.uint(6000)], deployer);
    expect(w1assets.result).toBeOk(Cl.uint(9000));

    // wallet2 has 4000 shares => (4000 * 15000) / 10000 = 6000 assets
    const w2assets = simnet.callReadOnlyFn(AUTO_VAULT, "convert-to-assets", [Cl.uint(4000)], deployer);
    expect(w2assets.result).toBeOk(Cl.uint(6000));

    // wallet1 withdraws all
    const w1result = simnet.callPublicFn(AUTO_VAULT, "withdraw", [Cl.uint(6000)], wallet1);
    expect(w1result.result).toBeOk(Cl.uint(9000));

    // wallet2 withdraws all
    const w2result = simnet.callPublicFn(AUTO_VAULT, "withdraw", [Cl.uint(4000)], wallet2);
    expect(w2result.result).toBeOk(Cl.uint(6000));

    // Vault should be empty
    const totalAssets = simnet.callReadOnlyFn(AUTO_VAULT, "get-total-assets", [], deployer);
    expect(totalAssets.result).toBeOk(Cl.uint(0));
  });
});
