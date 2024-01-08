// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts@4.7.0/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.7.0/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.7.0/access/Ownable.sol";
import "@openzeppelin/contracts@4.7.0/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract SoulboundSpotifyWrapped is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;

    Counters.Counter private _tokenIdCounter;
    mapping(address => EnumerableSet.UintSet) private _ownedTokens;

    constructor() ERC721("SoulboundSpotifyWrapped", "SSW") {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(
    address from, 
    address to, 
    uint256 tokenId
    ) internal override virtual {
    require(from == address(0), "Err: token transfer is BLOCKED"); 
    super._beforeTokenTransfer(from, to, tokenId);  
    if (from != address(0)) {
            _ownedTokens[from].remove(tokenId);
        }
        if (to != address(0)) {
            _ownedTokens[to].add(tokenId);
        }
    }

     function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        EnumerableSet.UintSet storage tokenSet = _ownedTokens[owner];
        uint256[] memory tokens = new uint256[](tokenSet.length());

        for (uint256 i = 0; i < tokenSet.length(); i++) {
            tokens[i] = tokenSet.at(i);
        }

        return tokens;
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can burn an NFT");
        super._burn(tokenId);
    }

    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}