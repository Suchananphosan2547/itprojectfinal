'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

// Icons are replaced with inline SVG to avoid dependencies
const IconPenToSquare = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4"><path d="M471.6 21.7c-21.9-21.9-57.5-21.9-79.4 0L362.4 51.7l97.9 97.9 30.3-30.3c21.9-21.9 21.9-57.5 0-79.4L471.6 21.7zm-299.8 190.7L194.5 365.2 71.9 491.1c-9.2 9.2-22.9 11.9-35.3 7.4S-1.4 466.8 2.8 454.4L128.7 331.8 301.6 158.9 409.9 267.2 243.6 433.5c-44.9 44.9-106.1 50-149.2 13.9s-31-118.2 13.9-149.2L217.2 147.2l97.9 97.9-122.9 122.9c-2.4 2.4-4.7 4.8-7 7.2L160 380.8z"/></svg>
);
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4"><path d="M135.2 17.7C140.7 6.3 151.7 0 163.8 0H284.2c12.1 0 23.2 6.3 28.7 17.7L384 100.8V176H64V100.8L135.2 17.7zM0 176c0-26.5 21.5-48 48-48H88V96c0-35.3 28.7-64 64-64h128c35.3 0 64 28.7 64 64v32h40c26.5 0 48 21.5 48 48v312c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176zm64 48V464h320V224H64zm192 48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
);
const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm90.4-332.6c-4.5-4.5-10.4-6.8-16.3-6.8s-11.8 2.3-16.3 6.8L224 287.4l-33.8-33.8c-4.5-4.5-10.4-6.8-16.3-6.8s-11.8 2.3-16.3 6.8c-9 9-9 23.6 0 32.6l48 48c4.5 4.5 10.4 6.8 16.3 6.8s11.8-2.3 16.3-6.8l96-96c9-9 9-23.6 0-32.6z"/></svg>
);

// --- Dummy Data ---
const DUMMY_FACULTIES = [
    { faculty_id: 1, faculty_name: 'คณะวิศวกรรมศาสตร์' },
    { faculty_id: 2, faculty_name: 'คณะแพทยศาสตร์' },
    { faculty_id: 3, faculty_name: 'คณะศิลปกรรมศาสตร์' },
    { faculty_id: 4, faculty_name: 'คณะเศรษฐศาสตร์' },
    { faculty_id: 5, faculty_name: 'คณะสถาปัตยกรรมศาสตร์' },
];

const DUMMY_MAJORS = [
    { major_id: 101, major_name: 'สาขาวิศวกรรมคอมพิวเตอร์', faculty_id: 1 },
    { major_id: 102, major_name: 'สาขาวิศวกรรมโยธา', faculty_id: 1 },
    { major_id: 201, major_name: 'สาขาการแพทย์แผนไทย', faculty_id: 2 },
    { major_id: 202, major_name: 'สาขาพยาบาลศาสตร์', faculty_id: 2 },
    { major_id: 301, major_name: 'สาขาดนตรีสากล', faculty_id: 3 },
    { major_id: 401, major_name: 'สาขาเศรษฐศาสตร์การเงิน', faculty_id: 4 },
    { major_id: 501, major_name: 'สาขาสถาปัตยกรรมหลัก', faculty_id: 5 },
    { major_id: 502, major_name: 'สาขาสถาปัตยกรรมภายใน', faculty_id: 5 },
];

const DUMMY_DATA = [
    {
        faculty_id: 1,
        faculty_name: 'คณะวิศวกรรมศาสตร์',
        major_id: 101,
        major_name: 'สาขาวิศวกรรมคอมพิวเตอร์',
        project_code: 'ENG-COMP-001',
        project_name: 'ระบบจัดการฐานข้อมูลอัจฉริยะ',
    },
    {
        faculty_id: 2,
        faculty_name: 'คณะแพทยศาสตร์',
        major_id: 201,
        major_name: 'สาขาการแพทย์แผนไทย',
        project_code: 'MED-THAI-002',
        project_name: 'วิจัยสมุนไพรลดความดันโลหิต',
    },
    {
        faculty_id: 3,
        faculty_name: 'คณะศิลปกรรมศาสตร์',
        major_id: 301,
        major_name: 'สาขาดนตรีสากล',
        project_code: 'ART-MUSIC-003',
        project_name: 'การแสดงดนตรีพื้นบ้านร่วมสมัย',
    },
    {
        faculty_id: 4,
        faculty_name: 'คณะเศรษฐศาสตร์',
        major_id: 401,
        major_name: 'สาขาเศรษฐศาสตร์การเงิน',
        project_code: 'ECON-FIN-004',
        project_name: 'วิเคราะห์ผลกระทบของสกุลเงินดิจิทัล',
    },
    {
        faculty_id: 5,
        faculty_name: 'คณะสถาปัตยกรรมศาสตร์',
        major_id: 501,
        major_name: 'สาขาสถาปัตยกรรมหลัก',
        project_code: 'ARCH-MAIN-005',
        project_name: 'การออกแบบอาคารประหยัดพลังงาน',
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
                        <p className="text-xs text-back-400 mt-1">
                    <span className="font-semibold">{user.project_code}</span> - {user.project_name}</p>
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
        className="hover:bg-gray-50"
    >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.project_code}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.project_name}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.faculty_name}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.major_name}</td>
    </tr>
);


// --- Main Page Component ---
export default function AdminProjectClientPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');

    const [majors, setMajors] = useState([]);

    const [pageState, setPageState] = useState('list');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (selectedFaculty) {
            const filteredMajors = DUMMY_MAJORS.filter(major => major.faculty_id === parseInt(selectedFaculty));
            setMajors(filteredMajors);
        } else {
            setMajors([]);
        }
        setSelectedMajor('');
    }, [selectedFaculty]);

    const filteredUsers = DUMMY_DATA.filter(user => {
        const matchesSearch = user.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.major_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.project_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFaculty = selectedFaculty ? user.faculty_id === parseInt(selectedFaculty) : true;
        const matchesMajor = selectedMajor ? user.major_id === parseInt(selectedMajor) : true;

        return matchesSearch && matchesFaculty && matchesMajor;
    });

    return (
        <div className="bg-gray-100 min-h-screen py-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 px-2 sm:px-0">
                    <h1 className="text-2xl font-bold text-gray-800">โครงการทั้งหมด</h1>
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
                            {filteredUsers.length === 0 ? (
                                <p className="text-center p-6">ไม่พบข้อมูล</p>
                            ) : (
                                <>
                                    <div className="space-y-4 md:hidden">
                                        {filteredUsers.map((user, index) => (
                                            <UserCard key={index} user={user} onClick={() => handleItemClick(user)} />
                                        ))}
                                    </div>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-teal-600">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">คณะ</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">สาขา</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">รหัสโครงการ</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ชื่อโครงการ</th>
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