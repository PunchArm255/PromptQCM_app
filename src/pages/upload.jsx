import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiUpload, FiFileText, FiCheck, FiAlertCircle, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { useDarkMode } from '../lib/DarkModeContext';
import Logo from '../assets/icons/logo.svg';
import LogoDark from '../assets/icons/logoDark.svg';
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
    const { isDarkMode, colors } = useDarkMode();
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
            dropArea.classList.add('border-[#AF42F6]', 'bg-opacity-20');
        };

        const unhighlight = () => {
            dropArea.classList.remove('border-[#AF42F6]', 'bg-opacity-20');
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

            // Create a new PDFDocument to render each page as an image
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const worker = await createWorker();
            let ocrText = '';

            for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                setExtractionStep(`Performing OCR on page ${i + 1} of ${pdfDoc.getPageCount()}...`);

                // Render the page to a canvas
                const page = await pdf.getPage(i + 1);
                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert canvas to image data URL
                const imageData = canvas.toDataURL('image/png');

                // Perform OCR on the image
                const { data } = await worker.recognize(imageData);
                ocrText += data.text + '\n\n';
            }

            await worker.terminate();

            return ocrText || extractedText; // Return OCR text if available, otherwise fall back to PDF.js text
        } catch (error) {
            console.error("Error extracting text:", error);
            throw new Error("Failed to extract text from PDF");
        }
    };

    const handleExtractQCM = async () => {
        if (!pdfFile) {
            setError('Please upload a PDF file first.');
            return;
        }

        setLoading(true);
        setError(null);
        setQcm(null);
        setPdfText('');

        try {
            // Extract text from PDF
            const extractedText = await extractTextFromPDF(pdfFile);
            setPdfText(extractedText);

            setExtractionStep('Generating QCM from extracted text...');

            // Generate QCM from extracted text
            const prompt = `
            I've extracted text from a PDF that contains multiple choice questions. 
            Please format this content into a proper QCM format with questions and answers.
            Here's the extracted text:
            
            ${extractedText.substring(0, 6000)} // Limit text length to avoid token limits
            
            Format each question as:
            1. Question text
            A) Option 1
            B) Option 2
            C) Option 3
            D) Option 4
            Answer: X (where X is the correct option letter)
            `;

            const aiResponse = await generateQCMWithOpenRouter(prompt);
            const parsedQCM = parseQCMFromText(aiResponse);

            if (parsedQCM && parsedQCM.questions && parsedQCM.questions.length > 0) {
                setQcm(parsedQCM);
            } else {
                setError('Could not generate a valid QCM from the PDF. Please try a different file or check the PDF content.');
            }
        } catch (err) {
            console.error("Error processing PDF:", err);
            setError(`Error processing PDF: ${err.message}`);
        } finally {
            setLoading(false);
            setExtractionStep('');
        }
    };

    const handleSaveQCM = async (e) => {
        e?.preventDefault();

        if (!qcm || !selectedModuleId || !qcmName.trim()) {
            setError('Please provide a name and select a module before saving.');
            return;
        }

        setSavingQcm(true);
        setSaveSuccess(false);
        setError(null);

        try {
            await saveQCM({
                name: qcmName.trim(),
                moduleId: selectedModuleId,
                questions: qcm.questions
            });

            setSaveSuccess(true);
            setQcmName('');
            setSelectedModuleId('');
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Error saving QCM:", err);
            setError(`Error saving QCM: ${err.message}`);
        } finally {
            setSavingQcm(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Upload Section */}
                <div className="w-full lg:w-1/2">
                    <div
                        className="rounded-2xl overflow-hidden shadow-lg flex flex-col"
                        style={{
                            backgroundColor: colors.bgPrimary,
                            height: '70vh'
                        }}
                    >
                        {/* Upload Header */}
                        <div className="p-4 border-b" style={{ borderColor: colors.borderColor }}>
                            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Upload PDF</h2>
                        </div>

                        {/* Upload Area */}
                        <div className="flex-1 p-4 flex flex-col">
                            {/* Drop Area */}
                            <div
                                ref={dropAreaRef}
                                className="border-2 border-dashed rounded-xl flex-1 flex flex-col items-center justify-center p-6 transition-all duration-200"
                                style={{
                                    borderColor: colors.borderColor,
                                    backgroundColor: colors.bgAccent,
                                    opacity: loading ? 0.7 : 1
                                }}
                                onClick={() => !loading && fileInputRef.current?.click()}
                            >
                                {loading ? (
                                    <div className="text-center">
                                        <FiLoader className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: colors.purple }} />
                                        <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>Processing PDF...</p>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>{extractionStep}</p>
                                    </div>
                                ) : pdfFile ? (
                                    <div className="text-center">
                                        <FiFileText className="w-12 h-12 mx-auto mb-4" style={{ color: colors.purple }} />
                                        <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>{pdfFile.name}</p>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExtractQCM();
                                            }}
                                            className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
                                            style={{
                                                background: "linear-gradient(to right, #00CAC3, #AF42F6)"
                                            }}
                                        >
                                            Extract QCM
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <FiUpload className="w-12 h-12 mx-auto mb-4" style={{ color: colors.purple }} />
                                        <p className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>Drag & Drop PDF here</p>
                                        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>or click to browse files</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className="px-4 py-2 rounded-lg text-white font-medium"
                                            style={{
                                                background: "linear-gradient(to right, #00CAC3, #AF42F6)"
                                            }}
                                        >
                                            Select PDF
                                        </button>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={loading}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-700">
                                    <div className="flex items-center">
                                        <FiAlertCircle className="mr-2" />
                                        {error}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* QCM Preview Section */}
                <div className="w-full lg:w-1/2">
                    <div
                        className="rounded-2xl overflow-hidden shadow-lg flex flex-col"
                        style={{
                            backgroundColor: colors.bgPrimary,
                            height: '70vh'
                        }}
                    >
                        {/* Preview Header */}
                        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: colors.borderColor }}>
                            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>QCM Preview</h2>
                            {qcm && (
                                <button
                                    onClick={() => setShowAnswers(!showAnswers)}
                                    className="px-3 py-1 text-sm rounded-lg"
                                    style={{
                                        backgroundColor: colors.bgAccent,
                                        color: colors.textPrimary
                                    }}
                                >
                                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                                </button>
                            )}
                        </div>

                        {/* QCM Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {saveSuccess && (
                                <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 flex items-center">
                                    <FiCheckCircle className="mr-2" />
                                    QCM saved successfully!
                                </div>
                            )}

                            {!qcm ? (
                                <div
                                    className="h-full flex flex-col items-center justify-center text-center p-6"
                                    style={{ color: colors.textSecondary }}
                                >
                                    <p className="mb-2">No QCM extracted yet.</p>
                                    <p>Upload a PDF file to extract QCM content.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Save QCM Form */}
                                    <form
                                        onSubmit={handleSaveQCM}
                                        className="p-4 rounded-lg"
                                        style={{ backgroundColor: colors.bgAccent }}
                                    >
                                        <h3
                                            className="text-lg font-medium mb-3"
                                            style={{ color: colors.textPrimary }}
                                        >
                                            Save QCM
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label
                                                    htmlFor="qcmName"
                                                    className="block text-sm font-medium mb-1"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    QCM Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="qcmName"
                                                    value={qcmName}
                                                    onChange={(e) => setQcmName(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                                    style={{
                                                        backgroundColor: colors.bgSecondary,
                                                        color: colors.textPrimary,
                                                        borderColor: colors.borderColor
                                                    }}
                                                    placeholder="Enter a name for this QCM"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="moduleSelect"
                                                    className="block text-sm font-medium mb-1"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    Module
                                                </label>
                                                <select
                                                    id="moduleSelect"
                                                    value={selectedModuleId}
                                                    onChange={(e) => setSelectedModuleId(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                                    style={{
                                                        backgroundColor: colors.bgSecondary,
                                                        color: colors.textPrimary,
                                                        borderColor: colors.borderColor
                                                    }}
                                                    required
                                                >
                                                    <option value="">Select a module</option>
                                                    {modules.map((module) => (
                                                        <option key={module.$id} value={module.$id}>
                                                            {module.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={savingQcm}
                                                className="w-full py-2 rounded-lg text-white font-medium"
                                                style={{
                                                    background: "linear-gradient(to right, #00CAC3, #AF42F6)",
                                                    opacity: savingQcm ? 0.7 : 1
                                                }}
                                            >
                                                {savingQcm ? 'Saving...' : 'Save QCM'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* QCM Questions */}
                                    {qcm.questions.map((q, qIndex) => (
                                        <div
                                            key={qIndex}
                                            className="p-4 rounded-lg"
                                            style={{ backgroundColor: colors.bgAccent }}
                                        >
                                            <h3
                                                className="text-lg font-medium mb-2"
                                                style={{ color: colors.textPrimary }}
                                            >
                                                {qIndex + 1}. {q.question}
                                            </h3>

                                            <div className="space-y-2 ml-4">
                                                {q.options.map((opt, i) => {
                                                    const letter = String.fromCharCode(65 + i); // A, B, C, D
                                                    const isCorrect = q.answer && q.answer.trim().toUpperCase() === letter.toUpperCase();

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`flex items-start ${showAnswers && isCorrect ? 'font-bold' : ''
                                                                }`}
                                                            style={{
                                                                color: showAnswers && isCorrect ? '#00CAC3' : colors.textPrimary
                                                            }}
                                                        >
                                                            <span className="mr-2">{letter})</span>
                                                            <span>{opt}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload; 