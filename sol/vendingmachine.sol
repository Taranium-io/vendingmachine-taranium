// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VendingMachine {
    address public owner;
    uint256 public productCount = 0;
    uint256 public nextProductId;

    struct Product {
        uint256 id;
        string code; // Tambahan: kode produk
        string name;
        uint256 price;
        uint256 stock;
    }

    mapping(uint256 => Product) public products; // Mapping dari id ke Produk
    mapping(string => uint256) private codeToId; // Tambahan: Mapping dari kode produk ke id produk

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
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextProductId = 1;
    }

    function addProduct(
        string memory _code,
        string memory _name,
        uint256 _price,
        uint256 _stock
    ) public onlyOwner {
        require(codeToId[_code] == 0, "Product code already exists");

        products[nextProductId] = Product({
            id: nextProductId,
            code: _code,
            name: _name,
            price: _price,
            stock: _stock
        });

        codeToId[_code] = nextProductId;
        nextProductId++;
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

    function addStockByCode(string memory code, uint256 quantity)
        external
        onlyOwner
    {
        require(quantity > 0, "Jumlah harus > 0");
        uint256 productId = codeToId[code];
        require(productId != 0, "Produk tidak ditemukan");

        products[productId].stock += quantity;
    }

    function updateStockByCode(string memory _code, uint256 _newStock)
        public
        onlyOwner
    {
        uint256 id = codeToId[_code];
        require(id != 0, "Product code does not exist");

        products[id].stock = _newStock;
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

    function updatePriceByCode(string memory _code, uint256 _newPrice)
        public
        onlyOwner
    {
        uint256 id = codeToId[_code];
        require(id != 0, "Product code does not exist");

        products[id].price = _newPrice;
    }

    function getProductByCode(string memory _code)
        public
        view
        returns (Product memory)
    {
        uint256 id = codeToId[_code];
        require(id != 0, "Product code does not exist");
        return products[id];
    }

    function getProductById(uint256 _id) public view returns (Product memory) {
        require(_id != 0 && _id < nextProductId, "Product ID does not exist");
        return products[_id];
    }

    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](nextProductId - 1);
        for (uint256 i = 1; i < nextProductId; i++) {
            allProducts[i - 1] = products[i];
        }
        return allProducts;
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

// https://testnet-scan.taranium.com/address/0xEB2ccC22bcBE106a5f223408163FDdd665c6Eb72?tab=contract
