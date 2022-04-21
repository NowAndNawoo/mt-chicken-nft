import { ethers } from "hardhat";
import { readFileSync } from "fs";

async function main() {
  // deploy
  const factory = await ethers.getContractFactory("MtChickenNFT");
  const contract = await factory.deploy();
  await contract.deployed();
  console.log("MtChickenNFT deployed to:", contract.address);

  // setSvgHead & appendSvgBody
  const svgHead = readFileSync("./data/chicken_head.svg");
  const svgBody = readFileSync("./data/chicken_body.svg");
  const splitSize = 12000;
  const splitCount = Math.ceil(svgBody.length / splitSize);
  console.log("splitCount", splitCount);
  let tx = await contract.setSvgHead(svgHead);
  console.log("setSvgHead", tx.hash);
  await tx.wait();
  for (let i = 0; i < splitCount; i++) {
    const buf = svgBody.slice(i * splitSize, (i + 1) * splitSize);
    tx = await contract.appendSvgBody(buf);
    console.log("appendSvgBody", i, buf.length, tx.hash);
    await tx.wait();
  }
  // setClassNames
  tx = await contract.setClassNames(
    [
      "outline",
      "cockscomb",
      "eyes",
      "face",
      "faceshadow",
      "body",
      "bodyshadow",
      "tail",
      "tailshadow",
      "wattle",
      "beak",
      "foot",
    ],
    ["forehead", "nose", "cheek", "berry"]
  );
  console.log("setClassNames", tx.hash);
  await tx.wait();

  // 1枚目をミント (色なしバージョン)
  const hexToInt = (s: string) => parseInt(s, 16);
  tx = await contract.mint(
    [
      hexToInt("999999"),
      hexToInt("b3b3b3"),
      hexToInt("999999"),
      hexToInt("ffffff"),
      hexToInt("cccccc"),
      hexToInt("e6e6e6"),
      hexToInt("b3b3b3"),
      hexToInt("ffffff"),
      hexToInt("cccccc"),
      hexToInt("b3b3b3"),
      hexToInt("cccccc"),
      hexToInt("cccccc"),
    ],
    [false, false, false, false]
  );
  console.log("mint#1", tx.hash);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
