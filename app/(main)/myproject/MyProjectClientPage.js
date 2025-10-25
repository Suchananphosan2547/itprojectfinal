'use client'

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSpinner, FaUserTie, FaCalendarXmark, FaUsers, FaPaperclip, FaCalendarDays, FaFile, FaTriangleExclamation, FaCircleInfo, FaPenToSquare, FaTrash, FaClock } from 'react-icons/fa6';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

// Component สำหรับแสดงผลการ์ดโครงการ
const ProjectCard = ({ project, currentUser, onEdit, onDelete, onViewDetails }) => {
  const creatorName = (project.firstname && project.lastname) ? `${project.firstname} ${project.lastname}` : project.create_by;
  const formattedDate = new Date(project.create_date).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const canModify = currentUser && (currentUser.role_id === 3 || currentUser.role_id === 2);
  const isStudent = currentUser && currentUser.role_id === 1;
  const isRegistrationActive = project.registration_status === 'active' && new Date(project.end_project) >= new Date();
  const isProjectOverdue = new Date(project.end_project) < new Date();
  const isRegistered = project.is_registered_by_user; // Assuming this comes from the project data

return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 relative">
            <div className="p-6">
                
                {/* 💡 แถวบนสุด: ชื่อโครงการ + ภาคเรียน | ปุ่มแก้ไข/ลบ (ใช้ justify-between) */}
                <div className="flex items-start justify-between mb-4">
                    
                    {/* ซ้าย: ชื่อโครงการ + ภาคเรียน (flex-grow เพื่อให้ชื่อโครงการขยายเต็มที่) */}
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 min-w-0 flex-grow pr-4"> 
                        <h3 className="text-2xl font-bold text-slate-800 truncate">{project.project_title}</h3>
                        <div
                            className={`text-xs font-bold px-3 py-1.5 rounded-full text-white whitespace-nowrap flex-shrink-0 
                                        ${project.program_type === 'ปกติ' ? 'bg-indigo-500' : 'bg-pink-500'
                            }`}
                        >
                            <span>{project.program_type}</span>
                        </div>
                    </div>
                    
                    {/* ขวา: ปุ่มแก้ไข/ลบ (flex-shrink-0 เพื่อไม่ให้ถูกบีบ) */}
                    {canModify && (
                        <div className="flex space-x-2 flex-shrink-0 text-xl pt-1">
                            {/* เพิ่ม p-2 เพื่อขยายพื้นที่คลิกและสไตล์ Hover */}
                            <button onClick={() => onEdit(project)} className="text-slate-500 hover:text-sky-600 p-2 rounded-md transition duration-150" title="แก้ไข"><FaPenToSquare /></button>
                            <button onClick={() => onDelete(project.project_id)} className="text-slate-500 hover:text-red-600 p-2 rounded-md transition duration-150" title="ลบ"><FaTrash /></button>
                        </div>
                    )}
                </div>
                
                {/* ข้อมูลผู้สร้าง + วันที่ */}
                <div className="flex items-center space-x-3 text-sm text-slate-500 mb-4 border-b border-slate-200 pb-4">
                    <FaUserTie className="h-4 w-4 mr-1.5" />
                    <span>By: {creatorName}</span>
                    <FaCalendarDays className="h-4 w-4 mr-1.5" />
                    <span>{formattedDate}</span>
                </div>

                {/* คำอธิบายโครงการ */}
                <p className="text-slate-600 mb-2 leading-relaxed line-clamp-3"> {/* เพิ่ม line-clamp-3 เพื่อจำกัดบรรทัด */}
                    {project.project_description}
                </p>

                {/* ไฟล์แนบ */}
                <div className="flex items-center space-x-2 mt-4"> {/* ปรับ mt-2 เป็น mt-4 เพื่อเพิ่มช่องว่าง */}
                    {project.attached_file_name && (
                        <a href={`/api/project-files/${project.attached_file_name}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">
                            <FaPaperclip className="mr-1.5" />
                            <span>{project.attached_file_name}</span>
                        </a>
                    )}
                </div>

                {/* สถานะโครงการ + ปุ่มดูรายละเอียด */}
                <div className="flex items-center justify-between flex-wrap mt-6 pt-4 border-t border-slate-200"> {/* เพิ่มเส้นแบ่งและช่องว่างด้านบน */}
                    
                    {/* ซ้าย: สถานะลงทะเบียน */}
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2 md:mb-0">
                        {isProjectOverdue ? (
                            <div className="text-red-600 flex items-center font-semibold"><FaCalendarXmark className="mr-2" />หมดเขตลงทะเบียนแล้ว</div>
                        ) : (
                            <div className="text-green-600 flex items-center font-semibold"><FaClock className="mr-2" />เปิดให้ลงทะเบียน</div>
                        )}
                    </div>
                    
                    {/* ขวา: ปุ่มดูรายละเอียด (รวมกันเพื่อไม่ให้ซ้ำซ้อน) */}
                    <div className="flex space-x-2 mt-2 md:mt-0">
                        {(isStudent || canModify) && (
                            <button 
                                onClick={() => onViewDetails(project)} 
                                className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition duration-150"
                            >
                                <FaUsers className="mr-2" />ดูรายละเอียด
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component ใหม่: Popup แสดงรายละเอียดโครงการ (ปรับปรุงตาม Role) ---
const ProjectDetailsModal = ({ isOpen, onClose, projectItem, onViewRegistrations, onUnregister, isRegistered, isStudent }) => {
  if (!isOpen || !projectItem) return null;

  // Find creator name
  const creatorName = (projectItem.firstname && projectItem.lastname) ? `${projectItem.firstname} ${projectItem.lastname}` : projectItem.create_by;
  const formattedStartDate = new Date(projectItem.start_project).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
  const formattedEndDate = new Date(projectItem.end_project).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
  const isRegistrationActive = projectItem.registration_status === 'active' && new Date(projectItem.end_project) >= new Date();

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 font-inter p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold">รายละเอียดโครงการ</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
        </div>
        <div className="space-y-4 text-slate-700">
          <h4 className="text-xl font-semibold">{projectItem.project_title}</h4>
          <p className="text-slate-500">{projectItem.project_description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">ช่วงเวลา:</p>
              <p>ตั้งแต่ {formattedStartDate} ถึง {formattedEndDate}</p>
            </div>
            <div>
              <p className="font-semibold">สถานที่:</p>
              <p>{projectItem.program_location || '-'}</p>
            </div>
            {/* ส่วนนี้จะแสดงผลเฉพาะสำหรับ Role 2 (บุคลากร) ขึ้นไป หรือถ้าเป็นนักศึกษาที่ต้องการดูรายละเอียดเพิ่มเติม */}
            {(!isStudent || (isStudent && isRegistered)) && ( // Show more details if not student OR if student and already registered
              <>
                <div>
                  <p className="font-semibold">ผู้รับผิดชอบ:</p>
                  <p>{(projectItem.manager_firstname && projectItem.manager_lastname) ? `${projectItem.manager_firstname} ${projectItem.manager_lastname}` : creatorName}</p>
                </div>
                <div>
                  <p className="font-semibold">ประเภทโครงการ:</p>
                  <p>{projectItem.program_type || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">งบประมาณที่ได้รับจัดสรร:</p>
                  <p>{projectItem.associated_budget ? projectItem.associated_budget.toLocaleString('th-TH') + ' บาท' : '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">ปีงบประมาณ:</p>
                  <p>{projectItem.fiscal_year || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">จำนวนกลุ่มเป้าหมาย:</p>
                  <p>{projectItem.group_count ? `${projectItem.group_count} คน` : '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">เปอร์เซ็นต์ที่คาดว่าจะเข้าร่วม:</p>
                  <p>{projectItem.expected_participant_percentage ? `${projectItem.expected_participant_percentage} %` : '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">แผนงาน:</p>
                  <p>{projectItem.plan || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">สถานะการลงทะเบียน:</p>
                  <p className={`font-medium ${projectItem.registration_status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {projectItem.registration_status === 'active' ? 'เปิดรับ' : 'ปิดรับ'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* วัตถุประสงค์ (แสดงผลเฉพาะสำหรับ Role 2 ขึ้นไป หรือถ้าเป็นนักศึกษาที่ต้องการดูรายละเอียดเพิ่มเติม) */}
          {(!isStudent || (isStudent && isRegistered)) && (
            <div className="pt-4">
              <h5 className="font-semibold text-lg">วัตถุประสงค์:</h5>
              <ul className="list-disc list-inside space-y-1">
                {projectItem.objectives?.length > 0 ? (
                  projectItem.objectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                  ))
                ) : (
                  <li>-</li>
                )}
              </ul>
            </div>
          )}


          {projectItem.attached_file_name && (
            <div>
              <p className="font-semibold">ไฟล์แนบ:</p>
              <a href={`/api/project-files/${projectItem.attached_file_name}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mt-1">
                <FaFile className="mr-2" />
                <span>{projectItem.attached_file_name}</span>
              </a>
            </div>
          )}
        </div>



        <div className="flex justify-end pt-5 mt-4 border-t">
          {/* ปุ่มสำหรับผู้ดูแล/อาจารย์ */}
          {!isStudent && (
            <button onClick={() => onViewRegistrations(projectItem.project_id)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg mr-3">
              <FaUsers className="inline-block mr-2" />ดูข้อมูลการลงทะเบียน
            </button>
          )}

          <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">ปิด</button>
        </div>
      </div>
    </div>
  );
};



// Main component for the "My Projects" page for students
const MyProjectClientPage = () => {
  // State for storing projects, loading status, errors, and current user
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [registrationDetails, setRegistrationDetails] = useState(null);

  // Function to fetch the projects the user has registered for
  const fetchMyProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ');
        setLoading(false);
        return;
      }

      let user = null;
      if (typeof window !== 'undefined') {
        const userData = sessionStorage.getItem('user');
        if (userData) {
          user = JSON.parse(userData);
          setCurrentUser(user);
        }
      }

      if (!user) {
          setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ');
          setLoading(false);
          return;
      }

      // Check if the user is a student (role_id === 1) before fetching
      if (user.role_id !== 1) {
        setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/my-project');
      setProjects(response.data.data);

    } catch (err) {
      console.error('API My Projects GET Error:', err);
      setError(err.response?.data?.message || 'ไม่สามารถดึงข้อมูลโครงการของฉันได้');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to view registration details for a specific project
  const handleViewDetails = useCallback(async (project) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        Swal.fire('Error', 'Access token not found. Please log in.', 'error');
        return;
      }

      // --- Simulate API call with mock data ---
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setRegistrationDetails(null); // Removed mock data

      setSelectedProject(project);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('API Error:', err);
      Swal.fire('Error', err.response?.data?.message || 'ไม่สามารถดึงข้อมูลการลงทะเบียนได้', 'error');
    }
  }, [currentUser]);

  // Function to handle unregistering from a project (for students)
const handleUnregisterProject = useCallback(async (projectId) => {
    Swal.fire({
        title: 'ยืนยันการยกเลิก?',
        text: "คุณต้องการยกเลิกการลงทะเบียนโครงการนี้ใช่หรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const accessToken = Cookies.get('accessToken');
                if (!accessToken) {
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด',
                        text: 'Access token not found. Please log in.',
                        icon: 'error',
                        confirmButtonText: 'ตกลง' 
                    });
                    return;
                }
                
                const config = { headers: { Authorization: `Bearer ${accessToken}` } };
                const response = await axios.delete(`/api/registration/${projectId}`, config); 

                Swal.fire({
                    title: 'ยกเลิกสำเร็จ', 
                    text: response.data?.message || 'การลงทะเบียนถูกยกเลิกเรียบร้อยแล้ว', 
                    icon: 'success',
                    confirmButtonText: 'ตกลง' 
                });
                
                fetchMyProjects(); // Refresh the list of projects
            } catch (err) {
                console.error('API Error:', err);
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกการลงทะเบียน',
                    icon: 'error',
                    confirmButtonText: 'ตกลง' 
                });
            }
        }
    });
}, [fetchMyProjects]); 


  // useEffect hook to run the fetch function when the component mounts
  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">โครงการของฉัน</h1>
        </header>

        <main className="space-y-6">
          {/* Conditional rendering based on loading, error, and data state */}
          {loading ? (
            <div className="flex justify-center items-center h-48 text-gray-500">
              <FaSpinner className="animate-spin text-4xl mr-2" />
              <span>กำลังโหลด...</span>
            </div>
          ) : error ? (
            <div className="text-center p-10 text-red-500"><FaTriangleExclamation className="mx-auto text-4xl mb-2" /><p>{error}</p></div>
          ) : projects.length === 0 ? (
            <div className="text-center p-10 text-gray-500"><FaCircleInfo className="mx-auto text-4xl mb-2" /><p>คุณยังไม่ได้ลงทะเบียนโครงการใด</p></div>
          ) : (
            // Map through the projects and render a ProjectCard for each one
            projects.map((item) => (
              <ProjectCard
                key={item.project_id}
                project={item}
                currentUser={currentUser} // Pass currentUser to ProjectCard
                onViewDetails={handleViewDetails}
                isRegistered={item.is_registered_by_user} // Pass isRegistered status
                // onEdit and onDelete are not applicable for MyProjectClientPage, but kept in ProjectCard for reusability
                onEdit={() => console.log('Edit not available on My Projects page')}
                onDelete={() => console.log('Delete not available on My Projects page')}
              />
            ))
          )}
        </main>
      </div>

      {/* Modal for displaying registration details */}
      {showDetailsModal && selectedProject && (
        <ProjectDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          projectItem={selectedProject}
          isRegistered={selectedProject.is_registered_by_user} // Pass isRegistered status
          isStudent={currentUser?.role_id === 1} // Pass if current user is a student
          onViewRegistrations={() => Swal.fire('ข้อมูลการลงทะเบียน', 'ฟังก์ชันนี้สำหรับผู้จัดการเท่านั้น', 'info')} // Placeholder for manager function
          onUnregister={handleUnregisterProject} // Pass unregister function
        />
      )}
    </div>
  );
};

export default MyProjectClientPage;