import { expect } from "chai";
import { ethers } from "hardhat";

describe("NurieNFT", function () {
  it("deploy", async function () {
    const factory = await ethers.getContractFactory("NurieNFT");
    const contract = await factory.deploy();
    await contract.deployed();
  });
  // it("toColorHex", async function () {
  //   const factory = await ethers.getContractFactory("NurieNFT");
  //   const contract = await factory.deploy();
  //   await contract.deployed();

  //   const hexList = [
  //     "abcdef",
  //     "123456",
  //     "ffccaa",
  //     "010203",
  //     "000000",
  //     "ffffff",
  //   ];
  //   for (const hex of hexList) {
  //     expect(await contract.toColorHex(parseInt(hex, 16))).equal(hex);
  //   }
  // });
});
