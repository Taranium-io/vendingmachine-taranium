// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract VendingMachine {
    address public owner;
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

    event ProductAdded(uint256 indexed id, string code, string name, uint256 price, uint256 stock);
    event ProductPurchased(address indexed buyer, uint256 indexed productId, uint256 quantity);
    event StockAdded(uint256 indexed productId, uint256 addedStock);
    event PriceUpdated(uint256 indexed productId, uint256 newPrice);
    event FundsWithdrawn(address indexed to, uint256 amount);

    constructor(address _vntaranTokenAddress) {
        owner = msg.sender;
        vntaranToken = IERC20(_vntaranTokenAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addProduct(string memory code, string memory name, uint256 price, uint256 stock) public onlyOwner {
        require(productCodeToId[code] == 0, "Product code already exists");
        uint256 productId = nextProductId + 1;
        products[productId] = Product(productId, code, name, price, stock);
        productCodeToId[code] = productId;
        nextProductId = productId;

        emit ProductAdded(productId, code, name, price, stock);
    }

    function addStockByCode(string memory code, uint256 quantity) public onlyOwner {
        uint256 productId = productCodeToId[code];
        require(productId != 0, "Product code not found");
        products[productId].stock += quantity;

        emit StockAdded(productId, quantity);
    }

    function updatePriceByCode(string memory code, uint256 newPrice) public onlyOwner {
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
        require(vntaranToken.transferFrom(msg.sender, address(this), totalPrice), "Token transfer failed");

        product.stock -= quantity;

        emit ProductPurchased(msg.sender, productId, quantity);
    }

    function getProductById(uint256 productId) public view returns (Product memory) {
        require(productId != 0 && productId <= nextProductId, "Invalid product ID");
        return products[productId];
    }

    function getProductByCode(string memory code) public view returns (Product memory) {
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

    function withdrawTokens(address to, uint256 amount) public onlyOwner {
        require(vntaranToken.transfer(to, amount), "Withdraw failed");
        emit FundsWithdrawn(to, amount);
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

        // Menghitung jumlah produk yang cocok
        for (uint256 i = 1; i < nextProductId; i++) {
            if (
                keccak256(abi.encodePacked(products[i].name)) ==
                keccak256(abi.encodePacked(_name))
            ) {
                matchedCount++;
            }
        }

        // Mengumpulkan produk yang cocok
        Product[] memory matchedProducts = new Product[](matchedCount);
        uint256 index = 0;

        for (uint256 i = 1; i < nextProductId; i++) {
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
