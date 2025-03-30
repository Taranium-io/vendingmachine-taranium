import React, { useState } from "react";
import { web3 } from "../web3";
import { Button, Typography } from "@mui/material";

const WalletConnect = ({ setAccount }) => {
    const [connected, setConnected] = useState(false);

    const connectWallet = async () => {
        try {
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);
            setConnected(true);
        } catch (error) {
            console.error("Gagal menghubungkan ke wallet:", error);
        }
    };

    return (
        <div style={{ marginBottom: "20px" }}>
            {connected ? (
                <Typography color="green" fontWeight="bold">✅ Wallet Terhubung</Typography>
            ) : (
                <Button variant="contained" color="success" onClick={connectWallet}>
                    Hubungkan MetaMask
                </Button>
            )}
        </div>
    );
};

export default WalletConnect;