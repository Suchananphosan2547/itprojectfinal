'use client'

import { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useRouter } from 'next/navigation';
import { FaBars, FaXmark, FaRightFromBracket } from 'react-icons/fa6';
import axios from 'axios';
import Footer from './Footer';

export default function LayoutWrapper({ children, user, sidebarItems }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [userName, setUserName] = useState('Application Content');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      if (user.firstname && user.lastname) {
        setUserName(`${user.firstname} ${user.lastname}`);
      } else if (user.firstname) {
        setUserName(user.firstname);
      } else if (user.lastname) {
        setUserName(user.lastname);
      }
    } else {
      handleLogout();
    }

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    setSidebarOpen(window.innerWidth >= 768);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      sessionStorage.removeItem('user');
      router.push('/');
    }
  };

  const getMainMargin = () => {
    if (isSmallScreen) {
      return 'ml-0';
    } else if (isSidebarOpen) {
      return 'ml-64';
    } else {
      return isHovered ? 'ml-64' : 'ml-20';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-x-hidden">
      {/* This condition ensures the entire sidebar container is removed from the DOM on small screens when closed */}
      {(!isSmallScreen || isSidebarOpen) && (
        <div
          onMouseEnter={() => !isSidebarOpen && !isSmallScreen && setIsHovered(true)}
          onMouseLeave={() => !isSidebarOpen && !isSmallScreen && setIsHovered(false)}
          className="fixed inset-y-0 left-0 z-40 h-full"
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isHovered={isHovered}
            isSmallScreen={isSmallScreen}
            sidebarItems={sidebarItems}
          />
        </div>
      )}

      <div className={`flex-1 flex flex-col ${getMainMargin()} transition-all duration-300`}>
        <div className="p-4 bg-[#02BC77] shadow-md flex items-center justify-between text-white fixed top-0 right-0 z-30"
          style={{
            left: isSmallScreen ? 0 : (isSidebarOpen ? '16rem' : (isHovered ? '16rem' : '5rem'))
          }}
        >

          {isSmallScreen && (
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isSidebarOpen ? <FaXmark className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          )}
          <div className="flex-grow"></div>
          <div className="flex items-center space-x-4">
            <h1 className="hidden md:block text-md">{userName}</h1>
            <button
              onClick={handleLogout}
              className="p-2 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              title="Logout"
            >
              <FaRightFromBracket className="w-5 h-5" />
            </button>
          </div>
        </div>

        <main className="flex-1 p-6 mt-16">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}