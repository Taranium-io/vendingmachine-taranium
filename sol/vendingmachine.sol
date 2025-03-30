// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

contract VendingMachine {
    address public owner;
    uint256 public productCount = 0;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        uint256 stock;
    }

    mapping(uint256 => Product) public products;

    event Purchased(
        address indexed buyer,
        uint256 indexed productId,
        uint256 quantity
    );
    event StockAdded(uint256 indexed productId, uint256 quantity);
    event ProductAdded(
        uint256 indexed productId,
        string name,
        uint256 price,
        uint256 stock
    );
    event Withdraw(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Hanya pemilik kontrak yang bisa melakukan ini"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        addProduct(string.concat(unicode"🥤", " Minuman"), 0.01 ether, 10);
        addProduct(string.concat(unicode"🍫", " Snack"), 0.02 ether, 5);
    }

    function addProduct(
        string memory name,
        uint256 price,
        uint256 stock
    ) public onlyOwner {
        require(price > 0, "Harga harus lebih dari 0");
        require(stock > 0, "Stok harus lebih dari 0");

        productCount++;
        products[productCount] = Product(productCount, name, price, stock);

        emit ProductAdded(productCount, name, price, stock);
    }

    function buyProduct(uint256 productId, uint256 quantity) public payable {
        require(products[productId].price > 0, "Produk tidak tersedia");
        require(products[productId].stock >= quantity, "Stok tidak cukup");
        require(
            msg.value >= products[productId].price * quantity,
            "Ether tidak cukup"
        );

        products[productId].stock -= quantity;
        emit Purchased(msg.sender, productId, quantity);
    }

    function addStock(uint256 productId, uint256 quantity) public onlyOwner {
        require(products[productId].price > 0, "Produk tidak tersedia");
        products[productId].stock += quantity;
        emit StockAdded(productId, quantity);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Saldo kontrak kosong");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Gagal menarik saldo");

        emit Withdraw(owner, balance);
    }

    function getProduct(uint256 productId)
        public
        view
        returns (
            uint256,
            string memory,
            uint256,
            uint256
        )
    {
        Product memory product = products[productId];
        return (product.id, product.name, product.price, product.stock);
    }
}


// https://testnet-scan.taranium.com/address/0xEB2ccC22bcBE106a5f223408163FDdd665c6Eb72?tab=contract