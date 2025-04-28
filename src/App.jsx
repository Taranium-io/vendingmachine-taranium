import React, { useState } from "react";
import { Box, Divider, Grid2, Paper, Typography, Tabs, Tab, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import WalletConnect from "./components/WalletConnect";
import ProductList from "./components/ProductList";
import AddStock from "./components/AddStock";
import UpdatePrice from "./components/UpdatePrice";
import WithdrawFunds from "./components/WithdrawFunds";
import AddProduct from "./components/AddProduct";

const App = () => {
    const [account, setAccount] = useState(null);
    const [refreshSignal, setRefreshSignal] = useState(0);
    const [refreshBalance, setRefreshBalance] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [openDialog, setOpenDialog] = useState(false);

    const triggerRefresh = () => {
        setRefreshSignal(prev => prev + 1);
    };

    const triggerBalanceRefresh = () => {
        setRefreshBalance(prev => prev + 1);
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleWithdrawRequest = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center"
            sx={{ bgcolor: '#223f56', color: "#fff", minWidth: "100vw", minHeight: "100vh" }}>
            <Grid2 container spacing={0} direction="column" alignItems="center">
                <Grid2 size={{ sm: 12, xs: 8 }}>
                    <img src="/logo.png" height={100} />
                    <Paper elevation={6} sx={{ p: 4, textAlign: "center", backgroundColor: "#e9edee", color: "#4C4D4F" }}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            🛒 Vending Machine DApp
                        </Typography>
                        <WalletConnect setAccount={setAccount} />
                        <ProductList
                            account={account}
                            refreshSignal={refreshSignal}
                            onTransaction={() => { triggerBalanceRefresh(); handleSnackbar("Transaksi berhasil!"); }}
                        />
                        <Divider sx={{ mt: 5, mb: 3 }} />

                        {/* Menu Tabs */}
                        <Tabs value={tabIndex} onChange={handleTabChange} centered textColor="primary" indicatorColor="primary" sx={{ mb: 3 }}>
                            <Tab label="Tambah Stok" />
                            <Tab label="Update Harga" />
                            <Tab label="Tambah Produk" />
                            <Tab label="Tarik Dana" />
                        </Tabs>

                        {/* Tab Content */}
                        {tabIndex === 0 && <AddStock account={account} onStockUpdated={() => { triggerRefresh(); handleSnackbar("Stok berhasil diperbarui!"); }} />}
                        {tabIndex === 1 && <UpdatePrice account={account} onPriceUpdated={() => { triggerRefresh(); handleSnackbar("Harga berhasil diperbarui!"); }} />}
                        {tabIndex === 2 && <AddProduct account={account} onProductAdded={() => { triggerRefresh(); handleSnackbar("Produk berhasil ditambahkan!"); }} />}
                        {tabIndex === 3 && (
                            <>
                                <Button variant="contained" color="error" onClick={handleWithdrawRequest}>
                                    Konfirmasi Tarik Dana
                                </Button>
                                <Dialog open={openDialog} onClose={handleDialogClose}>
                                    <DialogTitle>Konfirmasi Tarik Dana</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Apakah Anda yakin ingin menarik semua dana dari kontrak vending machine?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleDialogClose}>Batal</Button>
                                        <WithdrawFunds account={account} refreshSignal={refreshBalance} onWithdrawComplete={() => { handleDialogClose(); handleSnackbar("Dana berhasil ditarik!"); }} />
                                    </DialogActions>
                                </Dialog>
                            </>
                        )}
                    </Paper>
                </Grid2>
            </Grid2>

            {/* Snackbar Notification */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default App;