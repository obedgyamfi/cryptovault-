// test/Vault.test.ts
import { network } from "hardhat";
import { describe, it, beforeEach } from "node:test";
import { expect } from "chai";

describe("Vault (Hardhat 3 style)", async () => {
  const { ethers } = await network.connect();
  let vault: any;
  let owner: any;
  let user: any;

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
});
