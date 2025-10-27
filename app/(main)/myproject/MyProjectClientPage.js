'use client'

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSpinner, FaUserTie, FaCalendarXmark, FaUsers, FaPaperclip, FaCalendarDays, FaFile, FaTriangleExclamation, FaCircleInfo, FaPenToSquare, FaTrash, FaCircleCheck, FaCopy } from 'react-icons/fa6';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

// Component สำหรับแสดงผลการ์ดโครงการ (สำหรับหน้า 'โครงการของฉัน')
const ProjectCard = ({ project, currentUser, onViewDetails, onEdit, onDelete, onCopy, onToggleProjectStatus, onToggleRegistrationStatus }) => {
    // กำหนด Props ที่ไม่ได้ใช้ในหน้านี้เป็นฟังก์ชันว่าง เพื่อป้องกัน Error
    // นำ onUnregister ออกจาก props
    onEdit = onEdit || (() => {}); 
    onDelete = onDelete || (() => {});
    onCopy = onCopy || (() => {});
    onToggleProjectStatus = onToggleProjectStatus || (() => {});
    onToggleRegistrationStatus = onToggleRegistrationStatus || (() => {});

    const creatorName = (project.firstname && project.lastname) ? `${project.firstname} ${project.lastname}` : project.create_by;
    const formattedDate = new Date(project.create_date).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const canModify = currentUser && (currentUser.role_id === 3 || currentUser.role_id === 2);
    const isStudent = currentUser && currentUser.role_id === 1;
    const isProjectOverdue = new Date(project.end_project) < new Date();

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 relative">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-2xl font-bold text-slate-800">{project.project_title}</h3>
                        <div
                            className={`text-xs font-bold px-3 py-1.5 rounded-full text-white whitespace-nowrap ${project.program_type === 'ปกติ' ? 'bg-indigo-500' : 'bg-pink-500'
                                }`}
                        >
                            <span>{project.program_type}</span>
                        </div>
                    </div>

                    {/* ปุ่มสำหรับ Role 2, 3 (ผู้ดูแล/บุคลากร) */}
                    {canModify && (
                        <div className="flex space-x-2">
                            <button onClick={() => onCopy(project)} className="copy-btn text-slate-500 hover:text-blue-600 p-2 rounded-md" title="คัดลอกโครงการ"><FaCopy /></button>
                            <button onClick={() => onEdit(project)} className="edit-btn text-slate-500 hover:text-sky-600 p-2 rounded-md" title="แก้ไขโครงการ"><FaPenToSquare /></button>
                            <button onClick={() => onDelete(project.project_id)} className="delete-btn text-slate-500 hover:text-red-600 p-2 rounded-md" title="ลบโครงการ"><FaTrash /></button>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-500 mb-4 border-b border-slate-200 pb-4">
                    <FaUserTie className="h-4 w-4 mr-1.5" />
                    <span>โดย: {creatorName}</span>
                    <FaCalendarDays className="h-4 w-4 mr-1.5" />
                    <span>{formattedDate}</span>
                </div>

                <p className="text-slate-600 mb-2 leading-relaxed line-clamp-2">
                    {project.project_description}
                </p>

                <div className="flex items-center space-x-2 mt-2">
                    {project.attached_file_name && (
                        <a
                            href={`/api/project-files/${project.attached_file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-semibold py-1.5 px-3 text-sm rounded-lg flex items-center space-x-2"
                        >
                            <FaPaperclip className="mr-1.5" />
                            <span>ไฟล์แนบ</span>
                        </a>
                    )}
                </div>


                <div className="flex items-center justify-between flex-wrap pt-4">
                    <div className="flex items-center space-x-4 text-sm font-semibold">
                        {/* 1. แสดงสถานะโครงการ (เปิด/ปิด) สำหรับผู้ดูแลเท่านั้น */}
                        {canModify && (
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-white ${project.project_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                                    โครงการ: {project.project_status === 'active' ? 'เปิด' : 'ปิด'}
                                </span>
                            </div>
                        )}

                        {/* 2. แสดงสถานะการลงทะเบียนสำเร็จ (สำหรับนักศึกษา) */}
                        {isStudent && (
                            <div className="text-green-600 flex items-center">
                                <FaCircleCheck className="mr-2 h-4 w-4" /> ลงทะเบียนสำเร็จ
                            </div>
                        )}
                        
                        {/* 3. แสดงสถานะว่าโครงการหมดอายุแล้วหรือไม่ */}
                        {isProjectOverdue && (
                            <div className="text-red-600 flex items-center">
                                <FaCalendarXmark className="mr-2 h-4 w-4" /> โครงการสิ้นสุด
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-2 mt-4 md:mt-0">
                        {/* ปุ่มหลัก: ดูรายละเอียด */}
                        <button
                            onClick={() => onViewDetails(project)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md"
                        >
                            <FaUsers className="mr-2" /> ดูรายละเอียด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component ใหม่: ProjectDetailsModal (ปรับปรุงให้แสดงรายละเอียดที่จำกัดสำหรับนักศึกษา) ---
const ProjectDetailsModal = ({ isOpen, onClose, projectItem, isStudent }) => {
    // นำ onUnregister ออกจาก props
    if (!isOpen || !projectItem) return null;

    const creatorName = (projectItem.firstname && projectItem.lastname) ? `${projectItem.firstname} ${projectItem.lastname}` : projectItem.create_by;
    const formattedStartDate = new Date(projectItem.start_project).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
    const formattedEndDate = new Date(projectItem.end_project).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
    const isProjectOverdue = new Date(projectItem.end_project) < new Date();

    return (
        <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 font-inter p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold">รายละเอียดโครงการ</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
                </div>
                
                <div className="space-y-4 text-slate-700">
                    <h4 className="text-xl font-semibold">{projectItem.project_title}</h4>
                    
                    {/* แสดงสถานะโครงการสิ้นสุดแล้ว */}
                    {isProjectOverdue && (
                        <div className="text-red-600 flex items-center font-semibold p-2 border border-red-200 bg-red-50 rounded-lg">
                            <FaCalendarXmark className="mr-2 h-5 w-5" /> โครงการนี้ได้สิ้นสุดลงตามกำหนดแล้ว
                        </div>
                    )}
                    
                    {/* คำอธิบายโครงการ: แสดงเสมอ */}
                    <p className="text-slate-500 whitespace-pre-wrap">{projectItem.project_description}</p>
                    
                    {/* ส่วนรายละเอียดที่แสดงสำหรับนักศึกษา (จำกัด) */}
                    {/* NOTE: แสดงเฉพาะ ช่วงเวลา และ สถานที่ สำหรับนักศึกษา */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isStudent ? 'pt-2' : 'border-t pt-4 border-slate-200'}`}>
                        {/* 1. ช่วงเวลา (แสดงเสมอ) */}
                        <div><p className="font-semibold">ช่วงเวลา:</p><p>ตั้งแต่ {formattedStartDate} ถึง {formattedEndDate}</p></div>
                        {/* 2. สถานที่ (แสดงเสมอ) */}
                        <div><p className="font-semibold">สถานที่:</p><p>{projectItem.program_location || '-'}</p></div>

                        {/* รายละเอียดเชิงลึก: แสดงเฉพาะถ้าไม่ใช่ Role นักศึกษา (isStudent เป็น false) */}
                        {!isStudent && (
                            <>
                                <div><p className="font-semibold">ผู้รับผิดชอบ:</p><p>{(projectItem.manager_firstname && projectItem.manager_lastname) ? `${projectItem.manager_firstname} ${projectItem.manager_lastname}` : creatorName}</p></div>
                                <div><p className="font-semibold">ประเภทโครงการ:</p><p>{projectItem.program_type || '-'}</p></div>
                                <div><p className="font-semibold">งบประมาณที่ได้รับจัดสรร:</p><p>{projectItem.associated_budget ? projectItem.associated_budget.toLocaleString('th-TH') + ' บาท' : '-'}</p></div>
                                <div><p className="font-semibold">ปีงบประมาณ:</p><p>{projectItem.fiscal_year || '-'}</p></div>
                                <div><p className="font-semibold">จำนวนกลุ่มเป้าหมาย:</p><p>{projectItem.group_count ? `${projectItem.group_count} คน` : '-'}</p></div>
                                <div><p className="font-semibold">แผนงาน:</p><p>{projectItem.plan || '-'}</p></div>
                                <div><p className="font-semibold">สถานะการลงทะเบียน:</p><p className={`font-medium ${projectItem.registration_status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {projectItem.registration_status === 'active' ? 'เปิดรับ (สถานะเดิม)' : 'ปิดรับ (สถานะเดิม)'}
                                </p></div>
                            </>
                        )}
                    </div>

                    {/* วัตถุประสงค์: ซ่อนสำหรับนักศึกษา */}
                    {!isStudent && (
                        <div className="pt-4 border-t border-slate-200">
                            <h5 className="font-semibold text-lg">วัตถุประสงค์:</h5>
                            <ul className="list-disc list-inside space-y-1 pl-4">
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
                    {/* ปุ่มสำหรับผู้ดูแลดูข้อมูลการลงทะเบียน (Role 2, 3) */}
                    {!isStudent && (
                        <button onClick={() => Swal.fire('ข้อมูลการลงทะเบียน', 'ฟังก์ชันนี้ยังไม่ได้ถูกสร้าง', 'info')} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg mr-3">
                            <FaUsers className="inline-block mr-2" />ดูข้อมูลการลงทะเบียน
                        </button>
                    )}

                    <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">ปิด</button>
                </div>
            </div>
        </div>
    );
};


// Main component (MyProjectClientPage)
const MyProjectClientPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    // const [registrationDetails, setRegistrationDetails] = useState(null); // ไม่ได้ใช้

    // fetchMyProjects remains the same... (Logic เพื่อดึงข้อมูลโครงการที่ลงทะเบียน)
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

            if (user.role_id !== 1) {
                setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
                setLoading(false);
                return;
            }

            // NOTE: /api/my-project ควรเป็น API ที่เรียกใช้ Token เพื่อดึงโครงการที่ User_ID ปัจจุบันลงทะเบียนไว้เท่านั้น
            const response = await axios.get('/api/my-project', { headers: { Authorization: `Bearer ${accessToken}` } });
            setProjects(response.data.data);

        } catch (err) {
            console.error('API My Projects GET Error:', err);
            setError(err.response?.data?.message || 'ไม่สามารถดึงข้อมูลโครงการของฉันได้');
        } finally {
            setLoading(false);
        }
    }, []);

    // handleViewDetails remains the same... (เพียงแค่แสดง Modal)
    const handleViewDetails = useCallback((project) => {
        setSelectedProject(project);
        setShowDetailsModal(true);
    }, []);

    // NOTE: handleUnregisterProject ถูกลบออกทั้งหมดตามความต้องการ

    // useEffect hook to run the fetch function when the component mounts
    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]);

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-inter">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">โครงการที่ฉันลงทะเบียน</h1>
                </header>

                <main className="space-y-6">
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
                        projects.map((item) => (
                            <ProjectCard
                                key={item.project_id}
                                project={item}
                                currentUser={currentUser}
                                onViewDetails={handleViewDetails}
                                // onUnregister ถูกนำออก
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
                    isStudent={currentUser?.role_id === 1}
                    // onUnregister ถูกนำออก
                />
            )}
        </div>
    );
};

export default MyProjectClientPage;