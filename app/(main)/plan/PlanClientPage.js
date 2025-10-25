'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaSearchengin, FaPenToSquare, FaTrash, FaChevronLeft, FaChevronRight, FaCheck, FaMagnifyingGlass, FaCircleInfo } from 'react-icons/fa6';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

export default function PlanClientPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const fetchPlans = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setError('ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ');
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const response = await axios.get(`/api/plan`, { params: { page }, ...config });
      setPlans(response.data.data || []);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err.response?.data?.message || err.message || 'ล้มเหลวในการดึงข้อมูลแผนงาน');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(currentPage);
  }, [currentPage]);

  const handleAddPlan = async (planName) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const response = await axios.post(`/api/plan/create`, { plan_name: planName }, config);

      Swal.fire({
        title: 'สำเร็จ',
        text: 'เพิ่มแผนงานสำเร็จ',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      fetchPlans();
    } catch (err) {
      console.error('Error adding plan:', err);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ล้มเหลวในการเพิ่มแผนงาน',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });

      throw err;
    }
  };

  const handleActivePlan = async (planId) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const response = await axios.put(`/api/active-plan/${planId}`, {}, config);

      Swal.fire({
        title: 'สำเร็จ',
        text: 'เปิดใช้งานแผนงานสำเร็จ',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      fetchPlans();
    } catch (err) {
      console.error('Error activating plan:', err);

      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ล้มเหลวในการเปิดใช้งานแผนงาน',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  const handleEditPlan = async (planId, newPlanName) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const response = await axios.put(`/api/plan/${planId}`, { plan_name: newPlanName }, config);

      Swal.fire({
        title: 'สำเร็จ',
        text: 'แก้ไขแผนงานสำเร็จ',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      fetchPlans();
    } catch (err) {
      console.error('Error editing plan:', err);

      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ล้มเหลวในการแก้ไขแผนงาน',
        icon: 'error',
        confirmButtonText: 'ตกลง' 
      });

      throw err;
    }
  };

  const handleDeletePlan = async (planId) => {
    Swal.fire({
      title: 'ยืนยันการลบข้อมูล',
      text: "คุณต้องการลบแผนงานนี้หรือไม่?",
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
          const config = { headers: { Authorization: `Bearer ${accessToken}` } };
          const response = await axios.delete(`/api/plan/${planId}`, config);
          Swal.fire({
            title: 'ลบข้อมูลสำเร็จ',
            text: 'แผนงานถูกปิดใช้งานแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง' 
          });

          fetchPlans();
        } catch (err) {
          console.error('Error deleting plan:', err);
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: err.response?.data?.message || 'ล้มเหลวในการลบแผนงาน',
            icon: 'error',
            confirmButtonText: 'ตกลง' 
          });
        }
      }
    });
  };

  const filteredPlans = plans.filter(plan =>
    plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AddPlanModal = ({ isOpen, onClose, onSave }) => {
    const [planName, setPlanName] = useState('');
    const [modalError, setModalError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setModalError('');
      try {
        await onSave(planName);
        setPlanName('');
        onClose();
      } catch (err) {
        setModalError(err.message || 'ล้มเหลวในการเพิ่มแผนงาน');
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] plan-section">
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <h3 className="text-xl font-semibold">เพิ่มแผนงาน</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
          </div>

          <form id="addPlanForm" onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
            <div>
              <label htmlFor="plan_name" className="block text-sm font-medium text-slate-700">ชื่อแผนงาน</label>
              <input type="text" id="plan_name" name="plan_name" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={planName} onChange={(e) => setPlanName(e.target.value)} required />
            </div>
            {modalError && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{modalError}</div>}
          </form>

          <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
            <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
            <button type="submit" form="addPlanForm" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">เพิ่มแผนงาน</button>
          </div>
        </div>
      </div>
    );
  };

  const EditPlanModal = ({ isOpen, onClose, onSave, plan }) => {
    const [planName, setPlanName] = useState(plan?.plan_name || '');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
      if (plan) {
        setPlanName(plan.plan_name);
      }
    }, [plan]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setModalError('');
      try {
        await onSave(plan.plan_id, planName);
        onClose();
      } catch (err) {
        setModalError(err.message || 'ล้มเหลวในการอัปเดตแผนงาน');
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] plan-section">
          <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
            <h3 className="text-xl font-semibold">แก้ไขแผนงาน</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">&times;</button>
          </div>

          <form id="editPlanForm" onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
            <div>
              <label htmlFor="edit_plan_name" className="block text-sm font-medium text-slate-700">ชื่อแผนงาน</label>
              <input type="text" id="edit_plan_name" name="plan_name" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2" value={planName} onChange={(e) => setPlanName(e.target.value)} required />
            </div>
            {modalError && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{modalError}</div>}
          </form>

          <div className="flex justify-end p-6 border-t mt-auto flex-shrink-0">
            <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mr-3">ยกเลิก</button>
            <button type="submit" form="editPlanForm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">บันทึก</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 px-2 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-800">แผนงาน</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 h-10 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            <span>เพิ่มแผนงาน</span>
          </button>
        </header>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-4 gap-2 w-full">
            <div className="relative flex-grow">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหา..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading && <p className="text-center p-6">กำลังโหลด...</p>}

          {error && <p className="text-center p-6 text-red-500">เกิดข้อผิดพลาด: {error}</p>}

          {!loading && !error && filteredPlans.length === 0 && (
            <div className="text-center p-10 text-gray-500">
              <FaCircleInfo className="mx-auto text-4xl mb-2" />
              <p>ไม่พบแผนงาน</p>
            </div>
          )}

          {!loading && !error && filteredPlans.length > 0 && (
            <>
              {/* Card View for Mobile */}
              <div className="space-y-4 md:hidden">
                {filteredPlans.map((item) => (
                  <div key={item.plan_id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex justify-between items-start gap-4"> {/* Changed items-center to items-start for better top alignment */}
                      <div className="flex-1 min-w-0">
                        {/* ID: Moved to the top as a distinct line */}
                        <p className="text-sm text-gray-500 mb-1">ID: {item.plan_id}</p>

                        {/* NEW STRUCTURE: Flex container for Name and Status Badge */}
                        <div className="flex items-center space-x-2">
                          {/* Plan Name */}
                          <p className="font-semibold text-gray-800 truncate">{item.plan_name}</p>

                          {/* Status Badge: Moved here, removed mt-2, use flex for proper alignment */}
                          <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${item.plan_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.plan_status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center flex-shrink-0 space-x-1">
                        <button
                          onClick={() => { setSelectedPlan(item); setIsEditModalOpen(true); }}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"
                          aria-label="แก้ไขแผนงาน"
                        >
                          <FaPenToSquare className="h-5 w-5" />
                        </button>
                        {item.plan_status === 'active' ? (
                          <button
                            onClick={() => handleDeletePlan(item.plan_id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                            aria-label="ลบแผนงาน"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivePlan(item.plan_id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                            aria-label="เปิดใช้งานแผนงาน"
                          >
                            <FaCheck className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table View for Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center space-x-1 cursor-pointer hover:text-teal-600 transition">
                          <span>รหัสแผนงาน</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center space-x-1 cursor-pointer hover:text-teal-600 transition">
                          <span>ชื่อแผนงาน</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center justify-center space-x-1 cursor-pointer hover:text-teal-600 transition">
                          <span>สถานะแผนงาน</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">เมนู</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((item, index) => (
                      <tr
                        key={item.plan_id}
                        className={`border-t border-gray-100 hover:bg-teal-50/60 transition duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }`}
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium text-center">{item.plan_id}</td>
                        <td className="px-6 py-4 text-gray-700 text-center">{item.plan_name}</td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex justify-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${item.plan_status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {item.plan_status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedPlan(item);
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-indigo-500 hover:text-indigo-700 hover:scale-110 hover:bg-indigo-50 rounded-full transition-all duration-200"
                            >
                              <FaPenToSquare className="h-4 w-4" />
                            </button>

                            {item.plan_status === "active" ? (
                              <button
                                onClick={() => handleDeletePlan(item.plan_id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:scale-110 hover:bg-red-50 rounded-full transition-all duration-200"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivePlan(item.plan_id)}
                                className="p-2 text-green-500 hover:text-green-700 hover:scale-110 hover:bg-green-50 rounded-full transition-all duration-200"
                              >
                                <FaCheck className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* START: Updated Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">หน้า {currentPage} จาก {totalPages}</span>
              <div className="inline-flex mt-2 xs:mt-0">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 h-8 text-sm text-white bg-gray-800 rounded-l hover:bg-gray-900 disabled:bg-gray-400"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 h-8 text-sm text-white bg-gray-800 rounded-r hover:bg-gray-900 disabled:bg-gray-400 ml-1"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddPlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPlan}
      />

      {selectedPlan && (
        <EditPlanModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditPlan}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}