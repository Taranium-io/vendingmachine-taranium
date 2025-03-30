import React, { useState } from "react";
import { Box, Divider, Grid2, Paper, Typography } from "@mui/material";
import WalletConnect from "./components/WalletConnect";
import ProductList from "./components/ProductList";
import AddStock from "./components/AddStock";
import WithdrawFunds from "./components/WithdrawFunds";
import AddProduct from "./components/AddProduct";

const App = () => {
    const [account, setAccount] = useState(null);
    // const [refreshStock, setRefreshStock] = useState(false);
    const [refreshSignal, setRefreshSignal] = useState(0);
    const [refreshBalance, setRefreshBalance] = useState(0);

    // const handleStockUpdate = () => {
    //     setRefreshStock(prev => !prev);
    // };

    const triggerRefresh = () => {
        setRefreshSignal(prev => prev + 1); // Trigger semua component agar fetch ulang data
    };

    const triggerBalanceRefresh = () => {
        setRefreshBalance(prev => prev + 1);
    };

    return (
        <Box sx={{ bgcolor: '#223f56', color: "#fff", borderRadius: 3, p: 6, minWidth: 300, }}>
            <Grid2 spacing={0} direction="column" sx={{ alignItems: "center" }}>
                {/* Kolom Kiri (Kosong) */}
                <Grid2 xs={2} />

                {/* Kolom Tengah (Konten Utama) */}
                <Grid2 xs={8}>
                    <img src="/logo.png" height={100} />
                    <Paper elevation={6} sx={{ p: 4, textAlign: "center", backgroundColor: "#e9edee", color: "#fff" }}>
                        <Typography variant="h3" fontWeight="bold" color="#4C4D4F" gutterBottom>
                            🛒 Vending Machine DApp
                        </Typography>
                        <WalletConnect setAccount={setAccount} />
                        <ProductList
                            account={account}
                            refreshSignal={refreshSignal}
                            onTransaction={triggerBalanceRefresh}
                        />
                        <Divider sx={{ mt: 5, mb: 3}} />
                        <AddStock account={account} onStockUpdated={triggerRefresh} />
                        <AddProduct account={account} onProductAdded={triggerRefresh} />
                        <WithdrawFunds account={account} refreshSignal={refreshBalance} />
                    </Paper>
                </Grid2>

                {/* Kolom Kanan (Kosong) */}
                <Grid2 xs={2} />
            </Grid2>
        </Box>
    );
};

export default App;
