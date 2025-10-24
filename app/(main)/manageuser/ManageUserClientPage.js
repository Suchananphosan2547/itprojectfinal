'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPlus, FaUsers, FaSearchengin, FaPenToSquare, FaTrash, FaCheck, FaCloudArrowUp, FaMagnifyingGlass } from 'react-icons/fa6';
import * as XLSX from 'xlsx';
import Cookies from 'js-cookie';

// --- User Card Component (for mobile view) ---
const UserCard = ({ user, onEdit, onActivate, onDelete }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
    <div className="flex justify-between items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-teal-700 truncate">{user.prefix} {user.firstname} {user.lastname}</p>
        <p className="text-xs text-gray-600 truncate">{user.std_id || user.username}</p>
        <p className="text-xs text-gray-500 break-all">{user.email}</p>
      </div>
      <div className="flex items-center space-x-3 text-xl flex-shrink-0">
        <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-900"><FaPenToSquare /></button>
        {user.user_status === 'active' ? (
          <button onClick={onDelete} className="text-red-600 hover:text-red-900"><FaTrash /></button>
        ) : (
          <button onClick={onActivate} className="text-green-600 hover:text-green-900"><FaCheck /></button>
        )}
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-700 space-y-1">
      <p><span className="font-semibold">คณะ:</span> {user.faculty_name || '-'}</p>
      <p><span className="font-semibold">สาขา:</span> {user.major_name || '-'}</p>
      <p><span className="font-semibold">ตำแหน่ง:</span> <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">{user.role_name}</span></p>
    </div>
  </div>
);

// --- User Table Row Component (for desktop view) ---

// ** ไม่ต้องประกาศ canManage ตรงนี้ **

const UserTableRow = ({ user, currentUser, onEdit, onActivate, onDelete }) => {

  // 💡 ย้าย canManage มาไว้ข้างใน Component ตรงนี้
  const canManage = (currentUser?.role_id === 3 || currentUser?.program_type === user.program_type);

  return (
    <tr key={user.username}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.std_id || user.username}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.prefix} {user.firstname} {user.lastname}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.faculty_name || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.major_name || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '-'}</td>

      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

        {/* 💡 ใช้ canManage ตรวจสอบตรงนี้ */}
        {canManage ? (
          <>
            <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-900" title="แก้ไข">
              <FaPenToSquare />
            </button>

            {user.user_status === 'active' ? (
              <button onClick={onDelete} className="text-red-600 hover:text-red-900 ml-4" title="ลบ">
                <FaTrash />
              </button>
            ) : (
              <button onClick={onActivate} className="text-green-600 hover:text-green-900 ml-4" title="เปิดใช้งาน">
                <FaCheck />
              </button>
            )}
          </>
        ) : (
          // ถ้าไม่มีสิทธิ์ (อยู่คนละภาค และไม่ใช่ Admin) ให้แสดงขีด (-)
          <span className="text-gray-400"></span>
        )}

      </td>
    </tr>
  );
};


// --- Modal Components ---

// Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onSave, currentUser, faculties, roles }) => {
  const [username, setUsername] = useState('');
  const [stdId, setStdId] = useState('');
  const [prefix, setPrefix] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // 1. State สำหรับเบอร์โทรศัพท์
  const [programType, setProgramType] = useState('ปกติ');
  const [facultyId, setFacultyId] = useState('');
  const [majorId, setMajorId] = useState('');
  const [roleId, setRoleId] = useState(1); // Default to Student
  const [modalMajors, setModalMajors] = useState([]);
  const [displayFacultyName, setDisplayFacultyName] = useState('');
  const [displayMajorName, setDisplayMajorName] = useState('');
  const [error, setError] = useState('');

  // Effect to set initial state based on currentUser (for Manager role)
  useEffect(() => {
    if (isOpen && currentUser) {
      if (currentUser.role_id === 2) {
        const managerFacultyId = String(currentUser.faculty_id);
        const managerMajorId = String(currentUser.major_id);
        setFacultyId(managerFacultyId);
        setMajorId(managerMajorId);
        const faculty = faculties.find(f => String(f.faculty_id) === managerFacultyId);
        if (faculty) setDisplayFacultyName(faculty.faculty_name);
        if (currentUser.program_type) setProgramType(currentUser.program_type);
      }
    }
  }, [isOpen, currentUser, faculties]);

  // Effect to fetch majors and set display name for Manager
  useEffect(() => {
    const fetchMajorsAndSetDisplay = async () => {
      if (!facultyId) {
        setModalMajors([]);
        setDisplayMajorName('');
        return;
      }
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/major/${facultyId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const fetchedMajors = response.data.data || [];
        setModalMajors(fetchedMajors);
        if (currentUser?.role_id === 2) {
          const managerMajor = fetchedMajors.find(m => String(m.major_id) === String(currentUser.major_id));
          if (managerMajor) setDisplayMajorName(managerMajor.major_name);
        }
      } catch (err) {
        console.error('Failed to fetch majors for modal:', err);
        setError('Failed to load majors.');
      }
    };
    if (isOpen) fetchMajorsAndSetDisplay();
  }, [isOpen, facultyId, currentUser]);

  const resetForm = () => {
    setUsername(''); setStdId(''); setPrefix(''); setFirstname(''); setLastname('');
    setEmail(''); setPhone('');
    setProgramType('ปกติ');
    // Set initial faculty/major for Manager role
    setFacultyId(currentUser?.role_id === 2 ? String(currentUser.faculty_id) : '');
    setMajorId(currentUser?.role_id === 2 ? String(currentUser.major_id) : '');
    setRoleId(1); setError(''); setDisplayFacultyName(''); setDisplayMajorName('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. ตรวจสอบข้อมูลที่ต้องกรอก (Required Fields Validation)
    if (!username || !prefix || !firstname || !lastname || !email || !phone) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    // 2. ตรวจสอบรูปแบบพื้นฐาน (Basic Format Validation)

    // Username: อนุญาตเฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และขีดล่าง (_) อย่างน้อย 4 ตัวอักษร
    const usernameRegex = /^[a-zA-Z0-9]{4,}$/;
    if (!usernameRegex.test(username)) {
      setError('Username ไม่ถูกต้อง');
      return;
    }

    // ชื่อ-นามสกุล: อนุญาตเฉพาะตัวอักษรภาษาไทย/อังกฤษ และเว้นวรรค
    const nameRegex = /^[a-zA-Zก-ฮะ-์\s]+$/;
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
      setError('ชื่อจริงและนามสกุลไม่ถูกต้อง');
      return;
    }

    // รหัสนิสิต (ถ้ามี): ต้องเป็นตัวเลข 8 ถึง 10 หลัก
    const stdIdRegex = /^\d{8,10}$/;
    if (stdId && !stdIdRegex.test(stdId)) {
      setError('รหัสนิสิตไม่ถูกต้อง');
      return;
    }

    // อีเมล: ตรวจสอบรูปแบบมาตรฐาน
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    // เบอร์โทรศัพท์: ต้องเป็นตัวเลข 9 หรือ 10 หลัก
    const phoneRegex = /^\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
      setError('เบอร์โทรศัพท์ไม่ถูกต้อง');
      return;
    }

    // 3. ตรวจสอบคณะ/สาขา ตามสิทธิ์
    let finalFacultyId = facultyId;
    let finalMajorId = majorId;

    if (currentUser?.role_id === 2) {
      finalFacultyId = currentUser.faculty_id;
      finalMajorId = currentUser.major_id;
    }

    // ตรวจสอบคณะสำหรับ Admin (role_id 3)
    if (currentUser?.role_id === 3 && !facultyId) {
      setError('กรุณาเลือกคณะ');
      return;
    }

    // ตรวจสอบสาขาสำหรับ Admin และ Manager (ต้องเลือกสาขา หากมีการเลือกคณะแล้ว หรืออยู่ในสิทธิ์ Manager)
    if ((currentUser?.role_id === 3 && facultyId && !majorId) || (currentUser?.role_id === 2 && !finalMajorId)) {
      setError('กรุณาเลือกสาขา');
      return;
    }


    const userData = {
      username, std_id: stdId, prefix, firstname, lastname, email, phone, // รวม phone
      program_type: programType,
      faculty_id: finalFacultyId ? parseInt(finalFacultyId) : null,
      major_id: finalMajorId ? parseInt(finalMajorId) : null,
      role_id: currentUser?.role_id === 3 ? parseInt(roleId) : 1,
    };

    try {
      await onSave(userData);
      handleClose();
    } catch (err) {
      // ดักจับ Error จาก Server
      setError(err.response?.data?.message || err.message || 'Failed to add user.');
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h3 className="text-xl font-semibold">เพิ่มสมาชิกรายบุคคล</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
        </div>
        <form id="addUserForm" onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label><input type="text" id="username" name="username" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
            <div><label htmlFor="std_id" className="block text-sm font-medium text-slate-700">รหัสนิสิต (ถ้ามี)</label><input type="text" id="std_id" name="std_id" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={stdId} onChange={(e) => setStdId(e.target.value)} /></div>
          </div>
          <div><label htmlFor="prefix" className="block text-sm font-medium text-slate-700">คำนำหน้า</label><select id="prefix" name="prefix" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={prefix} onChange={(e) => setPrefix(e.target.value)} required><option value="">เลือกคำนำหน้า</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option><option value="นาง">นาง</option></select></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="firstname" className="block text-sm font-medium text-slate-700">ชื่อจริง</label><input type="text" id="firstname" name="firstname" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={firstname} onChange={(e) => setFirstname(e.target.value)} required /></div>
            <div><label htmlFor="lastname" className="block text-sm font-medium text-slate-700">นามสกุล</label><input type="text" id="lastname" name="lastname" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={lastname} onChange={(e) => setLastname(e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="email" className="block text-sm font-medium text-slate-700">อีเมล</label><input type="email" id="email" name="email" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>

            {/* ช่องกรอกเบอร์โทรศัพท์ */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div><label htmlFor="program_type" className="block text-sm font-medium text-slate-700">ประเภทโครงการ</label><select id="program_type" name="program_type" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={programType} onChange={(e) => setProgramType(e.target.value)} required disabled={currentUser?.role_id === 2}><option value="ปกติ">ปกติ</option><option value="พิเศษ">พิเศษ</option></select></div>

          {currentUser?.role_id === 3 && (
            <>
              <div><label htmlFor="role_id" className="block text-sm font-medium text-slate-700">ตำแหน่ง (Role)</label><select id="role_id" name="role_id" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>{roles.map(role => (<option key={role.role_id} value={role.role_id}>{role.role_name}</option>))}</select></div>
              <div><label htmlFor="faculty_id" className="block text-sm font-medium text-slate-700">คณะ</label><select id="faculty_id" name="faculty_id" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={facultyId} onChange={(e) => { setFacultyId(e.target.value); setMajorId(''); }} required><option value="">เลือกคณะ</option>{faculties.map(faculty => (<option key={faculty.faculty_id} value={faculty.faculty_id}>{faculty.faculty_name}</option>))}</select></div>
              <div><label htmlFor="major_id" className="block text-sm font-medium text-slate-700">สาขา</label><select id="major_id" name="major_id" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={majorId} onChange={(e) => setMajorId(e.target.value)} required disabled={!facultyId}><option value="">เลือกสาขา</option>{modalMajors.map(major => (<option key={major.major_id} value={major.major_id}>{major.major_name}</option>))}</select></div>
            </>
          )}

          {currentUser?.role_id === 2 && (
            <>
              <div><label htmlFor="faculty_id_display" className="block text-sm font-medium text-slate-700">คณะ</label><input type="text" id="faculty_id_display" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 bg-slate-100" value={displayFacultyName} readOnly /></div>
              <div><label htmlFor="major_id_display" className="block text-sm font-medium text-slate-700">สาขา</label><input type="text" id="major_id_display" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 bg-slate-100" value={displayMajorName} readOnly /></div>
            </>
          )}

          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
        </form>
        <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
          <button type="button" onClick={handleClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
          <button type="submit" form="addUserForm" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">เพิ่มสมาชิก</button>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ isOpen, onClose, onSave, userItem, currentUser, roles, faculties }) => {
  const [prefix, setPrefix] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [majorId, setMajorId] = useState('');
  const [modalMajors, setModalMajors] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userItem && roles) {
      setPrefix(userItem.prefix || '');
      setFirstname(userItem.firstname || '');
      setLastname(userItem.lastname || '');
      setEmail(userItem.email || '');
      setPhone(userItem.phone || '');
      const userRole = roles.find(role => role.role_name === userItem.role_name);
      setRoleId(userRole ? String(userRole.role_id) : '');
      setFacultyId(userItem.faculty_id ? String(userItem.faculty_id) : '');
      setMajorId(userItem.major_id ? String(userItem.major_id) : '');
      setError('');
    }
  }, [userItem, roles]);

  useEffect(() => {
    const fetchMajorsForEditModal = async () => {
      if (!facultyId) {
        setModalMajors([]);
        return;
      }
      try {
        // สมมติว่า Cookies และ axios ถูก import มาแล้ว
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/major/${facultyId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setModalMajors(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch majors for edit modal:', err);
        setError('Failed to load majors.');
      }
    };
    if (isOpen) {
      fetchMajorsForEditModal();
    }
  }, [isOpen, facultyId]);


  const handleClose = () => { onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. ตรวจสอบข้อมูลที่ต้องกรอก (Required Fields Validation)
    if (!prefix || !firstname || !lastname || !email || !phone) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    // 2. ตรวจสอบรูปแบบพื้นฐาน (Basic Format Validation)

    // ชื่อ-นามสกุล: อนุญาตเฉพาะตัวอักษรภาษาไทย/อังกฤษ และเว้นวรรค
    const nameRegex = /^[a-zA-Zก-ฮะ-์\s]+$/;
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
      setError('ชื่อจริงและนามสกุลไม่ถูกต้อง');
      return;
    }

    // อีเมล: ตรวจสอบรูปแบบมาตรฐาน
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    // เบอร์โทรศัพท์: ต้องเป็นตัวเลข 9 หรือ 10 หลัก
    const phoneRegex = /^\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
      setError('เบอร์โทรศัพท์ไม่ถูกต้อง');
      return;
    }

    // 3. ตรวจสอบ Role/Faculty/Major สำหรับ Admin เท่านั้น (role_id 3)
    if (currentUser?.role_id === 3) {
      if (!roleId) {
        setError('กรุณาเลือกตำแหน่ง (Role)');
        return;
      }
      if (!facultyId) {
        setError('กรุณาเลือกคณะ');
        return;
      }
      if (!majorId) {
        setError('กรุณาเลือกสาขา');
        return;
      }
    }

    const updatedData = { prefix, firstname, lastname, email, phone };

    if (currentUser?.role_id === 3) {
      updatedData.role_id = parseInt(roleId);
      updatedData.faculty_id = facultyId ? parseInt(facultyId) : null;
      updatedData.major_id = majorId ? parseInt(majorId) : null;
    }

    try {
      await onSave(userItem.username, updatedData);
      handleClose();
    }
    catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update user.');
    }
  };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/70 backdrop-blur-md p-4">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">

          <h3 className="text-xl font-semibold">แก้ไขข้อมูลสมาชิก</h3>

          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>

        </div>

        <form id="editUserForm" onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div><label className="block text-sm font-medium text-slate-700">รหัสนิสิต</label><input type="text" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 bg-slate-100" value={userItem?.std_id || '-'} readOnly /></div>

            <div><label htmlFor="edit_prefix" className="block text-sm font-medium text-slate-700">คำนำหน้า</label><select id="edit_prefix" name="prefix" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={prefix} onChange={(e) => setPrefix(e.target.value)}><option value="">เลือกคำนำหน้า</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option><option value="นาง">นาง</option></select></div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div><label htmlFor="edit_firstname" className="block text-sm font-medium text-slate-700">ชื่อจริง</label><input type="text" id="edit_firstname" name="firstname" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={firstname} onChange={(e) => setFirstname(e.target.value)} /></div>

            <div><label htmlFor="edit_lastname" className="block text-sm font-medium text-slate-700">นามสกุล</label><input type="text" id="edit_lastname" name="lastname" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={lastname} onChange={(e) => setLastname(e.target.value)} /></div>

          </div>



          {/* 3. เพิ่มช่องกรอกเบอร์โทรศัพท์ให้อยู่ในแถวเดียวกับอีเมล */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div><label htmlFor="edit_email" className="block text-sm font-medium text-slate-700">อีเมล</label><input type="email" id="edit_email" name="email" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={email} onChange={(e) => setEmail(e.target.value)} /></div>

            <div><label htmlFor="edit_phone" className="block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label><input type="text" id="edit_phone" name="phone" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>

          </div>

          {/* สิ้นสุดการเพิ่มช่องเบอร์โทรศัพท์ */}



          {currentUser?.role_id === 3 ? (

            <>

              <div><label htmlFor="edit_role_id" className="block text-sm font-medium text-slate-700">ตำแหน่ง (Role)</label><select id="edit_role_id" name="role_id" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>{roles.map(role => (<option key={role.role_id} value={role.role_id}>{role.role_name}</option>))}</select></div>

              <div><label htmlFor="edit_faculty_id" className="block text-sm font-medium text-slate-700">คณะ</label><select id="edit_faculty_id" name="faculty_id" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={facultyId} onChange={(e) => { setFacultyId(e.target.value); setMajorId(''); }} required><option value="">เลือกคณะ</option>{faculties.map(faculty => (<option key={faculty.faculty_id} value={faculty.faculty_id}>{faculty.faculty_name}</option>))}</select></div>

              <div><label htmlFor="edit_major_id" className="block text-sm font-medium text-slate-700">สาขา</label><select id="edit_major_id" name="major_id" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={majorId} onChange={(e) => setMajorId(e.target.value)} required disabled={!facultyId}><option value="">เลือกสาขา</option>{modalMajors.map(major => (<option key={major.major_id} value={major.major_id}>{major.major_name}</option>))}</select></div>

            </>

          ) : (

            <>

              <div><label className="block text-sm font-medium text-slate-700">ตำแหน่ง</label><div className="mt-1 block w-full border-slate-200 rounded-md bg-slate-100 p-2">{userItem?.role_name || '-'}</div></div>

              <div><label className="block text-sm font-medium text-slate-700">คณะ</label><div className="mt-1 block w-full border-slate-200 rounded-md bg-slate-100 p-2">{userItem?.faculty_name || '-'}</div></div>

              <div><label className="block text-sm font-medium text-slate-700">สาขา</label><div className="mt-1 block w-full border-slate-200 rounded-md bg-slate-100 p-2">{userItem?.major_name || '-'}</div></div>

            </>

          )}



          <div><label className="block text-sm font-medium text-slate-700">ประเภทโครงการ</label><div className="mt-1 block w-full border-slate-200 rounded-md bg-slate-100 p-2">{userItem?.program_type || '-'}</div></div>

          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}

        </form>

        <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">

          <button type="button" onClick={handleClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>

          <button type="submit" form="editUserForm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">บันทึกการแก้ไข</button>

        </div>

      </div>

    </div>

  );

};

