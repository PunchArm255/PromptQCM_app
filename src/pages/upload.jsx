import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { useOutletContext } from 'react-router-dom';
import Logo from '../assets/icons/logo.svg';
import { generateQCMWithOpenRouter } from '../lib/openrouter';
import * as pdfjsLib from 'pdfjs-dist';
import { getModules, uploadPDF, listPDFs, createQCM } from '../appwrite/api';
// Fix for Vite/React: set workerSrc manually
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const parseQCMFromText = (text) => {
    // Try to extract QCM blocks from raw PDF text (very basic, can be improved)
    const questionBlocks = text.split(/\n(?=\d+\. )/).filter(Boolean);
    const questions = [];
    for (const block of questionBlocks) {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length < 2) continue;
        let questionLine = lines[0];
        const options = [];
        let answer = '';
        for (let i = 1; i < lines.length; i++) {
            const optMatch = lines[i].match(/^[A-D]\)\s*(.*)$/);
            if (optMatch) {
                options.push(optMatch[1]);
            } else if (/^Answer[:：]?/i.test(lines[i])) {
                answer = lines[i].replace(/^Answer[:：]?\s*/i, '');
            }
        }
        if (questionLine && options.length >= 2) {
            questions.push({
                question: questionLine,
                options,
                answer: answer ? answer : null,
            });
        }
    }
    return questions.length > 0 ? { questions } : null;
};

