'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Cell } from 'recharts';
import { FaExclamationTriangle, FaSearch, FaFileExcel, FaTimesCircle } from 'react-icons/fa';
import { Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ComposedChart, BarChart } from 'recharts';
import Cookies from 'js-cookie';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const DashboardClientPage = () => {
    const [initialLoading, setInitialLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [filters, setFilters] = useState({ search: '', fiscal_id: '', plan_id: '', program_type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 10 });
    const [fiscalYears, setFiscalYears] = useState([]);
    const [plans, setPlans] = useState([]);
    const [totalBudget, setTotalBudget] = useState(0);
    const [initialFiltersSet, setInitialFiltersSet] = useState(false);

    const API_HEADERS = useMemo(() => ({ 'Authorization': `Bearer ${Cookies.get('accessToken')}` }), []);

    const defaultFiscalId = '';
    const defaultPlanId = '';

    const fetchDashboardData = useCallback(async () => {
        if (!initialFiltersSet) return;

        setDataLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                search: filters.search,
                fiscal_id: filters.fiscal_id,
                plan_id: filters.plan_id,
                program_type: filters.program_type,
            });

            const response = await axios.get(`/api/dashboard?${params.toString()}`, { headers: API_HEADERS });

            const projectsData = response.data?.data?.projects || [];
            setProjects(projectsData);
            setPagination(prev => ({
                ...prev,
                ...response.data?.pagination,
                totalRecords: response.data?.pagination?.totalRecords || projectsData.length,
            }));

            const budgetSum = projectsData.reduce((sum, item) => sum + (item.actual_budget || 0), 0);
            setTotalBudget(budgetSum);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (err.response?.status === 401) {
                setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            } else {
                setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
            }
        } finally {
            setDataLoading(false);
        }
    }, [API_HEADERS, pagination.currentPage, pagination.limit, filters, initialFiltersSet]);

    const fetchInitialData = useCallback(async () => {
        try {
            const [fiscalRes, planRes] = await Promise.all([
                axios.get(`/api/fiscal-year`, { headers: API_HEADERS }),
                axios.get(`/api/plan`, { headers: API_HEADERS })
            ]);

            setFiscalYears(fiscalRes.data?.data || []);
            setPlans(planRes.data?.data || []);

        } catch (err) {
            console.error('Fetch initial data error:', err);
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเริ่มต้น');
        } finally {
            setInitialLoading(false);
        }
    }, [API_HEADERS]);

    const handleExport = async () => {
        setIsExporting(true);
        setError(null);

        const COMMON_FONT = { name: 'TH Sarabun New', size: 14 };

        try {
            const params = new URLSearchParams({
                search: filters.search,
                fiscal_id: filters.fiscal_id,
                plan_id: filters.plan_id,
                program_type: filters.program_type,
                limit: 99999,
            });

            const response = await axios.get(`/api/dashboard?${params.toString()}`, { headers: API_HEADERS });
            const projectsToExport = response.data?.data?.projects || [];

            if (projectsToExport.length === 0) {
                setError('ไม่พบข้อมูลที่จะส่งออก');
                return;
            }


            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('รายงานงบประมาณ');
            worksheet.columns = [
                { header: 'ชื่อโครงการ', key: 'title', width: 45 },
                { header: 'งบประมาณที่ได้รับจัดสรร', key: 'allocated', width: 20, style: { numFmt: '#,##0.00' } },
                { header: 'งบประมาณที่ใช้จริง', key: 'actual', width: 20, style: { numFmt: '#,##0.00' } },
                { header: 'แผนงาน', key: 'plan', width: 15 },
                { header: 'ภาคเรียน', key: 'program', width: 15 }
            ];
            const headerRow = worksheet.getRow(1);
            headerRow.font = { ...COMMON_FONT, bold: true };
            headerRow.eachCell({ includeEmpty: false }, (cell) => { cell.alignment = { vertical: 'middle', horizontal: 'center' }; });

            projectsToExport.forEach((item) => {
                const row = worksheet.addRow({
                    title: item.project_title,
                    allocated: item.allocated_budget || 0,
                    actual: item.actual_budget || 0,
                    plan: item.plan_name,
                    program: item.program_type
                });
                row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                    cell.font = COMMON_FONT;
                    if (colNumber === 2 || colNumber === 3) {
                        cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    } else {
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                    }
                });
            });

            const totalActual = projectsToExport.reduce((sum, item) => sum + (item.actual_budget || 0), 0);
            const summaryRow = worksheet.addRow(['รวมงบประมาณที่ใช้จริง', '', totalActual, '', '']);
            summaryRow.eachCell((cell, colNumber) => {
                cell.font = { ...COMMON_FONT, bold: true };
                if (colNumber === 3) {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });
            const lastRow = worksheet.lastRow.number;
            worksheet.mergeCells(`A${lastRow}:B${lastRow}`);
            worksheet.getCell(`A${lastRow}`).alignment = { vertical: 'middle', horizontal: 'center' };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const now = new Date();
            const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

            saveAs(blob, `รายงานงบประมาณ_${timestamp}.xlsx`);

        } catch (err) {
            console.error('Export error:', err);
            if (err.response?.status === 401) {
                setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            } else {
                setError('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
            }
        } finally {
            setIsExporting(false);
        }
    };


    useEffect(() => {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setError('ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ');
            setInitialLoading(false);
            return;
        }
        fetchInitialData();
    }, [fetchInitialData]);


    useEffect(() => {

        if (!initialLoading && !initialFiltersSet) {
            setFilters(prev => ({
                ...prev,

                fiscal_id: defaultFiscalId,
                plan_id: defaultPlanId
            }));
            setInitialFiltersSet(true);
        }
    }, [initialLoading, defaultFiscalId, defaultPlanId, setFilters, initialFiltersSet]);



    useEffect(() => {
        if (initialFiltersSet) {
            fetchDashboardData();
        }
    }, [fetchDashboardData, initialFiltersSet]);


    useEffect(() => {
        setSearchTerm(filters.search);
    }, [filters.search]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }, 500);

        return () => { clearTimeout(handler); };
    }, [searchTerm]);


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'search') {
            setSearchTerm(value);
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }
    };


    const handleClearFilters = () => {
        setFilters({
            search: '',
            fiscal_id: '',
            plan_id: '',
            program_type: ''
        });
        setSearchTerm('');
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '฿0';
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(value);
    };

