import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const StudentDashboard = () => {
    // --- STATES (Logic Remains Unchanged) ---
    const [myVouchers, setMyVouchers] = useState([]);
    const [slots, setSlots] = useState([]);
    const [bookedSlotName, setBookedSlotName] = useState(null);
    const userEmail = localStorage.getItem('user_email');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [formData, setFormData] = useState({ name: '', reg_no: '' });

    const fetchData = useCallback(async () => {
        try {
            const vRes = await axios.get(`http://127.0.0.1:8000/vouchers/my-vouchers?email=${userEmail}`);
            
            if (vRes.data.length > 0 && vRes.data[0].booked_slot_name) {
                setBookedSlotName(vRes.data[0].booked_slot_name);
                setMyVouchers(vRes.data);
            } else {
                setBookedSlotName(null);
                setMyVouchers([]);
            }

            const sRes = await axios.get('http://127.0.0.1:8000/vouchers/slots');
            setSlots(sRes.data);

        } catch (err) {
            console.error("Error fetching data", err);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openBookingModal = (slotId) => {
        setSelectedSlotId(slotId);
        setIsModalOpen(true);
    };

    const handleFinalBooking = async () => {
        const { name, reg_no } = formData;
        const nameRegex = /^[A-Z\s]+$/;
        const regRegex = /^[A-Z0-9]+$/;

        if (!nameRegex.test(name)) return alert("NAME: Only Capital Letters (A-Z) allowed!");
        if (!regRegex.test(reg_no)) return alert("REGISTER NUMBER: Only Capital Letters and Numbers allowed!");

        try {
            const res = await axios.post('http://127.0.0.1:8000/vouchers/book-slot', {
                email: userEmail,
                slot_id: selectedSlotId,
                name: name,
                register_number: reg_no
            });
            
            alert(res.data.message);
            setIsModalOpen(false);
            setFormData({ name: '', reg_no: '' });
            fetchData(); 
        } catch (err) {
            alert(err.response?.data?.detail || "Booking failed!");
        }
    };

    return (
        <>
            {/* Responsive Global Styles */}
            <style>
            {`
              @media (max-width: 768px) {
                .stats-container { flex-direction: column !important; align-items: center !important; }
                .admin-sections { flex-direction: column !important; }
                .input-group { flex-direction: column !important; }
                table { font-size: 12px !important; }
                th, td { padding: 8px 5px !important; }
                .main-content { padding: 10px !important; }
              }
              
              @media (min-width: 769px) and (max-width: 1024px) {
                .stats-container { flex-wrap: wrap !important; }
                .admin-sections { flex-wrap: wrap !important; }
              }
            `}
            </style>

            <div style={containerStyle} className="main-content">
                <div style={contentWrapperStyle}>
                    <h1 style={mainTitleStyle}>Student Learning Portal</h1>
                    <p style={welcomeTextStyle}>Welcome, <b>{userEmail}</b></p>
                    
                    {/* --- SECTION 1: SLOT BOOKING --- */}
                    <div style={sectionStyle}>
                        <h2 style={sectionTitleStyle}>1. Exam Slot Booking</h2>
                        
                        {bookedSlotName ? (
                            <div style={successBoxStyle}>
                                <h2 style={{ color: '#34a853', margin: '0 0 10px 0' }}>🎉 Congrats!</h2>
                                <p style={{ fontSize: '18px', margin: '5px 0' }}>You have successfully booked <b>{bookedSlotName}</b>.</p>
                                <p style={{ fontSize: '13px', color: '#666' }}>Note: You cannot book another slot without Admin permission.</p>
                            </div>
                        ) : (
                            <>
                                <p style={instructionTextStyle}>Please select your preferred exam slot. You will be asked for your details upon clicking book.</p>
                                <div style={slotGridStyle}>
                                    {slots.map((slot) => (
                                        <div key={slot.id} style={slotCardStyle}>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#1a73e8' }}>{slot.slot_name}</h3>
                                            <p style={{ margin: '5px 0', fontSize: '14px' }}>📅 <b>{slot.date}</b></p>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>🕒 {slot.time_range}</p>
                                            <p style={{ fontSize: '13px', color: '#666' }}>
                                                Capacity: {slot.booked_count} / {slot.student_limit}
                                            </p>
                                            <button onClick={() => openBookingModal(slot.id)} style={bookBtnStyle}>Book This Slot</button>
                                        </div>
                                    ))}
                                </div>
                                {slots.length === 0 && <p style={noDataTextStyle}>No available slots at the moment.</p>}
                            </>
                        )}
                    </div>

                    {/* --- SECTION 2: MY VOUCHERS --- */}
                    <div style={sectionStyle}>
                        <h2 style={sectionTitleStyle}>2. My Assigned Vouchers</h2>
                        
                        {myVouchers.filter(v => v.voucher_code && v.is_visible).length === 0 ? (
                            <div style={noDataTextStyle}>
                                <p>Vouchers will appear here once the admin makes them visible.</p>
                            </div>
                        ) : (
                            <div style={voucherGridStyle}>
                                {myVouchers.filter(v => v.is_visible).map((v, index) => (
                                    <div key={index} style={voucherCardStyle}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 10px 0', color: '#1a73e8' }}>{v.course_name}</h3>
                                            
                                            <div style={studentDetailsBoxStyle}>
                                                <p style={{ margin: '2px 0', fontSize: '14px' }}>👤 <b>Student:</b> {v.student_name}</p>
                                                <p style={{ margin: '2px 0', fontSize: '14px' }}>🆔 <b>Reg No:</b> {v.reg_no}</p>
                                            </div>

                                            <p style={{ margin: '5px 0' }}><b>Voucher Code:</b> <span style={codeStyle}>{v.voucher_code}</span></p>
                                            <p style={{ margin: '5px 0' }}><b>Status:</b> 
                                                <span style={{ color: v.exam_status === 'pending' ? '#f2994a' : '#34a853', fontWeight: 'bold', marginLeft: '5px' }}>
                                                    {v.exam_status.toUpperCase()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MODAL UI (Responsive) --- */}
                {isModalOpen && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <h2 style={{marginTop: 0, color: '#1a73e8'}}>Registration Details</h2>
                            <p style={{fontSize: '13px', color: '#666', marginBottom: '20px'}}>Please enter your details in <b>CAPITAL LETTERS</b> only.</p>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Full Name:</label>
                                <input 
                                    type="text" 
                                    style={inputStyle} 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                                    placeholder="E.G. AKASH M"
                                />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={labelStyle}>Register Number:</label>
                                <input 
                                    type="text" 
                                    style={inputStyle} 
                                    value={formData.reg_no}
                                    onChange={(e) => setFormData({...formData, reg_no: e.target.value.toUpperCase()})}
                                    placeholder="E.G. URK23CS1001"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleFinalBooking} style={confirmBtnStyle}>Confirm</button>
                                <button onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// --- STYLES (Kept exactly same) ---
const containerStyle = { padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh' };
const contentWrapperStyle = { maxWidth: '900px', margin: '0 auto', width: '100%' };
const mainTitleStyle = { color: '#1a73e8', textAlign: 'center', marginBottom: '10px', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' };
const welcomeTextStyle = { textAlign: 'center', color: '#5f6368', marginBottom: '20px', fontSize: '14px' };
const sectionStyle = { background: 'white', padding: 'clamp(15px, 4vw, 25px)', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px', width: '100%', boxSizing: 'border-box' };
const sectionTitleStyle = { color: '#2c3e50', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' };
const instructionTextStyle = { fontSize: '14px', color: '#666', marginBottom: '15px' };
const slotGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' };
const slotCardStyle = { padding: '20px', borderRadius: '10px', backgroundColor: '#fff', textAlign: 'center', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const bookBtnStyle = { marginTop: '15px', backgroundColor: '#34a853', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' };
const voucherGridStyle = { display: 'grid', gap: '20px', marginTop: '20px' };
const voucherCardStyle = { background: '#f8f9fa', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', borderLeft: '6px solid #1a73e8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', gap: '10px' };
const studentDetailsBoxStyle = { background: '#fff', padding: '10px', borderRadius: '8px', border: '1px dashed #ccc' };
const codeStyle = { background: '#e8f0fe', padding: '4px 10px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold', color: '#1a73e8', wordBreak: 'break-all' };
const noDataTextStyle = { textAlign: 'center', padding: '30px', color: '#7f8c8d' };
const successBoxStyle = { textAlign: 'center', padding: '30px', background: '#e6fffa', borderRadius: '15px', border: '1px solid #34a853', marginTop: '20px' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px' };
const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '15px', width: '95%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#333' };
const inputStyle = { width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', textTransform: 'uppercase' };
const confirmBtnStyle = { flex: 1, padding: '12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { flex: 1, padding: '12px', background: '#f1f3f4', color: '#3c4043', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default StudentDashboard;