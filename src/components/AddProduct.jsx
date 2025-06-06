import React, { useState } from "react";
import { vendingMachine, web3 } from "../web3";
import { TextField, Button, Alert, Typography, Box, Grid2 } from "@mui/material";

const AddProduct = ({ account, onProductAdded }) => {
    const [productCode, setProductCode] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [error, setError] = useState("");

    React.useEffect(() => {
        const checkOwner = async () => {
            if (account) {
                const ownerAddress = await vendingMachine.methods.owner().call();
                setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
            }
        };
        checkOwner();
    }, [account]);

    const validate = () => {
        if (!productCode.trim()) return "Kode produk wajib diisi";
        if (!name.trim()) return "Nama produk wajib diisi";
        if (!price || isNaN(price) || Number(price) <= 0) return "Harga harus lebih dari 0";
        if (!stock || isNaN(stock) || Number(stock) <= 0) return "Stok harus lebih dari 0";
        return null;
    };

    const addProduct = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setError("");
            await vendingMachine.methods
                .addProduct(productCode, name, web3.utils.toWei(price, "ether"), stock)
                .send({ from: account });

            alert(`Produk ${name} berhasil ditambahkan!`);
            setProductCode("");
            setName("");
            setPrice("");
            setStock("");

            if (typeof onProductAdded === "function") {
                onProductAdded();
            }
        } catch (err) {
            console.error("Gagal menambahkan produk:", err);
            setError("Terjadi kesalahan saat menambahkan produk.");
        }
    };

    return isOwner && (
        <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#4C4D4F" }}>➕ Tambah Produk Baru</Typography>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Grid2 container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                <Grid2 size={{xs:3}}>
                    <TextField
                        label="Kode Produk"
                        fullWidth
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value)}
                    />
                </Grid2>
                <Grid2 size={{xs:3}}>
                    <TextField
                        label="Nama Produk"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Grid2>
                <Grid2 size={{xs:2}}>
                    <TextField
                        label="Harga (TARAN)"
                        type="number"
                        fullWidth
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </Grid2>
                <Grid2 size={{xs:2}}>
                    <TextField
                        label="Stok Awal"
                        type="number"
                        fullWidth
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />
                </Grid2>
                <Grid2 size={{xs:2}}>
                    <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={addProduct}>
                        Tambah Produk
                    </Button>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default AddProduct;
