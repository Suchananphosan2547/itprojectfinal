'use client';

import { FaPlus, FaSearchengin, FaPenToSquare, FaTrash, FaChevronLeft, FaChevronRight, FaCheck, FaMagnifyingGlass, FaCircleInfo } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

export default function FiscalYearClientPage() {
    const [fiscalYears, setFiscalYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchFiscalYears = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                setError('Access token not found. Please log in.');
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${accessToken}` } };
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await axios.get(`${apiBaseUrl}/api/fiscal-year`, { params: { page }, ...config });
            setFiscalYears(response.data.data || []);
            setCurrentPage(response.data.pagination.currentPage);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error('Error fetching fiscal years:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch fiscal years.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiscalYears(currentPage);
    }, [currentPage]);

    const handleAddFiscalYear = async (fiscalName) => {
        try {
            const accessToken = Cookies.get('accessToken');
            const config = { headers: { Authorization: `Bearer ${accessToken}` } };
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await axios.post(`${apiBaseUrl}/api/fiscal-year/create`, { fiscal_name: fiscalName }, config);

            Swal.fire({
                title: 'สำเร็จ',
                text: 'เพิ่มปีงบประมาณสำเร็จ', 
                icon: 'success',
                confirmButtonText: 'ตกลง'
            });

            fetchFiscalYears();
        } catch (err) {
            console.error('Error adding fiscal year:', err);

            Swal.fire({
                title: 'เกิดข้อผิดพลาด', 
                text: err.response?.data?.message || 'ล้มเหลวในการเพิ่มปีงบประมาณ', 
                icon: 'error',
                confirmButtonText: 'ตกลง' 
            });

            throw err;
        }
    };

    const handleEditFiscalYear = async (fiscalId, newFiscalName) => {
        try {
            const accessToken = Cookies.get('accessToken');
            const config = { headers: { Authorization: `Bearer ${accessToken}` } };
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await axios.put(`${apiBaseUrl}/api/fiscal-year/${fiscalId}`, { fiscal_name: newFiscalName }, config);

            Swal.fire({
                title: 'สำเร็จ',
                text: 'แก้ไขปีงบประมาณสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            });

            fetchFiscalYears();
        } catch (err) {
            console.error('Error editing fiscal year:', err);

            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: err.response?.data?.message || 'ล้มเหลวในการแก้ไขปีงบประมาณ',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });

            throw err;
        }
    };

    const handleActiveFiscalYear = async (fiscalId) => {
        try {
            const accessToken = Cookies.get('accessToken');
            const config = { headers: { Authorization: `Bearer ${accessToken}` } };
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await axios.put(`${apiBaseUrl}/api/active-fiscal-year/${fiscalId}`, {}, config);

            Swal.fire({
                title: 'สำเร็จ',
                text: 'เปิดใช้งานปีงบประมาณสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            });

            fetchFiscalYears();
        } catch (err) {
            console.error('Error activating fiscal year:', err);

            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: err.response?.data?.message || 'ล้มเหลวในการเปิดใช้งานปีงบประมาณ',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
        }
    };

    const handleDeleteFiscalYear = async (fiscalId) => {
        Swal.fire({
            title: 'ยืนยันการลบข้อมูล',
            text: "คุณต้องการลบปีงบประมาณนี้หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', 
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const accessToken = Cookies.get('accessToken');
                    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
                    const response = await axios.delete(`${apiBaseUrl}/api/fiscal-year/${fiscalId}`, config);

                    Swal.fire({
                        title: 'ลบข้อมูลสำเร็จ',
                        text: 'ปีงบประมาณปิดใช้งานแล้ว',
                        icon: 'success',
                        confirmButtonText: 'ตกลง'
                    });

                    fetchFiscalYears();
                } catch (err) {
                    console.error('Error deleting fiscal year:', err);

                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: err.response?.data?.message || 'ล้มเหลวในการลบปีงบประมาณ',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    });
                }
            }
        });
    };

    const filteredFiscalYears = fiscalYears.filter(fiscal =>
        fiscal.fiscal_name.toString().includes(searchTerm)
    );

    // Add Modal Component
    const AddFiscalYearModal = ({ isOpen, onClose, onSave }) => {
        const [fiscalName, setFiscalName] = useState('');
        const [modalError, setModalError] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setModalError('');
            try {
                await onSave(fiscalName);
                setFiscalName('');
                onClose();
            } catch (err) {
                setModalError(err.message || 'Failed to add fiscal year.');
            }
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center p-6 border-b flex-shrink-0 ">
                        <h3 className="text-xl font-semibold">เพิ่มปีงบประมาณ</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
                    </div>
                    <form id="addFiscalYearForm" onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
                        <div>
                            <label htmlFor="fiscal_name" className="block text-sm font-medium text-slate-700">ปีงบประมาณ</label>
                            <input type="number" id="fiscal_name" name="fiscal_name" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={fiscalName} onChange={(e) => setFiscalName(e.target.value)} required />
                        </div>
                        {modalError && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{modalError}</div>}
                    </form>
                    <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
                        <button type="submit" form="addFiscalYearForm" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">เพิ่มปีงบประมาณ</button>
                    </div>
                </div>
            </div>
        );
    };

    // Edit Modal Component
    const EditFiscalYearModal = ({ isOpen, onClose, onSave, fiscalYear }) => {
        const [fiscalName, setFiscalName] = useState(fiscalYear?.fiscal_name || '');
        const [modalError, setModalError] = useState('');

        useEffect(() => {
            if (fiscalYear) {
                setFiscalName(fiscalYear.fiscal_name);
            }
        }, [fiscalYear]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setModalError('');
            try {
                await onSave(fiscalYear.fiscal_id, fiscalName);
                onClose();
            } catch (err) {
                setModalError(err.message || 'Failed to update fiscal year.');
            }
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                        <h3 className="text-xl font-semibold">แก้ไขปีงบประมาณ</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
                    </div>
                    <form id="editFiscalYearForm" onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
                        <div>
                            <label htmlFor="edit_fiscal_name" className="block text-sm font-medium text-slate-700">ปีงบประมาณ</label>
                            <input type="number" id="edit_fiscal_name" name="fiscal_name" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={fiscalName} onChange={(e) => setFiscalName(e.target.value)} required />
                        </div>
                        {modalError && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{modalError}</div>}
                    </form>
                    <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
                        <button type="submit" form="editFiscalYearForm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">บันทึก</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen py-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6 px-2 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-800">
                        งบประจำปี
                    </h1>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                    >
                        <FaPlus className="mr-2 h-4 w-4" />
                        เพิ่มปีงบประมาณ
                    </button>
                </header>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-4 gap-2 w-full">
                        <div className="relative flex-grow">
                            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="ค้นหา..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading && <p className="text-center p-6">กำลังโหลด...</p>}
                    {error && <p className="text-center p-6 text-red-500">Error: {error}</p>}
                    {!loading && !error && filteredFiscalYears.length === 0 && <div className="text-center p-10 text-gray-500">
                        <FaCircleInfo className="mx-auto text-4xl mb-2" />
                        <p>ไม่พบแผนงาน</p>
                    </div>}

                    {!loading && !error && filteredFiscalYears.length > 0 && (
                        <>
                            {/* Card View for Mobile */}
                            <div className="space-y-4 md:hidden">
                                {filteredFiscalYears.map((item) => (
                                    <div key={item.fiscal_id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                        <div className="flex justify-between items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-lg font-semibold text-gray-800">ปีงบประมาณ {item.fiscal_name}</p>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.fiscal_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {item.fiscal_status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </span>
                                            </div>

                                            <div className="flex items-center flex-shrink-0 space-x-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedFiscalYear(item);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"
                                                    aria-label="Edit item"
                                                >
                                                    <FaPenToSquare className="h-5 w-5" />
                                                </button>
                                                {item.fiscal_status === 'active' ? (
                                                    <button
                                                        onClick={() => handleDeleteFiscalYear(item.fiscal_id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                                        aria-label="Delete item"
                                                    >
                                                        <FaTrash className="h-5 w-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActiveFiscalYear(item.fiscal_id)}
                                                        className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                                                        aria-label="Activate item"
                                                    >
                                                        <FaCheck className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Table View for Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="w-1/3 px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                ปีงบประมาณ
                                            </th>
                                            <th className="w-1/3 px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                สถานะของปี
                                            </th>
                                            <th className="w-1/3 px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                เมนู
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFiscalYears.map((item, index) => (
                                            <tr
                                                key={item.fiscal_id}
                                                className={`border-t border-gray-100 hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                                    }`}
                                            >
                                                <td className="w-1/3 px-6 py-4 text-gray-800 font-medium text-center">
                                                    {item.fiscal_name}
                                                </td>
                                                <td className="w-1/3 px-6 py-4 text-gray-700">
                                                    <div className="flex justify-center">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${item.fiscal_status === "active"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-600"
                                                                }`}
                                                        >
                                                            {item.fiscal_status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="w-1/3 px-6 py-4 text-sm">
                                                    <div className="flex justify-center space-x-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedFiscalYear(item);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition"
                                                            aria-label="Edit item"
                                                        >
                                                            <FaPenToSquare className="h-4 w-4" />
                                                        </button>
                                                        {item.fiscal_status === "active" ? (
                                                            <button
                                                                onClick={() => handleDeleteFiscalYear(item.fiscal_id)}
                                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition"
                                                                aria-label="Delete item"
                                                            >
                                                                <FaTrash className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleActiveFiscalYear(item.fiscal_id)}
                                                                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-full transition"
                                                                aria-label="Activate item"
                                                            >
                                                                <FaCheck className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}


                    {!loading && !error && totalPages > 1 && (
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                            <div className="inline-flex mt-2 xs:mt-0">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 h-8 text-sm text-white bg-gray-800 rounded-l hover:bg-gray-900 disabled:bg-gray-400"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 h-8 text-sm text-white bg-gray-800 rounded-r hover:bg-gray-900 disabled:bg-gray-400 ml-1"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddFiscalYearModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddFiscalYear}
            />

            {selectedFiscalYear && (
                <EditFiscalYearModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleEditFiscalYear}
                    fiscalYear={selectedFiscalYear}
                />
            )}
        </div>
    );
}