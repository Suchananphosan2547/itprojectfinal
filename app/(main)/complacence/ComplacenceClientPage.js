'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPlus, FaPenSquare, FaTrash, FaCheckCircle, FaXmark, FaCheck, FaExclamationCircle, FaFileAlt, FaEdit, FaSearch } from 'react-icons/fa';
import { FaPenToSquare } from 'react-icons/fa6';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';

const StudentSurveyForm = ({ survey, onBack, onSubmit }) => {
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        if (survey) {
            const initialAnswers = {};
            survey.questions.forEach(q => {
                initialAnswers[q.questions_id] = '';
            });
            setAnswers(initialAnswers);
        }
    }, [survey]);

    const handleChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(survey.assessment_id, answers);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to submit survey.', 'error');
        }
    };

    if (!survey) return <div className="p-8 text-center text-slate-500">ไม่พบแบบประเมิน</div>;

    const ratingOptions = [
        { value: '5', label: 'มากที่สุด' },
        { value: '4', label: 'มาก' },
        { value: '3', label: 'ปานกลาง' },
        { value: '2', label: 'น้อย' },
        { value: '1', label: 'น้อยที่สุด' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{`แบบประเมินโครงการ ${survey.project_title}`}</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {survey.questions.map((q, index) => (
                        <div key={q.questions_id} className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
                            <h4 className="text-lg md:text-xl font-semibold text-slate-700 mb-4">
                                {`${index + 1}. ${q.questions_name}`}
                            </h4>
                            {q.question_type === 'complacence' ? (
                                <div className="space-y-2">
                                    {ratingOptions.map(option => (
                                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-100">
                                            <input
                                                type="radio"
                                                name={`question-${q.questions_id}`}
                                                value={option.value}
                                                checked={answers[q.questions_id] === option.value}
                                                onChange={() => handleChange(q.questions_id, option.value)}
                                                className="form-radio h-5 w-5 text-blue-600"
                                                required
                                            />
                                            <span className="text-slate-600">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    rows="4"
                                    value={answers[q.questions_id] || ''}
                                    onChange={(e) => handleChange(q.questions_id, e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="คำตอบของคุณ"
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-end pt-8 mt-4 border-t space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                    >
                        ย้อนกลับ
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                    >
                        ส่ง
                    </button>
                </div>
            </form>
        </div>
    );
};

const AddSurveyModal = ({ isOpen, onClose, onSave, projects }) => {
    const [selectedProject, setSelectedProject] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedProject('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedProject) {
            onSave(selectedProject);
            onClose();
        } else {
            Swal.fire('Warning', 'Please select a project.', 'warning');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-semibold mb-4">สร้างแบบประเมินใหม่</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">กรุณาเลือกโครงการ</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value=""> เลือกโครงการ </option>
                            {projects.map(p => (
                                <option key={p.project_id} value={p.project_id}>
                                    {p.project_title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end pt-4 border-t gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                        >
                            สร้างแบบประเมิน
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const QuestionModal = ({ isOpen, onClose, onSave, question, assessmentId }) => {
    const [questionName, setQuestionName] = useState('');
    const [questionType, setQuestionType] = useState('complacence');

    useEffect(() => {
        if (question) {
            setQuestionName(question.questions_name);
            setQuestionType(question.question_type);
        } else {
            setQuestionName('');
            setQuestionType('complacence');
        }
    }, [isOpen, question]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            questions_id: question?.questions_id,
            questions_name: questionName,
            question_type: questionType,
            assessment_id: assessmentId,
            isPersisted: question?.isPersisted
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{question ? 'แก้ไขหัวข้อประเมิน' : 'เพิ่มหัวข้อประเมิน'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">หัวข้อการประเมิน</label>
                        <input
                            type="text"
                            value={questionName}
                            onChange={(e) => setQuestionName(e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">ประเภทคำถาม</label>
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="complacence"
                                    checked={questionType === 'complacence'}
                                    onChange={() => setQuestionType('complacence')}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">ประเมินความพึงพอใจ (คะแนน)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="suggestions"
                                    checked={questionType === 'suggestions'}
                                    onChange={() => setQuestionType('suggestions')}
                                    className="form-radio h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2">ข้อความ</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end pt-4 border-t gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                        >
                            {question ? 'บันทึก' : 'เพิ่ม'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminManageSurvey = ({ assessment, onBack, onQuestionSaved }) => {
    const [questions, setQuestions] = useState([]);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const fetchQuestions = async () => {
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                Swal.fire({
                    title: 'Error',
                    text: 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                });
                return;
            }

            const response = await axios.get(`/api/question-complacence/${assessment.assessment_id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.status === 200 && response.data && response.data.data) {
                const fetchedQuestions = response.data.data.map(q => ({
                    ...q,
                    questions_id: q.questions_id || null,
                    isPersisted: true
                }));
                setQuestions(fetchedQuestions);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.data.message || 'Failed to fetch questions.',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                });
                setQuestions([]);
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to fetch questions.',
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
            setQuestions([]);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [assessment]);

    const handleSaveQuestion = async (data) => {
        if (data.isPersisted) {
            try {
                const accessToken = Cookies.get('accessToken');
                if (!accessToken) {
                    Swal.fire({
                        title: 'Error',
                        text: 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    });
                    return;
                }

                if (!data.questions_id) {
                    Swal.fire({
                        title: 'Error',
                        text: 'ไม่สามารถแก้ไขคำถามที่ไม่มี ID ได้',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    });
                    return;
                }

                const response = await axios.put(`/api/question-complacence/edit-question/${data.questions_id}`, {
                    questions_name: data.questions_name,
                    question_type: data.question_type
                }, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (response.status === 200) {
                    const updatedQuestions = questions.map(q =>
                        q.questions_id === data.questions_id ? { ...q, questions_name: data.questions_name, question_type: data.question_type } : q
                    );
                    setQuestions(updatedQuestions);
                    Swal.fire({
                        title: 'สำเร็จ',
                        text: 'แก้ไขหัวข้อประเมินสำเร็จ',
                        icon: 'success',
                        confirmButtonText: 'ตกลง'
                    });
                    setIsQuestionModalOpen(false);
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.data.message || 'Failed to update question.',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    });
                }
            } catch (error) {
                console.error("Error updating question:", error);
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to update question.',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                });
            }
        } else {
            try {
                const accessToken = Cookies.get('accessToken');
                if (!accessToken) {
                    Swal.fire({
                        title: 'Error',
                        text: 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    });
                    return;
                }

                const payload = {
                    assessment_id: data.assessment_id,
                    questions: [{
                        questions_name: data.questions_name,
                        question_type: data.question_type
                    }]
                };

                const response = await axios.post('/api/question-complacence', payload, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (response.status === 200 && response.data) {
                    Swal.fire({
                        title: 'สำเร็จ',
                        text: 'เพิ่มหัวข้อประเมินสำเร็จ',
                        icon: 'success',
                        confirmButtonText: 'ตกลง'
                    });
                    setIsQuestionModalOpen(false);
                    fetchQuestions();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.data.message || 'Failed to create question.',
                        icon: 'error',
                        confirmButtonText: 'ตกลง'
                    });
                }
            } catch (error) {
                console.error("Error creating question:", error);
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to create question.',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                });
            }
        }
    };

    const handleDeleteQuestion = (questionId) => {
        // 💡 ข้อควรระวัง: ตรวจสอบว่า questionId ไม่เป็นค่าว่างก่อนเริ่มกระบวนการลบ
        if (!questionId) {
            Swal.fire('Error', 'Question ID is missing (Frontend Error)', 'error');
            return;
        }

        Swal.fire({
            title: 'ยืนยันการลบข้อมูล',
            text: 'คุณต้องการลบหัวข้อประเมินนี้ใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const accessToken = Cookies.get('accessToken');
                    if (!accessToken) {
                        Swal.fire('Error', 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ', 'error');
                        return;
                    }

                    // การเรียก API ที่ใช้ questionId ที่ได้รับมา
                    const response = await axios.delete(`/api/question-complacence/delete-question/${questionId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });

                    if (response.status === 200) {
                        const updatedQuestions = questions.filter(q => q.questions_id !== questionId);
                        setQuestions(updatedQuestions);
                        Swal.fire('สำเร็จ', 'ลบหัวข้อประเมินสำเร็จ', 'success');
                    } else {
                        Swal.fire('Error', response.data.message || 'Failed to delete question.', 'error');
                    }
                } catch (error) {
                    console.error("Error deleting question:", error);
                    Swal.fire('Error', error.response?.data?.message || 'Failed to delete question.', 'error');
                }
            }
        });
    };

    const openEditModal = (question) => {
        setSelectedQuestion(question);
        setIsQuestionModalOpen(true);
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {`แบบประเมินโครงการ ${assessment.project_title}`}
                </h2>
                <button
                    onClick={() => { setSelectedQuestion(null); setIsQuestionModalOpen(true); }}
                    className="inline-flex items-center justify-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg w-full md:w-auto text-sm"
                >
                    <FaPlus className="mr-2" />เพิ่มหัวข้อ
                </button>
            </div>
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <div key={q.questions_id} className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-4 relative">
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <button
                                onClick={() => openEditModal(q)}
                                className="text-slate-500 hover:text-sky-600 p-2 rounded-md"
                                title="แก้ไข"
                            >
                                <FaPenToSquare />
                            </button>
                            <button
                                onClick={() => handleDeleteQuestion(q.questions_id)}
                                className="text-slate-500 hover:text-red-600 p-2 rounded-md"
                                title="ลบ"
                            >
                                <FaTrash />
                            </button>
                        </div>
                        <h4 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">
                            {`${index + 1}. ${q.questions_name}`}
                        </h4>
                        <p className="text-sm text-slate-500 mb-4">
                            ประเภท: {q.question_type === 'complacence' ? 'ประเมินความพึงพอใจ (คะแนน)' : 'ข้อเสนอแนะ (ข้อความ)'}
                        </p>

                        <div className="space-y-2">
                            {q.question_type === 'complacence' ? (
                                <div className="flex flex-wrap gap-4 items-center text-slate-600">
                                    <label className="flex items-center space-x-2 cursor-not-allowed">
                                        <input type="radio" name={`preview-${q.questions_id}`} disabled className="form-radio h-5 w-5 text-slate-400" />
                                        <span>มากที่สุด</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-not-allowed">
                                        <input type="radio" name={`preview-${q.questions_id}`} disabled className="form-radio h-5 w-5 text-slate-400" />
                                        <span>มาก</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-not-allowed">
                                        <input type="radio" name={`preview-${q.questions_id}`} disabled className="form-radio h-5 w-5 text-slate-400" />
                                        <span>ปานกลาง</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-not-allowed">
                                        <input type="radio" name={`preview-${q.questions_id}`} disabled className="form-radio h-5 w-5 text-slate-400" />
                                        <span>น้อย</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-not-allowed">
                                        <input type="radio" name={`preview-${q.questions_id}`} disabled className="form-radio h-5 w-5 text-slate-400" />
                                        <span>น้อยที่สุด</span>
                                    </label>
                                </div>
                            ) : (
                                <textarea
                                    rows="3"
                                    className="w-full p-3 border border-slate-300 rounded-md bg-slate-50 cursor-not-allowed"
                                    placeholder="คำตอบของคุณ"
                                    disabled
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-end pt-8 mt-4 border-t space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                    onClick={onBack}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                >
                    ย้อนกลับ
                </button>
            </div>
            <QuestionModal
                isOpen={isQuestionModalOpen}
                onClose={() => setIsQuestionModalOpen(false)}
                onSave={handleSaveQuestion}
                question={selectedQuestion}
                assessmentId={assessment.assessment_id}
            />
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
                ก่อนหน้า
            </button>
            <span className="text-sm text-gray-700">
                หน้า {currentPage} จาก {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
                ถัดไป
            </button>
        </div>
    );
};

const AdminSurveyList = ({ assessments, onManage, onToggleStatus, onAdd, onViewData, searchTerm, onSearchChange, pagination, onPageChange }) => {
    return (
        <div className="space-y-6 complacence-section">
            <div className="space-y-4">
                {assessments.length === 0 ? (
                    <div className="text-center p-10">
                        <FaCircleInfo className="mx-auto text-4xl mb-2" />
                        <p>ไม่พบข้อมูลแบบประเมิน</p>
                    </div>
                ) : (
                    assessments.map(a => (
                        <div
                            key={a.assessment_id}
                            className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-4 flex flex-col lg:flex-row justify-between gap-4 border border-gray-100"
                        >
                            <div className="flex-grow self-center">
                                <h4 className="text-lg font-semibold text-slate-700">
                                    {`แบบประเมินโครงการ ${a.project_title}`}
                                </h4>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 w-full lg:w-auto">
                                    <span className="text-sm text-slate-500 mr-4 whitespace-nowrap">
                                        สถานะ: {a.evaluation_status === 'active' ? 'เปิด' : 'ปิด'}
                                    </span>
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={a.evaluation_status === 'active'}
                                                onChange={() => onToggleStatus(a.assessment_id, a.evaluation_status)}
                                            />
                                            <div
                                                className={`block bg-gray-200 w-14 h-8 rounded-full transition-all duration-300 ${a.evaluation_status === 'active' ? 'bg-green-500' : ''
                                                    }`}
                                            ></div>
                                            <div
                                                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all duration-300 ${a.evaluation_status === 'active' ? 'translate-x-full' : ''
                                                    }`}
                                            ></div>
                                        </div>
                                    </label>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={() => onViewData(a)}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-sky-700 text-white font-semibold text-sm py-1.5 px-3 rounded-lg whitespace-nowrap"
                                    >
                                        <FaFileAlt />
                                        <span>ดูข้อมูล</span>
                                    </button>
                                    <button
                                        onClick={() => onManage(a)}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-1.5 px-3 rounded-lg whitespace-nowrap"
                                    >
                                        <FaEdit />
                                        <span>จัดการ</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

const ViewDataModal = ({ isOpen, onClose, assessment, responseData, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredRespondents = responseData?.data?.filter(respondent => {
        const fullName = `${respondent.prefix}${respondent.firstname} ${respondent.lastname}`.toLowerCase();
        const studentId = respondent.std_id ? String(respondent.std_id).toLowerCase() : '';
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || studentId.includes(term);
    });

    const handleExport = () => {
        const dataToExport = filteredRespondents || [];
        if (!dataToExport || dataToExport.length === 0) {
            Swal.fire('Info', 'ไม่มีข้อมูลสำหรับส่งออก', 'info');
            return;
        }

        const headers = [
            'รหัสนิสิต',
            'ชื่อ-สกุล',
            ...responseData.question.map(q => q.question)
        ];

        const rows = dataToExport.map(respondent => {
            const row = {
                'รหัสนิสิต': respondent.std_id,
                'ชื่อ-สกุล': `${respondent.prefix}${respondent.firstname} ${respondent.lastname}`,
            };
            responseData.question.forEach(q => {
                const answerObj = respondent.answers.find(a => a.questions_id === q.questions_id);
                row[q.question] = answerObj ? answerObj.answer : '';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Data");
        const fileName = `assessment_data_${assessment.assessment_id}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 to-gray-200/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-4xl p-6 flex flex-col complacence-section">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <h3 className="text-lg md:text-xl font-semibold">
                        ข้อมูลการประเมิน: {assessment?.project_title || ''}
                    </h3>
                    <input
                        type="text"
                        placeholder="ค้นหาด้วยรหัสนิสิตหรือชื่อ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full md:w-1/3"
                    />
                </div>

                {isLoading ? (
                    <p className="text-center py-10">กำลังโหลดข้อมูล...</p>
                ) : !responseData || !responseData.data || responseData.data.length === 0 ? (
                    <p className="text-center py-10">ไม่พบข้อมูลผู้ทำแบบประเมิน</p>
                ) : (
                    <div className="overflow-auto max-h-[60vh]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนิสิต</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-สกุล</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ส่ง</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRespondents && filteredRespondents.length > 0 ? (
                                    filteredRespondents.map((respondent) => (
                                        <tr key={respondent.std_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{respondent.std_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${respondent.prefix}${respondent.firstname} ${respondent.lastname}`}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(respondent.submitted_at).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-10">ไม่พบข้อมูลที่ตรงกัน</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-end pt-4 mt-4 border-t gap-2">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                    >
                        Export to Excel
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ComplacenceClientPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    // State for Admin
    const [assessments, setAssessments] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [currentAdminView, setCurrentAdminView] = useState('list'); // 'list' | 'manage'
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [isAddSurveyModalOpen, setIsAddSurveyModalOpen] = useState(false);
    const [isViewDataModalOpen, setIsViewDataModalOpen] = useState(false);
    const [respondentData, setRespondentData] = useState(null);
    const [viewingAssessment, setViewingAssessment] = useState(null);
    const [isViewDataLoading, setIsViewDataLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // State for Student
    const [studentProjects, setStudentProjects] = useState([]);
    const [currentStudentView, setCurrentStudentView] = useState('list'); // 'list' | 'form'
    const [selectedSurvey, setSelectedSurvey] = useState(null);

    const resetStudentState = () => {
        setStudentProjects([]);
        setCurrentStudentView('list');
        setSelectedSurvey(null);
    };

    const resetAdminState = () => {
        setAssessments([]);
        setAllProjects([]);
        setCurrentAdminView('list');
        setSelectedAssessment(null);
        setIsAddSurveyModalOpen(false);
        setPagination(null);
    };

    const handleSaveAndClose = () => {
        setCurrentAdminView('list');
        fetchData(currentPage);
    };

    const fetchData = async (page = 1) => {
        setLoading(true);
        setError(null);
        setCurrentPage(page);

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
                setUserRole(user.role_id);
            }
        }

        if (!user) {
            setError('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ');
            setLoading(false);
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            if (user.role_id === 1) { // Student
                resetAdminState();
                const assessmentsResponse = await axios.get('/api/complacence', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: { page }
                });
                setStudentProjects(assessmentsResponse.data.data);
                setPagination(assessmentsResponse.data.pagination);
            } else if (user.role_id === 2 || user.role_id === 3) { // Admin/Staff
                resetStudentState();
                const [assessmentsResponse, projectsResponse] = await Promise.all([
                    axios.get('/api/complacence', {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        params: { page }
                    }),
                    axios.get('/api/project-complacence', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                ]);
                setAssessments(assessmentsResponse.data.data);
                setPagination(assessmentsResponse.data.pagination);
                setAllProjects(projectsResponse.data.data);
            }
        } catch (err) {
            console.error('Fetch data error:', err);
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData(1);
    }, []);

    const handleStartSurvey = async (project) => {
        setLoading(true);
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                Swal.fire('Error', 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ', 'error');
                setLoading(false);
                return;
            }

            const response = await axios.get(`/api/question-complacence/${project.assessment_id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.status === 200 && response.data && response.data.data) {
                const surveyDetails = {
                    assessment_id: project.assessment_id,
                    project_title: project.project_title,
                    questions: response.data.data
                };
                setSelectedSurvey(surveyDetails);
                setCurrentStudentView('form');
            } else {
                Swal.fire('Error', response.data.message || 'Failed to fetch survey details.', 'error');
            }
        } catch (error) {
            console.error("Error fetching survey details:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to fetch survey details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSurveySubmit = async (assessmentId, answers) => {
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                Swal.fire('Error', 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ', 'error');
                return;
            }

            const formattedAnswers = Object.keys(answers).map(questionId => ({
                questions_id: parseInt(questionId, 10),
                answer: answers[questionId]
            }));

            if (formattedAnswers.some(a => isNaN(a.questions_id))) {
                Swal.fire('Error', 'มีข้อผิดพลาด: ID คำถามไม่ถูกต้อง', 'error');
                return;
            }

            const payload = {
                assessment_id: assessmentId,
                answers: formattedAnswers
            };

            const response = await axios.post('/api/submit-complacence', payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.status === 200) {
                await Swal.fire({
                    title: 'สำเร็จ',
                    text: 'ส่งแบบประเมินเรียบร้อยแล้ว',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                setCurrentStudentView('list');
                fetchData(1);
            } else {
                Swal.fire('Error', response.data.message || 'Failed to submit survey.', 'error');
            }
        } catch (error) {
            console.error("Error submitting survey:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to submit survey.', 'error');
        }
    };

    const handleViewData = async (assessment) => {
        setViewingAssessment(assessment);
        setRespondentData(null);
        setIsViewDataModalOpen(true);
        setIsViewDataLoading(true);

        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                Swal.fire('Error', 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ', 'error');
                setIsViewDataModalOpen(false);
                return;
            }
            const response = await axios.get(`/api/person-complacence/${assessment.assessment_id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (response.status === 200 && response.data) {
                setRespondentData(response.data);
            } else {
                Swal.fire('Error', response.data.message || 'Failed to fetch respondent data.', 'error');
                setIsViewDataModalOpen(false);
            }
        } catch (error) {
            console.error("Error fetching respondent data:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to fetch respondent data.', 'error');
            setIsViewDataModalOpen(false);
        } finally {
            setIsViewDataLoading(false);
        }
    };

    const handleToggleStatus = async (assessmentId, currentStatus) => {
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                Swal.fire('Error', 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ', 'error');
                return;
            }

            const response = await axios.put(`/api/change-complacence-status/${assessmentId}`, null, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.status === 200) {
                Swal.fire('สำเร็จ', 'เปลี่ยนสถานะแบบประเมินสำเร็จ', 'success');
                fetchData(currentPage);
            } else {
                Swal.fire('Error', response.data.message || 'Failed to change assessment status.', 'error');
            }
        } catch (error) {
            console.error("Error changing assessment status:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to change assessment status.', 'error');
        }
    };

    const handleCreateAssessment = async (projectId) => {
        console.log("Sending payload to /api/create-complacence:", { project_id: projectId });
        try {
            const accessToken = Cookies.get('accessToken');
            if (!accessToken) {
                Swal.fire('Error', 'ไม่พบโทเค็นการเข้าถึง กรุณาเข้าสู่ระบบ', 'error');
                return;
            }

            const response = await axios.post('/api/create-complacence', {
                project_id: parseInt(projectId, 10)
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.status === 200) {
                Swal.fire('สำเร็จ', 'สร้างแบบประเมินสำเร็จ', 'success');
                fetchData(1);
            } else {
                Swal.fire('Error', response.data.message || 'Failed to create assessment.', 'error');
            }
        } catch (error) {
            console.error("Error creating assessment:", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to create assessment.', 'error');
        }
    };

    const filteredAssessments = assessments.filter(assessment =>
        assessment.project_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="text-center p-10"><p>กำลังโหลด...</p></div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500"><FaExclamationCircle className="mx-auto text-4xl mb-2" /><p>{error}</p></div>;
    }

    if (userRole === 1) { // Student View
        return (
            <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {currentStudentView === 'list' && (
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">แบบประเมินโครงการ</h1>
                            <div className="space-y-6">
                                {studentProjects.length === 0 ? (
                                    <div className="text-center p-10"><FaCircleInfo className="mx-auto text-4xl mb-2" /><p>ไม่พบแบบประเมินที่ต้องทำ</p></div>
                                ) : (
                                    studentProjects.map(p => (
                                        <div key={p.assessment_id} className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <h4 className="text-lg md:text-xl font-semibold text-slate-700">
                                                {`โครงการ ${p.project_title}`}
                                            </h4>
                                            <button
                                                onClick={() => handleStartSurvey(p)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg w-full sm:w-auto flex-shrink-0"
                                            >
                                                เริ่มทำ
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            {pagination && (
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={fetchData}
                                />
                            )}
                        </div>
                    )}
                    {currentStudentView === 'form' && (
                        <StudentSurveyForm
                            survey={selectedSurvey}
                            onBack={() => {
                                setCurrentStudentView('list');
                                setSelectedSurvey(null);
                            }}
                            onSubmit={handleStudentSurveySubmit}
                        />
                    )}
                </div>
            </div>
        );
    } else if (userRole === 2 || userRole === 3)
        return (
            <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {currentAdminView === 'list' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">แบบประเมิน</h1>
                                <button
                                    onClick={() => setIsAddSurveyModalOpen(true)}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg whitespace-nowrap"
                                >
                                    <FaPlus className="mr-2" />เพิ่มแบบประเมิน
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="search"
                                        name="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="ค้นหาแบบประเมิน..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg transition duration-150 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-sm"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                </div>
                                <AdminSurveyList
                                    assessments={filteredAssessments}
                                    onManage={(assessment) => { setSelectedAssessment(assessment); setCurrentAdminView('manage'); }}
                                    onToggleStatus={handleToggleStatus}
                                    onViewData={handleViewData}
                                    pagination={pagination}
                                    onPageChange={fetchData}
                                />
                            </div>
                        </>
                    )}
                    {currentAdminView === 'manage' && (
                        <AdminManageSurvey
                            assessment={selectedAssessment}
                            onBack={() => {
                                setCurrentAdminView('list');
                                setSelectedAssessment(null);
                            }}
                            onQuestionSaved={handleSaveAndClose}
                        />
                    )}
                </div>
                <AddSurveyModal
                    isOpen={isAddSurveyModalOpen}
                    onClose={() => setIsAddSurveyModalOpen(false)}
                    onSave={handleCreateAssessment}
                    projects={allProjects}
                />
                <ViewDataModal
                    isOpen={isViewDataModalOpen}
                    onClose={() => setIsViewDataModalOpen(false)}
                    assessment={viewingAssessment}
                    responseData={respondentData}
                    isLoading={isViewDataLoading}
                />
            </div>
        );
}

