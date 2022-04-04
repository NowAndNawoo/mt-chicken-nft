// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

struct PaintInfo {
    uint24[] colors;
    bool[] flags;
}

struct Traits {
    uint8 mountPower;
    // ...
}

contract NurieNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    bytes16 private constant HEX_SYMBOLS = "0123456789abcdef";

    bytes private svgHead;
    bytes private svgBody;
    string[] private colorClassNames;
    string[] private flagClassNames;
    mapping(uint256 => PaintInfo) private paintsData; // tokenId => PaintInfo
    mapping(uint256 => Traits) private traitsData; // tokenId => Traits

    uint256 public nextTokenId = 1;

    constructor() ERC721("NurieNFT", "NURIE") {}

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(uint24[] calldata colors, bool[] calldata flags) external {
        uint256 _tokenId = nextTokenId;
        nextTokenId++;
        paintsData[_tokenId] = PaintInfo(colors, flags);
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

    function setClassNames(
        string[] memory _colorClassNames,
        string[] memory _flagClassNames
    ) external onlyOwner {
        colorClassNames = _colorClassNames;
        flagClassNames = _flagClassNames;
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
                Base64.encode(getSvg(paintsData[tokenId])),
                '"}'
            );
    }

    function toColorHex(uint24 value) private pure returns (string memory) {
        bytes memory buffer = new bytes(6);
        for (uint256 i = 0; i < 6; i++) {
            buffer[i] = HEX_SYMBOLS[(value >> (4 * (5 - i))) & 0xf];
        }
        return string(buffer);
    }

    function getSvg(PaintInfo memory paintInfo)
        private
        view
        returns (bytes memory)
    {
        bytes memory styles = "";
        for (uint256 i = 0; i < paintInfo.colors.length; i++) {
            styles = abi.encodePacked(
                styles,
                ".",
                colorClassNames[i],
                "{fill:#",
                toColorHex(paintInfo.colors[i]),
                ";}"
            );
        }
        for (uint256 i = 0; i < paintInfo.flags.length; i++) {
            if (!paintInfo.flags[i])
                styles = abi.encodePacked(
                    styles,
                    ".",
                    flagClassNames[i],
                    "{display:none;}"
                );
        }
        return abi.encodePacked(svgHead, styles, svgBody);
    }
}
