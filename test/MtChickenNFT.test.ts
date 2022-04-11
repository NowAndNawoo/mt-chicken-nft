import { expect } from "chai";
import { readFileSync } from "fs";
import { ethers, waffle } from "hardhat";

const { loadFixture } = waffle;

function hexToInt(s: string) {
  return parseInt(s, 16);
}

function betweenText(s: string, start: string, end: string): string {
  const startIndex = s.indexOf(start) + start.length;
  const endIndex = s.indexOf(end, startIndex);
  return s.substring(startIndex, endIndex);
}

describe("MtChickenNFT", function () {
  async function fixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("MtChickenNFT");
    const contract = await factory.deploy();
    await contract.deployed();
    const contractUser1 = contract.connect(user1);
    const contractUser2 = contract.connect(user2);

    const svgHead = readFileSync("./data/sample_head.svg");
    const svgBody = readFileSync("./data/sample_body.svg");
    const splitSize = 12000;
    const splitCount = Math.ceil(svgBody.length / splitSize);
    await contract.setSvgHead(svgHead);
    for (let i = 0; i < splitCount; i++) {
      const buf = svgBody.slice(i * splitSize, (i + 1) * splitSize);
      await contract.appendSvgBody(buf);
    }
    await contract.setClassNames(
      ["cls-1", "cls-3", "cls-5", "cls-7"],
      ["dsp-1", "dsp-2", "dsp-3"]
    );
    return { contract, contractUser1, contractUser2, owner, user1, user2 };
  }
  describe("basic", function () {
    it("deployできる", async function () {
      await loadFixture(fixture);
    });
    it("name&symbolが正しい", async function () {
      const { contract } = await loadFixture(fixture);
      expect(await contract.name()).equal("MtChicken");
      expect(await contract.symbol()).equal("MTCHICKEN");
    });
  });
  describe("mint", function () {
    it("mintできる", async function () {
      const { contract, contractUser1, contractUser2, user1, user2 } =
        await fixture();
      await contractUser1.mint([1, 1, 1, 1], [true, true, true]);
      await contractUser2.mint([2, 2, 2, 2], [false, false, false]);
      expect(await contract.totalSupply()).equal(2);
      expect(await contract.ownerOf(1)).equal(user1.address);
      expect(await contract.ownerOf(2)).equal(user2.address);
    });
    it("mintしていないtokenURIは取得できない", async function () {
      const { contractUser1 } = await fixture();
      await contractUser1.mint([1, 2, 3, 4], [false, false, true]);
      await expect(contractUser1.tokenURI(1)).not.reverted;
      await expect(contractUser1.tokenURI(2)).revertedWith(
        "URI query for nonexistent token"
      );
    });
    it("引数の数が違うとmintできない", async function () {
      const { contractUser2 } = await fixture();
      await expect(
        contractUser2.mint([1, 2, 3, 4, 5], [false, true, false])
      ).revertedWith("colors.length is invalid");
      await expect(
        contractUser2.mint([1, 2, 3, 4], [false, true])
      ).revertedWith("flags.length is invalid");
    });
  });
  describe("metadata", function () {
    let metadata: any;
    beforeEach(async function () {
      const { contract, contractUser1, owner, user1 } = await fixture();
      await contractUser1.mint(
        [
          hexToInt("ff00ff"),
          hexToInt("00ffff"),
          hexToInt("ffff00"),
          hexToInt("abcdef"),
        ],
        [false, true, false]
      );
      const uri = await contract.tokenURI(1);
      metadata = JSON.parse(
        Buffer.from(uri.split(",")[1], "base64").toString()
      );
    });
    it("name&descriptionが正しい", async function () {
      expect(metadata.name).equal("MtChicken #1");
      const description =
        'Mt. Chicken is a NFT collection on the Polygon chain. You can "paint" Mt. Chicken through the website and mint it for only gas fee. No mint number limit, No secondary sale fee, No license(=CC0).';
      expect(metadata.description).equal(description);
    });
    it("traitsが正しい", async function () {
      expect(metadata.attributes.length).equal(2);
      expect(metadata.attributes[0].trait_type).equal("Mount");
      expect(metadata.attributes[0].value).gte(1).lte(100);
      expect(metadata.attributes[1].trait_type).equal("Thru");
      expect(metadata.attributes[1].value).gte(1).lte(100);
    });
    it("svgが正しい", async function () {
      const svg = Buffer.from(
        metadata.image.split(",")[1],
        "base64"
      ).toString();
      expect(svg.startsWith("<svg ")).true;
      expect(svg.endsWith("</svg>")).true;
      const style = betweenText(svg, "<style>", "</style>");
      expect(style).string(".cls-1{fill:#ff00ff;}");
      expect(style).string(".cls-3{fill:#00ffff;}");
      expect(style).string(".cls-5{fill:#ffff00;}");
      expect(style).string(".cls-7{fill:#abcdef;}");
      expect(style).string(".dsp-1{display:none;}");
      expect(style).not.string(".dsp-2{display:none;}");
      expect(style).string(".dsp-3{display:none;}");
    });
  });
});
