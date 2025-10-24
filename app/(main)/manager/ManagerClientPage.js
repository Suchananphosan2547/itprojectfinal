'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPlus, FaPenToSquare, FaTrash, FaSearchengin, FaSearch, FaMagnifyingGlass } from 'react-icons/fa6';
import Cookies from 'js-cookie';

// 🚩 แก้ไข API_BASE_URL ให้สอดคล้องกับ URL ใหม่
const API_BASE_URL = 'https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master';

const validateManagerData = (data) => {
    // 1. ตรวจสอบข้อมูลที่ต้องกรอก (Required Fields Validation)
    if (!data.manager_prefix || data.manager_prefix.trim() === '') {
        return 'กรุณาเลือกคำนำหน้า';
    }
    if (!data.manager_fname || data.manager_fname.trim() === '') {
        return 'กรุณากรอกชื่อจริง';
    }
    if (!data.manager_lname || data.manager_lname.trim() === '') {
        return 'กรุณากรอกนามสกุล';
    }
    if (!data.house_number || data.house_number.trim() === '') {
        return 'กรุณากรอกบ้านเลขที่';
    }

    // 2. ตรวจสอบรูปแบบพื้นฐาน (Basic Format Validation)

    // ชื่อ-นามสกุล: อนุญาตเฉพาะตัวอักษรภาษาไทย/อังกฤษ และเว้นวรรค
    const nameRegex = /^[a-zA-Zก-ฮะ-์\s]+$/;
    if (!nameRegex.test(data.manager_fname) || !nameRegex.test(data.manager_lname)) {
        return 'ชื่อจริงและนามสกุลไม่ถูกต้อง';
    }

    // บ้านเลขที่: อนุญาตตัวอักษร, ตัวเลข, เครื่องหมาย / และ -
    const addressNumberRegex = /^[a-zA-Z0-9\s/-]+$/;
    if (!addressNumberRegex.test(data.house_number)) {
        return 'บ้านเลขที่ไม่ถูกต้อง';
    }

    // 3. ตรวจสอบที่อยู่ (Address Validation)

    if (!data.province || data.province.trim() === '') {
        return 'กรุณาเลือกจังหวัด';
    }
    if (!data.prefecture || data.prefecture.trim() === '') {
        return 'กรุณาเลือกอำเภอ/เขต';
    }
    if (!data.district || data.district.trim() === '') {
        return 'กรุณาเลือกตำบล/แขวง';
    }

    // รหัสไปรษณีย์: ต้องเป็นตัวเลข 5 หลัก (ตรวจสอบเป็นขั้นตอนสุดท้าย)
    const zipCodeRegex = /^\d{5}$/;
    if (!data.zip_code || !zipCodeRegex.test(data.zip_code)) {
        return 'รหัสไปรษณีย์ไม่ถูกต้อง';
    }

    return null; // ข้อมูลถูกต้อง
};

