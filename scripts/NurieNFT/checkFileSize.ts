import { ethers } from "hardhat";
import { readFileSync } from "fs";

async function main() {
  const factory = await ethers.getContractFactory("NurieNFT");
  const contract = await factory.deploy();
  await contract.deployed();

  console.log("NurieNFT deployed to:", contract.address);
  const svgBody = readFileSync("./data/26kb.svg");
  console.log("length", svgBody.length);
  const buf = svgBody.slice(0, 14000);
  console.log("buf.length", buf.length);

  let tx = await contract.addNurie(
    "First",
    Buffer.from(""),
    Buffer.from(""),
    [""],
    [""]
  );
  console.log("addNurie", tx.hash);
  await tx.wait();
  tx = await contract.appendSvgBody(0, buf);
  // 15000 Transaction gas limit is 30041880 and exceeds block gas limit of 30000000
  // 14000 OK
  console.log("appendSvgBody 1", tx.hash);
  console.log(tx.gasLimit);
  // 14000 gasLimit: BigNumber { value: "29973912" },
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
