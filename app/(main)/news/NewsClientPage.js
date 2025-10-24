'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPlus, FaUserTie, FaCalendarDays, FaFileArrowDown, FaThumbtack, FaFilePdf, FaTriangleExclamation, FaCircleInfo, FaFolderOpen, FaCloudArrowUp, FaFloppyDisk, FaPenToSquare, FaTrash, FaXmark } from 'react-icons/fa6';
import Cookies from 'js-cookie';

// News Card Component
const NewsCard = ({ news, currentUser, onEdit, onDelete }) => {
  const isPinned = news.news_pin === 'pin';
  const creatorName = (news.firstname && news.lastname) ? `${news.firstname} ${news.lastname}` : news.create_by;
  const formattedDate = new Date(news.create_at).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fileUrl = news.news_file ? `${process.env.NEXT_PUBLIC_API_URL}/api/news-files/${news.news_file}` : null;

  // แก้ไขเงื่อนไขการแสดงปุ่ม: อนุญาตให้ role_id 2 และ 3 แก้ไขได้ทุกคน
  const canModify = currentUser && (currentUser.role_id === 3 || currentUser.role_id === 2);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 relative">
      <div className="p-6">
        {/* บรรทัดชื่อข่าว + ปุ่มต่าง ๆ */}
        <div className="flex justify-between items-start mb-3">
<h3 className="text-2xl font-bold text-slate-800 flex-grow min-w-0 mr-4">
    {/* ใช้ truncate และ overflow-hidden เพื่อให้ชื่อยาวๆ ถูกตัดและตามด้วย ... ถ้าจำเป็น */}
    <span className="truncate block">{news.news_title}</span>
  </h3>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isPinned && (
              <div className="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                <FaThumbtack className="w-3 h-3" /><span>ปักหมุด</span>
              </div>
            )}
            {canModify && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(news)}
                  className="edit-btn text-slate-500 hover:text-sky-600 p-2 rounded-md"
                  title="Edit"
                >
                  <FaPenToSquare />
                </button>
                <button
                  onClick={() => onDelete(news.news_id)}
                  className="delete-btn text-slate-500 hover:text-red-600 p-2 rounded-md"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* รายละเอียดข่าว */}
        <div className="flex items-center space-x-3 text-sm text-slate-500 mb-4 border-b border-slate-200 pb-4">
          <FaUserTie className="h-4 w-4 mr-1.5" /><span>โดย: {creatorName}</span>
          <FaCalendarDays className="h-4 w-4 mr-1.5" /><span>{formattedDate}</span>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed">{news.news_detail}</p>

        {news.news_file && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-semibold py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <FaFileArrowDown className="h-5 w-5 mr-2" /><span>Download Attachment</span>
          </a>
        )}
      </div>
    </div>
  );
};

