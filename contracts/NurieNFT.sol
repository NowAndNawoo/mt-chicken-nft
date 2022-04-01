// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

struct PaintInfo {
    string[10] colors;
    bool[4] flags;
}

struct Traits {
    uint8 mountPower;
    // ...
}

contract NurieNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    bytes private svgHead;
    bytes private svgBody;
    mapping(uint256 => PaintInfo) private paintData; // tokenId => PaintInfo
    mapping(uint256 => Traits) private traitsData; // tokenId => Traits;

    uint256 public nextTokenId = 1;

    constructor() ERC721("NurieNFT", "NURIE") {}

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(string[10] calldata colors, bool[4] calldata flags) external {
        uint256 _tokenId = nextTokenId;
        nextTokenId++;
        paintData[_tokenId] = PaintInfo(colors, flags);
        // TODO: set traitsData
        _safeMint(_msgSender(), _tokenId);
    }

    function setSvgHead(bytes calldata head) external onlyOwner {
        svgHead = head;
    }

    function appendSvgBody(bytes calldata body) external onlyOwner {
        svgBody = abi.encodePacked(svgBody, body);
    }

    function clearSvgBody() external onlyOwner {
        svgBody = "";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "URI query for nonexistent token");
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(getMetadata(tokenId))
                )
            );
    }

    function getMetadata(uint256 tokenId) private view returns (bytes memory) {
        // TODO: traitsDataからattributesを作成
        return
            // TODO: name,descriptionは仮
            abi.encodePacked(
                '{"name": "NurieNFT #',
                tokenId.toString(),
                '", "description": "(todo) description", "image": "data:image/svg+xml;base64,',
                Base64.encode(getSvg(paintData[tokenId])),
                '"}'
            );
    }

    function getSvg(PaintInfo memory paintInfo)
        private
        view
        returns (bytes memory)
    {
        string[10] memory colors = paintInfo.colors;
        bool[4] memory flags = paintInfo.flags;

        // 落書きのon/off切り替え (fill="transparent" にするか display:none を設定)
        string memory faceMark1 = flags[0] ? "#804020" : "transparent"; // TODO:色は仮
        string memory faceMark2 = flags[0] ? "#304020" : "transparent";
        string memory faceMark3 = flags[0] ? "#404020" : "transparent";
        string memory faceMark4 = flags[0] ? "#204020" : "transparent";

        bytes memory styles = abi.encodePacked(
            ".cls-1{fill:", // TODO: クラス名は仮
            colors[0],
            "}",
            ".cls-2{fill:",
            colors[1],
            "}",
            ".cls-3{fill:",
            colors[2],
            "}",
            ".cls-4{fill:",
            colors[3],
            "}",
            ".cls-5{fill:",
            colors[4],
            "}"
            // ...
        );
        styles = abi.encodePacked(
            styles,
            ".cls-11{fill:",
            faceMark1,
            "}",
            ".cls-12{fill:",
            faceMark2,
            "}",
            ".cls-13{fill:",
            faceMark3,
            "}",
            ".cls-14{fill:",
            faceMark4,
            "}"
        );
        return abi.encodePacked(svgHead, styles, svgBody);
    }
}
