'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// --- Dummy Data ---
// ข้อมูลจำลองสำหรับคณะและสาขา
const DUMMY_FACULTIES = [
    { faculty_id: 1, faculty_name: 'คณะศิลปศาสตร์และวิทยาศาสตร์' },
    { faculty_id: 2, faculty_name: 'คณะแพทยศาสตร์' },
    { faculty_id: 3, faculty_name: 'คณะศิลปกรรมศาสตร์' },
    { faculty_id: 4, faculty_name: 'คณะเศรษฐศาสตร์' },
    { faculty_id: 5, faculty_name: 'คณะสถาปัตยกรรมศาสตร์' },
];

const DUMMY_MAJORS = [
    { major_id: 101, major_name: 'สาขาเทคโนโลยีสารสนเทศ', faculty_id: 1 },
    { major_id: 102, major_name: 'สาขาวิศวกรรมโยธา', faculty_id: 1 },
    { major_id: 201, major_name: 'สาขาการแพทย์แผนไทย', faculty_id: 2 },
    { major_id: 202, major_name: 'สาขาพยาบาลศาสตร์', faculty_id: 2 },
    { major_id: 301, major_name: 'สาขาดนตรีสากล', faculty_id: 3 },
    { major_id: 401, major_name: 'สาขาเศรษฐศาสตร์การเงิน', faculty_id: 4 },
    { major_id: 501, major_name: 'สาขาสถาปัตยกรรมหลัก', faculty_id: 5 },
    { major_id: 502, major_name: 'สาขาสถาปัตยกรรมภายใน', faculty_id: 5 },
];

// ข้อมูลจำลองนี้ใช้สำหรับแสดงผลในตาราง
const DUMMY_DATA = [
    {
      faculty_id: 1,
      faculty_name: 'คณะศิลปศาสตร์และวิทยาศาสตร์',
      major_id: 101,
      major_name: 'สาขาเทคโนโลยีสารสนเทศ',
    },
    {
      faculty_id: 2,
      faculty_name: 'คณะแพทยศาสตร์',
      major_id: 201,
      major_name: 'สาขาการแพทย์แผนไทย',
    },
    {
      faculty_id: 3,
      faculty_name: 'คณะศิลปกรรมศาสตร์',
      major_id: 301,
      major_name: 'สาขาดนตรีสากล',
    },
    {
      faculty_id: 4,
      faculty_name: 'คณะเศรษฐศาสตร์',
      major_id: 401,
      major_name: 'สาขาเศรษฐศาสตร์การเงิน',
    },
    {
      faculty_id: 5,
      faculty_name: 'คณะสถาปัตยกรรมศาสตร์',
      major_id: 501,
      major_name: 'สาขาสถาปัตยกรรมหลัก',
    },
];

// --- User Card Component (สำหรับมุมมองมือถือ) ---
const UserCard = ({ user, onClick }) => (
  <div
    className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50"
    onClick={onClick}
  >
    <div className="flex justify-between items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-teal-700 truncate">{user.faculty_name}</p>
        <p className="text-xs text-gray-600 truncate">{user.major_name}</p>
      </div>
    </div>
  </div>
);

// --- User Table Row Component (สำหรับมุมมองเดสก์ท็อป) ---
const UserTableRow = ({ user, onClick }) => (
  <tr
    key={user.major_name}
    className="hover:bg-gray-50 cursor-pointer"
    onClick={onClick}
  >
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.faculty_name}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.major_name}</td>
  </tr>
);

