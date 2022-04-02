import { ethers } from "hardhat";

async function main() {
  // deploy
  const factory = await ethers.getContractFactory("NurieNFT");
  const contract = await factory.deploy();
  await contract.deployed();
  console.log("NurieNFT deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
