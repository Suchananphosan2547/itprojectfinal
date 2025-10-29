'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Link from 'next/link';
import Image from 'next/image'; // เพิ่ม Image component
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(null);
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const KU_LOGO_URL = "https://my.ku.th/myku/img/KU_Logo_PNG.png";

  useEffect(() => {
    if (!username) {
      router.push('/resetpassword/request-otp');
      return;
    }
    const storedResetToken = sessionStorage.getItem('resetToken');
    if (storedResetToken) {
      setResetToken(storedResetToken);
    } else {
      // If no reset token is found, redirect back to request OTP
      Swal.fire('ข้อผิดพลาด', 'ไม่พบโทเคนรีเซ็ตรหัสผ่าน กรุณาขอ OTP ใหม่อีกครั้ง', 'error');
      router.push('/resetpassword/request-otp');
    }
  }, [username, router]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire('ข้อผิดพลาด', 'รหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบ', 'error');
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire('ข้อผิดพลาด', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }
    try {
      const response = await axios.post('/api/confirm-reset-password', { username, password: newPassword }, {
        headers: { Authorization: `Bearer ${resetToken}` },
      });
      Swal.fire('สำเร็จ', response.data.message || 'รีเซ็ตรหัสผ่านสำเร็จแล้ว', 'success');
      sessionStorage.removeItem('resetToken'); 
      router.push('/'); // Redirect to home/login page after successful password reset
    } catch (error) {
      console.error('Error resetting password:', error);
      Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง', 'error');
    }
  };

  if (!username || !resetToken) {
    return null; // Or a loading spinner
  }

  const getPasswordInputType = (showState) => showState ? 'text' : 'password';

  return (
    <main className="bg-white flex items-center justify-center min-h-screen font-sans px-4">
      <div className="bg-white p-8 sm:p-10 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          
          {/* ส่วนแสดงโลโก้ KU */}
          <div className="flex flex-col items-center mb-10">
          <img
            className='mx-auto'
            aria-hidden
            src="/images/KU_Logo_PNG.png"
            alt="KU icon"
            width={120}
            height={150}
          />
          </div>
          
          <h2 className="text-lg font-normal text-gray-700 mt-4">รีเซ็ตรหัสผ่าน</h2>
          <p className="mt-2 text-sm text-gray-500">
            กรอกรหัสผ่านใหม่ของคุณ
          </p>
        </div>
        
        <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
          
          {/* 1. ช่อง รหัสผ่านใหม่ */}
          <div>
            <label 
              htmlFor="newPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              รหัสผ่านใหม่
            </label>
            <div className="relative"> 
                <input
                    id="newPassword"
                    name="newPassword"
                    type={getPasswordInputType(showNewPassword)} 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    // ปรับ py-3 ให้สอดคล้องกับภาพ
                    className="w-full px-2 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                    {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
            </div>
          </div>
          
          {/* 2. ช่อง ยืนยันรหัสผ่านใหม่ */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ยืนยันรหัสผ่านใหม่
            </label>
            <div className="relative"> 
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={getPasswordInputType(showConfirmPassword)} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    // ปรับ py-3 ให้สอดคล้องกับภาพ
                    className="w-full px-2 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
            </div>
          </div>
          
          <button
            type="submit"
            // ปรับสไตล์ปุ่มให้เป็นสีเขียวและมีขนาดตามภาพ
            className="w-full py-3 px-4 rounded-md text-sm font-medium text-white bg-green-600 transition duration-300 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            รีเซ็ตรหัสผ่าน
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-normal text-blue-500 hover:text-blue-400">
            &larr; กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </main>
  );
}