const truncateLabel = (label, maxLength = 25) => {
        if (!label) return '';
        if (label.length <= maxLength) {
            return label;
        }
        return label.substring(0, maxLength) + '...';
    };

    const chartData = useMemo(() => projects.map(project => ({
        name: project.project_title,
        'งบประมาณที่ได้รับจัดสรร': project.allocated_budget || 0,
        'งบประมาณที่จ่ายจริง': project.actual_budget || 0,
        program_type: project.program_type,
    })), [projects]);

    if (initialLoading) {
        return <div className="text-center p-10"><p>กำลังโหลด...</p></div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500"><FaExclamationTriangle className="mx-auto text-4xl mb-2" /><p>{error}</p></div>;
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto">


                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
                    โครงการและงบประมาณที่ใช้
                </h1>


                <div className="bg-white rounded-lg shadow-md p-6 mb-6">


                    <div className="mb-4 md:mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">ค้นหาโครงการ</label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="พิมพ์ชื่อโครงการ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}

                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                            />

                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-150"
                                >


                                    &#x2715;
                                </button>
                            )}
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ปีงบประมาณ</label>
                            <select
                                name="fiscal_id"
                                value={filters.fiscal_id}
                                onChange={handleFilterChange}

                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm transition duration-150 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                            >
                                <option value="">ทั้งหมด</option>
                                {fiscalYears
                                    .sort((a, b) => b.fiscal_name - a.fiscal_name)
                                    .map(year => (
                                        <option key={year.fiscal_id} value={String(year.fiscal_id)}>{year.fiscal_name}</option>
                                    ))}
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">แผนงาน</label>
                            <select
                                name="plan_id"
                                value={filters.plan_id}
                                onChange={handleFilterChange}

                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm transition duration-150 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                            >
                                <option value="">ทั้งหมด</option>
                                {plans.map(plan => (
                                    <option key={plan.plan_id} value={String(plan.plan_id)}>{plan.plan_name}</option>
                                ))}
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ภาค</label>
                            <select
                                name="program_type"
                                value={filters.program_type}
                                onChange={handleFilterChange}

                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm transition duration-150 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                            >
                                <option value="">ทั้งหมด</option>
                                <option value="ปกติ">ปกติ</option>
                                <option value="พิเศษ">พิเศษ</option>
                            </select>
                        </div>
                    </div>


                    <div className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center mt-5 gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={handleClearFilters}
                            className="w-full sm:w-auto text-sm text-gray-600 hover:text-gray-800 transition-all px-4 py-2"
                        >
                            ล้างค่าการค้นหา
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-white font-medium transition-all ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
                                }`}
                        >
                            <FaFileExcel className="inline-block mr-2" />
                            {isExporting ? 'กำลังส่งออก...' : 'ส่งออก Excel'}
                        </button>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-sm font-medium text-gray-500">จำนวนโครงการทั้งหมด</p>
                        <p className="text-4xl font-bold text-gray-800 mt-2">{dataLoading ? '...' : pagination.totalRecords}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-sm font-medium text-gray-500">งบประมาณที่ใช้ (ในหน้านี้)</p>
                        <p className="text-4xl font-bold text-indigo-600 mt-2">{dataLoading ? '...' : formatCurrency(totalBudget)}</p>
                    </div>
                </div>


                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">
                        กราฟแสดงงบประมาณโครงการ (Bar Chart)
                    </h2>
                    {dataLoading ? (
                        <div className="w-full h-[400px] flex items-center justify-center text-gray-500">กำลังโหลดกราฟ...</div>
                    ) : chartData.length > 0 ? (
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 10, left: 10, bottom: 80 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
<XAxis
                                    dataKey="name"
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                    height={window.innerWidth < 640 ? 50 : 80}
                                    tick={{ fontSize: window.innerWidth < 640 ? 8 : 10, fill: '#555' }}
                                    // 🚀 เพิ่ม tickFormatter เข้ามาตรงนี้
                                    tickFormatter={(name) => truncateLabel(name, window.innerWidth < 640 ? 15 : 25)}
                                />
                                    <YAxis
                                        tickFormatter={(v) => new Intl.NumberFormat('th-TH').format(v)}
                                        tick={{ fontSize: 11 }}
                                        label={{
                                            value: 'งบประมาณ (บาท)',
                                            angle: -90,
                                            position: 'insideLeft',
                                            dx: window.innerWidth < 640 ? -10 : -35,
                                            style: { fill: '#555', fontSize: 10, textAnchor: 'middle' },
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(v, name) => [formatCurrency(v), name]}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '10px',
                                            border: '1px solid #ddd',
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="center"
                                        wrapperStyle={{ top: 0, marginBottom: 20, fontSize: 13 }}
                                        iconType="circle"
                                    />

                                    <Bar dataKey="งบประมาณที่จ่ายจริง" barSize={25} radius={[5, 5, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.program_type === 'ปกติ' ? '#6366F1' : '#EC4899'}
                                            />
                                        ))}
                                    </Bar>

                                    <Bar dataKey="งบประมาณที่ได้รับจัดสรร" barSize={25} radius={[5, 5, 0, 0]} fill="#6B7280" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
                            ไม่พบข้อมูลโครงการตามตัวกรองที่เลือก
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardClientPage;
