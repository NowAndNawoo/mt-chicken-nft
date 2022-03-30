import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  // deploy
  const factory = await ethers.getContractFactory("NurieNFT");
  const contract = await factory.deploy();
  await contract.deployed();
  console.log("NurieNFT deployed to:", contract.address);

  // addNurie & appendSvgBody
  const svgHead = readFileSync("./input/108_head.svg");
  const svgBody = readFileSync("./input/108_body.svg");
  const splitSize = 12000;
  const splitCount = Math.ceil(svgBody.length / splitSize);
  console.log("splitCount", splitCount);
  const classes = [
    // ユーザーが色を変更できるクラス名とその名称
    ["cls-1", "Background"],
    ["cls-2", "Face1"],
    ["cls-3", "Face2"],
    ["cls-4", "Body"],
    ["cls-5", "Hand"],
    ["cls-6", "Mouth"],
    ["cls-7", "LeftEye"],
    ["cls-8", "RightEye"],
  ];
  const areaNames = classes.map(([_, a]) => a);
  const classNames = classes.map(([c, _]) => c);

  let tx = await contract.addNurie(
    "First",
    svgHead,
    Buffer.from(""),
    areaNames,
    classNames
  );
  console.log("addNurie", tx.hash);
  await tx.wait();
  for (let i = 0; i < splitCount; i++) {
    const buf = svgBody.slice(i * splitSize, (i + 1) * splitSize);
    console.log("i=", i, buf.length);
    tx = await contract.appendSvgBody(0, buf);
    console.log("appendSvgBody", i, tx.hash);
    await tx.wait();
  }

  // mint
  const colors = [
    "ff00ff", // Background
    "808080", // Face1
    "002020", // ...
    "0040ff",
    "8060ff",
    "00ff00",
    "008000",
    "00a0c0",
  ];
  tx = await contract.mint(0, colors);
  console.log("mint", tx.hash);
  await tx.wait();

  // SVGの確認
  const tokenId = 1;
  const uri = await contract.tokenURI(tokenId);
  const json = Buffer.from(uri.split(",")[1], "base64").toString();
  const svg = Buffer.from(
    JSON.parse(json).image.split(",")[1],
    "base64"
  ).toString();
  console.log(svg);
  writeFileSync(`./output/nft_${tokenId}.svg`, svg);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
