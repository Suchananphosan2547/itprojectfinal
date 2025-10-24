'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Link from 'next/link';
// 💡 ต้องติดตั้ง react-icons ก่อน: npm install react-icons
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(null);
  
  // 💡 State ใหม่สำหรับควบคุมการมองเห็นรหัสผ่าน
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      router.push('/resetpassword/request-otp');
    }
  }, [username, router]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire('Error', 'Password must be at least 6 characters long.', 'error');
      return;
    }
    try {
      const response = await axios.post('/api/confirm-reset-password', { username, password: newPassword }, {
        headers: { Authorization: `Bearer ${resetToken}` },
      });
      Swal.fire('สำเร็จ', response.data.message, 'success');
      // 💡 เคลียร์ token หลังจากรีเซ็ตสำเร็จ
      sessionStorage.removeItem('resetToken'); 
      router.push('/'); // Redirect to home/login page after successful password reset
    } catch (error) {
      console.error('Error resetting password:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to reset password. Please try again.', 'error');
    }
  };

  if (!username || !resetToken) {
    return null; // Or a loading spinner
  }

  // 💡 Helper function เพื่อกำหนด type ของ input
  const getPasswordInputType = (showState) => showState ? 'text' : 'password';

  return (
    <main className="bg-slate-100 flex items-center justify-center min-h-screen font-sans px-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your new password.
          </p>
        </div>
        <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
          
          {/* 1. ช่อง New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            {/* 💡 เพิ่ม relative และ absolute สำหรับไอคอน */}
            <div className="relative"> 
                <input
                    id="newPassword"
                    name="newPassword"
                    // 💡 ใช้ getPasswordInputType
                    type={getPasswordInputType(showNewPassword)} 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    // 💡 เพิ่ม pr-10 เพื่อให้มีที่ว่างสำหรับปุ่ม
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 hover:border-gray-400 "
                />
                <button
                    type="button"
                    // 💡 Toggle state
                    onClick={() => setShowNewPassword(prev => !prev)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                    {/* 💡 แสดงไอคอนตามสถานะ */}
                    {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
            </div>
          </div>
          
          {/* 2. ช่อง Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            {/* 💡 เพิ่ม relative และ absolute สำหรับไอคอน */}
            <div className="relative"> 
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    // 💡 ใช้ getPasswordInputType
                    type={getPasswordInputType(showConfirmPassword)} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    // 💡 เพิ่ม pr-10 เพื่อให้มีที่ว่างสำหรับปุ่ม
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 hover:border-gray-400"
                />
                <button
                    type="button"
                    // 💡 Toggle state
                    onClick={() => setShowConfirmPassword(prev => !prev)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                    {/* 💡 แสดงไอคอนตามสถานะ */}
                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md text-sm font-semibold text-white bg-green-600 transition duration-300 hover:bg-green-700 hover:shadow-xl focus:ring-2 focus:ring-green-500"
          >
            Reset Password
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 active:text-blue-800">
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}