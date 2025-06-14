import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiUpload, FiFileText, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import Logo from '../assets/icons/logo.svg';
import { generateQCMWithOpenRouter } from '../lib/openrouter';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { getUserModules, saveQCM } from '../lib/appwriteService';

// Set the worker source path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Helper function to parse QCM from AI response
const parseQCMFromText = (text) => {
    // Try to extract QCM blocks from AI response
    const questionBlocks = text.split(/\n(?=\d+\. )/).filter(Boolean);
    const questions = [];

    for (const block of questionBlocks) {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length < 2) continue;

        // Get the question text (first line)
        const questionLine = lines[0].replace(/^\d+\.\s*/, '').trim();

        // Extract options and answer
        const options = [];
        let answer = '';
        let answerLetter = '';

        for (let i = 1; i < lines.length; i++) {
            // Match option patterns like "A) Option text" or "A. Option text"
            const optMatch = lines[i].match(/^([A-D])[).]\s*(.*)$/i);
            if (optMatch) {
                options.push(optMatch[2].trim());
            }
            // Match answer patterns
            else if (/^Answer\s*[:：]?\s*([A-D])$/i.test(lines[i])) {
                answerLetter = lines[i].match(/^Answer\s*[:：]?\s*([A-D])$/i)[1];
            }
        }

        // Only add questions with proper format
        if (questionLine && options.length >= 2) {
            questions.push({
                question: questionLine,
                options,
                answer: answerLetter,
            });
        }
    }

    return questions.length > 0 ? { questions } : null;
};

