import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const factory = await ethers.getContractFactory("NurieNFT");
  const contract = await factory.deploy();
  await contract.deployed();

  console.log("NurieNFT deployed to:", contract.address);

  const svgBody = fs.readFileSync("./scripts/NurieNFT/108_body.svg", "utf-8");
  console.log("length", svgBody.length);
  const svgBody1 = svgBody.slice(0, 14000);
  const buf = Buffer.from(svgBody1);
  console.log("buf.length", buf.length);

  let tx = await contract.addNurie("First", "", "", [""]);
  console.log("addNurie", tx.hash);
  await tx.wait();
  tx = await contract.appendSvgBody(0, svgBody1);
  // 14000 OK
  // 15000 Transaction gas limit is 30041880 and exceeds block gas limit of 30000000
  console.log("appendSvgBody 1", tx.hash);
  console.log(tx.gasLimit);
  // 14000 gasLimit: BigNumber { value: "29973912" }
  // 12000 gasLimit: BigNumber { value: "29837848" },
  let receipt = await tx.wait();
  // 14000 gasUsed: BigNumber { value: "9987657" },
  // 12000 gasUsed: BigNumber { value: "8558403" },
  console.log(receipt.gasUsed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
