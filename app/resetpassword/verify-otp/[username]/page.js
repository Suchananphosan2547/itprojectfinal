'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username;

  const [otp, setOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

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
          Swal.fire('Error', 'OTP has expired. Please request a new one.', 'error');
          router.push('/resetpassword/request-otp');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiresAt, router]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/verify-otp', { username, otp });
      Swal.fire('สำเร็จ', response.data.message, 'success');
      sessionStorage.setItem('resetToken', response.data.resetToken);
      router.push(`/resetpassword/reset-password/${username}`);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to verify OTP. Please try again.', 'error');
    }
  };

  if (!username) {
    return null; // Or a loading spinner
  }

  return (
    <main className="bg-slate-100 flex items-center justify-center min-h-screen font-sans px-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md px-6 ">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-sm text-gray-500">
            OTP sent to {username}. It expires in {formatTime(timeLeft)}.
          </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 hover:border-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md text-sm font-semibold text-white bg-green-600 transition duration-300 hover:bg-green-700 hover:shadow-xl focus:ring-2 focus:ring-green-500"
          >
            Verify OTP
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
