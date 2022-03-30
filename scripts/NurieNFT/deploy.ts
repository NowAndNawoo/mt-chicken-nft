import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const factory = await ethers.getContractFactory("NurieNFT");
  const contract = await factory.deploy();
  await contract.deployed();

  console.log("NurieNFT deployed to:", contract.address);

  const svgHead = fs.readFileSync("./input/108_head.svg", "utf-8");
  const svgBody = fs.readFileSync("./input/108_body.svg", "utf-8");
  const splitSize = 12000;
  const splitCount = Math.ceil(svgBody.length / splitSize);
  console.log("splitCount", splitCount);

  const colorNames = [
    "Background",
    "Face1",
    "Face2",
    "Body1",
    "Body2",
    "Mouth1",
    "Mouth2",
    "Eye",
  ]; // 適当です

  let tx = await contract.addNurie("First", svgHead, "", colorNames);
  console.log("addNurie", tx.hash);
  await tx.wait();
  for (let i = 0; i < splitCount; i++) {
    const s = svgBody.slice(i * splitSize, (i + 1) * splitSize);
    console.log("i=", i, s.length);
    tx = await contract.appendSvgBody(0, s);
    console.log("appendSvgBody", i, tx.hash);
    await tx.wait();
  }

  const colors = [
    "ff00ff",
    "808080",
    "ff8040",
    "0040ff",
    "8060ff",
    "00ff00",
    "008000",
    "00a0c0",
  ];
  tx = await contract.mint(0, colors);
  console.log("mint", tx.hash);
  await tx.wait();

  const tokenId = 1;
  const uri = await contract.tokenURI(tokenId);
  const json = Buffer.from(uri.split(",")[1], "base64").toString();
  const svg = Buffer.from(
    JSON.parse(json).image.split(",")[1],
    "base64"
  ).toString();
  console.log(svg);
  fs.writeFileSync(`./output/nft_${tokenId}.svg`, svg);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
