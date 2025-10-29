'use client'

import { useRouter } from 'next/navigation'
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const activityImages = [
    "/images/activity1.jpg",
    "/images/activity2.jpg",
    "/images/activity3.jpg",
    "/images/activity4.jpg",
    "/images/activity5.jpg",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNext();
    }, 10000); // เปลี่ยนรูปทุกๆ 10 วินาที
    return () => clearInterval(intervalId);
  }, [activityImages.length]);

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + activityImages.length) % activityImages.length
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % activityImages.length
    );
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/login', {
        username,
        password,
      });

      const { user, initialPath } = response.data;
      //sessionStorage.setItem('user', JSON.stringify(user));

      await Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      });

      router.push(initialPath);
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left side: Enhanced Carousel with Super Smooth Gradient to White */}
      <div className="hidden md:flex md:w-6/10 items-stretch justify-center bg-gray-100 relative">
        <div className="w-full h-full relative overflow-hidden"> 
          {/* ✅ โครงสร้างใหม่: แต่ละรูปภาพจะ absolute ซ้อนทับกัน และควบคุมการแสดงผลด้วย opacity */}
          {activityImages.map((src, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100 z-0' : 'opacity-0 z-0' // z-0 เพื่อให้ข้อความอยู่บน
              }`}
            >
              <Image
                src={src}
                alt={`Activity ${index + 1}`}
                fill
                className="object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div 
                className="absolute inset-0" // ไม่ต้องมี z-0 ตรงนี้แล้ว เพราะภาพหลักเป็น z-0 อยู่แล้ว
                style={{ 
                  background: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 70%, rgba(255, 255, 255, 1) 100%)' 
                }}
              ></div>
            </div>
          ))}

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 z-10"> 
            <h2 className="text-5xl font-extrabold text-center drop-shadow-lg ">
              Kasetsart University
            </h2>
            <p className="mt-4 text-xl text-center font-light drop-shadow-md max-w-md">
              มหาวิทยาลัยเกษตรศาสตร์ สร้างสรรค์ศาสตร์แห่งแผ่นดินสู่สากลเพื่อพัฒนาประเทศอย่างยั่งยืน
            </p>
          </div>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 z-20 transition duration-300 backdrop-blur-sm hover:bg-white/30 hover:scale-110"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 z-20 transition duration-300 backdrop-blur-sm hover:bg-white/30 hover:scale-110"
          >
            ›
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {activityImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition duration-300 hover:scale-125 ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>



      {/* Right side: Login Form */}
      <div className="w-full md:w-4/10 flex flex-col items-center justify-center flex-grow p-0 p-4">
        <div className="w-full max-w-sm bg-white/0 p-0 shadow-none">
          <img
            className='mx-auto'
            aria-hidden
            src="/images/KU_Logo_PNG.png"
            alt="KU icon"
            width={120}
            height={150}
          />
          <div className="text-center my-5">
            <p className="text-lg text-gray-700">เข้าใช้งานระบบ KU Next</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="เช่น b6521xxxxxx"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 transition duration-150 hover:border-gray-400 rounded-md shadow-sm 
                  placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} // toggle 👁️
                  autoComplete="current-password"
                  required
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 transition duration-150 hover:border-gray-400 rounded-md shadow-sm 
                  placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="text-right text-sm">
              <Link
                href="/resetpassword/request-otp"
                className="font-medium text-blue-600 transition duration-150 hover:text-blue-500 active:text-blue-800"
              >
                ลืมรหัสผ่าน ?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white bg-green-600 transition duration-300 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}