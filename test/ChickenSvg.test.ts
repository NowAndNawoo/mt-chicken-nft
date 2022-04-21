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

describe("ChickenSVG", function () {
  async function fixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("MtChickenNFT");
    const contract = await factory.deploy();
    await contract.deployed();
    const contractUser1 = contract.connect(user1);
    const contractUser2 = contract.connect(user2);

    const svgHead = readFileSync("./data/chicken_head.svg");
    const svgBody = readFileSync("./data/chicken_body.svg");
    const splitSize = 12000;
    const splitCount = Math.ceil(svgBody.length / splitSize);
    await contract.setSvgHead(svgHead);
    for (let i = 0; i < splitCount; i++) {
      const buf = svgBody.slice(i * splitSize, (i + 1) * splitSize);
      await contract.appendSvgBody(buf);
    }
    await contract.setClassNames(
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
    return { contract, contractUser1, contractUser2, owner, user1, user2 };
  }

  describe("metadata", function () {
    let metadata: any;
    beforeEach(async function () {
      const { contract, contractUser1 } = await loadFixture(fixture);
      await contractUser1.mint(
        [
          hexToInt("010101"),
          hexToInt("020202"),
          hexToInt("030303"),
          hexToInt("040404"),
          hexToInt("050505"),
          hexToInt("060606"),
          hexToInt("070707"),
          hexToInt("080808"),
          hexToInt("090909"),
          hexToInt("101010"),
          hexToInt("111111"),
          hexToInt("121212"),
        ],
        [false, true, false, true]
      );
      const uri = await contract.tokenURI(1);
      metadata = JSON.parse(
        Buffer.from(uri.split(",")[1], "base64").toString()
      );
    });
    it("svgが正しい", async function () {
      const svg = Buffer.from(
        metadata.image.split(",")[1],
        "base64"
      ).toString();
      expect(svg.startsWith("<svg ")).true;
      expect(svg.endsWith("</svg>")).true;
      const style = betweenText(svg, "<style>", "</style>");
      expect(style).string(".outline{fill:#010101;}");
      expect(style).string(".cockscomb{fill:#020202;}");
      expect(style).string(".eyes{fill:#030303;}");
      expect(style).string(".face{fill:#040404;}");
      expect(style).string(".faceshadow{fill:#050505;}");
      expect(style).string(".body{fill:#060606;}");
      expect(style).string(".bodyshadow{fill:#070707;}");
      expect(style).string(".tail{fill:#080808;}");
      expect(style).string(".tailshadow{fill:#090909;}");
      expect(style).string(".wattle{fill:#101010;}");
      expect(style).string(".beak{fill:#111111;}");
      expect(style).string(".foot{fill:#121212;}");
      expect(style).string(".forehead{display:none;}");
      expect(style).not.string(".nose{display:none;}");
      expect(style).string(".cheek{display:none;}");
      expect(style).not.string(".berry{display:none;}");
    });
  });
});