// Add News Modal Component - UPDATED
const AddNewsModal = ({ isOpen, onClose, onSave }) => {
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDetail, setNewsDetail] = useState('');
  const [newsFile, setNewsFile] = useState(null);
  const [newsPin, setNewsPin] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = React.useRef(null);

  const resetForm = () => {
    setNewsTitle('');
    setNewsDetail('');
    setNewsFile(null);
    setNewsPin(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    setNewsFile(e.target.files[0]);
  };

  const handleClearFile = () => {
    setNewsFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('news_title', newsTitle);
    formData.append('news_detail', newsDetail);
    formData.append('news_pin', newsPin ? 'pin' : 'unpin');
    if (newsFile) {
      formData.append('news_file', newsFile);
    }

    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add news.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal flex items-center justify-center p-4 fixed inset-0 z-50 bg-gradient-to-br from-white/60 to-gray-200/50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center border-b pb-3]">
          <h3 className="text-xl font-semibold">เพิ่มข่าวใหม่</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div><label className="block text-sm font-medium text-slate-700">หัวข้อข่าว</label><input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required /></div>
          <div><label className="block text-sm font-medium text-slate-700">รายละเอียด</label><textarea rows="4" value={newsDetail} onChange={(e) => setNewsDetail(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required></textarea></div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">เพิ่มไฟล์แนบ</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">

              {/* 1. input type="file" ถูกซ่อนไว้ */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="new-file-upload-modern"
              />

              {/* 2. ปุ่ม/ป้ายกำกับแบบกำหนดเอง - สไตล์ปุ่มหลัก */}
              <label
                htmlFor="new-file-upload-modern"
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out cursor-pointer flex-shrink-0 w-full sm:w-auto"
              >
                <FaCloudArrowUp className="h-5 w-5" /> {/* สมมติว่ามีการ import FaCloudArrowUp แล้ว */}
                เลือกไฟล์
              </label>

              {/* 3. แสดงสถานะ/ชื่อไฟล์ และปุ่มล้างไฟล์ */}
              <div className="flex items-center space-x-3 w-full">
                <span className={`text-sm ${newsFile ? 'text-gray-600 font-medium' : 'text-slate-500 italic'}`}>
                  {newsFile ? `ไฟล์ที่เลือก: ${newsFile.name}` : 'ยังไม่ได้เลือกไฟล์ / คลิกเพื่ออัพโหลด'}
                </span>

                {newsFile && (
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 flex-shrink-0"
                    title="ล้างไฟล์ที่เลือกใหม่"
                  >
                    <FaXmark className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center"><input type="checkbox" checked={newsPin} onChange={(e) => setNewsPin(e.target.checked)} className="h-4 w-4" /><label className="ml-2">ปักหมุด</label></div>
          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
          <div className="flex justify-end pt-5 mt-4 border-t">
            <button type="button" onClick={handleClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
            <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">เพิ่มข่าว</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit News Modal Component
const EditNewsModal = ({ isOpen, onClose, onSave, newsItem }) => {
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDetail, setNewsDetail] = useState('');
  const [newsFile, setNewsFile] = useState(null);
  const [newsPin, setNewsPin] = useState(false);
  const [error, setError] = useState('');
  const [currentFileName, setCurrentFileName] = useState(null);

  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (newsItem) {
      setNewsTitle(newsItem.news_title || '');
      setNewsDetail(newsItem.news_detail || '');
      setNewsPin(newsItem.news_pin === 'pin');
      setCurrentFileName(newsItem.news_file);
      setNewsFile(null); // Clear any previously selected new file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [newsItem]);

  const handleFileChange = (e) => {
    setNewsFile(e.target.files[0]);
    // If a new file is selected, let's also clear the current one to avoid confusion.
    setCurrentFileName(null);
  };

  const handleClearCurrentFile = () => {
    setCurrentFileName(null);
  };

  const handleClearNewFile = () => {
    setNewsFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('news_title', newsTitle);
    formData.append('news_detail', newsDetail);
    formData.append('news_pin', newsPin ? 'pin' : 'unpin');

    // Logic to handle file changes
    if (newsFile) {
      // If a new file is selected, append it.
      formData.append('news_file', newsFile);
    } else if (newsItem.news_file && !currentFileName) {
      // If the user cleared the old file but didn't upload a new one,
      // we add a flag to tell the backend to delete the file.
      // NOTE: You must implement backend logic to handle this 'delete_file' flag.
      formData.append('delete_file', 'true');
    }

    try {
      await onSave(newsItem.news_id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update news.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-semibold">แก้ไขข่าว</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div><label className="block text-sm font-medium text-slate-700">หัวข้อข่าว</label><input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required /></div>
          <div><label className="block text-sm font-medium text-slate-700">รายละเอียด</label><textarea rows="4" value={newsDetail} onChange={(e) => setNewsDetail(e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" required></textarea></div>

          {/* ส่วนสำหรับจัดการไฟล์แนบปัจจุบัน - UI ทันสมัย */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ไฟล์แนบปัจจุบัน</label>
            <div className="mt-1 flex items-center p-3 border border-slate-300 rounded-lg bg-slate-50 justify-between transition duration-200">
              {currentFileName ? (
                <div className="flex items-center space-x-3 w-full">
                  {/* ไอคอนไฟล์ */}
                  <FaFilePdf className="h-6 w-6 text-red-500 flex-shrink-0" /> {/* สมมติว่ามีการ import FaFilePdf แล้ว */}

                  {/* ชื่อไฟล์ */}
                  <span className="text-sm font-medium text-slate-700 truncate">{currentFileName}</span>

                  {/* ปุ่มลบ */}
                  <button
                    type="button"
                    onClick={handleClearCurrentFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 ml-auto flex-shrink-0"
                    title="ลบไฟล์ปัจจุบัน"
                  >
                    <FaXmark className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span className="text-sm text-slate-500 flex items-center space-x-2">
                  <FaFolderOpen className="h-5 w-5 text-slate-400" /> {/* สมมติว่ามีการ import FaFolderOpen แล้ว */}
                  <span>ไม่มีไฟล์แนบ</span>
                </span>
              )}
            </div>
          </div>

          <hr className="my-6 border-slate-200" />

          {/* ส่วนสำหรับอัพโหลดไฟล์ใหม่ - UI ทันสมัย */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">เปลี่ยนไฟล์แนบ</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">

              {/* 1. input type="file" ถูกซ่อนไว้ */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="new-file-upload-modern"
              />

              {/* 2. ปุ่ม/ป้ายกำกับแบบกำหนดเอง - สไตล์ปุ่มหลัก */}
              <label
                htmlFor="new-file-upload-modern"
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out cursor-pointer flex-shrink-0 w-full sm:w-auto"
              >
                <FaCloudArrowUp className="h-5 w-5" /> {/* สมมติว่ามีการ import FaCloudArrowUp แล้ว */}
                เลือกไฟล์
              </label>

              {/* 3. แสดงสถานะ/ชื่อไฟล์ และปุ่มล้างไฟล์ */}
              <div className="flex items-center space-x-3 w-full">
                <span className={`text-sm ${newsFile ? 'text-gray-600 font-medium' : 'text-slate-500 italic'}`}>
                  {newsFile ? `ไฟล์ที่เลือก: ${newsFile.name}` : 'ยังไม่ได้เลือกไฟล์ / คลิกเพื่ออัพโหลด'}
                </span>

                {newsFile && (
                  <button
                    type="button"
                    onClick={handleClearNewFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150 flex-shrink-0"
                    title="ล้างไฟล์ที่เลือกใหม่"
                  >
                    <FaXmark className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center"><input type="checkbox" checked={newsPin} onChange={(e) => setNewsPin(e.target.checked)} className="h-4 w-4" /><label className="ml-2">ปักหมุด</label></div>
          {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
          <div className="flex justify-end pt-5 mt-4 border-t">
            <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
            <button type="submit" className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function NewsClientPage({ disableCrud = false }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('Access token not found. Please log in.');
        setLoading(false);
        return;
      }

      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setNews(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleAddNews = async (formData) => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        Swal.fire('Error', 'Access token not found. Please log in.', 'error');
        return;
      }
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/create-news`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      Swal.fire('สำเร็จ', 'เพิ่มข่าวใหม่สำเร็จ', 'success');
      fetchNews();
      setIsAddModalOpen(false);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to create news.', 'error');
      throw err;
    }
  };

const handleEditNews = async (newsId, formData) => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'Access token not found. Please log in.',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${newsId}`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    Swal.fire({
      title: 'บันทึกการแก้ไข',
      text: 'แก้ไขข่าวสำเร็จ',
      icon: 'success',
      confirmButtonText: 'ตกลง',
    }).then(() => {
      fetchNews();
      setIsEditModalOpen(false);
    });
    
  } catch (err) {
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: err.response?.data?.message || 'Failed to update news.',
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
    throw err;
  }
};


const handleDeleteNews = (newsId) => {
  Swal.fire({
    title: 'ยืนยันการลบข้อมูล',
    text: "คุณต้องการลบข่าวนี้หรือไม่?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ตกลง',
    cancelButtonText: 'ยกเลิก',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'Access token not found. Please log in.',
            icon: 'error',
            confirmButtonText: 'ตกลง',
          });
          return;
        }

        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${newsId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ข่าวนี้ถูกลบเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          fetchNews();
        });

      } catch (err) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || 'Failed to delete news.',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
    }
  });
};


  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ประกาศข่าวสาร</h1>
          {!disableCrud && currentUser && (currentUser.role_id === 2 || currentUser.role_id === 3) && (
            <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md">
              <FaPlus className="mr-2" />
              เพิ่มข่าวใหม่
            </button>
          )}
        </header>

        <main className="space-y-6">
          {loading ? (
            <div className="text-center p-10"><p>กำลังโหลด...</p></div>
          ) : error ? (
            <div className="text-center p-10 text-red-500"><FaTriangleExclamation className="mx-auto text-4xl mb-2" /><p>{error}</p></div>
          ) : news.length === 0 ? (
            <div className="text-center p-10"><FaCircleInfo className="mx-auto text-4xl mb-2" /><p>ไม่พบข้อมูลข่าวสาร</p></div>
          ) : (
            news.map((item) => (
              <NewsCard
                key={item.news_id}
                news={item}
                currentUser={currentUser}
                onEdit={!disableCrud ? () => { setSelectedNews(item); setIsEditModalOpen(true); } : undefined}
                onDelete={!disableCrud ? () => handleDeleteNews(item.news_id) : undefined}
              />
            ))
          )}
        </main>

        {!disableCrud && <AddNewsModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddNews} />}
        {!disableCrud && selectedNews && <EditNewsModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleEditNews} newsItem={selectedNews} />}
      </div>
    </div>
  );
}