const Upload = () => {
    const { user } = useOutletContext() || {};
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfText, setPdfText] = useState('');
    const [qcm, setQcm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);
    const [error, setError] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [qcmName, setQcmName] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [pdfList, setPdfList] = useState([]);
    const [showPdfSelector, setShowPdfSelector] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Fetch modules from Appwrite
        const fetchModules = async () => {
            const modRes = await getModules();
            setModules(modRes.documents || []);
        };
        fetchModules();
    }, []);

    const handleFileChange = async (e) => {
        setError(null);
        setQcm(null);
        setPdfText('');
        const file = e.target.files[0];
        if (!file) return;
        setPdfFile(file);
    };

    const handleUploadPDF = async () => {
        if (!pdfFile) return;
        setLoading(true);
        try {
            await uploadPDF(pdfFile);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            setError('Failed to upload PDF.');
        }
        setLoading(false);
    };

    const handleShowPdfSelector = async () => {
        setShowPdfSelector(true);
        const res = await listPDFs();
        setPdfList(res.files || []);
    };

    const handleSelectExistingPDF = (file) => {
        setPdfFile(file);
        setShowPdfSelector(false);
    };

    const handleExtractQCM = async () => {
        setError(null);
        setQcm(null);
        setLoading(true);
        if (!pdfFile) {
            setError('Please select a PDF file.');
            setLoading(false);
            return;
        }
        try {
            let arrayBuffer;
            if (pdfFile.data) {
                // Appwrite file object
                arrayBuffer = await fetch(pdfFile.href).then(res => res.arrayBuffer());
            } else {
                arrayBuffer = await pdfFile.arrayBuffer();
            }
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
            }
            if (!text.trim()) throw new Error('No text found in PDF.');
            setPdfText(text);
            // Send the extracted text to the AI to get QCM answers
            const aiResponse = await generateQCMWithOpenRouter(text);
            const parsed = parseQCMFromText(aiResponse);
            if (parsed) {
                setQcm(parsed);
            } else {
                setError('Could not parse a valid QCM from the AI response.');
            }
        } catch (err) {
            setError('Failed to extract text from PDF. Please try a different file.');
        }
        setLoading(false);
    };

    const handleSaveQCM = async () => {
        if (!qcmName.trim() || !selectedModuleId || !qcm) return;
        try {
            await createQCM({
                moduleId: selectedModuleId,
                name: qcmName.trim(),
                questions: JSON.stringify(qcm.questions),
                createdBy: user?.$id || '',
                createdAt: new Date().toISOString(),
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            setQcmName('');
            setSelectedModuleId('');
        } catch (err) {
            setError('Failed to save QCM.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center bg-[#EAEFFB] px-4 font-gotham relative"
            style={{ minHeight: '100vh' }}
        >
            {/* Gradient Glow Background */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00CAC3] rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#AF42F6] rounded-full opacity-10 blur-3xl"></div>

            <div className="w-full max-w-2xl bg-[#F5F6FF] rounded-2xl p-6 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.08)] relative overflow-hidden mt-8 mb-8">
                <div className="flex items-center mb-6">
                    <img src={Logo} alt="PromptQCM" className="h-10 w-auto mr-3" />
                    <h1 className="text-2xl font-bold text-[#252525]">Upload QCM PDF</h1>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#EAEFFB] mb-4 flex flex-col items-center justify-center">
                    <label htmlFor="pdf-upload" className="w-full flex flex-col items-center justify-center cursor-pointer py-8 px-4 border-2 border-dashed border-[#AF42F6] rounded-xl hover:bg-[#F5F6FF] transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#AF42F6] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-[#AF42F6] font-semibold text-lg mb-1">Click to upload a PDF</span>
                        <span className="text-gray-500 text-sm">or drag and drop</span>
                        <input
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    <button
                        className="mt-2 text-sm text-blue-600 underline"
                        onClick={handleShowPdfSelector}
                        type="button"
                    >
                        Select from existing PDFs
                    </button>
                    {pdfFile && <div className="mt-2 text-[#252525] text-sm font-medium">Selected: {pdfFile.name || pdfFile.filename}</div>}
                    {loading && <div className="mt-4 text-[#AF42F6] font-semibold flex items-center gap-2"><span className="loader border-t-4 border-[#AF42F6] border-solid rounded-full w-6 h-6 animate-spin"></span> Extracting...</div>}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleExtractQCM}
                        className="mt-4 py-2 px-5 rounded-lg text-sm font-semibold text-white font-gotham"
                        style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                        disabled={!pdfFile || loading}
                    >
                        Extract QCM
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleUploadPDF}
                        className="mt-2 py-2 px-5 rounded-lg text-sm font-semibold text-white font-gotham"
                        style={{ background: 'linear-gradient(to right, #AF42F6, #00CAC3)' }}
                        disabled={!pdfFile || loading}
                    >
                        Upload PDF to Library
                    </motion.button>
                    {error && <div className="text-red-500 text-center my-2">{error}</div>}
                </div>
                {showPdfSelector && (
                    <div className="bg-white rounded-xl p-4 border border-[#EAEFFB] mb-4 w-full">
                        <h3 className="font-bold mb-2">Select a PDF from Library</h3>
                        <ul>
                            {pdfList.map(file => (
                                <li key={file.$id} className="flex justify-between items-center py-2 border-b">
                                    <span>{file.filename}</span>
                                    <button className="text-blue-600 underline" onClick={() => handleSelectExistingPDF(file)}>
                                        Select
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button className="mt-2 text-sm text-red-600 underline" onClick={() => setShowPdfSelector(false)}>Cancel</button>
                    </div>
                )}
                {qcm && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#252525]">Extracted QCM</h2>
                            <button
                                onClick={() => setShowAnswers(a => !a)}
                                className="py-2 px-4 rounded-lg text-sm font-semibold text-white"
                                style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                            >
                                {showAnswers ? 'Hide Answers' : 'Show Answers'}
                            </button>
                        </div>
                        <form className="flex flex-col sm:flex-row gap-2 mb-4 items-center" onSubmit={e => { e.preventDefault(); handleSaveQCM(); }}>
                            <input
                                type="text"
                                className="flex-1 py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#AF42F6] font-gotham"
                                placeholder="QCM Name (required)"
                                value={qcmName}
                                onChange={e => setQcmName(e.target.value)}
                                required
                            />
                            <select
                                className="py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00CAC3] font-gotham"
                                value={selectedModuleId}
                                onChange={e => setSelectedModuleId(e.target.value)}
                                required
                            >
                                <option value="">Select Module</option>
                                {modules.map(m => (
                                    <option key={m.$id} value={m.$id}>{m.name}</option>
                                ))}
                            </select>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={!qcmName.trim() || !selectedModuleId}
                                className="py-2 px-5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70 font-gotham"
                                style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                            >
                                Save QCM
                            </motion.button>
                        </form>
                        <div className="bg-white rounded-xl border border-[#EAEFFB] p-4">
                            {qcm.questions.map((q, i) => (
                                <div key={i} className="mb-6">
                                    <div className="font-semibold mb-2">{i + 1}. {q.question}</div>
                                    <ul className="mb-2">
                                        {q.options.map((opt, j) => (
                                            <li key={j} className="pl-2 py-1 flex items-center">
                                                <span className="inline-block w-6 font-bold text-[#AF42F6]">{String.fromCharCode(65 + j)})</span>
                                                <span className="ml-2">{opt}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {showAnswers && q.answer && (
                                        <div className="text-green-600 font-semibold">Answer: {q.answer}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Upload; 