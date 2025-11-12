// test/Vault.test.ts
import { network } from "hardhat";
import { describe, it, beforeEach, before, after } from "node:test";
import { expect } from "chai";

describe("Vault (Hardhat 3 style)", () => {
  let ethers: Awaited<ReturnType<typeof network.connect>>["ethers"];
  let vault: any;
  let owner: any;
  let user: any;

  before(async () => {
    ({ ethers } = await network.connect());
  });

  after(async () => {
    await network.disconnect();
  });

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // Recommended deploy helper for HH3
    vault = await ethers.deployContract("Vault");
    await vault.waitForDeployment();
  });

  it("accepts deposits", async () => {
    const amount = ethers.parseEther("1.0");
    await vault.connect(user).deposit({ value: amount });
    const balance = await vault.getBalance(user.address);
    expect(balance).to.equal(amount);
  });

  it("accepts plain ETH transfers", async () => {
    const amount = ethers.parseEther("0.4");
    await user.sendTransaction({
      to: await vault.getAddress(),
      value: amount,
    });

    const balance = await vault.getBalance(user.address);
    expect(balance).to.equal(amount);
  });

  it("handles withdrawals", async () => {
    const deposit = ethers.parseEther("1.0");
    const withdraw = ethers.parseEther("0.3");

    await vault.connect(user).deposit({ value: deposit });
    await vault.connect(user).withdraw(withdraw);

    const remaining = await vault.getBalance(user.address);
    expect(remaining).to.equal(deposit - withdraw);
  });

  it("reverts on insufficient balance", async () => {
    const tooMuch = ethers.parseEther("1.0");
    await expect(vault.connect(user).withdraw(tooMuch)).to.be.revertedWith(
      "Insufficient balance"
    );
  });

  it("reverts on zero-value deposit and withdrawal", async () => {
    await expect(
      vault.connect(user).deposit({ value: 0n })
    ).to.be.revertedWith("Deposit must be greater than 0");

    await expect(vault.connect(user).withdraw(0)).to.be.revertedWith(
      "Amount must be greater than 0"
    );
  });

  it("only lets the owner trigger emergency withdrawals", async () => {
    const deposit = ethers.parseEther("0.25");
    await vault.connect(user).deposit({ value: deposit });

    await expect(
      vault.connect(user).emergencyWithdraw(user.address, user.address)
    ).to.be.revertedWithCustomError(vault, "Unauthorized");

    await expect(
      vault.connect(owner).emergencyWithdraw(user.address, owner.address)
    )
      .to.emit(vault, "EmergencyWithdrawn")
      .withArgs(user.address, owner.address, deposit);

    const vaultBalance = await vault.getVaultBalance();
    expect(vaultBalance).to.equal(0n);

    const recoveredUserBalance = await vault.getBalance(user.address);
    expect(recoveredUserBalance).to.equal(0n);
  });
});
