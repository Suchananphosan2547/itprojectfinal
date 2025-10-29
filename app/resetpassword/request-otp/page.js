'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // **เพิ่มบรรทัดนี้**

export default function RequestOtpPage() {
  const [username, setUsername] = useState('');
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  const router = useRouter();

  // Cooldown หลังส่ง OTP
  useEffect(() => {
    let cooldownInterval;
    if (cooldownActive) {
      cooldownInterval = setInterval(() => {
        setCooldownTimer(prev => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownInterval);
  }, [cooldownActive]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      if (cooldownActive) {
        Swal.fire('ข้อผิดพลาด', `กรุณารอ ${cooldownTimer} วินาที ก่อนร้องขอ OTP ใหม่`, 'error');
        return;
      }
      const response = await axios.post('/api/request-otp', { username });
      Swal.fire('สำเร็จ', response.data.RespMessage, 'success');
      sessionStorage.setItem('otpExpiresAt', response.data.otpExpiresAt);
      router.push(`/resetpassword/verify-otp/${username}`);
      setCooldownActive(true);
      setCooldownTimer(60); // 60 วินาที
    } catch (error) {
      console.error('Error requesting OTP:', error);
      Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถส่ง OTP ได้ กรุณาลองอีกครั้ง', 'error');
    }
  };

  const KU_LOGO_URL = "https://my.ku.th/myku/img/KU_Logo_PNG.png";

  return (
    <main className="bg-white flex items-center justify-center min-h-screen font-sans px-4">
      <div className="bg-white p-8 sm:p-10 w-full max-w-md mx-auto">
        <div className="text-center mb-8">

          {/* ส่วนแสดงโลโก้ KU โดยใช้ Next/Image และ URL */}
          <div className="flex flex-col items-center mb-4">
          <img
            className='mx-auto'
            aria-hidden
            src="/images/KU_Logo_PNG.png"
            alt="KU icon"
            width={120}
            height={150}
          />
          </div>

          <h2 className="text-lg font-normal text-gray-900 mt-8">ลืมรหัสผ่าน</h2>
          <p className="mt-2 text-sm text-gray-500">
            กรุณากรอกชื่อผู้ใช้เพื่อรับรหัส OTP สำหรับรีเซ็ตรหัสผ่าน
          </p>
        </div>
        <form onSubmit={handleRequestOtp} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-base font-normal text-gray-600 mb-1" // ปรับขนาดและสีให้เข้มขึ้นตามภาพ
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md text-sm font-medium text-white bg-green-600 transition duration-300 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cooldownActive}
          >
            {cooldownActive ? `ส่ง OTP (${cooldownTimer} วินาที)` : 'ส่ง OTP'}
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-normal text-blue-500 hover:text-blue-400">
            &larr; กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </main>
  );
}