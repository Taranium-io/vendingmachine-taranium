// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VendingMachine is Ownable {
    IERC20 public vntaranToken;

    struct Product {
        uint256 id;
        string code;
        string name;
        uint256 price; // dalam satuan token VNTARAN
        uint256 stock;
    }

    mapping(uint256 => Product) public products;
    mapping(string => uint256) public productCodeToId;
    uint256 public nextProductId;

    event ProductAdded(
        uint256 indexed id,
        string code,
        string name,
        uint256 price,
        uint256 stock
    );
    event ProductPurchased(
        address indexed buyer,
        uint256 indexed productId,
        uint256 quantity
    );
    event StockAdded(uint256 indexed productId, uint256 addedStock);
    event PriceUpdated(uint256 indexed productId, uint256 newPrice);
    event FundsWithdrawn(address indexed to, uint256 amount);

    constructor(address _vntaranTokenAddress) Ownable(msg.sender) {
        vntaranToken = IERC20(_vntaranTokenAddress);
    }

    function addProduct(
        string memory code,
        string memory name,
        uint256 price,
        uint256 stock
    ) public onlyOwner {
        require(productCodeToId[code] == 0, "Product code already exists");
        uint256 productId = nextProductId + 1;
        products[productId] = Product(productId, code, name, price, stock);
        productCodeToId[code] = productId;
        nextProductId = productId;

        emit ProductAdded(productId, code, name, price, stock);
    }

    function addStockByCode(string memory code, uint256 quantity)
        public
        onlyOwner
    {
        uint256 productId = productCodeToId[code];
        require(productId != 0, "Product code not found");
        products[productId].stock += quantity;

        emit StockAdded(productId, quantity);
    }

    function updatePriceByCode(string memory code, uint256 newPrice)
        public
        onlyOwner
    {
        uint256 productId = productCodeToId[code];
        require(productId != 0, "Product code not found");
        products[productId].price = newPrice;

        emit PriceUpdated(productId, newPrice);
    }

    function buyProductByCode(string memory code, uint256 quantity) public {
        uint256 productId = productCodeToId[code];
        require(productId != 0, "Product code not found");

        Product storage product = products[productId];
        require(product.stock >= quantity, "Not enough stock");

        uint256 totalPrice = product.price * quantity;

        uint256 allowance = vntaranToken.allowance(msg.sender, address(this));
        require(allowance >= totalPrice, "Allowance not sufficient");

        uint256 balance = vntaranToken.balanceOf(msg.sender);
        require(balance >= totalPrice, "Insufficient VNTARAN balance");

        bool success = vntaranToken.transferFrom(
            msg.sender,
            address(this),
            totalPrice
        );
        require(success, "Token transfer failed");

        product.stock -= quantity;

        emit ProductPurchased(msg.sender, productId, quantity);
    }

    function getTotalPriceByCode(string memory code, uint256 quantity)
        public
        view
        returns (uint256)
    {
        uint256 productId = productCodeToId[code];
        require(productId != 0, "Invalid product code");

        Product memory product = products[productId];
        return product.price * quantity;
    }

    function getProductById(uint256 productId)
        public
        view
        returns (Product memory)
    {
        require(
            productId != 0 && productId <= nextProductId,
            "Invalid product ID"
        );
        return products[productId];
    }

    function getProductByCode(string memory code)
        public
        view
        returns (Product memory)
    {
        uint256 productId = productCodeToId[code];
        require(productId != 0, "Product code not found");
        return products[productId];
    }

    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](nextProductId);
        for (uint256 i = 1; i <= nextProductId; i++) {
            allProducts[i - 1] = products[i];
        }
        return allProducts;
    }

    function withdraw() public onlyOwner {
        uint256 amount = vntaranToken.balanceOf(address(this));
        require(amount > 0, "No token to withdraw");
        require(vntaranToken.transfer(owner(), amount), "Transfer failed");

        emit FundsWithdrawn(owner(), amount);
    }

    function getBalance() public view returns (uint256) {
        return vntaranToken.balanceOf(address(this));
    }

    function searchProductsByName(string memory _name)
        public
        view
        returns (Product[] memory)
    {
        uint256 matchedCount = 0;

        for (uint256 i = 1; i <= nextProductId; i++) {
            if (
                keccak256(abi.encodePacked(products[i].name)) ==
                keccak256(abi.encodePacked(_name))
            ) {
                matchedCount++;
            }
        }

        Product[] memory matchedProducts = new Product[](matchedCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= nextProductId; i++) {
            if (
                keccak256(abi.encodePacked(products[i].name)) ==
                keccak256(abi.encodePacked(_name))
            ) {
                matchedProducts[index] = products[i];
                index++;
            }
        }

        return matchedProducts;
    }
}
