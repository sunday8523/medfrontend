// src/components/VaccinePopup.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Modal, Typography, IconButton, Table, TableHead,
    TableRow, TableCell, TableBody, CircularProgress, Alert, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/vaccines`;

const VaccinePopup = ({ open, onClose }) => {
    const [vaccines, setVaccines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) return;

        const fetchVaccines = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(API_URL);
                setVaccines(res.data);
            } catch (err) {
                console.error(err);
                setError('ไม่สามารถดึงข้อมูลวัคซีนได้');
            } finally {
                setLoading(false);
            }
        };

        fetchVaccines();
    }, [open]);

    const popupStyle = {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', md: 700 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 3, borderRadius: 3,
        maxHeight: '80vh', overflowY: 'auto'
    };

    // 🔹 ฟังก์ชันช่วย format วันหมดอายุเอาเวลาออก
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return dateStr.split('T')[0]; // ตัดเฉพาะวันที่
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={popupStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>วัคซีนทั้งหมด 💉</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ my: 2 }} />
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : vaccines.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', py: 3, color: 'gray' }}>ไม่มีรายการวัคซีน</Typography>
                ) : (
                    <Table>
                        <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                            <TableRow>
                                <TableCell>ชื่อวัคซีน</TableCell>
                                <TableCell>จำนวน</TableCell>
                                <TableCell>วันหมดอายุ</TableCell>
                                <TableCell>คลัง</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vaccines.map((v, i) => (
                                <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' }, '&:hover': { bgcolor: '#f0f0f0' } }}>
                                    <TableCell>{v.med_name}</TableCell>
                                    <TableCell>{v.amount}</TableCell>
                                    <TableCell>{formatDate(v.expire)}</TableCell> {/* 🔹 ใช้ formatDate */}
                                    <TableCell>{v.location}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Box>
        </Modal>
    );
};

export default VaccinePopup;
