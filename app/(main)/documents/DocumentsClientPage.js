'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaFilePdf, FaFileWord, FaFileExcel, FaMagnifyingGlass, FaTriangleExclamation, FaCircleInfo } from 'react-icons/fa6';
import { FaSave } from 'react-icons/fa';
import Cookies from 'js-cookie';

// Helper function สำหรับแปลงค่าเฉลี่ยเป็นระดับความพึงพอใจ
const getSatisfactionLevel = (score) => {
    if (score >= 4.21) return 'มากที่สุด';
    if (score >= 3.41) return 'มาก';
    if (score >= 2.61) return 'ปานกลาง';
    if (score >= 1.81) return 'น้อย';
    if (score == null || score === 0) return '-';
    return 'น้อยที่สุด';
};

const populateHtmlTemplates = (mainTemplate, summaryTemplate, apiData) => {
    const { project, assessment, derived_data } = apiData;

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('th-TH') : '-';
    const formatNumber = (num) => num != null ? num.toLocaleString() : '-';
    const checkMark = (value) => value ? '<td class="check-mark">✓</td>' : '<td></td>';

    const objectivesList = project.objectives.map(obj => `<li>${obj}</li>`).join('');

    let complacenceRows = assessment.complacence_questions.map((q, index) => `
        <tr>
            <td class="item-name">${index + 1}. ${q.question_name}</td>
            <td>${q.level_counts['5']}</td><td>${q.level_percentages['5']?.toFixed(2) || '0.00'}%</td>
            <td>${q.level_counts['4']}</td><td>${q.level_percentages['4']?.toFixed(2) || '0.00'}%</td>
            <td>${q.level_counts['3']}</td><td>${q.level_percentages['3']?.toFixed(2) || '0.00'}%</td>
            <td>${q.level_counts['2']}</td><td>${q.level_percentages['2']?.toFixed(2) || '0.00'}%</td>
            <td>${q.level_counts['1']}</td><td>${q.level_percentages['1']?.toFixed(2) || '0.00'}%</td>
            <td>${q.average_score?.toFixed(2) || '0.00'}</td><td>${q.std_dev?.toFixed(2) || '0.00'}</td>
        </tr>
    `).join('');
    complacenceRows += `<tr style="font-weight: bold;"><td colspan="11" style="text-align: center;">เฉลี่ยรวม</td><td>${assessment.overall_average_score?.toFixed(2) || '0.00'}</td><td></td></tr>`;

    const satisfactionSummaryList = (assessment.satisfaction_level_summary || []).map(line => `<li>${line}</li>`).join('');

    const suggestionsHtml = assessment.suggestion_questions.map(q =>
        `<h3>${q.question_name}</h3><div>${q.answers.map(ans => `<p class="feedback-item">- ${ans}</p>`).join('')}</div>`
    ).join('');

    const summaryRow = `
        <tr>
            <td>1</td>
            <td class="left-align">${project.project_title}</td>
            <td class="left-align">${project.manager_prefix || ''}${project.manager_fname} ${project.manager_lname}</td>
            <td>${formatDate(project.start_project)}</td>
            <td>${formatDate(project.end_project)}</td>
            <td>${derived_data.expected_people}</td>
            <td>${project.plan_quality || '-'}</td>
            <td>-</td>
            <td>${formatNumber(project.allocated_budget)}</td>
            <td>${formatDate(project.start_project)}</td>
            <td>${formatDate(project.end_project)}</td>
            <td>${project.real_people || '-'}</td>
            <td>${assessment.overall_average_score ? assessment.overall_average_score.toFixed(2) : '-'}</td>
            <td>-</td>
            <td>${formatNumber(project.actual_budget)}</td>
            <td>${derived_data.cost_per_unit ? formatNumber(parseFloat(derived_data.cost_per_unit).toFixed(2)) : '-'}</td>
            ${checkMark(project.criteria_1)}${checkMark(project.criteria_2)}${checkMark(project.criteria_3)}${checkMark(project.criteria_4)}${checkMark(project.criteria_5)}${checkMark(project.criteria_6)}${checkMark(project.criteria_7)}
            <td>${project.evidence || '-'}</td>
        </tr>`;

    const replacements = {
        project_title: project.project_title,
        fiscal_year: project.fiscal_name,
        plan_name: project.plan_name,
        allocated_budget: formatNumber(project.allocated_budget),
        actual_budget: formatNumber(project.actual_budget),
        date_operation: `${formatDate(project.start_project)} - ${formatDate(project.end_project)}`,
        group_count: project.group_count || '-',
        real_people: project.real_people || '-',
        problems: project.problems || '-',
        solutions: project.solutions || '-',
        manager_name: `${project.manager_rank_name || project.manager_prefix || ''}${project.manager_fname} ${project.manager_lname}`,
        plan_quality: project.plan_quality || '-',
        evidence: project.evidence || '-',
        start_date_short: formatDate(project.start_project),
        end_date_short: formatDate(project.end_project),
        total_respondents: assessment.total_respondents,
        overall_average_score: assessment.overall_average_score?.toFixed(2) || '0.00',
        overall_satisfaction_level: getSatisfactionLevel(assessment.overall_average_score),
        complacence_question_count: assessment.complacence_questions.length,
        expected_people: derived_data.expected_people,
        percentage_real_people: derived_data.percentage_real_people?.toFixed(2) || '0.00',
        percentage_respondents: derived_data.percentage_respondents?.toFixed(2) || '0.00',
        cost_per_unit: derived_data.cost_per_unit ? formatNumber(parseFloat(derived_data.cost_per_unit).toFixed(2)) : '-',
        check_operation_box: project.check_operation === 1 ? '☑ เป็นไปตามกำหนดเวลา&nbsp;&nbsp;&nbsp;<span class="unchecked">☐ ไม่เป็นไปตามกำหนดเวลา</span>' : '<span class="unchecked">☐ เป็นไปตามกำหนดเวลา</span>&nbsp;&nbsp;&nbsp;☑ ไม่เป็นไปตามกำหนดเวลา',
        check_real_people_box: project.check_real_people === 1 ? '☑ บรรลุเป้าหมาย&nbsp;&nbsp;&nbsp;<span class="unchecked">☐ ไม่บรรลุเป้าหมาย</span>' : '<span class="unchecked">☐ บรรลุเป้าหมาย</span>&nbsp;&nbsp;&nbsp;☑ ไม่บรรลุเป้าหมาย',
        check_satisfaction_box: project.check_satisfaction === 1 ? '☑ บรรลุเป้าหมาย&nbsp;&nbsp;&nbsp;<span class="unchecked">☐ ไม่บรรลุเป้าหมาย</span>' : '<span class="unchecked">☐ บรรลุเป้าหมาย</span>&nbsp;&nbsp;&nbsp;☑ ไม่บรรลุเป้าหมาย',
        criteria_1_check: project.criteria_1 ? '✓' : '', criteria_2_check: project.criteria_2 ? '✓' : '',
        criteria_3_check: project.criteria_3 ? '✓' : '', criteria_4_check: project.criteria_4 ? '✓' : '',
        criteria_5_check: project.criteria_5 ? '✓' : '', criteria_6_check: project.criteria_6 ? '✓' : '',
        criteria_7_check: project.criteria_7 ? '✓' : '',
        complacence_question_start_index: assessment.complacence_questions.length > 1 ? 1 : 0,
    };

    let finalMainHtml = mainTemplate;
    let finalSummaryHtml = summaryTemplate;
    for (const key in replacements) {
        const regex = new RegExp(`{&${key}}`, 'g');
        finalMainHtml = finalMainHtml.replace(regex, replacements[key]);
        finalSummaryHtml = finalSummaryHtml.replace(regex, replacements[key]);
    }

    finalMainHtml = finalMainHtml.replace(/<ol id="objectives-list">[\s\S]*?<\/ol>/, `<ol id="objectives-list">${objectivesList}</ol>`);
    finalMainHtml = finalMainHtml.replace(/<tbody id="complacence-body">[\s\S]*?<\/tbody>/, `<tbody id="complacence-body">${complacenceRows}</tbody>`);
    finalMainHtml = finalMainHtml.replace(/<ol id="satisfaction-summary-list"[\s\S]*?>[\s\S]*?<\/ol>/, `<ol id="satisfaction-summary-list" style="font-size: 12px; list-style-position: inside; padding-left: 0;">${satisfactionSummaryList}</ol>`);
    finalMainHtml = finalMainHtml.replace(/<div id="suggestions-container">[\s\S]*?<\/div>/, `<div id="suggestions-container">${suggestionsHtml}</div>`);

    finalSummaryHtml = finalSummaryHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${summaryRow}</tbody>`);

    return { finalMainHtml, finalSummaryHtml };
};

const ProjectReportDataModal = ({ isOpen, onClose, onSave, project, onGenerateAndDownloadPdf }) => {
    const [formData, setFormData] = useState({
        actual_budget: '',
        check_operation: 1,
        real_people: '',
        check_real_people: 1,
        check_satisfaction: 1,
        problems: '',
        solutions: '',
        criteria_1: 0,
        criteria_2: 0,
        criteria_3: 0,
        criteria_4: 0,
        criteria_5: 0,
        criteria_6: 0,
        criteria_7: 0,
        evidence: '',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                actual_budget: project.actual_budget || '',
                check_operation: project.check_operation ?? 1,
                real_people: project.real_people || '',
                check_real_people: project.check_real_people ?? 1,
                check_satisfaction: project.check_satisfaction ?? 1,
                problems: project.problems || '',
                solutions: project.solutions || '',
                criteria_1: project.criteria_1 ?? 0,
                criteria_2: project.criteria_2 ?? 0,
                criteria_3: project.criteria_3 ?? 0,
                criteria_4: project.criteria_4 ?? 0,
                criteria_5: project.criteria_5 ?? 0,
                criteria_6: project.criteria_6 ?? 0,
                criteria_7: project.criteria_7 ?? 0,
                evidence: project.evidence || '',
            });
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val;
        if (type === 'checkbox') {
            val = checked ? 1 : 0;
        } else if (name === 'check_operation' || name === 'check_real_people' || name === 'check_satisfaction') {
            val = parseInt(value, 10);
        } else {
            val = value;
        }
        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.actual_budget || !formData.real_people) {
            Swal.fire('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน', 'warning');
            return;
        }
        onSave(project.project_id, formData);
    };

    if (!isOpen) return null;

    const criteriaOptions = [
        { key: 'criteria_1', label: 'มีการดำเนินงานตามแผน' },
        { key: 'criteria_2', label: 'เป็นไปตามกำหนดเวลา' },
        { key: 'criteria_3', label: 'ตรงตามวัตถุประสงค์' },
        { key: 'criteria_4', label: 'บรรลุเป้าหมาย' },
        { key: 'criteria_5', label: 'มีการติดตามและประเมินผล' },
        { key: 'criteria_6', label: 'มีการปรับแผน' },
        { key: 'criteria_7', label: 'ยังไม่ดำเนินงานตามแผน' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6 documentation-section">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="text-2xl font-bold">กรอกข้อมูลสรุปโครงการ</h3>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">งบประมาณที่จ่ายจริง <span className="text-red-500">*</span></label>
                            <input type="number" name="actual_budget" value={formData.actual_budget} onChange={handleChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">จำนวนคนที่เข้าร่วมจริง <span className="text-red-500">*</span></label>
                            <input type="number" name="real_people" value={formData.real_people} onChange={handleChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm p-2" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">การดำเนินงาน</label>
                            <div className="mt-2 flex items-center space-x-6">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="check_operation"
                                        value={1}
                                        checked={formData.check_operation === 1}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <span className="ml-2">เป็นไปตามกำหนดเวลา</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="check_operation"
                                        value={0}
                                        checked={formData.check_operation === 0}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <span className="ml-2">ไม่เป็นไปตามกำหนดเวลา</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">เป้าหมายผู้เข้าร่วม</label>
                            <div className="mt-2 flex items-center space-x-6">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="check_real_people"
                                        value={1}
                                        checked={formData.check_real_people === 1}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <span className="ml-2">บรรลุเป้าหมาย</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="check_real_people"
                                        value={0}
                                        checked={formData.check_real_people === 0}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <span className="ml-2">ไม่บรรลุเป้าหมาย</span>
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">ผลการประเมินความพึงพอใจ</label>
                            <div className="mt-2 flex items-center space-x-6">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="check_satisfaction"
                                        value={1}
                                        checked={formData.check_satisfaction === 1}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <span className="ml-2">บรรลุเป้าหมาย</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="check_satisfaction"
                                        value={0}
                                        checked={formData.check_satisfaction === 0}
                                        onChange={handleChange}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <span className="ml-2">ไม่บรรลุเป้าหมาย</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">ปัญหา/อุปสรรค</label>
                        <textarea name="problems" value={formData.problems} onChange={handleChange} rows="3" className="mt-1 w-full border-slate-300 rounded-md shadow-sm p-2"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">แนวทางแก้ไขปัญหา</label>
                        <textarea name="solutions" value={formData.solutions} onChange={handleChange} rows="3" className="mt-1 w-full border-slate-300 rounded-md shadow-sm p-2"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">เกณฑ์การประเมิน</label>
                        <div className="mt-2 space-y-2">
                            {criteriaOptions.map(item => (
                                <label key={item.key} className="flex items-center">
                                    <input type="checkbox" name={item.key} checked={formData[item.key] === 1} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-600">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">เอกสารหลักฐาน</label>
                        <input
                            type="text"
                            name="evidence"
                            value={formData.evidence}
                            onChange={handleChange}
                            className="mt-1 w-full border-slate-300 rounded-md shadow-sm p-2"
                            placeholder="ระบุชื่อเอกสาร เช่น เอกสารสรุปโครงการ"
                        />
                    </div>

                    <div className="flex flex-wrap justify-end pt-5 mt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg mb-2 md:mb-0 md:mr-3 w-full md:w-auto">ยกเลิก</button>
                        <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg mb-2 md:mb-0 md:mr-3 w-full md:w-auto">
                            บันทึก
                        </button>
                        <button type="button" onClick={() => onGenerateAndDownloadPdf(project)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mb-2 md:mb-0 md:mr-3 w-full md:w-auto">
                            สร้างและดาวน์โหลด
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ComplacenceTable = ({ complacenceQuestions, overallAverageScore }) => {
    if (!complacenceQuestions || complacenceQuestions.length === 0) {
        return <p>No complacence data available.</p>;
    }

    return (
        <div className="overflow-x-auto mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ตารางความพึงพอใจ</h2>
            <table className="evaluation-table min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th rowSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายการประเมิน</th>
                        <th colSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">มากที่สุด</th>
                        <th colSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">มาก</th>
                        <th colSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ปานกลาง</th>
                        <th colSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">น้อย</th>
                        <th colSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">น้อยที่สุด</th>
                        <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">x̄</th>
                        <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">S.D.</th>
                    </tr>
                    <tr>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> %
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> %
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> %
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> %
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> %
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {complacenceQuestions.map((q, index) => (
                        <tr key={q.question_id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 item-name">${index + 1}. ${q.question_name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_counts['5']}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_percentages['5']?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_counts['4']}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_percentages['4']?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_counts['3']}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_percentages['3']?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_counts['2']}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_percentages['2']?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_counts['1']}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.level_percentages['1']?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.average_score?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">${q.std_dev?.toFixed(2) || '0.00'}</td>
                        </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold' }}>
                        <td colSpan="11" className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">เฉลี่ยรวม</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">${overallAverageScore?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const ProjectDocumentCard = ({ project, onGenerateReport }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4 mt-4">
            <h3 className="text-lg font-bold text-gray-800 truncate">{project.project_title}</h3>
            <div className="mt-2 text-sm text-gray-500 space-y-1">
                <p><span className="font-semibold">ปีงบประมาณ:</span> {project.fiscal_year}</p>
                <p><span className="font-semibold">แผนงาน:</span> {project.plan}</p>
                <p><span className="font-semibold">ภาค:</span> {project.program_type}</p>
                <p><span className="font-semibold">ผู้สร้าง:</span> {project.firstname} {project.lastname}</p>
            </div>
            <div className="mt-4 text-right">
                <button
                    onClick={() => onGenerateReport(project)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    สร้างรายงาน
                </button>
            </div>
        </div>
    );
};

const DocumentsClientPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ search: '', fiscal_id: '', plan_id: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 10 });
    const [fiscalYears, setFiscalYears] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedProjectForReport, setSelectedProjectForReport] = useState(null);

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

            const response = await axios.get(`/api/project-report?${params.toString()}`, { headers: API_HEADERS });

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
            const [fiscalRes, planRes] = await Promise.all([
                axios.get('/api/fiscal-year', { headers: API_HEADERS }),
                axios.get('/api/plan', { headers: API_HEADERS })
            ]);
            setFiscalYears(fiscalRes.data?.data || []);
            setPlans(planRes.data?.data || []);
        } catch (err) {
            console.error('Fetch initial data error:', err);
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลเริ่มต้น');
        }
    }, [API_HEADERS]);

    useEffect(() => {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            setError('ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ');
            setLoading(false);
            return;
        }
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

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

    const handleSaveReportData = async (projectId, reportData) => {
        try {
            await axios.put(`/api/project-summary/${projectId}`, reportData, {
                headers: {
                    ...API_HEADERS,
                    'Content-Type': 'application/json',
                },
            });

            Swal.fire({
                title: 'สำเร็จ',
                text: 'เอกสารโครงการถูกบันทึกแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง', 
            });

            setIsReportModalOpen(false);
            fetchProjects();
        } catch (err) {
            console.error('Error saving report data:', err);
            Swal.fire({
                title: 'ผิดพลาด',
                text: err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้',
                icon: 'error',
                confirmButtonText: 'ตกลง', 
            });
        }
    };


    const generateAndDownloadPdf = async (projectToGenerate) => {
        try {
            Swal.fire({
                title: 'กำลังสร้างไฟล์ PDF',
                text: 'กรุณารอสักครู่...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const [mainTplRes, summaryTplRes, detailsRes] = await Promise.all([
                fetch('/main.html'),
                fetch('/summary-table.html'),
                axios.get(`/api/project-report-details/${projectToGenerate.project_id}`, { headers: API_HEADERS })
            ]);

            if (!mainTplRes.ok || !summaryTplRes.ok) {
                throw new Error('Failed to load PDF templates.');
            }

            const mainTpl = await mainTplRes.text();
            const summaryTpl = await summaryTplRes.text();
            const apiData = detailsRes.data.data;

            const { finalMainHtml, finalSummaryHtml } = populateHtmlTemplates(mainTpl, summaryTpl, apiData);


            const { PDFDocument } = await import('pdf-lib');
            const html2pdf = (await import('html2pdf.js')).default;

            const mainElement = document.createElement('div');
            mainElement.innerHTML = finalMainHtml;
            const mainOpt = {
                margin: 10,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            const mainPdfAsArrayBuffer = await html2pdf().from(mainElement).set(mainOpt).output('arraybuffer');

            const summaryElement = document.createElement('div');
            summaryElement.innerHTML = finalSummaryHtml;
            const summaryOpt = {
                margin: 5,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };
            const summaryPdfAsArrayBuffer = await html2pdf().from(summaryElement).set(summaryOpt).output('arraybuffer');

            const mergedPdf = await PDFDocument.create();

            const mainPdfDoc = await PDFDocument.load(mainPdfAsArrayBuffer);
            const summaryPdfDoc = await PDFDocument.load(summaryPdfAsArrayBuffer);

            const mainPages = await mergedPdf.copyPages(mainPdfDoc, mainPdfDoc.getPageIndices());
            mainPages.forEach(page => mergedPdf.addPage(page));

            const summaryPages = await mergedPdf.copyPages(summaryPdfDoc, summaryPdfDoc.getPageIndices());
            summaryPages.forEach(page => mergedPdf.addPage(page));

            const mergedPdfBytes = await mergedPdf.save();

            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `สรุปผลการดำเนินงานโครงการ_${projectToGenerate.project_title.replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.close();
        } catch (err) {
            console.error('Error generating PDF:', err);
            Swal.fire('ผิดพลาด', err.response?.data?.message || 'ไม่สามารถสร้างรายงาน PDF ได้', 'error');
        }
    };

    const handleGenerateReport = async (project) => {
        setSelectedProjectForReport(project);
        setIsReportModalOpen(true);
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto documentation-section">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">เอกสารโครงการ</h1>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-400"
                                />
                                <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

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
                    </div>
                </div>


                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    {loading ? (
                        <div className="text-center p-10"><p>กำลังโหลด...</p></div>
                    ) : error ? (
                        <div className="text-center p-10 text-red-500"><FaTriangleExclamation className="mx-auto text-4xl mb-2" /><p>{error}</p></div>
                    ) : projects.length === 0 ? (
                        <div className="text-center p-10"><FaCircleInfo className="mx-auto text-4xl mb-2" /><p>ไม่พบข้อมูลโครงการ</p></div>
                    ) : (
                        <div>
                            {/* Table for Desktop */}
                            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อโครงการ</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ปีงบประมาณ</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แผนงาน</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ภาค</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้สร้าง</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ดำเนินการ</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {projects.map((project) => (
                                        <tr key={project.project_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{project.project_title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{project.fiscal_year}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{project.plan}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{project.program_type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{project.firstname} {project.lastname}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    onClick={() => handleGenerateReport(project)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    สร้างรายงาน
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Cards for Mobile */}
                            <div className="md:hidden p-4">
                                <div className="flex flex-col space-y-4"> {/* ใช้ flex-col และ space-y-4 แทนการใช้ block */}
                                    {projects.map((project) => (
                                        <ProjectDocumentCard
                                            key={project.project_id}
                                            project={project}
                                            onGenerateReport={handleGenerateReport}
                                            className="border border-gray-300 rounded-lg shadow-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

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

                <ProjectReportDataModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onSave={handleSaveReportData}
                    project={selectedProjectForReport}
                    onGenerateAndDownloadPdf={generateAndDownloadPdf}
                />
            </div>
        </div>
    );
};

export default DocumentsClientPage;

