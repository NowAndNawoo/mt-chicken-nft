// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

struct Nurie {
    string title;
    bytes svgHead;
    bytes svgBody;
    string[] areaNames; // ex. "Face", "Eyes"...
    string[] classNames; // ex. "cls-1", "cls-2"...
    uint256 mintCount;
}

struct ColorInfo {
    uint256 nurieIndex;
    string[] colors;
}

contract NurieNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public nextTokenId = 1;

    Nurie[] public nurieItems;
    mapping(uint256 => ColorInfo) public colorInfoItems; // tokenId => ColorInfo

    constructor() ERC721("NurieNFT", "NURIE") {
        //
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(uint256 nurieIndex, string[] calldata colors) external {
        require(nurieIndex < nurieItems.length, "nurieIndex out of range");
        Nurie storage nurie = nurieItems[nurieIndex];
        require(
            colors.length == nurie.areaNames.length,
            "colors.length is not equal to areaNames.length"
        );

        uint256 _tokenId = nextTokenId;
        nextTokenId++;
        colorInfoItems[_tokenId] = ColorInfo(nurieIndex, colors);
        nurieItems[nurieIndex].mintCount++;
        _safeMint(_msgSender(), _tokenId);
    }

    function addNurie(
        string calldata title,
        bytes calldata svgHead,
        bytes calldata svgBody,
        string[] calldata areaNames,
        string[] calldata classNames
    ) external onlyOwner {
        require(
            areaNames.length == classNames.length,
            "areaNames.length is not equal to classNames.length"
        );
        nurieItems.push(
            Nurie(title, svgHead, svgBody, areaNames, classNames, 0)
        );
    }

    function appendSvgBody(uint256 nurieIndex, bytes calldata svg)
        external
        onlyOwner
    {
        require(nurieIndex < nurieItems.length, "nurieIndex out of range");
        Nurie storage nurie = nurieItems[nurieIndex];
        nurie.svgBody = abi.encodePacked(nurie.svgBody, svg);
    }

    function clearSvgBody(uint256 nurieIndex) external onlyOwner {
        require(nurieIndex < nurieItems.length, "nurieIndex out of range");
        nurieItems[nurieIndex].svgBody = "";
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(getMetadata(tokenId))
                )
            );
    }

    function getMetadata(uint256 tokenId) private view returns (bytes memory) {
        ColorInfo storage colorInfo = colorInfoItems[tokenId];
        uint256 nurieIndex = colorInfo.nurieIndex;
        string[] memory colors = colorInfo.colors;

        // TODO: attributes

        return
            abi.encodePacked(
                '{"name": "NurieNFT (',
                nurieItems[nurieIndex].title,
                ") #",
                tokenId.toString(),
                '", "description": "(todo) description", "image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(getSvg(nurieIndex, colors))),
                '"}'
            );
    }

    function getSvg(uint256 nurieIndex, string[] memory colors)
        public
        view
        returns (string memory)
    {
        Nurie storage nurie = nurieItems[nurieIndex];
        bytes memory styles = "";
        for (uint256 i = 0; i < colors.length; i++) {
            styles = abi.encodePacked(
                styles,
                ".",
                nurie.classNames[i],
                "{fill:#",
                colors[i],
                ";}"
            );
        }
        return string(abi.encodePacked(nurie.svgHead, styles, nurie.svgBody));
    }
}
