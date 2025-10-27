import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './sec_med_table.css';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';

const api = axios.create({ baseURL: `${process.env.REACT_APP_API_URL}/api` });

let isRefreshing = false, failedQueue = [];
const processQueue = (err, token = null) => { failedQueue.forEach(p => err ? p.reject(err) : p.resolve(token)); failedQueue = []; };

api.interceptors.request.use(cfg => { const t = localStorage.getItem('token'); if(t) cfg.headers['Authorization'] = `Bearer ${t}`; return cfg; });
api.interceptors.response.use(res => res, async err => {
  const orig = err.config;
  if(err.response?.status === 401 && !orig._retry){
    if(isRefreshing) return new Promise((res, rej) => failedQueue.push({res, rej})).then(token => { orig.headers['Authorization'] = `Bearer ${token}`; return api(orig); });
    orig._retry = true; isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem('refreshToken'); if(!refreshToken) throw new Error('No refresh token');
      const { data:{ token } } = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refresh-token`,{refreshToken});
      localStorage.setItem('token', token);
      processQueue(null, token);
      return api(orig);
    } catch(e){ processQueue(e,null); localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); return Promise.reject(e); }
    finally{ isRefreshing = false; }
  }
  return Promise.reject(err);
});

const formatDate = d => { if(!d) return 'N/A'; const dt = new Date(d); return isNaN(dt)?'N/A':format(dt,'dd/MM/yyyy'); };
const rowKey = m => (m?.med_id||'').trim();

export default function SecMedTable({ onWithdrawClick }){
  const { user } = useContext(UserContext);
  const [meds,setMeds] = useState([]), [returnKey,setReturnKey]=useState(null), [returnAmt,setReturnAmt]=useState(''), [msg,setMsg]=useState(''), [msgType,setMsgType]=useState(''), [qrMed,setQrMed]=useState(null);
  const [page,setPage]=useState(1), rows=6;

  const fetchMeds = async ()=>{
    try{
      const res = await api.get('/min_meds'); setMeds(res.data||[]);
      (res.data||[]).forEach(async m=>{ if(Number(m.amount)===0) await api.delete(`/min_meds/${encodeURIComponent(rowKey(m))}`); });
    }catch{ setMsg('เกิดข้อผิดพลาดในการดึงข้อมูลยา'); setMsgType('error'); }
  };
  useEffect(()=>{ fetchMeds(); },[]);

  const confirmReturn = async (med)=>{
    const val=Number(returnAmt), amt=Number(med.amount);
    if(!Number.isFinite(val)||val<=0||val>amt){ setMsg('จำนวนส่งกลับไม่ถูกต้อง'); setMsgType('error'); return; }
    try{
      await api.post('/return',{ med_id: rowKey(med), med_name: med.med_name, amount: val, expire: med.expire?format(new Date(med.expire),'yyyy-MM-dd'):'', type: med.type });
      setMeds(p=>p.map(it=>rowKey(it)===rowKey(med)?{...it,amount:it.amount-val}:it));
      setMsg('ส่งยาคืนคลังเรียบร้อย'); setMsgType('success'); setReturnKey(null); setReturnAmt(''); fetchMeds();
    }catch{ setMsg('เกิดข้อผิดพลาด'); setMsgType('error'); }
  };

  const currentMeds = meds.slice((page-1)*rows,page*rows), totalPages=Math.ceil(meds.length/rows);

  const downloadQR = ()=>{
    const canvas=document.getElementById('sec-med-qrcode'); if(canvas&&qrMed){
      const url=canvas.toDataURL('image/png').replace('image/png','image/octet-stream');
      const a=document.createElement('a'); a.href=url; a.download=`qrcode-${qrMed.med_name}.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  return (
    <div className="medicines-table-container">
      <h2>เตรียมเบิกจ่าย</h2>
      {msg && <div className={`toast ${msgType}`}>{msg}</div>}
      <table className="medicines-table">
        <thead><tr><th>ID</th><th>ชื่อยา</th><th>จำนวน</th><th>ประเภท</th><th>หมดอายุ</th><th>ส่งกลับ</th><th>เบิกยา</th></tr></thead>
        <tbody>
          {currentMeds.length?currentMeds.map(med=>{
            const k=rowKey(med), isRet=returnKey===k;
            return <tr key={k} onClick={()=>setQrMed(med)} className="clickable-row">
              <td>{med.med_id}</td>
              <td>{med.med_name}</td>
              <td>{med.amount}</td>
              <td>{med.type}</td>
              <td>{formatDate(med.expire)}</td>
              <td onClick={e=>e.stopPropagation()}>{isRet?(
                <div className="return-form">
                  <input type="number" value={returnAmt} onChange={e=>setReturnAmt(e.target.value)} placeholder="จำนวน"/>
                  <button className="confirm" onClick={()=>confirmReturn(med)}>ยืนยัน</button>
                  <button className="cancel" onClick={()=>setReturnKey(null)}>ยกเลิก</button>
                </div>
              ):<button className="return-btn" onClick={()=>setReturnKey(k)}>ส่งกลับ</button>}</td>
              <td onClick={e=>e.stopPropagation()}><button className="withdraw-btn" onClick={()=>onWithdrawClick(med)}>เบิกยา</button></td>
            </tr>;
          }):<tr><td colSpan={7} style={{textAlign:'center'}}>ไม่พบข้อมูลยา</td></tr>}
        </tbody>
      </table>

      {totalPages>1 && <div className="pagination">
        <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1}>⟨ ก่อนหน้า</button>
        <span>หน้า {page}/{totalPages}</span>
        <button onClick={()=>setPage(p=>Math.min(p+1,totalPages))} disabled={page===totalPages}>ถัดไป ⟩</button>
      </div>}

      {qrMed && <div className="modal-overlay" onClick={()=>setQrMed(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <button className="close-modal" onClick={()=>setQrMed(null)}>×</button>
          <h3>ข้อมูลยา ID: {qrMed.med_id}</h3>
          <div className="qr-code-container">
            <QRCodeCanvas id="sec-med-qrcode" size={180} value={`ชื่อยา: ${qrMed.med_name}\nจำนวน: ${qrMed.amount}\nประเภท: ${qrMed.type}\nหมดอายุ: ${formatDate(qrMed.expire)}`}/>
            <button className="btn-download-qr" onClick={downloadQR}>ดาวน์โหลด QR</button>
            <div className="med-info-details">
              <p><strong>ชื่อยา:</strong>{qrMed.med_name}</p>
              <p><strong>จำนวน:</strong>{qrMed.amount}</p>
              <p><strong>ประเภท:</strong>{qrMed.type}</p>
              <p><strong>หมดอายุ:</strong>{formatDate(qrMed.expire)}</p>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
