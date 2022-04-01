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

  // mint
  tx = await contract.mint(
    [
      "#ff00ff",
      "#00ff00",
      "#ff00ff",
      "#00ff00",
      "#ff00ff",
      "#00ff00",
      "#ff00ff",
      "#00ff00",
      "#ff00ff",
      "#00ff00",
    ],
    [true, true, false, false]
  );
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
