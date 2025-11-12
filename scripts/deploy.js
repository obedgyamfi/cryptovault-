import {network} from "hardhat";

async function  main() {
    const { ethers } =  await network.connect("localhost"); 

    const vault = await ethers.deployContract("Vault");
    await vault.waitForDeployment();

    const address = await vault.getAddress();
    console.log("Vault deployed at: ", await vault.getAddress());
}

main().catch((error) => {
    console.error("Failed Deployment: ", error);
    process.exitCode = 1;
})