import React, { useState } from "react";
import { Box, Container, Grid2, Paper, Typography } from "@mui/material";
import WalletConnect from "./components/WalletConnect";
import ProductList from "./components/ProductList";
import AddStock from "./components/AddStock";

const App = () => {
    const [account, setAccount] = useState(null);
    const [refreshStock, setRefreshStock] = useState(false);

    const handleStockUpdate = () => {
        setRefreshStock(prev => !prev);
    };

    return (
        <Box sx={{ bgcolor: '#223f56', color: "#fff", borderRadius: 3, p: 6, minWidth: 300,}}>
            <Grid2 spacing={0} direction="column" sx={{ alignItems: "center" }}>
                {/* Kolom Kiri (Kosong) */}
                <Grid2 xs={2} />

                {/* Kolom Tengah (Konten Utama) */}
                <Grid2 xs={8}>
                    <img src="/logo.png" height={100}/>
                    <Paper elevation={6} sx={{ p: 4, textAlign: "center", backgroundColor: "#e9edee", color: "#fff" }}>
                        <Typography variant="h3" fontWeight="bold" color="#4C4D4F" gutterBottom>
                            🛒 Vending Machine DApp
                        </Typography>
                        <WalletConnect setAccount={setAccount} />
                        <ProductList account={account} refreshStock={refreshStock} />
                        <AddStock account={account} onStockUpdated={handleStockUpdate} />
                    </Paper>
                </Grid2>

                {/* Kolom Kanan (Kosong) */}
                <Grid2 xs={2} />
            </Grid2>
        </Box>
    );
};

export default App;
