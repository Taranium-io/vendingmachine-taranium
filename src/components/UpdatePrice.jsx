import React, { useState, useEffect } from "react";
import { vendingMachine, web3 } from "../web3";
import { Grid2, TextField, Button, Typography, Box, Alert } from "@mui/material";

const UpdatePrice = ({ account, onPriceUpdated }) => {
    const [productCode, setProductCode] = useState("");
    const [newPrice, setNewPrice] = useState("");
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
        if (!newPrice.trim() || isNaN(newPrice) || Number(newPrice) <= 0) return "Harga baru harus lebih dari 0.";
        return null;
    };

    const updatePrice = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await vendingMachine.methods.updatePriceByCode(productCode, web3.utils.toWei(newPrice, "ether")).send({ from: account });
            alert(`Harga produk ${productCode} berhasil diperbarui menjadi ${newPrice} TARAN.`);
            setProductCode("");
            setNewPrice("");
            setError("");
            onPriceUpdated?.();
        } catch (err) {
            console.error("Gagal memperbarui harga:", err);
            setError("Terjadi kesalahan saat memperbarui harga.");
        }
    };

    if (!isOwner) return null;

    return (
        <Box mt={4} textAlign="center">
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4C4D4F" }}>
                Update Harga Produk (berdasarkan Kode)
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
                        label="Harga Baru (TARAN)"
                        type="number"
                        fullWidth
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                    />
                </Grid2>
                <Grid2 item xs={4}>
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={updatePrice}>
                        Update Harga
                    </Button>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default UpdatePrice;
