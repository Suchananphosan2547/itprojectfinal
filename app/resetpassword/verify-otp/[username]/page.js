'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Link from 'next/link';
import Image from 'next/image'; // **เพิ่ม Image component**

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username; // หรือค่า b6521651171 ในภาพ

  const [otp, setOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // URL โลโก้ KU (ใช้ตัวเดียวกับหน้า Request OTP)
  const KU_LOGO_URL = "https://my.ku.th/myku/img/KU_Logo_PNG.png";

  useEffect(() => {
    if (!username) {
      router.push('/resetpassword/request-otp');
      return;
    }
    const storedOtpExpiresAt = sessionStorage.getItem('otpExpiresAt');
    if (storedOtpExpiresAt) {
      setOtpExpiresAt(new Date(storedOtpExpiresAt));
    } else {
      // If no OTP expiry is found, redirect back to request OTP
      // ให้แจ้งเตือนก่อนย้อนกลับ
       Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลการขอ OTP กรุณาลองอีกครั้ง', 'error');
       router.push('/resetpassword/request-otp');
    }
  }, [username, router]);

  // Timer for OTP expiry
  useEffect(() => {
    let timer;
    if (otpExpiresAt) {
      timer = setInterval(() => {
        const now = new Date();
        const expiry = new Date(otpExpiresAt);
        const secondsLeft = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
        setTimeLeft(secondsLeft);
        if (secondsLeft === 0) {
          clearInterval(timer);
          // ข้อความแจ้งเตือนภาษาไทย
          Swal.fire('ข้อผิดพลาด', 'รหัส OTP หมดอายุแล้ว กรุณาร้องขอใหม่', 'error');
          router.push('/resetpassword/request-otp');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiresAt, router]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // รูปแบบ 04:44
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/verify-otp', { username, otp });
      // ข้อความแจ้งเตือนภาษาไทย
      Swal.fire('สำเร็จ', response.data.message, 'success'); 
      sessionStorage.setItem('resetToken', response.data.resetToken);
      router.push(`/resetpassword/reset-password/${username}`);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // ข้อความแจ้งเตือนภาษาไทย
      Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถยืนยัน OTP ได้ กรุณาลองอีกครั้ง', 'error');
    }
  };

  if (!username) {
    return null; 
  }

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
          
          {/* ข้อความหลัก */}
          <h2 className="text-lg font-normal text-gray-700 mt-4">ยืนยัน OTP</h2>
<p className="mt-2 text-sm text-gray-700">
             {/* **แก้ไข:** ใช้ <br /> เพื่อบังคับขึ้นบรรทัดใหม่ตามภาพ */}
             รหัส OTP ถูกส่งไปยัง {username} <br /> 
             จะหมดอายุในอีก {formatTime(timeLeft)} นาที
          </p>
        </div>
        
        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
          <div>
            <label 
              htmlFor="otp" 
              className="block text-sm font-medium text-gray-600 mb-1" // ปรับ label ตามภาพ
            >
              รหัส OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              // ปรับสไตล์ input ให้ตรงกับภาพ
              className="w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          <button
            type="submit"
            // ปรับสไตล์ปุ่มให้ตรงกับภาพ (สีเขียว, font-medium, py-3)
            className="w-full py-3 px-4 rounded-md text-sm font-medium text-white bg-green-600 transition duration-300 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            ยืนยัน OTP
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