// --- Manager Card Component (for mobile view) ---
const ManagerCard = ({ manager, onEdit, onDelete }) => {
    const fullName = `${manager.manager_prefix} ${manager.manager_fname} ${manager.manager_lname}`;
    return (
        <div className="bg-white p-4 mt-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{fullName}</p>
                    <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">คณะ:</span> {manager.faculty_name || '-'}
                    </p>
                    <p className="text-sm text-gray-500">
                        <span className="font-semibold">สาขา:</span> {manager.major_name || '-'}
                    </p>
                </div>
                <div className="flex flex-row items-end space-x-2 flex-shrink-0 ml-4">
                    <button onClick={onEdit} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full">
                        <FaPenToSquare />
                    </button>
                    <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Base Manager Modal Component for form fields ---
const ManagerFormFields = ({ managerData, setManagerData, isEditMode = false }) => {
    const [provinces, setProvinces] = useState([]);
    const [prefectures, setPrefectures] = useState([]); // อำเภอ/เขต
    const [districts, setDistricts] = useState([]); // ตำบล/แขวง
    const [allPrefectures, setAllPrefectures] = useState([]);
    const [allDistricts, setAllDistricts] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedPrefectureId, setSelectedPrefectureId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');

    useEffect(() => {
        const fetchAddressData = async () => {
            try {
                // 🚩 แก้ไขการเรียกใช้ API เป็น URL ใหม่ (ตามที่เคยแจ้งมา)
                const [provRes, prefRes, distRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/latest/province.json`),
                    axios.get(`${API_BASE_URL}/api/latest/district.json`),
                    axios.get(`${API_BASE_URL}/api/latest/sub_district.json`)
                ]);
                setProvinces(provRes.data);
                setAllPrefectures(prefRes.data);
                setAllDistricts(distRes.data);
            } catch (error) {
                console.error("Failed to fetch address data:", error);
            }
        };
        fetchAddressData();
    }, []);

    // Effect สำหรับโหลดข้อมูลที่อยู่เมื่ออยู่ในโหมดแก้ไข
    useEffect(() => {
        if (isEditMode && managerData.province && provinces.length && allPrefectures.length && allDistricts.length) {
            const province = provinces.find(p => p.name_th === managerData.province);
            if (province) {
                setSelectedProvinceId(province.id);
                
                const filteredPrefectures = allPrefectures.filter(d => d.province_id === province.id);
                setPrefectures(filteredPrefectures);

                const prefecture = filteredPrefectures.find(d => d.name_th === managerData.prefecture);
                if (prefecture) {
                    setSelectedPrefectureId(prefecture.id);
                    
                    const filteredDistricts = allDistricts.filter(sd => sd.district_id === prefecture.id);
                    setDistricts(filteredDistricts);

                    const district = filteredDistricts.find(sd => sd.name_th === managerData.district);
                    if (district) setSelectedDistrictId(district.id);
                }
            }
        }
    }, [isEditMode, managerData, provinces, allPrefectures, allDistricts]);

    const handleProvinceChange = (provinceId) => {
        const province = provinces.find(p => p.id == provinceId);
        // Reset prefecture, district, and zip_code
        setManagerData(prev => ({ ...prev, province: province?.name_th || '', prefecture: '', district: '', zip_code: '' }));
        setSelectedProvinceId(provinceId);
        setPrefectures(provinceId ? allPrefectures.filter(d => d.province_id == provinceId) : []);
        setDistricts([]);
        setSelectedPrefectureId('');
        setSelectedDistrictId('');
    };

    const handlePrefectureChange = (prefectureId) => {
        const prefecture = allPrefectures.find(d => d.id == prefectureId);
        // Reset district and zip_code
        setManagerData(prev => ({ ...prev, prefecture: prefecture?.name_th || '', district: '', zip_code: '' }));
        setSelectedPrefectureId(prefectureId);
        setDistricts(prefectureId ? allDistricts.filter(sd => sd.district_id == prefectureId) : []);
        setSelectedDistrictId('');
    };

    const handleDistrictChange = (districtId) => {
        const district = allDistricts.find(sd => sd.id == districtId);
        // Set district name and zip_code
        setManagerData(prev => ({ ...prev, district: district?.name_th || '', zip_code: district?.zip_code || '' }));
        setSelectedDistrictId(districtId);
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setManagerData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">คำนำหน้า <span className="text-red-500">*</span></label>
                <select name="manager_prefix" value={managerData.manager_prefix || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required>
                    <option value="">เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="นาง">นาง</option>
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">ชื่อจริง <span className="text-red-500">*</span></label>
                    <input type="text" name="manager_fname" value={managerData.manager_fname || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">นามสกุล <span className="text-red-500">*</span></label>
                    <input type="text" name="manager_lname" value={managerData.manager_lname || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">บ้านเลขที่ <span className="text-red-500">*</span></label>
                <input type="text" name="house_number" value={managerData.house_number || ''} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">จังหวัด <span className="text-red-500">*</span></label>
                    <select value={selectedProvinceId} onChange={(e) => handleProvinceChange(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2">
                        <option value="">เลือกจังหวัด</option>
                        {provinces.map(item => <option key={item.id} value={item.id}>{item.name_th}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">อำเภอ/เขต <span className="text-red-500">*</span></label>
                    <select value={selectedPrefectureId} onChange={(e) => handlePrefectureChange(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" disabled={!prefectures.length}>
                        <option value="">เลือกอำเภอ/เขต</option>
                        {prefectures.map(item => <option key={item.id} value={item.id}>{item.name_th}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">ตำบล/แขวง <span className="text-red-500">*</span></label>
                    <select value={selectedDistrictId} onChange={(e) => handleDistrictChange(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" disabled={!districts.length}>
                        <option value="">เลือกตำบล/แขวง</option>
                        {districts.map(item => <option key={item.id} value={item.id}>{item.name_th}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">รหัสไปรษณีย์</label>
                    <input type="text" name="zip_code" value={managerData.zip_code || ''} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 bg-slate-100" readOnly />
                </div>
            </div>
        </div>
    );
};

// --- Add Manager Modal Component ---
const AddManagerModal = ({ isOpen, onClose, onAdd, currentUser, faculties, majors }) => {
    const [managerData, setManagerData] = useState({});
    const [displayFacultyName, setDisplayFacultyName] = useState('');
    const [displayMajorName, setDisplayMajorName] = useState('');
    const [error, setError] = useState(''); // State สำหรับ Error UI

    useEffect(() => {
        if (isOpen) {
            setManagerData({});
            setError(''); // รีเซ็ต error ทุกครั้งที่เปิด modal

            // Set faculty/major for Manager role display
            if (currentUser && currentUser.role_id === 2) {
                const faculty = faculties.find(f => f.faculty_id === currentUser.faculty_id);
                if (faculty) setDisplayFacultyName(faculty.faculty_name);

                const major = majors.find(m => m.major_id === currentUser.major_id);
                if (major) setDisplayMajorName(major.major_name);
            }
        }
    }, [isOpen, currentUser, faculties, majors]);

    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        const validationError = validateManagerData(managerData);
        if (validationError) {
            setError(validationError); // แสดง Error ใน UI
            return; // หยุดการทำงาน
        }
        
        // เพิ่ม faculty_id และ major_id จาก currentUser (สำหรับ role_id=2)
        const finalManagerData = {
            ...managerData,
            faculty_id: currentUser?.role_id === 2 ? currentUser.faculty_id : null,
            major_id: currentUser?.role_id === 2 ? currentUser.major_id : null,
        };

        try {
            // onAdd ควรเป็น async function ที่จัดการการเรียก API
            await onAdd(finalManagerData); 
            handleClose();
        } catch (err) {
            // ดักจับ Error จาก Server
            setError(err.response?.data?.message || err.message || 'Failed to add manager.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
            <div className="bg-white mt-4 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                    <h3 className="text-xl font-semibold">เพิ่มอาจารย์ประจำสาขา</h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
                </div>
                <form id="addManagerForm" className="space-y-4 p-6 overflow-y-auto" onSubmit={handleSubmit}>
                    <ManagerFormFields managerData={managerData} setManagerData={setManagerData} />
                    
                    {/* แสดงคณะ/สาขาสำหรับ role_id = 2 (Manager) */}
                    {currentUser?.role_id === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">คณะ</label>
                                <input type="text" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 bg-slate-100" value={displayFacultyName} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">สาขา</label>
                                <input type="text" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 bg-slate-100" value={displayMajorName} readOnly />
                            </div>
                        </div>
                    )}
                    
                    {/* 🚩 แสดง Error UI */}
                    {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}

                </form>
                <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
                    <button type="button" onClick={handleClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
                    <button type="submit" form="addManagerForm" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">เพิ่มอาจารย์</button>
                </div>
            </div>
        </div>
    );
};

// --- Edit Manager Modal Component ---
const EditManagerModal = ({ isOpen, onClose, onUpdate, managerItem }) => {
    const [managerData, setManagerData] = useState({});
    const [error, setError] = useState(''); // State สำหรับ Error UI

    useEffect(() => {
        setManagerData(managerItem || {});
        setError(''); // รีเซ็ต error
    }, [managerItem]);

    if (!isOpen || !managerItem) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        const validationError = validateManagerData(managerData);
        if (validationError) {
            setError(validationError); // แสดง Error ใน UI
            return; // หยุดการทำงาน
        }
        
        try {
            // onUpdate ควรเป็น async function ที่จัดการการเรียก API
            await onUpdate(managerItem.manager_id, managerData);
            onClose();
        } catch (err) {
            // ดักจับ Error จาก Server
            setError(err.response?.data?.message || err.message || 'Failed to update manager.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
            <div className="bg-white mt-4 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                    <h3 className="text-xl font-semibold">แก้ไขข้อมูลอาจารย์</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
                </div>
                <form id="editManagerForm" className="space-y-4 p-6 overflow-y-auto" onSubmit={handleSubmit}>
                    <ManagerFormFields managerData={managerData} setManagerData={setManagerData} isEditMode={true} />
                    
                    {/* แสดงคณะ/สาขาที่อ่านได้อย่างเดียว */}
                    <div><label className="block text-sm font-medium text-slate-700">คณะ</label><div className="mt-1 block w-full border-slate-200 rounded-md bg-slate-100 p-2">{managerItem?.faculty_name || '-'}</div></div>
                    <div><label className="block text-sm font-medium text-slate-700">สาขา</label><div className="mt-1 block w-full border-slate-200 rounded-md bg-slate-100 p-2">{managerItem?.major_name || '-'}</div></div>
                    
                    {/* 🚩 แสดง Error UI */}
                    {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}

                </form>
                <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
                    <button type="submit" form="editManagerForm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">บันทึกการแก้ไข</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function ManagerClientPage() {
    const [managers, setManagers] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedManager, setSelectedManager] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) throw new Error('Access token not found.');
            const config = { headers: { Authorization: `Bearer ${accessToken}` } };
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            // 1. Fetch managers and faculties
            const [managersRes, facultiesRes] = await Promise.all([
                axios.get(`${apiBaseUrl}/api/manager`, config),
                axios.get(`${apiBaseUrl}/api/faculty`, config)
            ]);
            const fetchedManagers = managersRes.data.data || [];
            const fetchedFaculties = facultiesRes.data.data || [];
            setFaculties(fetchedFaculties);

            // 2. Get all unique faculty IDs from the managers
            const uniqueFacultyIds = [...new Set(fetchedManagers.map(m => m.faculty_id).filter(id => id))];

            // 3. Fetch all majors for those unique faculties using the Next.js API route
            const majorPromises = uniqueFacultyIds.map(facultyId =>
                axios.get(`/api/major/${facultyId}`) // Call our Next.js API route
                    .then(res => res.data.data) 
                    .catch(() => []) 
            );
            const majorsByFaculty = await Promise.all(majorPromises);
            const allMajors = majorsByFaculty.flat();
            setMajors(allMajors);

            // 4. Create maps for quick lookup
            const facultyMap = new Map(fetchedFaculties.map(f => [f.faculty_id, f.faculty_name]));
            const majorMap = new Map(allMajors.map(m => [m.major_id, m.major_name]));

            // 5. Combine data to include faculty and major names
            const managersWithNames = fetchedManagers.map(manager => ({
                ...manager,
                faculty_name: facultyMap.get(manager.faculty_id) || '-',
                major_name: majorMap.get(manager.major_id) || '-',
            }));

            setManagers(managersWithNames);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const userData = sessionStorage.getItem('user');
        if (userData) setCurrentUser(JSON.parse(userData));
    }, [fetchData]);

    const filteredManagers = managers.filter(manager => {
        const fullName = `${manager.manager_prefix || ''} ${manager.manager_fname || ''} ${manager.manager_lname || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    const handleAddManager = async (managerData) => {
        try {
            // Role ID 2 คือ Admin สาขา
            const majorId = currentUser?.role_id === 2 ? currentUser.major_id : null;
            const facultyId = currentUser?.role_id === 2 ? currentUser.faculty_id : null;

            const dataToSend = {
                ...managerData,
                major_id: majorId,
                faculty_id: facultyId,
            };

            const accessToken = Cookies.get('accessToken');
            const config = { headers: { Authorization: `Bearer ${accessToken}` } };
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/create`, dataToSend, config);
            Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: response.data.message });
            setIsAddModalOpen(false);
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด!', text: err.response?.data?.message || err.message });
        }
    };

    const handleUpdateManager = async (managerId, managerData) => {
        try {
            const accessToken = Cookies.get('accessToken');
            const config = { headers: { Authorization: `Bearer ${accessToken}` } };
            // โค้ดที่นี่จะส่งเฉพาะข้อมูลที่แก้ไขเท่านั้น (ชื่อ, ที่อยู่) ไม่อัปเดต major_id/faculty_id
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/${managerId}`, managerData, config);
            Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: response.data.message });
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด!', text: err.response?.data?.message || err.message });
        }
    };

    const handleDeleteManager = (managerId) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณจะไม่สามารถย้อนกลับการกระทำนี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const accessToken = Cookies.get('accessToken');
                    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
                    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/${managerId}`, config);
                    Swal.fire({ icon: 'success', title: 'ลบแล้ว!', text: 'ข้อมูลถูกลบเรียบร้อยแล้ว' });
                    fetchData();
                } catch (err) {
                    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด!', text: err.response?.data?.message || err.message });
                }
            }
        });
    };
    
    const handleEditClick = (manager) => {
        setSelectedManager(manager);
        setIsEditModalOpen(true);
    };

    return (
        <div className="bg-gray-100 min-h-screen py-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 px-2 sm:px-0">
                    <h1 className="text-2xl font-bold text-gray-800">จัดการอาจารย์ประจำสาขา</h1>
                    <div className="flex space-x-3 mt-4">
                        <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transition-colors">
                            <FaPlus className="mr-2" />เพิ่มอาจารย์ประจำสาขา
                        </button>
                    </div>
                </header>
                            <div className="bg-white mt-4 rounded-xl shadow-lg p-6"> 
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    name="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ค้นหาอาจารย์..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm "
                                />
                                <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            </div>

                    <div>
                        {isLoading ? (
                            <p className="text-center py-4">กำลังโหลด...</p>
                        ) : error ? (
                            <p className="text-center py-4 text-red-500">{error}</p>
                        ) : filteredManagers.length === 0 ? (
                            <p className="text-center py-4 text-gray-500">ไม่พบข้อมูลอาจารย์</p>
                        ) : (
                            <>
                                {/* Card View for Mobile */}
                                <div className="space-y-4 md:hidden">
                                    {filteredManagers.map((manager) => (
                                        <ManagerCard 
                                            key={manager.manager_id}
                                            manager={manager}
                                            onEdit={() => handleEditClick(manager)}
                                            onDelete={() => handleDeleteManager(manager.manager_id)}
                                        />
                                    ))}
                                </div>
                                
                                {/* Table View for Desktop */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4">
                                        <thead className="bg-teal-600">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ชื่อ - นามสกุล</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">คณะ</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">สาขา</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">เมนู</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredManagers.map((manager) => (
                                                <tr key={manager.manager_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${manager.manager_prefix} ${manager.manager_fname} ${manager.manager_lname}`}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.faculty_name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{manager.major_name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button onClick={() => handleEditClick(manager)} className="text-indigo-600 hover:text-indigo-900"><FaPenToSquare /></button>
                                                        {/* 🚩 แก้ไขการเรียก handleDeleteManager ในตารางให้ใช้ manager.manager_id */}
                                                        <button onClick={() => handleDeleteManager(manager.manager_id)} className="text-red-600 hover:text-red-900 ml-4"><FaTrash /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <AddManagerModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddManager}
                currentUser={currentUser}
                faculties={faculties}
                majors={majors}
            />
            <EditManagerModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onUpdate={handleUpdateManager}
                managerItem={selectedManager} 
            />
        </div>
    );
}