import React, { useState, useEffect } from "react";
import { vendingMachine, web3 } from "../web3";
import { Grid2, Card, CardContent, Typography, Button } from "@mui/material";

const ProductList = ({ account, refreshSignal, onTransaction }) => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const count = await vendingMachine.methods.productCount().call();
            const list = [];
            for (let i = 1; i <= count; i++) {
                const product = await vendingMachine.methods.getProduct(i).call();
                list.push({
                    id: product[0],
                    name: product[1],
                    price: web3.utils.fromWei(product[2], "ether"),
                    stock: product[3],
                });
            }
            setProducts(list);
        } catch (err) {
            console.error("Gagal memuat produk:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshSignal]); // refresh ketika ada sinyal perubahan

    const buyProduct = async (productId, price) => {
        if (!account) return alert("Hubungkan wallet dulu");
        try {
            await vendingMachine.methods.buyProduct(productId, 1).send({
                from: account,
                value: web3.utils.toWei(price.toString(), "ether"),
            });
            fetchProducts(); // update stok setelah beli
            if (onTransaction) onTransaction();
            alert("Pembelian berhasil!");
        } catch (err) {
            console.error("Gagal membeli:", err);
        }
    };

    return (
        <div>
            <Typography variant="h5" fontWeight="bold" textAlign="center" mt={3} sx={{ color: "#4c4d4f" }}>
                Daftar Produk
            </Typography>
            <Grid2 container spacing={3} justifyContent="center">
                {products.map((product) => (
                    <Grid2 item xs={12} sm={6} key={product.id}>
                        <Card sx={{ backgroundColor: "#616161", color: "#fff" }}>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h6">{product.name}</Typography>
                                <Typography color="yellow">{product.price} TARAN</Typography>
                                <Typography color={product.stock > 0 ? "#83b74d" : "red"}>
                                    Stok: {product.stock}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    onClick={() => buyProduct(product.id, product.price)}
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
