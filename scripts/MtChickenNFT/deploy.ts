import { ethers } from "hardhat";

async function main() {
  // deploy
  const factory = await ethers.getContractFactory("MtChickenNFT");
  const contract = await factory.deploy();
  await contract.deployed();
  console.log("MtChickenNFT deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
