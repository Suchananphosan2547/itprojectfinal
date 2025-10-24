'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

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
        if( cooldownActive ) {
          Swal.fire('Error', `Please wait ${cooldownTimer} seconds before requesting a new OTP.`, 'error');
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
      Swal.fire('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.', 'error');
    }
  };

  return (
    <main className="bg-slate-100 flex items-center justify-center min-h-screen font-sans px-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md mx-auto ">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your username to receive an OTP to reset your password.
          </p>
        </div>
        <form onSubmit={handleRequestOtp} className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm transition duration-150 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md text-sm font-semibold text-white bg-green-600 transition duration-300 hover:bg-green-700 hover:shadow-xl focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cooldownActive}
          >
            {cooldownActive ? `Send OTP (${cooldownTimer}s)` : 'Send OTP'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 active:text-blue-800 ">
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
