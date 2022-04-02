import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  // deploy
  const factory = await ethers.getContractFactory("NurieNFT");
  const contract = await factory.deploy();
  await contract.deployed();
  console.log("NurieNFT deployed to:", contract.address);

  // setSvgHead & appendSvgBody
  const svgHead = readFileSync("./data/sample_head.svg");
  const svgBody = readFileSync("./data/sample_body.svg");
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
  tx = await contract.setClassNames({
    head: "cls-1",
    body: "cls-3",
    eye: "cls-5",
    tail: "cls-7",
    scar: "dsp-1",
    moustache: "dsp-2",
    beard: "dsp-3",
  });
  console.log("setClassNames", tx.hash);
  await tx.wait();

  // mint
  const toHex = (s: string) => parseInt(s, 16);
  tx = await contract.mint({
    head: toHex("ff00ff"),
    body: toHex("00ffff"),
    eye: toHex("ffff00"),
    tail: toHex("abcdef"),
    scar: false,
    moustache: true,
    beard: false,
  });
  console.log("mint", tx.hash);
  await tx.wait();

  // SVGの確認
  const tokenId = 1;
  const uri = await contract.tokenURI(tokenId);
  const json = Buffer.from(uri.split(",")[1], "base64").toString();
  console.log(uri);
  const svg = Buffer.from(
    JSON.parse(json).image.split(",")[1],
    "base64"
  ).toString();
  console.log(svg);
  writeFileSync(`./output/sample_${tokenId}.svg`, svg);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
