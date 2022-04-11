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
    uint8 mount;
    uint8 thru;
}

contract MtChickenNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;
    bytes16 private constant HEX_SYMBOLS = "0123456789abcdef";

    bytes private svgHead;
    bytes private svgBody;
    string[] private colorClassNames;
    string[] private flagClassNames;
    mapping(uint256 => PaintInfo) private paintsData;
    mapping(uint256 => Traits) private traitsData;

    uint256 public nextTokenId = 1;
    bool public frozen = false;

    constructor() ERC721("MtChicken", "MTCHICKEN") {}

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function freeze() external onlyOwner {
        frozen = true;
    }

    function mint(uint24[] calldata colors, bool[] calldata flags) external {
        require(
            colors.length == colorClassNames.length,
            "colors.length is invalid"
        );
        require(
            flags.length == flagClassNames.length,
            "flags.length is invalid"
        );
        uint256 _tokenId = nextTokenId;
        nextTokenId++;
        paintsData[_tokenId] = PaintInfo(colors, flags);
        traitsData[_tokenId] = getTraits(_tokenId);
        _safeMint(_msgSender(), _tokenId);
    }

    function getTraits(uint256 tokenId)
        private
        view
        returns (Traits memory traits)
    {
        uint256 rand = uint256(
            keccak256(abi.encodePacked(tokenId, block.timestamp))
        );
        traits.mount = uint8((rand % 100) + 1);
        traits.thru = uint8(((rand / 100) % 100) + 1);
    }

    function setSvgHead(bytes calldata head) external onlyOwner {
        require(!frozen, "Data is frozen");
        svgHead = head;
    }

    function appendSvgBody(bytes calldata body) external onlyOwner {
        require(!frozen, "Data is frozen");
        svgBody = abi.encodePacked(svgBody, body);
    }

    function clearSvgBody() external onlyOwner {
        require(!frozen, "Data is frozen");
        svgBody = "";
    }

    function setClassNames(
        string[] memory _colorClassNames,
        string[] memory _flagClassNames
    ) external onlyOwner {
        require(!frozen, "Data is frozen");
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
        Traits storage traits = traitsData[tokenId];
        bytes memory attributes = abi.encodePacked(
            '{"trait_type": "Mount", "value": ',
            uint256(traits.mount).toString(),
            '}, {"trait_type": "Thru", "value": ',
            uint256(traits.thru).toString(),
            "}"
        );
        bytes
            memory description = 'Mt. Chicken is a NFT collection on the Polygon chain. You can \\"paint\\" Mt. Chicken through the website and mint it for only gas fee. No mint number limit, No secondary sale fee, No license(=CC0).';
        return
            abi.encodePacked(
                '{"name": "MtChicken #',
                tokenId.toString(),
                '", "description": "',
                description,
                '", "image": "data:image/svg+xml;base64,',
                Base64.encode(getSvg(paintsData[tokenId])),
                '", "attributes": [',
                attributes,
                "]}"
            );
    }

    function toHex(uint24 value) private pure returns (string memory) {
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
                toHex(paintInfo.colors[i]),
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
