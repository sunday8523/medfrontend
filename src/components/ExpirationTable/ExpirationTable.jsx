// src/components/ExpirationTable.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Card, CardContent, Modal, Divider, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody,
  useMediaQuery, useTheme
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const API_URL = `${import.meta.env.VITE_API_URL}/api/meds/expiration`;
const NOTIFY_URL = `${import.meta.env.VITE_API_URL}/api/meds/notify`;
const LOW_STOCK_API_URL = `${import.meta.env.VITE_API_URL}/api/meds/low-stock`;
const LOW_STOCK_NOTIFY_URL = `${import.meta.env.VITE_API_URL}/api/meds/notify-low-stock`;

const ExpirationTable = () => {
  const [meds, setMeds] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [error, setError] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState({ message: '', severity: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSendingLowStock, setIsSendingLowStock] = useState(false);

  const [openPopup, setOpenPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMeds, setPopupMeds] = useState([]);
  const [popupHeaders, setPopupHeaders] = useState(['ชื่อ', 'จำนวน', 'ประเภท', 'Lot No', 'วันหมดอายุ']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingLowStock(true);
        setError(null);

        const expResponse = await axios.get(API_URL);
        setMeds(expResponse.data);

        const lowStockResponse = await axios.get(LOW_STOCK_API_URL);
        setLowStockMeds(lowStockResponse.data);
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถดึงข้อมูลยาได้');
      } finally {
        setLoading(false);
        setLoadingLowStock(false);
      }
    };
    fetchData();
  }, []);

  const handleSendNotification = async () => {
    setIsSending(true);
    setNotificationStatus({ message: '', severity: '' });
    try {
      const response = await axios.post(NOTIFY_URL);
      setNotificationStatus({
        message: response.data.message || 'ส่งการแจ้งเตือนไปยัง LINE เรียบร้อยแล้ว',
        severity: 'success'
      });
    } catch (err) {
      console.error(err);
      setNotificationStatus({
        message: err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งแจ้งเตือน LINE',
        severity: 'error'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendLowStockNotification = async () => {
    setIsSendingLowStock(true);
    setNotificationStatus({ message: '', severity: '' });
    try {
      const response = await axios.post(LOW_STOCK_NOTIFY_URL);
      setNotificationStatus({
        message: response.data.message || 'ส่งการแจ้งเตือน "ยาใกล้หมด" เรียบร้อยแล้ว',
        severity: 'success'
      });
    } catch (err) {
      console.error(err);
      setNotificationStatus({
        message: err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งแจ้งเตือน "ยาใกล้หมด"',
        severity: 'error'
      });
    } finally {
      setIsSendingLowStock(false);
    }
  };

  const handleOpenPopup = (title, medsList, headers) => {
    setPopupTitle(title);
    setPopupMeds(medsList);
    setPopupHeaders(headers);
    setOpenPopup(true);
  };

  const handleClosePopup = () => setOpenPopup(false);

  if (loading || loadingLowStock) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, height: '300px' }}>
        <CircularProgress color="secondary" />
        <Typography variant="h6" sx={{ ml: 2, color: '#673ab7' }}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

  // 🔹 แบ่งกลุ่มวันหมดอายุ
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expired = [];
  const exp7Days = [];
  const exp30Days = [];
  const exp3Months = [];
  const exp6Months = [];

  meds.forEach(med => {
    const expireDate = new Date(med.expire);
    expireDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) expired.push(med);
    else if (diffDays <= 7) exp7Days.push(med);
    else if (diffDays <= 30) exp30Days.push(med);
    else if (diffDays <= 90) exp3Months.push(med);   // 3 เดือน
    else if (diffDays <= 180) exp6Months.push(med);  // 6 เดือน
  });

  const expHeaders = ['ชื่อ', 'จำนวน', 'ประเภท', 'Lot No', 'วันหมดอายุ'];
  const lowStockHeaders = ['ชื่อ', 'จำนวนคงเหลือ', 'ประเภท', 'Lot No'];

  // 🔹 Card Section
  const cardData = [
    { title: 'ใกล้หมด 📉', count: lowStockMeds.length, meds: lowStockMeds, color: '#3f51b5', bg: '#E8EAF6', headers: lowStockHeaders },
    { title: 'หมดอายุแล้ว 🔴', count: expired.length, meds: expired, color: '#B00020', bg: '#FBE4E7', headers: expHeaders },
    { title: 'ใกล้หมดอายุ 7 วัน 🟠', count: exp7Days.length, meds: exp7Days, color: '#E65100', bg: '#FFF3E0', headers: expHeaders },
    { title: 'ใกล้หมดอายุ 30 วัน 🟡', count: exp30Days.length, meds: exp30Days, color: '#FBC02D', bg: '#FFFDE7', headers: expHeaders },
    { title: 'ใกล้หมดอายุ 3 เดือน 🟢', count: exp3Months.length, meds: exp3Months, color: '#388E3C', bg: '#E8F5E9', headers: expHeaders },
    { title: 'ใกล้หมดอายุ 6 เดือน 🔵', count: exp6Months.length, meds: exp6Months, color: '#1976D2', bg: '#E3F2FD', headers: expHeaders },
  ];

  const popupCardStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: 800 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: 3,
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  return (
    <Box sx={{ p: 3, background: '#FAFAFA', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#444' }}>
          รายงานยาคงคลังและวันหมดอายุ 💊
        </Typography>
        {/* <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<NotificationsActiveIcon />}
            onClick={handleSendNotification}
            disabled={isSending}
            sx={{ bgcolor: '#673ab7', '&:hover': { bgcolor: '#512da8' } }}
          >
            {isSending ? 'กำลังส่ง...' : 'แจ้งเตือนวันหมดอายุ'}
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#3f51b5', '&:hover': { bgcolor: '#303f9f' } }}
            startIcon={<WarningAmberIcon />}
            onClick={handleSendLowStockNotification}
            disabled={isSendingLowStock}
          >
            {isSendingLowStock ? 'กำลังส่ง...' : 'แจ้งเตือนยาใกล้หมด'}
          </Button>
        </Box> */}
      </Box>

      {notificationStatus.message &&
        <Alert severity={notificationStatus.severity} sx={{ mb: 2 }} onClose={() => setNotificationStatus({ message: '', severity: '' })}>
          {notificationStatus.message}
        </Alert>
      }

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        gap: 2,
        mt: 2
      }}>
        {cardData.map((card, index) => (
          <Card
            key={index}
            sx={{
              backgroundColor: card.bg,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
              '&:hover': { transform: 'scale(1.03)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
              borderLeft: `5px solid ${card.color}`,
              borderRadius: 2
            }}
            onClick={() => handleOpenPopup(card.title, card.meds, card.headers)}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: card.color, fontWeight: 'bold' }}>{card.title}</Typography>
              <Typography variant="h3" sx={{ color: card.color, mt: 1, fontWeight: 'bold' }}>{card.count}</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                {card.meds.length > 0 ? 'คลิกเพื่อดูรายละเอียด' : 'ไม่มีรายการ'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Modal open={openPopup} onClose={handleClosePopup}>
        <Box sx={popupCardStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{popupTitle}</Typography>
            <IconButton onClick={handleClosePopup}><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2, mt: 1 }} />

          {popupMeds.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 3, color: 'gray' }}>ไม่มีรายการ</Typography>
          ) : (
            // Conditional Rendering
            <ResponsivePopupContent
              meds={popupMeds}
              headers={popupHeaders}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

// Sub-component to handle responsive logic cleanly
const ResponsivePopupContent = ({ meds, headers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {meds.map((m, i) => (
          <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
              {headers.map((header, idx) => {
                let value = '';
                // Map header to value
                if (header === 'ชื่อ') value = m.med_name;
                else if (header === 'จำนวน') value = m.amount;
                else if (header === 'ประเภท') value = m.type;
                else if (header === 'Lot No') value = m.lotno;
                else if (header === 'วันหมดอายุ') value = m.expire || '-';
                else if (header === 'จำนวนคงเหลือ') value = m.amount; // For low stock

                return (
                  <Box key={header} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666' }}>{header}:</Typography>
                    <Typography variant="body2">{value}</Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Table sx={{ minWidth: 650 }}>
      <TableHead sx={{ bgcolor: '#f4f6f8' }}>
        <TableRow>
          {headers.map(header => <TableCell key={header} sx={{ fontWeight: 'bold' }}>{header}</TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {meds.map((m, i) => (
          <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' }, '&:hover': { bgcolor: '#f0f0f0' } }}>
            <TableCell>{m.med_name}</TableCell>
            <TableCell>{m.amount}</TableCell>
            <TableCell>{m.type}</TableCell>
            <TableCell>{m.lotno}</TableCell>
            {headers.includes('วันหมดอายุ') && <TableCell>{m.expire || '-'}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ExpirationTable;
