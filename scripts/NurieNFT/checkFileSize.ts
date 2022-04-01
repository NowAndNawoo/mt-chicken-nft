import { ethers } from "hardhat";
import { readFileSync } from "fs";

async function main() {
  const factory = await ethers.getContractFactory("NurieNFT");
  const contract = await factory.deploy();
  await contract.deployed();

  console.log("NurieNFT deployed to:", contract.address);
  const svgBody = readFileSync("./data/26kb.svg");
  console.log("svg.length", svgBody.length);
  const buf = svgBody.slice(0, 14000);
  console.log("buf.length", buf.length);

  let tx = await contract.appendSvgBody(buf);
  // 15000 Transaction gas limit is 30041752 and exceeds block gas limit of 30000000
  // 14000 OK
  console.log("appendSvgBody", tx.hash);
  let receipt = await tx.wait();
  // 14000 gasUsed: BigNumber { value: "9985011" },
  // 12000 gasUsed: BigNumber { value: "8555757" },
  console.log(receipt.gasUsed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
