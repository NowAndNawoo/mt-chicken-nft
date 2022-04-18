import { ethers } from "hardhat";
import { writeFileSync } from "fs";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // local

async function main() {
  // contract
  const factory = await ethers.getContractFactory("MtChickenNFT");
  const contract = factory.attach(CONTRACT_ADDRESS);
  console.log("MtChickenNFT attached to:", contract.address);

  // mint
  const flagsList = [
    [false, false, false, false],
    [true, false, false, false],
    [false, true, false, false],
    [false, false, true, false],
    [false, false, false, true],
    [true, true, true, true],
  ];
  for (let i = 0; i < flagsList.length; i++) {
    const colors = [...Array(12)].map((_) =>
      Math.floor(Math.random() * 0xffffff)
    );
    let tx = await contract.mint(colors, flagsList[i]);
    console.log("mint", i, tx.hash);
    await tx.wait();

    const tokenId = i + 1;
    const uri = await contract.tokenURI(tokenId);
    const json = Buffer.from(uri.split(",")[1], "base64").toString();
    const svg = Buffer.from(
      JSON.parse(json).image.split(",")[1],
      "base64"
    ).toString();
    writeFileSync(`./output/chicken_${tokenId}.svg`, svg);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
