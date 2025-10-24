import React, { useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSidebar } from '../context/SidebarContext';
import { FaBars, FaHouse, FaChevronDown, FaChevronUp, FaGear, FaUser, FaQuestion, FaXmark } from 'react-icons/fa6';
import Image from "next/image";
import Cookies from 'js-cookie';

// --- ฟังก์ชันสำหรับแปลงชื่อเมนูเป็นไอคอน (ปรับแก้ตามเมนูของคุณ) ---
const getIconForName = (name) => {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes('dashboard') || lowerCaseName.includes('หน้าหลัก')) {
    return <FaHouse className="w-5 h-5" />;
  }
  if (lowerCaseName.includes('setting') || lowerCaseName.includes('ตั้งค่า')) {
    return <FaGear className="w-5 h-5" />;
  }
  if (lowerCaseName.includes('user') || lowerCaseName.includes('ผู้ใช้')) {
    return <FaUser className="w-5 h-5" />;
  }
  if (lowerCaseName.includes('help') || lowerCaseName.includes('ช่วยเหลือ')) {
    return <FaQuestion className="w-5 h-5" />;
  }
  // Default icon if no match
  return <FaBars className="w-5 h-5" />;
};

const Sidebar = ({ isSidebarOpen, setSidebarOpen, isHovered, isSmallScreen, sidebarItems }) => {
  // 🎯 START: เพิ่มเงื่อนไขนี้เพื่อแก้ไขปัญหา Layout
  // ถ้าเป็นจอเล็กและเมนูถูกปิด -> ไม่ต้องแสดงผลอะไรเลย
  if (isSmallScreen && !isSidebarOpen) {
    return null;
  }
  // 🎯 END: เพิ่มเงื่อนไขนี้เพื่อแก้ไขปัญหา Layout

  const { openItems, toggleItem } = useSidebar();
  const showFullSidebar = isSidebarOpen || isHovered;

  return (
    <div className={`
      bg-gray-800 text-white h-screen p-4
      transform transition-all duration-300 ease-in-out
      relative z-50
      ${isSmallScreen
        ? `w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
        : `${showFullSidebar ? 'w-64' : 'w-20'}`
      }
    `}>
      <div className="flex items-center justify-between mb-6">
        {showFullSidebar && <Image src="https://it.flas.kps.ku.ac.th/wp-content/uploads/2019/04/logo.png" alt="Logo" width={150} height={150} />}
        
        {/* Toggle button for large screens */}
        {!isSmallScreen && (
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            {isSidebarOpen ? <FaXmark className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        )}

        {/* Close button for small screens */}
        {isSmallScreen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <FaXmark className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav>
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.sidebar_id} className="mb-2">
              {item.sidebar_path ? (
                <Link 
                  href={item.sidebar_path} 
                  className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => isSmallScreen && setSidebarOpen(false)} // Close sidebar on item click on small screens
                >
                  {getIconForName(item.sidebar_name)}
                  {showFullSidebar && <span className="ml-3">{item.sidebar_name}</span>}
                </Link>
              ) : (
                <div
                  className="flex justify-between items-center py-2 px-4 rounded cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => toggleItem(item.sidebar_id)}
                >
                  <span className="flex items-center">
                    {getIconForName(item.sidebar_name)}
                    {showFullSidebar && <span className="ml-3">{item.sidebar_name}</span>}
                  </span>
                  {showFullSidebar && <span>{openItems[item.sidebar_id] ? <FaChevronUp /> : <FaChevronDown />}</span>}
                </div>
              )}
              {item.children && openItems[item.sidebar_id] && showFullSidebar && (
                <ul className="ml-4 mt-2">
                  {item.children.map((child) => (
                    <li key={child.sidebar_id} className="mb-1">
                      <Link 
                        href={child.sidebar_path} 
                        className="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => isSmallScreen && setSidebarOpen(false)} // Close sidebar on item click on small screens
                      >
                        {getIconForName(child.sidebar_name)}
                        {showFullSidebar && <span className="ml-3">{child.sidebar_name}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;