export const Upload = () => {
    const { user } = useOutletContext() || {};
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfText, setPdfText] = useState('');
    const [qcm, setQcm] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extractionStep, setExtractionStep] = useState('');
    const [showAnswers, setShowAnswers] = useState(false);
    const [error, setError] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [qcmName, setQcmName] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [savingQcm, setSavingQcm] = useState(false);
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);

    // Load modules from Appwrite
    useEffect(() => {
        const loadModules = async () => {
            try {
                const fetchedModules = await getUserModules();
                if (fetchedModules && fetchedModules.length > 0) {
                    setModules(fetchedModules);
                }
            } catch (err) {
                console.error("Error loading modules:", err);
            }
        };

        loadModules();
    }, []);

    // Handle drag and drop events
    useEffect(() => {
        const dropArea = dropAreaRef.current;
        if (!dropArea) return;

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const highlight = () => {
            dropArea.classList.add('border-[#AF42F6]', 'bg-[#F5F6FF]');
        };

        const unhighlight = () => {
            dropArea.classList.remove('border-[#AF42F6]', 'bg-[#F5F6FF]');
        };

        const handleDrop = (e) => {
            preventDefaults(e);
            unhighlight();

            const dt = e.dataTransfer;
            const file = dt.files[0];

            if (file && file.type === 'application/pdf') {
                setPdfFile(file);
                setError(null);
                setQcm(null);
                setPdfText('');
            } else {
                setError('Please select a valid PDF file.');
            }
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        dropArea.addEventListener('drop', handleDrop, false);

        return () => {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.removeEventListener(eventName, preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.removeEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.removeEventListener(eventName, unhighlight, false);
            });

            dropArea.removeEventListener('drop', handleDrop, false);
        };
    }, []);

    // Handle file selection
    const handleFileChange = async (e) => {
        setError(null);
        setQcm(null);
        setPdfText('');
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please select a valid PDF file.');
            return;
        }

        setPdfFile(file);
    };

    // Extract text from PDF using multiple methods
    const extractTextFromPDF = async (file) => {
        setExtractionStep('Analyzing PDF structure...');

        try {
            // Method 1: Try PDF.js text extraction first (works for text-based PDFs)
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let extractedText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                setExtractionStep(`Extracting text from page ${i} of ${pdf.numPages}...`);
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items
                    .map(item => item.str)
                    .join(' ');
                extractedText += pageText + '\n\n';
            }

            // If we got meaningful text, return it
            if (extractedText.trim().length > 100) {
                return extractedText;
            }

            // Method 2: If PDF.js didn't extract enough text, try OCR with Tesseract.js
            setExtractionStep('Using OCR to extract text from scanned pages...');

            // Load the PDF with pdf-lib to render pages as images
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const worker = await createWorker('eng');
            let ocrText = '';

            for (let i = 0; i < Math.min(pdfDoc.getPageCount(), 10); i++) {
                setExtractionStep(`OCR processing page ${i + 1}...`);

                // Render page to canvas
                const page = await pdf.getPage(i + 1);
                const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better OCR
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Get image data for OCR
                const imageData = canvas.toDataURL('image/png');

                // Perform OCR
                const { data } = await worker.recognize(imageData);
                ocrText += data.text + '\n\n';
            }

            await worker.terminate();

            return ocrText || extractedText;
        } catch (error) {
            console.error('Error extracting text:', error);
            throw new Error('Failed to extract text from PDF');
        }
    };

    // Process the PDF and generate QCM
    const handleExtractQCM = async () => {
        setError(null);
        setQcm(null);
        setLoading(true);
        setExtractionStep('');

        if (!pdfFile) {
            setError('Please select a PDF file.');
            setLoading(false);
            return;
        }

        try {
            // Extract text from PDF
            const extractedText = await extractTextFromPDF(pdfFile);
            setPdfText(extractedText);

            if (!extractedText || extractedText.trim().length < 50) {
                throw new Error('Could not extract sufficient text from the PDF.');
            }

            // Send to OpenRouter AI
            setExtractionStep('Generating QCM with AI...');
            const aiResponse = await generateQCMWithOpenRouter(extractedText);

            // Parse the AI response
            const parsed = parseQCMFromText(aiResponse);
            if (parsed && parsed.questions && parsed.questions.length > 0) {
                setQcm(parsed);
            } else {
                throw new Error('Could not generate a valid QCM from the PDF content.');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to process the PDF. Please try a different file.');
        } finally {
            setLoading(false);
            setExtractionStep('');
        }
    };

    // Save the QCM to Appwrite
    const handleSaveQCM = async (e) => {
        e.preventDefault();

        if (!qcmName.trim() || !selectedModuleId || !qcm || !qcm.questions || qcm.questions.length === 0) {
            setError('Please provide a name and select a module before saving.');
            return;
        }

        setSavingQcm(true);

        try {
            await saveQCM(
                selectedModuleId,
                qcmName.trim(),
                {
                    questions: qcm.questions.map(q => ({
                        question: q.question,
                        options: q.options,
                        answer: q.answer
                    }))
                }
            );

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            setQcmName('');
            setSelectedModuleId('');
        } catch (err) {
            console.error('Error saving QCM:', err);
            setError('Failed to save the QCM. Please try again.');
        } finally {
            setSavingQcm(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center justify-center bg-[#EAEFFB] px-4 py-8"
            style={{ minHeight: '100vh' }}
        >
            {/* Gradient Glow Background */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00CAC3] rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#AF42F6] rounded-full opacity-10 blur-3xl"></div>

            <div className="w-full max-w-2xl bg-[#F5F6FF] rounded-2xl p-6 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.08)] relative overflow-hidden">
                <div className="flex items-center mb-6">
                    <img src={Logo} alt="PromptQCM" className="h-10 w-auto mr-3" />
                    <h1 className="text-2xl font-bold text-[#252525]">Upload QCM PDF</h1>
                </div>

                {/* PDF Upload Section */}
                <div className="bg-white rounded-xl p-4 border border-[#EAEFFB] mb-4">
                    <div
                        ref={dropAreaRef}
                        className="w-full flex flex-col items-center justify-center cursor-pointer py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:bg-[#F5F6FF] transition-all"
                    >
                        <FiUpload className="h-10 w-10 text-[#AF42F6] mb-2" />
                        <span className="text-[#AF42F6] font-semibold text-lg mb-1">Click to upload a PDF</span>
                        <span className="text-gray-500 text-sm">or drag and drop</span>
                        <input
                            ref={fileInputRef}
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {pdfFile && (
                        <div className="mt-4 p-3 bg-[#F5F6FF] rounded-lg flex items-center">
                            <FiFileText className="text-[#AF42F6] mr-2" />
                            <span className="text-[#252525] text-sm font-medium">{pdfFile.name}</span>
                        </div>
                    )}

                    {loading && (
                        <div className="mt-4 p-3 bg-[#F5F6FF] rounded-lg">
                            <div className="flex items-center text-[#AF42F6] font-semibold mb-2">
                                <div className="animate-spin mr-2">
                                    <FiLoader />
                                </div>
                                <span>Processing PDF...</span>
                            </div>
                            {extractionStep && (
                                <div className="text-sm text-gray-600">{extractionStep}</div>
                            )}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-[#AF42F6] h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
                            <FiAlertCircle className="mr-2" />
                            <span>{error}</span>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => fileInputRef.current.click()}
                        className="mt-4 py-2 px-5 rounded-lg text-sm font-semibold border border-[#AF42F6] text-[#AF42F6] bg-white hover:bg-[#F5F6FF]"
                    >
                        Select PDF
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleExtractQCM}
                        className="ml-2 mt-4 py-2 px-5 rounded-lg text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                        disabled={!pdfFile || loading}
                    >
                        Extract QCM
                    </motion.button>
                </div>

                {/* QCM Display Section */}
                {qcm && qcm.questions && qcm.questions.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#252525]">Generated QCM</h2>
                            <button
                                onClick={() => setShowAnswers(a => !a)}
                                className="py-2 px-4 rounded-lg text-sm font-semibold text-white"
                                style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                            >
                                {showAnswers ? 'Hide Answers' : 'Show Answers'}
                            </button>
                        </div>

                        {/* QCM Save Form */}
                        <form className="flex flex-col sm:flex-row gap-2 mb-4 items-center" onSubmit={handleSaveQCM}>
                            <input
                                type="text"
                                className="flex-1 py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                placeholder="QCM Name (required)"
                                value={qcmName}
                                onChange={e => setQcmName(e.target.value)}
                                required
                            />
                            <select
                                className="py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00CAC3]"
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
                                disabled={!qcmName.trim() || !selectedModuleId || savingQcm}
                                className="py-2 px-5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-70"
                                style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                            >
                                {savingQcm ? 'Saving...' : 'Save QCM'}
                            </motion.button>
                            {saveSuccess && (
                                <span className="text-green-600 font-semibold flex items-center">
                                    <FiCheck className="mr-1" /> Saved!
                                </span>
                            )}
                        </form>

                        {/* QCM Questions Display */}
                        <div className="bg-white rounded-xl border border-[#EAEFFB] p-4 divide-y divide-gray-100">
                            {qcm.questions.map((q, i) => (
                                <div key={i} className="py-4 first:pt-0 last:pb-0">
                                    <div className="font-semibold mb-3 text-[#252525]">{i + 1}. {q.question}</div>
                                    <ul className="mb-3 space-y-2">
                                        {q.options.map((opt, j) => {
                                            const letter = String.fromCharCode(65 + j);
                                            const isCorrectAnswer = showAnswers && letter === q.answer;

                                            return (
                                                <li
                                                    key={j}
                                                    className={`p-2 rounded-lg flex items-center ${isCorrectAnswer
                                                            ? 'bg-green-50 border border-green-200'
                                                            : 'hover:bg-[#F5F6FF]'
                                                        }`}
                                                >
                                                    <span className={`inline-block w-6 font-bold ${isCorrectAnswer ? 'text-green-600' : 'text-[#AF42F6]'}`}>
                                                        {letter})
                                                    </span>
                                                    <span className="ml-2">{opt}</span>
                                                    {isCorrectAnswer && (
                                                        <span className="ml-auto text-green-600">
                                                            <FiCheck />
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}; 