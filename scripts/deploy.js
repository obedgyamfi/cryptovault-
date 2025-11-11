import {ethers} from "hardhat";

async function  main() {
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy();

    await vault.waitForDeployment();

    const address = await vault.getAddress();
}

main().catch((error) => {
    console.error("Failed Deployment: ", error);
    process.exitCode = 1;
})