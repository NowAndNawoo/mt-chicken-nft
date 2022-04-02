// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

struct ClassNames {
    string head;
    string body;
    string eye;
    string tail;
    // ...
    string scar;
    string moustache;
    string beard;
    // ...
}

struct Colors {
    uint24 head;
    uint24 body;
    uint24 eye;
    uint24 tail;
    // ...
    bool scar;
    bool moustache;
    bool beard;
    // ...
}

struct Traits {
    uint8 mountPower;
    // ...
}

contract NurieNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    bytes private svgHead;
    bytes private svgBody;
    ClassNames private classNames;
    mapping(uint256 => Colors) private colorsData; // tokenId => Colors
    mapping(uint256 => Traits) private traitsData; // tokenId => Traits

    uint256 public nextTokenId = 1;

    constructor() ERC721("NurieNFT", "NURIE") {}

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(Colors calldata colors) external {
        uint256 _tokenId = nextTokenId;
        nextTokenId++;
        colorsData[_tokenId] = colors;
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

    function setClassNames(ClassNames calldata _classNames) external onlyOwner {
        classNames = _classNames;
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
                Base64.encode(getSvg(colorsData[tokenId])),
                '"}'
            );
    }

    function getSvg(Colors memory colors) private view returns (bytes memory) {
        bytes memory styles = abi.encodePacked(
            ".",
            classNames.head,
            "{fill:#",
            uint256(colors.head).toHexString(3),
            "}",
            ".",
            classNames.body,
            "{fill:#",
            uint256(colors.body).toHexString(3),
            "}",
            ".",
            classNames.eye,
            "{fill:#",
            uint256(colors.eye).toHexString(3),
            "}",
            ".",
            classNames.tail,
            "{fill:#",
            uint256(colors.tail).toHexString(3),
            "}"
            // ...
        );
        if (!colors.scar)
            styles = abi.encodePacked(
                styles,
                ".",
                classNames.scar,
                "{display: none}"
            );
        if (!colors.moustache)
            styles = abi.encodePacked(
                styles,
                ".",
                classNames.moustache,
                "{display: none}"
            );
        if (!colors.beard)
            styles = abi.encodePacked(
                styles,
                ".",
                classNames.beard,
                "{display: none}"
            );
        // ...
        return abi.encodePacked(svgHead, styles, svgBody);
    }
}
