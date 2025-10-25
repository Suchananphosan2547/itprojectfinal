'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaFileExcel, FaRegSquarePlus, FaTriangleExclamation, FaCircleInfo, FaPenToSquare, FaTrash, FaUserTie, FaPlus, FaCalendarDays, FaClock, FaCalendarXmark, FaCircleCheck, FaUsers, FaUserPlus, FaFloppyDisk, FaFile, FaPaperclip, FaMagnifyingGlass, FaSort, FaSortUp, FaSortDown, FaCopy } from 'react-icons/fa6';
import * as XLSX from 'xlsx';
import Cookies from 'js-cookie';


// --- Component สำหรับแสดงผลการ์ดโครงการ ---
const ProjectCard = ({ project, currentUser, onEdit, onDelete, onViewDetails, isRegistered, onToggleProjectStatus, onToggleRegistrationStatus, onCopy }) => {
  const creatorName = (project.firstname && project.lastname) ? `${project.firstname} ${project.lastname}` : project.create_by;
  const formattedDate = new Date(project.create_date).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const canModify = currentUser && (currentUser.role_id === 3 || currentUser.role_id === 2);
  const isStudent = currentUser && currentUser.role_id === 1;
  const isRegistrationActive = project.registration_status === 'active' && new Date(project.end_project) >= new Date();
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

          {canModify && (
            <div className="flex space-x-2">
              <button
                onClick={() => onCopy(project)}
                className="copy-btn text-slate-500 hover:text-blue-600 p-2 rounded-md"
                title="คัดลอกโครงการ"
              >
                <FaCopy />
              </button>
              <button
                onClick={() => onEdit(project)}
                className="edit-btn text-slate-500 hover:text-sky-600 p-2 rounded-md"
                title="แก้ไขโครงการ"
              >
                <FaPenToSquare />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-sm text-slate-500 mb-4 border-b border-slate-200 pb-4">
          <FaUserTie className="h-4 w-4 mr-1.5" />
          <span>By: {creatorName}</span>
          <FaCalendarDays className="h-4 w-4 mr-1.5" />
          <span>{formattedDate}</span>
        </div>


        <p className="text-slate-600 mb-2 leading-relaxed">
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
              <span>{project.attached_file_name}</span>
            </a>
          )}
        </div>


        <div className="flex items-center justify-between flex-wrap mt-2">
          {canModify ? (
            <div className="flex items-center space-x-2 text-sm mb-2 mt-4 md:mb-0">
              <button
                onClick={() => onToggleProjectStatus(project.project_id, project.project_status)}
                className={`px-3 py-1 rounded-full font-semibold ${project.project_status === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                  }`}
              >
                สถานะโครงการ: {project.project_status === 'active' ? 'เปิด' : 'ปิด'}
              </button>
              <button
                onClick={() => onToggleRegistrationStatus(project.project_id, project.registration_status)}
                className={`px-3 py-1 rounded-full font-semibold ${project.registration_status === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-500 text-white'
                  }`}
              >
                สถานะการลงทะเบียน: {project.registration_status === 'active' ? 'เปิด' : 'ปิด'}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2 md:mb-0">
              {project.registration_status === 'active' ? (
                isProjectOverdue ? (
                  <div className="text-red-600 flex items-center font-semibold">
                    <FaCalendarXmark className="mr-2" /> หมดเขตลงทะเบียนแล้ว
                  </div>
                ) : (
                  <div className="text-green-600 flex items-center font-semibold">
                    <FaClock className="mr-2" /> เปิดให้ลงทะเบียน
                  </div>
                )
              ) : (
                <div className="text-red-600 flex items-center font-semibold">
                  <FaCalendarXmark className="mr-2" /> ปิดรับลงทะเบียน
                </div>
              )}
            </div>
          )}


          <div className="flex space-x-2 mt-2 md:mt-0">
            {isStudent && (
              isRegistrationActive ? (
                isRegistered ? (
                  <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg">
                    <FaCircleCheck className="mr-2" /> ลงทะเบียนแล้ว
                  </span>
                ) : (
                  <button
                    onClick={() => onViewDetails(project)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md"
                  >
                    <FaUsers className="mr-2" /> ดูรายละเอียด
                  </button>
                )
              ) : (
                <button
                  onClick={() => onViewDetails(project)}
                  className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-500 font-semibold rounded-lg shadow-md"
                  disabled
                >
                  <FaUsers className="mr-2" />
                  {project.registration_status !== 'active'
                    ? 'ปิดรับลงทะเบียน'
                    : 'หมดเขตลงทะเบียนแล้ว'}
                </button>
              )
            )}

            {canModify && (
              <button
                onClick={() => onViewDetails(project)}
                className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md"
              >
                <FaUsers className="mr-2" /> ดูรายละเอียด
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component ใหม่: Popup แสดงรายละเอียดโครงการ (ปรับปรุงตาม Role) ---
const ProjectDetailsModal = ({ isOpen, onClose, projectItem, onViewRegistrations, onOpenRegisterForm, onUnregister, isRegistered, isStudent, managers }) => {
  if (!isOpen || !projectItem) return null;

  const creatorName = (projectItem.firstname && projectItem.lastname) ? `${projectItem.firstname} ${projectItem.lastname}` : projectItem.create_by;
  const teacherName = managers.find(t => t.manager_id === projectItem.manager_id);
  const formattedStartDate = new Date(projectItem.start_project).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
  const formattedEndDate = new Date(projectItem.end_project).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
  const isRegistrationActive = projectItem.registration_status === 'active' && new Date(projectItem.end_project) >= new Date();

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/5 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto project-section">
        <div className="flex justify-between items-center border-b pb-3 mb-4 ">
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
            {!isStudent && (
              <>
                <div>
                  <p className="font-semibold">ผู้รับผิดชอบ:</p>
                  <p>{teacherName ? `${teacherName.manager_rank_name || teacherName.manager_prefix} ${teacherName.manager_fname} ${teacherName.manager_lname}` : creatorName}</p>
                </div>
                <div>
                  <p className="font-semibold">ภาค:</p>
                  <p>{projectItem.program_type || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">งบประมาณ:</p>
                  <p>{projectItem.allocated_budget ? projectItem.allocated_budget.toLocaleString('th-TH') + ' บาท' : '-'}</p>
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
                  <p className="font-semibold">ค่าเฉลี่ยคะแนนประเมินที่คาดว่าจะได้:</p>
                  <p>{projectItem.plan_quality || '-'}</p>
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

          {!isStudent && (
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
          {!isStudent && (
            <button onClick={() => onViewRegistrations(projectItem.project_id)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg mr-3">
              <FaUsers className="inline-block mr-2" />ดูข้อมูลการลงทะเบียน
            </button>
          )}

          {isStudent && isRegistrationActive && (
            isRegistered ? (
              <button onClick={() => onUnregister(projectItem.project_id)} className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md mr-3">
                <FaUserPlus className="mr-2" />ยกเลิกการลงทะเบียน
              </button>
            ) : (
              <button onClick={() => onOpenRegisterForm(projectItem)} className="inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md mr-3">
                <FaUserPlus className="mr-2" />ลงทะเบียนเข้าร่วม
              </button>
            )
          )}

          <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">ปิด</button>
        </div>
      </div>
    </div>
  );
};


// --- Component สำหรับ Modal ยืนยันการลงทะเบียนพร้อมฟอร์ม ---
const RegistrationConfirmationModal = ({ isOpen, onClose, onConfirm, projectItem }) => {
  const [allergyOption, setAllergyOption] = useState('none');
  const [allergyText, setAllergyText] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const formattedDates = `${new Date(projectItem?.start_project).toLocaleDateString('th-TH')} - ${new Date(projectItem?.end_project).toLocaleDateString('th-TH')}`;

  if (!isOpen || !projectItem) return null;

  const handleConfirm = () => {
    const allergyData = allergyOption === 'has' ? allergyText : '';
    onConfirm(projectItem.project_id, allergyData, suggestions);
  };

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/5 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto project-section">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold">ลงทะเบียนเข้าร่วม</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
        </div>

        <div className="space-y-4 text-slate-700">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-xl font-semibold">{projectItem.project_title}</h4>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <p><strong>สถานที่:</strong> {projectItem.program_location}</p>
              <p><strong>วันที่:</strong> {formattedDates}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">ข้อมูลการแพ้ยา/อาหาร</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="allergy"
                  value="none"
                  checked={allergyOption === 'none'}
                  onChange={() => setAllergyOption('none')}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">ไม่มี</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="allergy"
                  value="has"
                  checked={allergyOption === 'has'}
                  onChange={() => setAllergyOption('has')}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">มี</span>
              </label>
            </div>
            {allergyOption === 'has' && (
              <input
                type="text"
                placeholder="ระบุ เช่น แพ้กุ้ง, แพ้ถั่ว"
                value={allergyText}
                onChange={(e) => setAllergyText(e.target.value)}
                className="w-full border-slate-300 rounded-md shadow-sm p-2 mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">ข้อมูลเสนอแนะเพิ่มเติม</label>
            <textarea
              rows="3"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full border-slate-300 rounded-md shadow-sm p-2 mt-1"
              placeholder="กรอกข้อมูลที่ต้องการแจ้งให้ทราบเพิ่มเติม"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-4 border-t">
          <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
          <button onClick={handleConfirm} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">
            ยืนยันการลงทะเบียน
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Component สำหรับ Popup ดูรายชื่อผู้ลงทะเบียน (ปรับปรุงแล้ว) ---
const ViewParticipantsModal = ({ isOpen, onClose, participants }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'registered_at', direction: 'desc' });

  const sortedParticipants = useMemo(() => {
    let sortableItems = [...participants];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [participants, sortConfig]);

  const filteredAndSortedParticipants = useMemo(() => {
    const filtered = sortedParticipants.filter(participant =>
      participant.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.std_id.includes(searchTerm)
    );
    return filtered;
  }, [searchTerm, sortedParticipants]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-slate-400" />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleExport = () => {
    const dataToExport = filteredAndSortedParticipants.map(p => ({
      'รหัสนิสิต': p.std_id,
      'ชื่อ-นามสกุล': `${p.firstname} ${p.lastname}`,
      'ข้อมูลการแพ้': p.allergies || '-',
      'ข้อเสนอแนะ': p.suggestions || '-',
      'วันที่ลงทะเบียน': new Date(p.registered_at).toLocaleString('th-TH'),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "รายชื่อผู้ลงทะเบียน");

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // รหัสนิสิต
      { wch: 30 }, // ชื่อ-นามสกุล
      { wch: 30 }, // ข้อมูลการแพ้
      { wch: 40 }, // ข้อเสนอแนะ
      { wch: 20 }, // วันที่ลงทะเบียน
    ];

    XLSX.writeFile(wb, `รายชื่อผู้ลงทะเบียน-${Date.now()}.xlsx`);
  };

  if (!isOpen) return null;
  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] project-section">
        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
          <h3 className="text-2xl font-bold text-slate-800">รายชื่อผู้ลงทะเบียน</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อหรือรหัสนิสิต"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <div className="overflow-x-auto p-6 pt-0 flex-grow">
          {filteredAndSortedParticipants.length === 0 ? (
            <div className="text-center text-slate-500 p-8">ไม่พบรายชื่อที่ค้นหา</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('firstname')}>
                    <div className="flex items-center">
                      ชื่อ-นามสกุล <span className="ml-2">{getSortIcon('firstname')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('std_id')}>
                    <div className="flex items-center">
                      รหัสนิสิต <span className="ml-2">{getSortIcon('std_id')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('registered_at')}>
                    <div className="flex items-center">
                      วันที่ลงทะเบียน <span className="ml-2">{getSortIcon('registered_at')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ข้อมูลการแพ้</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ข้อเสนอแนะ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAndSortedParticipants.map((participant, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{participant.firstname} {participant.lastname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{participant.std_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(participant.registered_at).toLocaleString('th-TH')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{participant.allergies || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{participant.suggestions || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-between items-center p-6 border-t mt-auto flex-shrink-0">
          <button
            onClick={handleExport}
            disabled={filteredAndSortedParticipants.length === 0}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaFileExcel className="mr-2" />
            Export to Excel
          </button>
          <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">ปิด</button>
        </div>
      </div>
    </div>
  );
};


// Component สำหรับ Popup เพิ่มโครงการ
const AddProjectModal = ({ isOpen, onClose, onSave, currentUser, managers, fiscalYears, plans, initialData }) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [startProject, setStartProject] = useState('');
  const [endProject, setEndProject] = useState('');
  const [programPhase, setProgramPhase] = useState('');
  const [associatedBudget, setAssociatedBudget] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [groupCount, setGroupCount] = useState('');
  const [expectedParticipantPercentage, setExpectedParticipantPercentage] = useState('');
  const [planQuality, setPlanQuality] = useState('');
  const [plan, setPlan] = useState('');
  const [programLocation, setProgramLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [responsibleTeacherId, setResponsibleTeacherId] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileName, setAttachedFileName] = useState('');
  const [objectives, setObjectives] = useState(['']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProjectTitle(initialData.project_title ? `${initialData.project_title} (คัดลอก)` : '');
        setStartProject(initialData.start_project ? new Date(initialData.start_project).toISOString().slice(0, 16) : '');
        setEndProject(initialData.end_project ? new Date(initialData.end_project).toISOString().slice(0, 16) : '');
        setProgramPhase(initialData.program_type || '');
        setAssociatedBudget(initialData.allocated_budget || '');
        setGroupCount(initialData.group_count || '');
        setExpectedParticipantPercentage(initialData.expected_participant_percentage || '');
        setPlanQuality(initialData.plan_quality || '');
        setProgramLocation(initialData.program_location || '');
        setProjectDescription(initialData.project_description || '');
        setResponsibleTeacherId(initialData.manager_id || '');
        setObjectives(initialData.objectives?.length > 0 ? initialData.objectives : ['']);

        if (fiscalYears && fiscalYears.length > 0 && initialData.fiscal_year) {
          const foundFiscalYear = fiscalYears.find(fy => fy.fiscal_name === initialData.fiscal_year);
          setFiscalYear(foundFiscalYear ? foundFiscalYear.fiscal_id : '');
        }

        if (plans && plans.length > 0 && initialData.plan) {
          const foundPlan = plans.find(p => p.plan_name === initialData.plan);
          setPlan(foundPlan ? foundPlan.plan_id : '');
        }

        setAttachedFile(null);
        setAttachedFileName('');
      }
    }
  }, [isOpen, initialData, fiscalYears, plans]);

  const handleClose = () => {
    setError('');
    setProjectTitle('');
    setStartProject('');
    setEndProject('');
    setProgramPhase('');
    setAssociatedBudget('');
    setFiscalYear('');
    setGroupCount('');
    setExpectedParticipantPercentage('');
    setPlanQuality('');
    setPlan('');
    setProgramLocation('');
    setProjectDescription('');
    setResponsibleTeacherId('');
    setAttachedFile(null);
    setAttachedFileName('');
    setObjectives(['']);
    onClose();
  };

  const handleAddObjective = () => { setObjectives([...objectives, '']); };
  const handleObjectiveChange = (index, value) => { const newObjectives = [...objectives]; newObjectives[index] = value; setObjectives(newObjectives); };
  const handleRemoveObjective = (index) => { const newObjectives = objectives.filter((_, i) => i !== index); setObjectives(newObjectives); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      setAttachedFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setAttachedFileName('');
    const fileInput = document.getElementById('attached-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!projectTitle || !startProject || !endProject || !projectDescription || !responsibleTeacherId) {
      setError('Please fill in all required fields (marked with *).');
      return;
    }

    const parsedPercentage = parseFloat(expectedParticipantPercentage);
    if (isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      setError('เปอร์เซ็นต์ที่คาดว่าจะเข้าร่วมต้องอยู่ระหว่าง 0 ถึง 100');
      return;
    }

    const projectData = {
      project_title: projectTitle,
      start_project: startProject,
      end_project: endProject,
      program_phase: programPhase,
      associated_budget: parseFloat(associatedBudget) || 0,
      fiscal_year: parseInt(fiscalYear) || 0,
      group_count: parseInt(groupCount) || 0,
      expected_participant_percentage: parsedPercentage,
      plan_quality: parseFloat(planQuality) || 0,
      plan: plan,
      program_location: programLocation,
      project_description: projectDescription,
      manager_id: responsibleTeacherId,
      objectives: objectives.filter(obj => obj.trim() !== ''),
      attached_file: attachedFile,
    };
    try {
      await onSave(projectData);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to add project.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 z-50 flex items-center backdrop-blur-xs justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto project-section">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-2xl font-bold">เพิ่มโครงการ</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อโครงการ <span className="text-red-500">*</span></label>
                <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เริ่ม <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={startProject} onChange={(e) => setStartProject(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">สิ้นสุด <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={endProject} onChange={(e) => setEndProject(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ภาค</label>
                <select value={programPhase} onChange={(e) => setProgramPhase(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2">
                  <option value="">- เลือกภาค -</option>
                  <option value="ปกติ">ปกติ</option>
                  <option value="พิเศษ">พิเศษ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณที่ได้รับจัดสรร</label>
                <div className="relative">
                  <input type="number" value={associatedBudget} onChange={(e) => setAssociatedBudget(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2 pr-10" />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">บาท</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ปีงบประมาณ</label>
                <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} className="w-full max-w-full border-slate-300 rounded-md shadow-sm p-2">
                  <option value="">- เลือกปีงบประมาณ -</option>
                  {(fiscalYears || []).map((fy) => (
                    <option key={fy.fiscal_id} value={fy.fiscal_id}>
                      {fy.fiscal_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนกลุ่มเป้าหมาย</label>
                <input type="number" value={groupCount} onChange={(e) => setGroupCount(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เปอร์เซ็นต์ที่คาดว่าจะเข้าร่วม</label>
                <div className="relative">
                  <input type="number" value={expectedParticipantPercentage} onChange={(e) => setExpectedParticipantPercentage(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2 pr-10" />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ค่าเฉลี่ยคะแนนประเมินที่คาดว่าจะได้</label>
                <input type="number" value={planQuality} onChange={(e) => setPlanQuality(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">แผนงาน</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2">
                  <option value="">- เลือกแผนงาน -</option>
                  {(plans || []).map((p) => (
                    <option key={p.plan_id} value={p.plan_id}>
                      {p.plan_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">การบรรลุวัตถุประสงค์</label>
                <div className="space-y-2">
                  {objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input type="text" value={objective} onChange={(e) => handleObjectiveChange(index, e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" placeholder={`วัตถุประสงค์ข้อที่ ${index + 1}`} />
                      {objectives.length > 1 && (
                        <button type="button" onClick={() => handleRemoveObjective(index)} className="text-red-500 hover:text-red-700 p-2 text-2xl font-semibold leading-none">&times;</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddObjective} className="mt-2 text-sky-600 font-semibold inline-flex items-center">
                    <FaPlus className="mr-2" />เพิ่มวัตถุประสงค์
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่</label>
                <input type="text" value={programLocation} onChange={(e) => setProgramLocation(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดโครงการ <span className="text-red-500">*</span></label>
                <textarea rows="3" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้รับผิดชอบโครงการ <span className="text-red-500">*</span></label>
                <select value={responsibleTeacherId} onChange={(e) => setResponsibleTeacherId(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required>
                  <option value="">- เลือกอาจารย์ -</option>
                  {(managers || []).map(manager => (
                    <option key={manager.manager_id} value={manager.manager_id}>{`${manager.manager_rank_name || manager.manager_prefix} ${manager.manager_fname} ${manager.manager_lname}`}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">กรุณาแนบไฟล์</label>
                <input type="file" id="attached-file-input" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
                {attachedFileName && (
                  <div className="mt-2 flex items-center space-x-2">
                    <FaFile className="text-slate-500" />
                    <p className="text-sm text-slate-700">{attachedFileName}</p>
                    <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg mt-4">{error}</div>}
          <div className="flex justify-end pt-5 mt-4 border-t">
            <button type="button" onClick={handleClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
              เพิ่มโครงการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component สำหรับ Popup แก้ไขโครงการ (ปรับแก้ให้สอดคล้องกับ AddProjectModal)
const EditProjectModal = ({ isOpen, onClose, onSave, projectItem, managers, fiscalYears, plans }) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [startProject, setStartProject] = useState('');
  const [endProject, setEndProject] = useState('');
  const [programPhase, setProgramPhase] = useState('');
  const [associatedBudget, setAssociatedBudget] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [groupCount, setGroupCount] = useState('');
  const [expectedParticipantPercentage, setExpectedParticipantPercentage] = useState('');
  const [planQuality, setPlanQuality] = useState('');
  const [plan, setPlan] = useState('');
  const [programLocation, setProgramLocation] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [responsibleTeacherId, setResponsibleTeacherId] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileName, setAttachedFileName] = useState('');
  const [objectives, setObjectives] = useState(['']);
  const [deleteAttachedFile, setDeleteAttachedFile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectItem) {
      setProjectTitle(projectItem.project_title || '');
      setStartProject(projectItem.start_project ? new Date(projectItem.start_project).toISOString().slice(0, 16) : '');
      setEndProject(projectItem.end_project ? new Date(projectItem.end_project).toISOString().slice(0, 16) : '');
      setProgramPhase(projectItem.program_type || '');
      setAssociatedBudget(projectItem.allocated_budget || '');
      setGroupCount(projectItem.group_count || '');
      setExpectedParticipantPercentage(projectItem.expected_participant_percentage || '');
      setPlanQuality(projectItem.plan_quality || '');
      setProgramLocation(projectItem.program_location || '');
      setProjectDescription(projectItem.project_description || '');
      setResponsibleTeacherId(projectItem.manager_id || '');
      setObjectives(projectItem.objectives?.length > 0 ? projectItem.objectives : ['']);

      if (fiscalYears && fiscalYears.length > 0 && projectItem.fiscal_year) {
        const foundFiscalYear = fiscalYears.find(fy => fy.fiscal_name === projectItem.fiscal_year);
        setFiscalYear(foundFiscalYear ? foundFiscalYear.fiscal_id : '');
      }
      if (plans && plans.length > 0 && projectItem.plan) {
        const foundPlan = plans.find(p => p.plan_name === projectItem.plan);
        setPlan(foundPlan ? foundPlan.plan_id : '');
      }

      if (projectItem.attached_file_name) {
        setAttachedFileName(projectItem.attached_file_name);
      } else {
        setAttachedFileName('');
      }
    }
  }, [projectItem, fiscalYears, plans]);

  const handleClose = () => { setError(''); onClose(); };
  const handleAddObjective = () => { setObjectives([...objectives, '']); };
  const handleObjectiveChange = (index, value) => { const newObjectives = [...objectives]; newObjectives[index] = value; setObjectives(newObjectives); };
  const handleRemoveObjective = (index) => { const newObjectives = objectives.filter((_, i) => i !== index); setObjectives(newObjectives); };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      setAttachedFileName(file.name);
      setDeleteAttachedFile(false);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setAttachedFileName('');
    setDeleteAttachedFile(true);
    const fileInput = document.getElementById('edit-attached-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const projectData = {
      project_id: projectItem.project_id,
      project_title: projectTitle,
      start_project: startProject,
      end_project: endProject,
      program_phase: programPhase,
      associated_budget: parseFloat(associatedBudget) || 0,
      fiscal_year: parseInt(fiscalYear) || 0,
      group_count: parseInt(groupCount) || 0,
      expected_participant_percentage: parseFloat(expectedParticipantPercentage) || 0,
      plan_quality: parseFloat(planQuality) || 0,
      plan: plan,
      program_location: programLocation,
      project_description: projectDescription,
      manager_id: responsibleTeacherId,
      objectives: objectives.filter(obj => obj.trim() !== ''),
      attached_file: attachedFile,
      delete_project_file: deleteAttachedFile
    };
    try { await onSave(projectData); handleClose(); } catch (err) { setError(err.message || 'Failed to update project.'); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-gray-50/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto project-section">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-2xl font-bold">แก้ไขโครงการ</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อโครงการ <span className="text-red-500">*</span></label>
                <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เริ่ม <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={startProject} onChange={(e) => setStartProject(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">สิ้นสุด <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={endProject} onChange={(e) => setEndProject(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ภาค</label>
                <select value={programPhase} onChange={(e) => setProgramPhase(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2">
                  <option value="">- เลือกภาค -</option>
                  <option value="ปกติ">ปกติ</option>
                  <option value="พิเศษ">พิเศษ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">งบประมาณที่ได้รับจัดสรร</label>
                <div className="relative">
                  <input type="number" value={associatedBudget} onChange={(e) => setAssociatedBudget(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2 pr-10" />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">บาท</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ปีงบประมาณ</label>
                <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2">
                  <option value="">- เลือกปีงบประมาณ -</option>
                  {(fiscalYears || []).map((fy) => (
                    <option key={fy.fiscal_id} value={fy.fiscal_id}>
                      {fy.fiscal_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนกลุ่มเป้าหมาย</label>
                <input type="number" value={groupCount} onChange={(e) => setGroupCount(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เปอร์เซ็นต์ที่คาดว่าจะเข้าร่วม</label>
                <div className="relative">
                  <input type="number" value={expectedParticipantPercentage} onChange={(e) => setExpectedParticipantPercentage(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2 pr-10" />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ค่าเฉลี่ยคะแนนประเมินที่คาดว่าจะได้</label>
                <input type="number" value={planQuality} onChange={(e) => setPlanQuality(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">แผนงาน</label>
                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2">
                  <option value="">- เลือกแผนงาน -</option>
                  {(plans || []).map((p) => (
                    <option key={p.plan_id} value={p.plan_id}>
                      {p.plan_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">การบรรลุวัตถุประสงค์</label>
                <div className="space-y-2">
                  {objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input type="text" value={objective} onChange={(e) => handleObjectiveChange(index, e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" placeholder={`วัตถุประสงค์ข้อที่ ${index + 1}`} />
                      {objectives.length > 1 && (
                        <button type="button" onClick={() => handleRemoveObjective(index)} className="text-red-500 hover:text-red-700 p-2 text-2xl font-semibold leading-none">&times;</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddObjective} className="mt-2 text-sky-600 font-semibold inline-flex items-center">
                    <FaPlus className="mr-2" />เพิ่มวัตถุประสงค์
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">สถานที่</label>
                <input type="text" value={programLocation} onChange={(e) => setProgramLocation(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดโครงการ <span className="text-red-500">*</span></label>
                <textarea rows="3" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้รับผิดชอบโครงการ <span className="text-red-500">*</span></label>
                <select value={responsibleTeacherId} onChange={(e) => setResponsibleTeacherId(e.target.value)} className="w-full border-slate-300 rounded-md shadow-sm p-2" required>
                  <option value="">- เลือกอาจารย์ -</option>
                  {(managers || []).map(manager => (
                    <option key={manager.manager_id} value={manager.manager_id}>{`${manager.manager_rank_name || manager.manager_prefix} ${manager.manager_fname} ${manager.manager_lname}`}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">กรุณาแนบไฟล์</label>
                <input type="file" id="edit-attached-file-input" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
                {attachedFileName && (
                  <div className="mt-2 flex items-center space-x-2">
                    <FaFile className="text-slate-500" />
                    <p className="text-sm text-slate-700">{attachedFileName}</p>
                    <button type="button" onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg mt-4">{error}</div>}
          <div className="flex justify-end pt-5 mt-4 border-t">
            <button type="button" onClick={handleClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
            <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { AddProjectModal, EditProjectModal };

// --- Main Component ---
export default function ProjectClientPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [registeredProjects, setRegisteredProjects] = useState(new Set());
  const [managers, setManagers] = useState([]);
  const [copiedProjectData, setCopiedProjectData] = useState(null);

  // Filter & Pagination States
  const [filters, setFilters] = useState({ search: '', fiscal_id: '', plan_id: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 10 });
  const [fiscalYears, setFiscalYears] = useState([]);
  const [plans, setPlans] = useState([]);

  const API_HEADERS = useMemo(() => ({ 'Authorization': `Bearer ${Cookies.get('accessToken')}` }), []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: filters.search,
        fiscal_id: filters.fiscal_id,
        plan_id: filters.plan_id,
      });

      const response = await axios.get(`/api/project?${params.toString()}`, { headers: API_HEADERS });

      setProjects(response.data?.data || []);
      setPagination(prev => ({ ...prev, ...response.data?.pagination }));

    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  }, [API_HEADERS, pagination.currentPage, pagination.limit, filters]);

  const fetchInitialData = useCallback(async () => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (!userStr) throw new Error("ไม่พบข้อมูลผู้ใช้");
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      const [managersRes, fiscalRes, planRes] = await Promise.all([
        axios.get('/api/manager', { headers: API_HEADERS }),
        axios.get('/api/fiscal-year', { headers: API_HEADERS }),
        axios.get('/api/plan', { headers: API_HEADERS })
      ]);

      setManagers(managersRes.data?.data || []);
      setFiscalYears(fiscalRes.data?.data || []);
      setPlans(planRes.data?.data || []);

      if (user.role_id === 1) {
        const registeredRes = await axios.get('/api/registrations/student', { headers: API_HEADERS });
        setRegisteredProjects(new Set(registeredRes.data?.data.map(r => r.project_id) || []));
      }
    } catch (err) {
      console.error('Fetch initial data error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเริ่มต้น');
    }
  }, [API_HEADERS]);


  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  useEffect(() => {
    fetchProjects(filters, pagination);
  }, [fetchProjects, filters, pagination.currentPage, pagination.limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', fiscal_id: '', plan_id: '' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const fetchRegisteredProjects = async (stdId) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found.');
      }
      const response = await axios.get(`/api/registrations/student`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const registered = response.data.data.map(reg => reg.project_id);
      setRegisteredProjects(new Set(registered));
    } catch (err) {
      console.error('Error fetching registered projects:', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to fetch registered projects.', 'error');
    }
  };

  useEffect(() => {
    if (currentUser?.role_id === 1) {
      fetchRegisteredProjects(currentUser.std_id);
    }
  }, [currentUser]);

  const handleAddProject = async (projectData) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        Swal.fire('Error', 'Access token not found. Please log in.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('project_title', projectData.project_title);
      formData.append('project_description', projectData.project_description);
      formData.append('fiscal_id', projectData.fiscal_year);
      formData.append('plan_id', projectData.plan);
      formData.append('manager_id', projectData.manager_id);
      formData.append('allocated_budget', projectData.associated_budget);
      formData.append('start_project', projectData.start_project);
      formData.append('end_project', projectData.end_project);
      formData.append('program_type', projectData.program_phase);
      formData.append('group_count', projectData.group_count);
      formData.append('about_count', projectData.expected_participant_percentage);
      formData.append('plan_quality', projectData.plan_quality);
      formData.append('program_location', projectData.program_location);
      formData.append('objectives', JSON.stringify(projectData.objectives));
      if (projectData.attached_file) {
        formData.append('project_filedetail', projectData.attached_file);
      }

      const response = await axios.post('/api/project', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        title: 'สำเร็จ',
        text: 'โครงการถูกสร้างสำเร็จ',
        icon: 'success',
        confirmButtonText: 'ตกลง' 
      });

      fetchProjects(filters, { ...pagination, currentPage: 1 }); 
    } catch (err) {
      console.error('Error creating project:', err);

      Swal.fire({
        title: 'เกิดข้อผิดพลาด', 
        text: err.response?.data?.message || 'ล้มเหลวในการสร้างโครงการ', 
        icon: 'error',
        confirmButtonText: 'ตกลง' 
      });

      throw err;
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        Swal.fire('Error', 'Access token not found. Please log in.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('project_title', projectData.project_title);
      formData.append('project_description', projectData.project_description);
      formData.append('fiscal_id', projectData.fiscal_year);
      formData.append('plan_id', projectData.plan);
      formData.append('manager_id', projectData.manager_id);
      formData.append('allocated_budget', projectData.associated_budget);
      formData.append('start_project', projectData.start_project);
      formData.append('end_project', projectData.end_project);
      formData.append('program_type', projectData.program_phase);
      formData.append('group_count', projectData.group_count);
      formData.append('about_count', projectData.expected_participant_percentage);
      formData.append('plan_quality', projectData.plan_quality);
      formData.append('program_location', projectData.program_location);
      formData.append('objectives', JSON.stringify(projectData.objectives));
      if (projectData.attached_file) {
        formData.append('project_filedetail', projectData.attached_file);
      } else if (projectData.delete_project_file) {
        formData.append('delete_project_file', 'true');
      }

      const response = await axios.put(`/api/project/${projectData.project_id}`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        title: 'สำเร็จ',
        text: 'โครงการถูกแก้ไขเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง' 
      });

      fetchProjects(filters, pagination); 
    } catch (err) {
      console.error('Error updating project:', err);

      Swal.fire({
        title: 'เกิดข้อผิดพลาด', 
        text: err.response?.data?.message || 'ล้มเหลวในการแก้ไขโครงการ', 
        icon: 'error',
        confirmButtonText: 'ตกลง' 
      });

      throw err;
    }
  };

  const handleDeleteProject = (projectId) => {
    Swal.fire({
      title: 'ยืนยันการลบข้อมูล',
      text: "คุณต้องการลบโครงการนี้ใช่หรือไม่?",
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
              text: 'ไม่พบ Access token กรุณาเข้าสู่ระบบใหม่', 
              icon: 'error',
              confirmButtonText: 'ตกลง' 
            });
            return;
          }

          await axios.delete(`/api/project/${projectId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          Swal.fire({
            title: 'ลบข้อมูลสำเร็จ', 
            text: 'โครงการถูกลบเรียบร้อยแล้ว', 
            icon: 'success',
            confirmButtonText: 'ตกลง' 
          });

          fetchProjects(filters, { ...pagination, currentPage: 1 }); 
        } catch (err) {
          console.error('Error deleting project:', err);

          Swal.fire({
            title: 'เกิดข้อผิดพลาด', 
            text: err.response?.data?.message || 'ล้มเหลวในการลบโครงการ', 
            icon: 'error',
            confirmButtonText: 'ตกลง' 
          });
        }
      }
    });
  };

  const handleToggleProjectStatus = async (projectId, currentStatus) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.put(`/api/project-status/${projectId}`, null, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      Swal.fire({
        title: 'สำเร็จ',
        text: 'สถานะโครงการถูกอัปเดตเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง' 
      });

      fetchProjects(filters, pagination); 
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด', 
        text: err.response?.data?.message || 'ล้มเหลวในการอัปเดตสถานะโครงการ', 
        icon: 'error',
        confirmButtonText: 'ตกลง' 
      });
    }
  };

  const handleToggleRegistrationStatus = async (projectId, currentStatus) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const response = await axios.put(`/api/project-registration/${projectId}`, null, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      Swal.fire({
        title: 'สำเร็จ',
        text: 'สถานะการลงทะเบียนถูกอัปเดตเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง' 
      });

      fetchProjects(filters, pagination); // Refresh projects to show updated status
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด', 
        text: err.response?.data?.message || 'ล้มเหลวในการอัปเดตสถานะการลงทะเบียน', 
        icon: 'error',
        confirmButtonText: 'ตกลง' 
      });
    }
  };

  const handleOpenRegistrationConfirmationModal = (project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRegistration = async (projectId, allergies, suggestions) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด', 
          text: 'ไม่พบ Access token กรุณาเข้าสู่ระบบใหม่', 
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        return;
      }

      const registrationData = {
        project_id: projectId,
        allergy_info: allergies,
        suggestions: suggestions,
      };

      await axios.post('/api/registrations', registrationData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      Swal.fire({
        title: 'ลงทะเบียนสำเร็จ',
        text: 'ลงทะเบียนโครงการเรียบร้อยแล้ว', 
        icon: 'success',
        confirmButtonText: 'ตกลง' 
      });

      fetchRegisteredProjects(currentUser.std_id); // Refresh registered projects
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error('Error registering for project:', err);

      Swal.fire({
        title: 'เกิดข้อผิดพลาด', 
        text: err.response?.data?.message || 'ล้มเหลวในการลงทะเบียน', 
        icon: 'error',
        confirmButtonText: 'ตกลง' 
      });
    }
  };

  const handleUnregister = async (projectId) => {
    Swal.fire({
      title: 'คุณแน่ใจไหม?',
      text: "คุณต้องการยกเลิกการลงทะเบียนในโครงการนี้ใช่หรือไม่?",
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
              text: 'ไม่พบ Access token กรุณาเข้าสู่ระบบใหม่', 
              icon: 'error',
              confirmButtonText: 'ตกลง' 
            });
            return;
          }

          await axios.delete(`/api/project/unregister/${projectId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          Swal.fire({
            title: 'ยกเลิกสำเร็จ', 
            text: 'การลงทะเบียนถูกยกเลิกเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง' 
          });

          fetchRegisteredProjects(currentUser.std_id); // Refresh registered projects
          setIsDetailsModalOpen(false);
        } catch (err) {
          console.error('Error unregistering from project:', err);

          Swal.fire({
            title: 'เกิดข้อผิดพลาด', 
            text: err.response?.data?.message || 'ล้มเหลวในการยกเลิกการลงทะเบียน', 
            icon: 'error',
            confirmButtonText: 'ตกลง' 
          });
        }
      }
    });
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleViewRegistrations = async (projectId) => {
    try {
      setIsDetailsModalOpen(false);
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('Access token not found.');
      }
      const response = await axios.get(`/api/registrations/project/${projectId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setParticipants(response.data.data);
      setIsParticipantsModalOpen(true);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch participants.', 'error');
    }
  };

  const handleOpenAddModal = () => {
    setCopiedProjectData(null);
    setIsAddModalOpen(true);
  };

  const handleCopyProject = (project) => {
    setCopiedProjectData(project);
    setIsAddModalOpen(true);
  };

  // --- Render Section ---
  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">โครงการ</h1>
          {currentUser && (currentUser.role_id === 2 || currentUser.role_id === 3) && (
            <button onClick={handleOpenAddModal} className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md">
              <FaPlus className="mr-2" />เพิ่มโครงการ
            </button>
          )}
        </header>

        {/* --- Filter Section --- */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 project-section">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className={currentUser?.role_id === 1 ? "col-span-full" : "md:col-span-2"}>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                ค้นหาโครงการ
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="ค้นหาด้วยชื่อโครงการ..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                />
                <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {currentUser?.role_id !== 1 && (
              <>
                <div>
                  <label htmlFor="fiscal_id" className="block text-sm font-medium text-gray-700 mb-1">
                    ปีงบประมาณ
                  </label>
                  <select
                    id="fiscal_id"
                    name="fiscal_id"
                    value={filters.fiscal_id}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                  >
                    <option value="">ทั้งหมด</option>
                    {fiscalYears.map((fy) => (
                      <option key={fy.fiscal_id} value={fy.fiscal_id}>
                        {fy.fiscal_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700 mb-1">
                    แผนงาน
                  </label>
                  <select
                    id="plan_id"
                    name="plan_id"
                    value={filters.plan_id}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                  >
                    <option value="">ทั้งหมด</option>
                    {plans.map((p) => (
                      <option key={p.plan_id} value={p.plan_id}>
                        {p.plan_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-slate-600 hover:text-slate-800"
                  >
                    ล้างค่าการค้นหา
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <main className="space-y-6">
          {loading ? (
            <div className="text-center p-10"><p>กำลังโหลด...</p></div>
          ) : error ? (
            <div className="text-center p-10 text-red-500"><FaTriangleExclamation className="mx-auto text-4xl mb-2" /><p>{error}</p></div>
          ) : projects.length === 0 ? (
            <div className="text-center p-10"><FaCircleInfo className="mx-auto text-4xl mb-2" /><p>ไม่พบข้อมูลโครงการ</p></div>
          ) : (
            <div className="space-y-4">
              {projects.map((item) => (
                <ProjectCard
                  key={item.project_id}
                  project={item}
                  currentUser={currentUser}
                  onEdit={(project) => {
                    setSelectedProject(project);
                    setIsEditModalOpen(true);
                  }}
                  onCopy={handleCopyProject}
                  onDelete={() => handleDeleteProject(item.project_id)}
                  onViewDetails={handleViewDetails}
                  isRegistered={registeredProjects.has(item.project_id)}
                  onToggleProjectStatus={handleToggleProjectStatus}
                  onToggleRegistrationStatus={handleToggleRegistrationStatus}
                />
              ))}
            </div>
          )}
        </main>

        {/* Pagination Controls */}
        {projects.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-8">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 mx-1 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2 mx-1 text-slate-700">
              หน้า {pagination.currentPage} จาก {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 mx-1 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
            >
              ถัดไป
            </button>
          </div>
        )}

        <AddProjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddProject}
          currentUser={currentUser}
          managers={managers}
          fiscalYears={fiscalYears}
          plans={plans}
          initialData={copiedProjectData}
        />
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditProject}
          projectItem={selectedProject}
          managers={managers}
          fiscalYears={fiscalYears}
          plans={plans}
        />
        <ProjectDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          projectItem={selectedProject}
          onViewRegistrations={handleViewRegistrations}
          onOpenRegisterForm={handleOpenRegistrationConfirmationModal}
          onUnregister={handleUnregister}
          isRegistered={selectedProject ? registeredProjects.has(selectedProject.project_id) : false}
          isStudent={currentUser?.role_id === 1}
          managers={managers}
        />
        <RegistrationConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmRegistration}
          projectItem={selectedProject}
        />
        <ViewParticipantsModal
          isOpen={isParticipantsModalOpen}
          onClose={() => setIsParticipantsModalOpen(false)}
          participants={participants}
        />
      </div>
    </div>
  );
}