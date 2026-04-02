import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [file, setFile] = useState(null);
    const [stats, setStats] = useState({ total_vouchers: 0, assigned_vouchers: 0 });
    const [students, setStudents] = useState([]);
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [adminSlots, setAdminSlots] = useState([]); 
    const [selectedVouchers, setSelectedVouchers] = useState({});
    const [slotData, setSlotData] = useState({ slot_name: '', date: '', time_range: '', student_limit: '' });
    const [expandedSlot, setExpandedSlot] = useState(null);

    const fetchData = async () => {
        try {
            const sRes = await axios.get('http://127.0.0.1:8000/vouchers/stats');
            setStats(sRes.data);
            const stuRes = await axios.get('http://127.0.0.1:8000/vouchers/students'); 
            setStudents(stuRes.data);
            const avRes = await axios.get('http://127.0.0.1:8000/vouchers/available');
            setAvailableVouchers(avRes.data);
            const assignRes = await axios.get('http://127.0.0.1:8000/vouchers/all-assignments');
            setAssignments(assignRes.data);
            const slotRes = await axios.get('http://127.0.0.1:8000/vouchers/admin-slots');
            setAdminSlots(slotRes.data);
        } catch (err) { console.error("Data fetch error", err); }
    };

    useEffect(() => { fetchData(); }, []);

    const groupedStudents = students.reduce((acc, student) => {
        const slotName = student.booked_slot_name || "Unassigned";
        if (!acc[slotName]) acc[slotName] = [];
        acc[slotName].push(student);
        return acc;
    }, {});

    const handleCreateSlot = async () => {
        if (!slotData.slot_name || !slotData.date || !slotData.time_range || !slotData.student_limit) {
            return alert("Fill all details including Date!");
        }
        try {
            await axios.post('http://127.0.0.1:8000/vouchers/create-slot', slotData);
            alert("Slot Created successfully!");
            setSlotData({ slot_name: '', date: '', time_range: '', student_limit: '' });
            fetchData();
        } catch (err) { alert("Operation failed! Please try again."); }
    };

    const handleAssign = async (studentId) => {
        const vId = selectedVouchers[studentId];
        if (!vId) return alert("Please select a voucher before assigning!");
        try {
            await axios.post(`http://127.0.0.1:8000/vouchers/assign?student_id=${studentId}&voucher_id=${vId}`);
            fetchData(); 
        } catch (err) { console.error("Assignment Failed", err); }
    };

    const handleCancelSlot = async (slotId) => {
        if (!window.confirm("Canceling this slot will reset all student bookings for this timing. Proceed?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/vouchers/cancel-slot/${slotId}`);
            fetchData();
        } catch (err) { alert("Failed"); }
    };

    const handleResetStudent = async (studentDbId) => {
        if (!window.confirm("Are you sure you want to reset this student's booking/assignment?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/vouchers/remove-student/${studentDbId}`);
            fetchData();
        } catch (err) { alert("Reset failed!"); }
    };

    const handleUpload = async () => {
        if (!file) return alert("Select file!");
        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post('http://127.0.0.1:8000/vouchers/bulk-upload', formData);
            alert("Vouchers and student list uploaded successfully!");
            setFile(null);
            fetchData(); 
        } catch (err) { alert("Operation failed! Please try again."); }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/vouchers/toggle-visibility/${id}?visible=${!currentStatus}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleUpdateResult = async (id, result) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/vouchers/update-result/${id}?result=${result}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/vouchers/report/daily', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `VouchTrack_Report.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (err) { alert("Download Failed!"); }
    };

    return (
        <>
            <style>
            {`
              @media (max-width: 768px) {
                .stats-container { flex-direction: column !important; align-items: center !important; }
                .admin-sections { flex-direction: column !important; }
                .input-group { flex-direction: column !important; }
                table { font-size: 12px !important; }
                th, td { padding: 8px 5px !important; }
                .admin-title { font-size: 1.5rem !important; }
              }
              
              @media (min-width: 769px) and (max-width: 1024px) {
                .stats-container { flex-wrap: wrap !important; }
                .admin-sections { flex-wrap: wrap !important; }
              }
            `}
            </style>

            <div style={{ padding: 'clamp(10px, 3vw, 30px)', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                <h1 className="admin-title" style={{ color: '#1a73e8', textAlign: 'center', marginBottom: '40px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>VouchTrack Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="stats-container" style={cardGridStyle}>
                    <div style={{ ...cardStyle, borderTop: '5px solid #1a73e8' }}>
                        <h3 style={{ margin: 0, fontSize: '14px' }}>Total Vouchers</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a73e8' }}>{stats.total_vouchers}</p>
                    </div>
                    <div style={{ ...cardStyle, borderTop: '5px solid #f2994a' }}>
                        <h3 style={{ margin: 0, fontSize: '14px' }}>Assigned</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f2994a' }}>{stats.assigned_vouchers}</p>
                    </div>
                    <div style={{ ...cardStyle, borderTop: '5px solid #34a853' }}>
                        <h3 style={{ margin: 0, fontSize: '14px' }}>Remaining</h3>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#34a853' }}>{stats.total_vouchers - stats.assigned_vouchers}</p>
                    </div>
                </div>

                <div className="admin-sections" style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                    
                    {/* Upload Section */}
                    <div style={{ ...sectionStyle, flex: '1 1 350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ color: '#188038', borderBottom: '2px solid #eee', fontSize: '1.2rem', paddingBottom: '10px', marginBottom: '15px' }}>Upload Vouchers</h2>
                            
                            <div style={uploadBoxStyle}>
                                <span style={{ fontSize: '40px', marginBottom: '10px' }}>📁</span>
                                <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                                    {file ? file.name : "Select CSV or Excel File"}
                                </p>
                                <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>Support: .csv, .xlsx</p>
                                
                                <input 
                                    type="file" 
                                    id="fileUpload"
                                    accept=".csv, .xlsx" 
                                    onChange={(e) => setFile(e.target.files[0])} 
                                    style={{ display: 'none' }} 
                                />
                                <label htmlFor="fileUpload" style={browseLabelStyle}>Browse File</label>
                            </div>
                        </div>
                        <button style={uploadBtnStyle} onClick={handleUpload}> Upload My Data </button>
                    </div>
                    
                    {/* Create Slot Section */}
                    <div style={{ ...sectionStyle, flex: '1 1 450px' }}>
                        <h2 style={{ color: '#1a73e8', borderBottom: '2px solid #eee', fontSize: '1.2rem', paddingBottom: '10px' }}>Create New Slot</h2>
                        <div className="input-group" style={inputGroupStyle}>
                            <input placeholder="Slot Name (e.g. Session 1)" style={inputStyle} value={slotData.slot_name} onChange={(e) => setSlotData({...slotData, slot_name: e.target.value})} />
                            <input type="date" style={inputStyle} value={slotData.date} onChange={(e) => setSlotData({...slotData, date: e.target.value})} />
                            <input placeholder="Time Range (e.g. 10am - 12pm)" style={inputStyle} value={slotData.time_range} onChange={(e) => setSlotData({...slotData, time_range: e.target.value})} />
                            <input type="number" placeholder="Student Limit" style={inputStyle} value={slotData.student_limit} onChange={(e) => setSlotData({...slotData, student_limit: e.target.value})} />
                        </div>
                        <button style={{ ...uploadBtnStyle, background: '#1a73e8', margin: '15px 0 0 0', width: '100%' }} onClick={handleCreateSlot}>➕ Create Slot</button>
                    </div>
                </div>

                {/* Manage Slots Table */}
                <div style={sectionStyle}>
                    <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Manage Active Slots</h2>
                    <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={thStyle}>Slot Name</th>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Time</th>
                                    <th style={thStyle}>Capacity</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminSlots.map(slot => (
                                    <tr key={slot.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>{slot.slot_name}</td>
                                        <td style={tdStyle}><b>{slot.date}</b></td>
                                        <td style={tdStyle}>{slot.time_range}</td>
                                        <td style={tdStyle}>{slot.booked_count} / {slot.student_limit}</td>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleCancelSlot(slot.id)} style={cancelBtnStyle}>Cancel Slot</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 1. Assign Vouchers Section */}
                <div style={sectionStyle}>
                    <h2 style={{ color: '#202124', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>1. Assign Vouchers (By Slot)</h2>
                    {Object.keys(groupedStudents).length === 0 ? (
                        <p style={{textAlign:'center', color:'#999', padding: '20px'}}>No students currently in waitlist.</p>
                    ) : (
                        Object.entries(groupedStudents).map(([slotName, studentList]) => (
                            <div key={slotName} style={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                <div 
                                    onClick={() => setExpandedSlot(expandedSlot === slotName ? null : slotName)}
                                    style={{ background: '#f8f9fa', padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span style={{ fontWeight: 'bold' }}>📂 Slot: {slotName}</span>
                                    <span style={{ background: '#1a73e8', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>{studentList.length} Students Pending</span>
                                </div>

                                {expandedSlot === slotName && (
                                    <div style={{ background: 'white', padding: '10px' }}>
                                        <div style={tableWrapperStyle}>
                                            <table style={tableStyle}>
                                                <thead>
                                                    <tr>
                                                        <th style={thStyle}>Reg No</th>
                                                        <th style={thStyle}>Name</th>
                                                        <th style={thStyle}>Select Voucher</th>
                                                        <th style={thStyle}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentList.map(s => (
                                                        <tr key={s.id}>
                                                            <td style={tdStyle}>{s.register_number}</td>
                                                            <td style={tdStyle}>{s.name}</td>
                                                            <td style={tdStyle}>
                                                                <select style={selectStyle} onChange={(e) => setSelectedVouchers({...selectedVouchers, [s.id]: e.target.value})}>
                                                                    <option value="">-- Choose Voucher --</option>
                                                                    {availableVouchers.map(v => (<option key={v.id} value={v.id}>{v.course_name} ({v.voucher_code})</option>))}
                                                                </select>
                                                            </td>
                                                            <td style={tdStyle}><button style={assignBtnStyle} onClick={() => handleAssign(s.id)}>Assign</button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* 2. Control & Emergency Reset Table */}
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <h2 style={{ color: '#188038', margin: 0 }}>2. Control & Emergency Reset</h2>
                        <button onClick={handleDownloadReport} style={downloadBtnStyle}>📥 Download CSV Report</button>
                    </div>
                    <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={thStyle}>S.No</th>
                                    <th style={thStyle}>Reg No</th>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Voucher</th>
                                    <th style={thStyle}>Visibility</th>
                                    <th style={thStyle}>Exam Result</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((a, index) => (
                                    <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>{index + 1}</td>
                                        <td style={tdStyle}>{a.std_reg_no}</td>
                                        <td style={tdStyle}>{a.student_name}</td>
                                        <td style={tdStyle}><code>{a.voucher_code}</code></td>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleToggle(a.id, a.is_visible)} style={{ background: a.is_visible ? '#34a853' : '#ea4335', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor:'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                                                {a.is_visible ? "VISIBLE" : "HIDDEN"}
                                            </button>
                                        </td>
                                        <td style={tdStyle}>
                                            <select style={selectStyle} onChange={(e) => handleUpdateResult(a.id, e.target.value)} defaultValue="">
                                                <option value="" disabled>Update</option>
                                                <option value="passed">Passed</option>
                                                <option value="failed">Failed</option>
                                            </select>
                                        </td>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleResetStudent(a.student_db_id)} style={{ background: '#fce8e6', color: '#d93025', border: '1px solid #d93025', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reset</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- STYLES ---
const tableWrapperStyle = { overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' };
const sectionStyle = { background: 'white', padding: '25px', borderRadius: '15px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', boxSizing: 'border-box' };
const thStyle = { padding: '15px 12px', textAlign: 'left', fontSize: '13px', borderBottom: '2px solid #eee', whiteSpace: 'nowrap', fontWeight: '600' };
const tdStyle = { padding: '15px 12px', fontSize: '13px', whiteSpace: 'nowrap' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '700px' };
const cardGridStyle = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '40px' };
const cardStyle = { padding: '25px', borderRadius: '15px', flex: '1 1 200px', maxWidth: '300px', textAlign: 'center', background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const uploadBoxStyle = { border: '2px dashed #ccc', borderRadius: '12px', padding: '30px 20px', textAlign: 'center', backgroundColor: '#fafafa', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'border 0.3s ease' };
const browseLabelStyle = { background: '#fff', border: '1px solid #188038', color: '#188038', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' };
const selectStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', minWidth: '150px', outline: 'none' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box', outline: 'none' };
const assignBtnStyle = { padding: '8px 20px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const uploadBtnStyle = { padding: '12px 20px', background: '#188038', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const downloadBtnStyle = { padding: '10px 18px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtnStyle = { padding: '6px 12px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };

export default AdminDashboard;