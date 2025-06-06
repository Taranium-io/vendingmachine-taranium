import React, { useState, useEffect } from "react";
import { vendingMachine } from "../web3";
import { Grid2, TextField, Button, Typography, Box, Alert } from "@mui/material";

const AddStock = ({ account, onStockUpdated }) => {
    const [productCode, setProductCode] = useState("");
    const [quantity, setQuantity] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const checkOwner = async () => {
            if (account) {
                const ownerAddress = await vendingMachine.methods.owner().call();
                setIsOwner(account.toLowerCase() === ownerAddress.toLowerCase());
            }
        };

        checkOwner();
    }, [account]);

    const validate = () => {
        if (!productCode.trim()) return "Kode Produk wajib diisi.";
        if (!quantity.trim()) return "Jumlah stok wajib diisi.";
        if (isNaN(quantity) || Number(quantity) <= 0) return "Jumlah stok harus lebih dari 0.";
        return null;
    };

    const addStock = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const product = await vendingMachine.methods.getProductByCode(productCode).call();
            const newStock = Number(product.stock) + Number(quantity);

            await vendingMachine.methods.updateStockByCode(productCode, newStock).send({ from: account });

            alert(`Stok berhasil ditambahkan. Produk Kode: ${productCode}, Jumlah: ${quantity}`);
            setProductCode("");
            setQuantity("");
            setError("");
            onStockUpdated?.();
        } catch (err) {
            console.error("Gagal menambahkan stok:", err);
            setError("Terjadi kesalahan saat menambahkan stok.");
        }
    };

    if (!isOwner) return null;

    return (
        <Box mt={4} textAlign="center">
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4C4D4F" }}>
                Tambah Stok Produk (berdasarkan Kode)
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid2 container spacing={2} justifyContent="center">
                <Grid2 item xs={4}>
                    <TextField
                        label="Kode Produk"
                        fullWidth
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value)}
                    />
                </Grid2>
                <Grid2 item xs={4}>
                    <TextField
                        label="Jumlah Stok"
                        type="number"
                        fullWidth
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </Grid2>
                <Grid2 item xs={4}>
                    <Button variant="contained" color="warning" sx={{ mt: 2 }} onClick={addStock}>
                        Tambah Stok
                    </Button>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default AddStock;
