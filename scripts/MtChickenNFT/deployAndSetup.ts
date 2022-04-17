import { ethers } from "hardhat";
import { readFileSync, writeFileSync } from "fs";

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
    ["cheeks", "belly"]
  );

  console.log("setClassNames", tx.hash);
  await tx.wait();

  // mint
  // const hexToInt = (s: string) => parseInt(s, 16);
  // tx = await contract.mint(
  //   [
  //     hexToInt("ff00ff"),
  //     hexToInt("00ffff"),
  //     hexToInt("ffff00"),
  //     hexToInt("abcdef"),
  //   ],
  //   [false, true, false]
  // );
  // console.log("mint", tx.hash);
  // await tx.wait();

  // // SVGの確認
  // const tokenId = 1;
  // const uri = await contract.tokenURI(tokenId);
  // const json = Buffer.from(uri.split(",")[1], "base64").toString();
  // console.log(uri);
  // const svg = Buffer.from(
  //   JSON.parse(json).image.split(",")[1],
  //   "base64"
  // ).toString();
  // console.log(svg);
  // writeFileSync(`./output/sample_${tokenId}.svg`, svg);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
