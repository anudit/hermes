/* ======================================
    __  __
   / / / /__  _________ ___  ___  _____
  / /_/ / _ \/ ___/ __ `__ \/ _ \/ ___/
 / __  /  __/ /  / / / / / /  __(__  )
/_/ /_/\___/_/  /_/ /_/ /_/\___/____/

======================================== */

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.5 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Hermes is ERC721, PullPayment, ReentrancyGuard {
    uint256 public _tokenIds;
    uint256 public _postIds;
    mapping(uint256 => Post) private _posts;

    struct Post {
        address seller;
        uint256 price;
        string postData;
        bool exists;
    }

    constructor() ERC721("Hermes", "HERMES") {}

    modifier postExist(uint256 id) {
        require(_posts[id].exists, "Not Found");
        _;
    }

    function addPost(uint256 price, string memory postData) public nonReentrant() {
        require(price > 0, "Price cannot be 0");

        _postIds++;
        _posts[_postIds] = Post(msg.sender, price, postData, true);
    }

    function getPost(uint256 id)
        public
        view
        postExist(id)
        returns (
            uint256,
            uint256,
            string memory
        )
    {
        Post memory post = _posts[id];
        return (id, post.price, post.postData);
    }

    function purchasePost(uint256 postId)
        external
        payable
        postExist(postId)
        nonReentrant()
    {
        Post storage post = _posts[postId];

        require(msg.value >= post.price, "Bid lower than cost price.");

        _tokenIds++;

        _safeMint(msg.sender, _tokenIds);
        _setTokenURI(_tokenIds, post.postData);
        _asyncTransfer(post.seller, msg.value);
    }

    function getPayments() external {
        withdrawPayments(msg.sender);
    }
}
