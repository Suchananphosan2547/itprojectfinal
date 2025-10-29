import React, { useState, useContext, createContext } from "react";
import { RiDashboard3Fill } from "react-icons/ri";
import {
  FaChevronUp,
  FaChevronDown,
  FaBars,
  FaXmark,
  FaFileLines,
  FaUsers,
  FaUser,
  FaSquare,
  FaFolderOpen,
  FaCalendarDays,
  FaClipboardList,
  FaBullhorn,
  FaUserTie,
  FaFilePen,
  FaFileArrowDown,
  FaChartColumn,
  FaMoneyBill,
  FaChartBar
} from "react-icons/fa6";
import { FaHome } from "react-icons/fa"; // ✅ เพิ่มไอคอน Home ที่ถูกต้อง

const SidebarContext = createContext();
const useSidebar = () => useContext(SidebarContext);

const SidebarProvider = ({ children }) => {
  const [openItems, setOpenItems] = useState({});
  const toggleItem = (sidebarId) => {
    setOpenItems((prev) => ({
      ...prev,
      [sidebarId]: !prev[sidebarId],
    }));
  };
  return (
    <SidebarContext.Provider value={{ openItems, toggleItem }}>
      {children}
    </SidebarContext.Provider>
  );
};

// ===== ฟังก์ชันเลือกไอคอนตามชื่อ =====
const getIconForName = (name = "") => {
  const lower = name.toLowerCase();
  const iconClass = "w-5 h-5 flex-shrink-0 text-white";

  if (lower.includes("เเผนงาน") || lower.includes("plan"))
    return <FaClipboardList  className={iconClass} />; 

  if (lower.includes("แบบประเมินโครงการ") || lower.includes("complacence"))
    return <FaFilePen className={iconClass} />;

  if (lower.includes("เอกสารโครงการ"))
    return <FaFileArrowDown className={iconClass} />;

  if (lower.includes("โครงการของฉัน") || lower.includes("my project"))
    return <FaUser className={iconClass} />;

  if (lower.includes("โครงการ") || lower.includes("project"))
    return <FaFolderOpen className={iconClass} />;

  if (lower.includes("งบประจำปี") || lower.includes("fiscalyear"))
    return <FaMoneyBill className={iconClass} />;

  if (lower.includes("ประกาศ") || lower.includes("news"))
    return <FaBullhorn className={iconClass} />;

  if (lower.includes("สมาชิก") || lower.includes("manage"))
    return <FaUsers className={iconClass} />;

  if (lower.includes("อาจารย์") || lower.includes("teacher"))
    return <FaUserTie className={iconClass} />;

  if (lower.includes("เอกสาร"))
    return <FaFileLines className={iconClass} />;

  if (lower.includes("dashboard"))
    return <FaChartBar className={iconClass} />;

  if (lower.includes("home") || lower.includes("หน้าหลัก"))
    return <FaHome className={iconClass} />;

  return <FaSquare className={iconClass} />;
};


// ===== Sidebar Content =====
const SidebarContent = ({
  isSidebarOpen,
  setSidebarOpen,
  isHovered,
  isSmallScreen,
  sidebarItems,
}) => {
  const { openItems, toggleItem } = useSidebar();
  const showFullSidebar = isSidebarOpen || isHovered;

  if (isSmallScreen && !isSidebarOpen) return null;

  return (
    <div
      className={`
        bg-gray-800 text-white h-screen p-4
        transform transition-all duration-300 ease-in-out
        ${isSmallScreen
          ? `w-64 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
          : `${showFullSidebar ? "w-64" : "w-20"}`
        }
      `}
    >
      <div className="flex items-center justify-between mb-6">
        {showFullSidebar && (
          <img
            src="images/logo.png"
            alt="Logo"
            className="w-[150px] h-auto max-h-[150px] object-contain"
          />
        )}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-300 hover:bg-gray-700"
        >
          {isSidebarOpen ? (
            <FaXmark className="w-5 h-5" />
          ) : (
            <FaBars className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav>
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.sidebar_id} className="mb-2">
              {item.sidebar_path ? (
                <a
                  href={item.sidebar_path}
                  className="flex items-center py-2 px-4 rounded hover:bg-gray-700"
                  onClick={() => isSmallScreen && setSidebarOpen(false)}
                >
                  {getIconForName(item.sidebar_name)}
                  {showFullSidebar && (
                    <span className="ml-3">{item.sidebar_name}</span>
                  )}
                </a>
              ) : (
                <div
                  className="flex justify-between items-center py-2 px-4 rounded cursor-pointer hover:bg-gray-700"
                  onClick={() => toggleItem(item.sidebar_id)}
                >
                  <span className="flex items-center">
                    {getIconForName(item.sidebar_name)}
                    {showFullSidebar && (
                      <span className="ml-3">{item.sidebar_name}</span>
                    )}
                  </span>
                  {showFullSidebar && (
                    <span>
                      {openItems[item.sidebar_id] ? (
                        <FaChevronUp className="w-4 h-4" />
                      ) : (
                        <FaChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              )}
              {item.children &&
                openItems[item.sidebar_id] &&
                showFullSidebar && (
                  <ul className="ml-4 mt-2">
                    {item.children.map((child) => (
                      <li key={`child-${child.sidebar_id}`} className="mb-1">
                        <a
                          href={child.sidebar_path}
                          className="flex items-center py-2 px-4 rounded hover:bg-gray-700"
                          onClick={() => isSmallScreen && setSidebarOpen(false)}
                        >
                          {getIconForName(child.sidebar_name)}
                          {showFullSidebar && (
                            <span className="ml-3">{child.sidebar_name}</span>
                          )}
                        </a>
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

const Sidebar = (props) => (
  <SidebarProvider>
    <SidebarContent {...props} />
  </SidebarProvider>
);

export default Sidebar;
