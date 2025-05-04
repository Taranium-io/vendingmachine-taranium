import React, { useState, useEffect } from "react";
import { vendingMachine, vntaranToken, web3 } from "../web3";
import { BN } from "bn.js";
import { Grid2, Card, CardContent, Typography, Button } from "@mui/material";

const ProductList = ({ account, refreshSignal, onTransaction, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const list = await vendingMachine.methods.getAllProducts().call();
            const mappedProducts = list.map((product) => ({
                id: product.id,
                code: product.code,
                name: product.name,
                price: web3.utils.fromWei(product.price.toString(), "ether"),
                stock: product.stock,
            }));
            setProducts(mappedProducts);
            setFilteredProducts(mappedProducts);
        } catch (err) {
            console.error("Gagal memuat produk:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshSignal]);

    useEffect(() => {
        if (searchQuery && searchQuery.trim() !== "") {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const filtered = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(lowerCaseQuery) ||
                    p.code.toLowerCase().includes(lowerCaseQuery)
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const buyProduct = async (productCode, price) => {
        if (!account) return alert("Hubungkan wallet dulu");

        try {
            const totalPrice = web3.utils.toWei(price.toString(), "ether");

            // Cek saldo VNTARAN
            const balance = await vntaranToken.methods.balanceOf(account).call();
            if (new BN(balance).lt(new BN(totalPrice))) {
                alert("Saldo VNTARAN tidak mencukupi.");
                return;
            }

            // Approve token
            await vntaranToken.methods
                .approve(vendingMachine.options.address, totalPrice)
                .send({ from: account });

            // Beli produk
            await vendingMachine.methods
                .buyProductByCode(productCode, 1)
                .send({ from: account });

            fetchProducts();
            if (onTransaction) onTransaction();
            alert("Pembelian berhasil!");
        } catch (err) {
            console.error("Gagal membeli:", err);
        }
    };

    return (
        <div>
            <Typography variant="h5" fontWeight="bold" textAlign="center" sx={{ mt: 3, color: "#4c4d4f" }}>
                Daftar Produk
            </Typography>
            <Grid2 container spacing={3} justifyContent="center">
                {filteredProducts.map((product) => (
                    <Grid2 size={{ xs: 12, sm: 6 }} key={product.id}>
                        <Card sx={{ backgroundColor: "#616161", color: "#fff" }}>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h6">{product.name}</Typography>
                                <Typography color="yellow">{product.price} VNTARAN</Typography>
                                <Typography color={product.stock > 0 ? "#83b74d" : "red"}>
                                    Stok: {product.stock}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    onClick={() => buyProduct(product.code, product.price)}
                                    disabled={product.stock <= 0}
                                >
                                    {product.stock > 0 ? "Beli" : "Habis"}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid2>
                ))}
            </Grid2>
        </div>
    );
};

export default ProductList;