// --- Faculty Detail Page Component ---
const FacultyDetailPage = ({ selectedUser, onBack }) => {
    // ข้อมูลจำลองสำหรับกราฟ ซึ่งควรถูกดึงมาจาก API จริงในอนาคต
    const graphData = [
        { year: 2019, 'จำนวนโครงการ': 280, 'งบประมาณ': 220 },
        { year: 2020, 'จำนวนโครงการ': 300, 'งบประมาณ': 220 },
        { year: 2021, 'จำนวนโครงการ': 400, 'งบประมาณ': 340 },
        { year: 2022, 'จำนวนโครงการ': 180, 'งบประมาณ': 70 },
    ];

    // Tooltip formatter สำหรับแสดงข้อมูลใน tooltip เมื่อนำเมาส์ไปวางบนกราฟ
    const tooltipFormatter = (value, name, props) => {
        if (name === 'จำนวนโครงการ') {
            return `${value} โครงการ`;
        }
        if (name === 'งบประมาณ') {
            return `${value} ล้านบาท`; // หรือหน่วยอื่นตามความเหมาะสม
        }
        return value;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <button
                className="mb-4 px-4 py-2 text-sm text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition"
                onClick={onBack}
            >
                &larr; ย้อนกลับ
            </button>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedUser.faculty_name}</h2>
                <h3 className="text-lg text-gray-600 mb-6">{selectedUser.major_name}</h3>
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                        <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">วันที่เสร็จสิ้น</label>
                        <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                </div>
                <div className="mt-4">
                    <h4 className="text-lg font-bold">Statistics</h4>
                    <p className="text-sm text-gray-500">Demographic</p>
                    {/* ใช้ ResponsiveContainer เพื่อให้กราฟปรับขนาดตามหน้าจอ */}
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={graphData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip formatter={tooltipFormatter} />
                                <Legend />
                                <Bar dataKey="จำนวนโครงการ" fill="#4f46e5" />
                                <Bar dataKey="งบประมาณ" fill="#c084fc" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function AdminHomeClientPage() {
    // State สำหรับเก็บคำค้นหา
    const [searchTerm, setSearchTerm] = useState('');
    // State สำหรับเก็บตัวกรองที่เลือก
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    
    // State สำหรับ Majors ที่จะแสดงใน dropdown ของ filter
    const [majors, setMajors] = useState([]);
    
    // State for conditional rendering
    const [pageState, setPageState] = useState('list'); // 'list' or 'detail'
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        // อัปเดตรายการสาขาเมื่อมีการเปลี่ยนคณะ
        if (selectedFaculty) {
            const filteredMajors = DUMMY_MAJORS.filter(major => major.faculty_id === parseInt(selectedFaculty));
            setMajors(filteredMajors);
        } else {
            setMajors([]);
        }
        setSelectedMajor(''); // รีเซ็ตสาขาเมื่อเปลี่ยนคณะ
    }, [selectedFaculty]);

    // กรองข้อมูลตามคำค้นหาและตัวกรอง
    const filteredUsers = DUMMY_DATA.filter(user => {
        const matchesSearch = user.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.major_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFaculty = selectedFaculty ? user.faculty_id === parseInt(selectedFaculty) : true;
        const matchesMajor = selectedMajor ? user.major_id === parseInt(selectedMajor) : true;
        
        return matchesSearch && matchesFaculty && matchesMajor;
    });

    const handleItemClick = (user) => {
        setSelectedUser(user);
        setPageState('detail');
    };

    return (
        <div className="bg-gray-100 min-h-screen py-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 px-2 sm:px-0">
                    <h1 className="text-2xl font-bold text-gray-800">หน้าหลัก</h1>
                </header>
                {pageState === 'list' ? (
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <form className="flex flex-col sm:flex-row items-stretch sm:items-center mb-4 gap-2">
                            <div className="flex-grow flex">
                                <input
                                    type="text"
                                    placeholder="ค้นหา..."
                                    className="flex-grow px-4 py-2 h-10 border border-gray-300 rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                                {/* Filter by Faculty */}
                                <select
                                    value={selectedFaculty}
                                    onChange={(e) => setSelectedFaculty(e.target.value)}
                                    className="px-4 py-2 h-10 border border-gray-300 rounded-lg"
                                >
                                    <option value="">ทั้งหมด (คณะ)</option>
                                    {DUMMY_FACULTIES.map(faculty => (
                                        <option key={faculty.faculty_id} value={faculty.faculty_id}>{faculty.faculty_name}</option>
                                    ))}
                                </select>
                                {/* Filter by Major (disabled if no faculty is selected) */}
                                <select
                                    value={selectedMajor}
                                    onChange={(e) => setSelectedMajor(e.target.value)}
                                    className="px-4 py-2 h-10 border border-gray-300 rounded-lg"
                                    disabled={!selectedFaculty}
                                >
                                    <option value="">ทั้งหมด (สาขา)</option>
                                    {majors.map(major => (
                                        <option key={major.major_id} value={major.major_id}>{major.major_name}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                        <main>
                            {/* แสดงผลหากไม่พบข้อมูล */}
                            {filteredUsers.length === 0 ? (
                                <p className="text-center p-6">ไม่พบข้อมูล</p>
                            ) : (
                                <>
                                    {/* แสดงผลสำหรับมุมมองมือถือ */}
                                    <div className="space-y-4 md:hidden">
                                        {filteredUsers.map((user, index) => (
                                            <UserCard key={index} user={user} onClick={() => handleItemClick(user)} />
                                        ))}
                                    </div>
                                    {/* แสดงผลสำหรับมุมมองเดสก์ท็อป */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-teal-600">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">คณะ</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">สาขา</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredUsers.map((user, index) => (
                                                    <UserTableRow key={index} user={user} onClick={() => handleItemClick(user)} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </main>
                    </div>
                ) : (
                    <FacultyDetailPage selectedUser={selectedUser} onBack={() => setPageState('list')} />
                )}
            </div>
        </div>
    );
}