// ... (BulkAddUserModal remains the same) ...

const BulkAddUserModal = ({ isOpen, onClose, onSave }) => {
  const [userFile, setUserFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const resetForm = () => {
    setUserFile(null);
    setError('');
    // Clear file input value
    const fileInput = document.getElementById('user_file');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // New function to handle file clear
  const handleClearFile = () => {
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!userFile) {
      setError('Please select an Excel file.');
      return;
    }
    try {
      await onSave(userFile);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to upload users.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h3 className="text-xl font-semibold">เพิ่มสมาชิกพร้อมกัน</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
        </div>
        <form id="bulkAddUserForm" onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
          <p className="text-sm text-slate-600">อัปโหลดไฟล์ Excel (.xlsx) ที่มีคอลัมน์ตามลำดับต่อไปนี้: <br /><strong className="font-semibold">username, std_id, prefix, firstname, lastname, email, phone, program_type</strong><br />สำหรับ program_type ให้ใช้ค่า "ปกติ" หรือ "พิเศษ".</p>

          {/* 🔽 ส่วนที่ถูกแก้ไขให้ใช้ UI ทันสมัย 🔽 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ไฟล์ Excel (.xlsx)
            </label>

            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              {/* 🔹 Input ถูกซ่อน */}
              <input
                type="file"
                id="user_file_modern"
                ref={fileInputRef}
                accept=".xlsx"
                onChange={(e) => setUserFile(e.target.files[0])}
                className="hidden"
              />

              {/* 🔹 ปุ่มเลือกไฟล์ */}
              <label
                htmlFor="user_file_modern"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out cursor-pointer flex-shrink-0"
              >
                <FaCloudArrowUp className="h-5 w-5" />
                <span>เลือกไฟล์</span>
              </label>


              <div className="flex items-center space-x-3 w-full">
                <span className={`text-sm ${userFile ? 'text-gray-600 font-medium' : 'text-slate-500 italic'}`}>
                  {userFile ? `ไฟล์ที่เลือก: ${userFile.name}` : 'ยังไม่ได้เลือกไฟล์ / คลิกเพื่ออัพโหลด'}
                </span>

                {userFile && (
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 flex-shrink-0"
                    title="ล้างไฟล์ที่เลือกใหม่"
                  >
                    <FaXmark className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg whitespace-pre-wrap">{error}</div>}
        </form>
        <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
          <button type="button" onClick={handleClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
          <button type="submit" form="bulkAddUserForm" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">อัปโหลดและสร้าง</button>
        </div>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function ManageUserClientPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsersAndInitialData = useCallback(async (page, search, role = '', facultyId = '', majorId = '') => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) throw new Error('Access token not found.');

      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

      const [usersRes, rolesRes, facultiesRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/users`, { params: { page, search, role, faculty_id: facultyId, major_id: majorId }, ...config }),
        axios.get(`${apiBaseUrl}/api/roles`, config),
        axios.get(`${apiBaseUrl}/api/faculty`, config),
      ]);

      setUsers(usersRes.data.data || []);
      setCurrentPage(usersRes.data.pagination?.currentPage || 1);
      setTotalPages(usersRes.data.pagination?.totalPages || 1);
      setRoles(rolesRes.data.data || []);
      setFaculties(facultiesRes.data.data || []);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch initial data.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMajorsForFilter = useCallback(async (facultyId) => {
    if (!facultyId) {
      setMajors([]);
      return;
    }
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) throw new Error('Access token not found.');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/major/${facultyId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMajors(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch majors for filter:', err);
      setMajors([]);
    }
  }, []);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsersAndInitialData(1, searchTerm, selectedRole, selectedFaculty, selectedMajor);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, selectedRole, selectedFaculty, selectedMajor]);

  useEffect(() => {
    fetchUsersAndInitialData(currentPage, searchTerm, selectedRole, selectedFaculty, selectedMajor);
  }, [currentPage]);

  useEffect(() => {
    if (selectedFaculty) {
      fetchMajorsForFilter(selectedFaculty);
    } else {
      setMajors([]);
    }
  }, [selectedFaculty]);

const handleAddUser = async (userData) => {
  try {
    const accessToken = Cookies.get('accessToken');
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, [userData], {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    Swal.fire({
      title: 'สำเร็จ',
      text: 'เพิ่มสมาชิกใหม่สำเร็จ',
      icon: 'success',
      confirmButtonText: 'ตกลง',
    }).then(() => {
      fetchUsersAndInitialData(1, '', '', '', '');
    });

  } catch (err) {
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: err.response?.data?.message || 'ไม่สามารถเพิ่มสมาชิกได้',
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
    throw err;
  }
};

  const handleBulkAddUser = async (file) => {
    // This function can be filled in later
  };

  const handleEditUser = async (username, updatedData) => {
    try {
      const accessToken = Cookies.get('accessToken');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`, updatedData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      Swal.fire('บันทึกข้อมูลสำเร็จ', 'แก้ไขข้อมูลผู้ใช้สำเร็จ', 'success');
      fetchUsersAndInitialData(currentPage, searchTerm, selectedRole, selectedFaculty, selectedMajor);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update user.', 'error');
      throw err;
    }
  };

  const handleActiveUser = async (username) => {
    // This function can be filled in later
  };

  const handleRemoveUser = (username) => {
    // This function can be filled in later
  };

return (
  <div className="bg-gray-100 min-h-screen py-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 px-2 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-800">จัดการสมาชิก</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm"
          >
            <FaPlus className="mr-2" /> เพิ่มสมาชิกรายบุคคล
          </button>
          <button
            onClick={() => setIsBulkAddModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm"
          >
            <FaUsers className="mr-2" /> เพิ่มสมาชิกพร้อมกัน
          </button>
        </div>
      </header>

  {/* กล่องสีขาวครอบทุกอย่าง */}
<div className="bg-white rounded-lg shadow p-4 sm:p-6">
  {/* ช่องค้นหา + ตัวกรอง */}
  {/* 💡 เปลี่ยนเป็น flex-wrap เพื่อให้แน่ใจว่าถ้าไม่มีพื้นที่พอจะขึ้นบรรทัดใหม่ */}
  <div className="flex flex-wrap items-center mb-4 gap-4"> 
    
    {/* 1. ช่องค้นหา - ให้ใช้พื้นที่เท่าที่เหลือ */}
    <div className="relative flex-grow min-w-[200px]"> {/* min-w เพื่อไม่ให้ค้นหาหดเล็กเกินไป */}
      <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="ค้นหารายชื่อ..."
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* 2. ตัวกรอง - จัดกลุ่มให้อยู่ในแถวเดียวกันบนจอใหญ่ */}
    {currentUser?.role_id === 3 && (
      // 💡 ลบ w-full, mb-4 ออก แล้วใช้ flex-shrink-0 และ grid-cols-3 บนจอใหญ่
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full sm:w-auto"> 
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2.5 h-full border border-gray-300 rounded-lg" // 💡 ใช้ py-2.5 เพื่อให้สูงเท่าช่องค้นหา
        >
          <option value="">ทั้งหมด (ตำแหน่ง)</option>
          {roles.map((role) => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_name}
            </option>
          ))}
        </select>
        <select
          value={selectedFaculty}
          onChange={(e) => {
            setSelectedFaculty(e.target.value);
            setSelectedMajor('');
          }}
          className="px-4 py-2.5 h-full border border-gray-300 rounded-lg" // 💡 ใช้ py-2.5 
        >
          <option value="">ทั้งหมด (คณะ)</option>
          {faculties.map((faculty) => (
            <option key={faculty.faculty_id} value={faculty.faculty_id}>
              {faculty.faculty_name}
            </option>
          ))}
        </select>
        <select
          value={selectedMajor}
          onChange={(e) => setSelectedMajor(e.target.value)}
          className="px-4 py-2.5 h-full border border-gray-300 rounded-lg" // 💡 ใช้ py-2.5 
          disabled={!selectedFaculty}
        >
          <option value="">ทั้งหมด (สาขา)</option>
          {majors.map((major) => (
            <option key={major.major_id} value={major.major_id}>
              {major.major_name}
            </option>
          ))}
        </select>
      </div>
    )}
  </div> 

        {/* ตาราง + mobile view */}
        {loading ? (
          <p className="text-center p-6">กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <p className="text-center p-6 text-red-500">Error: {error}</p>
        ) : users.length === 0 ? (
          <p className="text-center p-6">ไม่พบผู้ใช้งาน</p>
        ) : (
          <>
            <div className="space-y-4 md:hidden">
              {users.map((user) => (
                <UserCard
                  key={user.username}
                  user={user}
                  currentUser={currentUser}
                  onEdit={() => {
                    setSelectedUser(user);
                    setIsEditModalOpen(true);
                  }}
                  onActivate={() => handleActiveUser(user.username)}
                  onDelete={() => handleRemoveUser(user.username)}
                />
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-teal-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      รหัสนิสิต / Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      ชื่อ - นามสกุล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      คณะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      สาขา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      เบอร์โทรศัพท์
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      เมนู
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserTableRow
                      key={user.username}
                      user={user}
                      currentUser={currentUser}
                      onEdit={() => {
                        setSelectedUser(user);
                        setIsEditModalOpen(true);
                      }}
                      onActivate={() => handleActiveUser(user.username)}
                      onDelete={() => handleRemoveUser(user.username)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 mt-4 border-t">
            <span className="text-sm text-gray-700">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <div className="inline-flex">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 h-8 text-sm text-white bg-gray-800 rounded-l hover:bg-gray-900 disabled:bg-gray-400"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 h-8 text-sm text-white bg-gray-800 rounded-r hover:bg-gray-900 disabled:bg-gray-400 ml-1"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Components */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUser}
        currentUser={currentUser}
        faculties={faculties}
        majors={majors}
        roles={roles}
      />
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditUser}
          userItem={selectedUser}
          currentUser={currentUser}
          roles={roles}
          faculties={faculties}
        />
      )}
      <BulkAddUserModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        onSave={handleBulkAddUser}
      />
    </div>
  </div>
);
}