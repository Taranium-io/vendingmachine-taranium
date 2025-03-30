import React, { useState, useEffect } from "react";
import { vendingMachine, web3 } from "../web3";
import { Typography, Button, Box, Alert } from "@mui/material";

const WithdrawFunds = ({ account, refreshSignal }) => {
    const [balance, setBalance] = useState("0.000000");
    const [isOwner, setIsOwner] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Cek apakah akun adalah owner
    useEffect(() => {
        const checkOwnership = async () => {
            try {
                const ownerAddress = await vendingMachine.methods.owner().call();
                setIsOwner(account && account.toLowerCase() === ownerAddress.toLowerCase());
            } catch (err) {
                console.error("Gagal mengecek pemilik kontrak:", err);
            }
        };

        checkOwnership();
    }, [account]);

    // Ambil saldo kontrak setiap kali ada sinyal refresh
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const rawBalance = await vendingMachine.methods.getBalance().call();
                const balanceEth = parseFloat(web3.utils.fromWei(rawBalance, "ether")).toFixed(6);
                setBalance(balanceEth);
                setError("");
            } catch (err) {
                console.error("Gagal mengambil saldo:", err);
                setError("Gagal mengambil saldo kontrak.");
            }
        };

        if (isOwner) {
            fetchBalance();
        }
    }, [isOwner, refreshSignal]);

    const withdraw = async () => {
        if (!account) {
            alert("Hubungkan wallet terlebih dahulu!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await vendingMachine.methods.withdraw().send({ from: account });
            alert("Penarikan dana berhasil!");
            setBalance("0.000000");
        } catch (err) {
            console.error("Penarikan gagal:", err);
            setError("Penarikan dana gagal. Pastikan Anda adalah pemilik kontrak dan ada saldo.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOwner) return null;

    return (
        <Box mt={4} textAlign="center">
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#4C4D4F" }}>
                💰 Saldo Kontrak: {balance} ETH
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            <Button
                variant="contained"
                color="error"
                sx={{ mt: 2 }}
                onClick={withdraw}
                disabled={parseFloat(balance) <= 0 || loading}
            >
                {loading ? "Menarik..." : "Tarik Dana"}
            </Button>
        </Box>
    );
};

export default WithdrawFunds;
