import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useOutletContext } from 'react-router-dom';
import { useDarkMode } from '../lib/DarkModeContext';
import Logo from '../assets/icons/logo.svg';
import LogoDark from '../assets/icons/logoDark.svg';
import { generateQCMWithOpenRouter } from '../lib/openrouter';
import { getUserModules, saveQCM } from '../lib/appwriteService';

const examplePrompt = `Write QCM about Python basics, 5 questions, difficulty: easy, code snippets: yes. Format: Numbered questions, each with 4 options (A-D), and indicate the correct answer at the end of each question as 'Answer: X'.`;

function parseOpenRouterQCMResponse(text) {
    // If the AI refuses, return null
    if (/Sorry, I can only generate QCMs/i.test(text)) return null;
    // Parse the response into QCM format
    const questionBlocks = text.split(/\n(?=\d+\. )/).filter(Boolean);
    const questions = [];
    for (const block of questionBlocks) {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length < 2) continue;
        // Find question line
        let questionLine = lines[0];
        let codeBlock = '';
        let inCode = false;
        let codeLines = [];
        // Check for code block in question
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].startsWith('```')) {
                inCode = !inCode;
                continue;
            }
            if (inCode) {
                codeLines.push(lines[i]);
            }
        }
        if (codeLines.length > 0) {
            codeBlock = codeLines.join('\n');
        }
        // Parse options and answer
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
                code: codeBlock,
                options,
                answer: answer ? answer : null,
            });
        }
    }
    return questions.length > 0 ? { questions } : null;
}

export const Generate = () => {
    const { user } = useOutletContext() || {};
    const { isDarkMode, colors } = useDarkMode();
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hi there! How can I help you today?"' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [qcm, setQcm] = useState(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [error, setError] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [qcmName, setQcmName] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Load modules from Appwrite
        const fetchModules = async () => {
            try {
                const fetchedModules = await getUserModules();
                console.log("Fetched modules:", fetchedModules); // Debug log

                if (fetchedModules && fetchedModules.length > 0) {
                    setModules(fetchedModules.map(mod => ({
                        id: mod.$id,
                        name: mod.name
                    })));
                } else {
                    setModules([]);
                }
            } catch (error) {
                console.error("Error fetching modules:", error);
                setModules([]);
            }
        };

        fetchModules();
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setLoading(true);
        setError(null);
        setMessages(msgs => [...msgs, { sender: 'user', text: input.trim() }]);
        setInput('');
        try {
            const openRouterResponse = await generateQCMWithOpenRouter(input.trim());
            // If the AI refuses, show the message and do not parse
            if (/Sorry, I can only generate QCMs/i.test(openRouterResponse)) {
                setMessages(msgs => [...msgs, { sender: 'ai', text: openRouterResponse }]);
                setQcm(null);
            } else {
                const parsed = parseOpenRouterQCMResponse(openRouterResponse);
                if (parsed) {
                    setMessages(msgs => [...msgs, { sender: 'ai', text: 'Your QCM is done!' }]);
                    setQcm(parsed);
                } else {
                    setMessages(msgs => [...msgs, { sender: 'ai', text: 'Sorry, I could not parse a valid QCM from the response.' }]);
                    setQcm(null);
                }
            }
        } catch (err) {
            setError('Error generating QCM. Please try again.');
        }
        setLoading(false);
        scrollToBottom();
    };

    const handleExportPDF = () => {
        if (!qcm || !qcm.questions || !Array.isArray(qcm.questions) || qcm.questions.length === 0) {
            setError("No valid QCM to export");
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const doc = new jsPDF();

            // Set document properties
            doc.setProperties({
                title: qcmName || 'QCM Generated by PromptQCM',
                subject: 'Multiple Choice Questions',
                creator: 'PromptQCM App'
            });

            // Set page background color
            doc.setFillColor(245, 246, 255); // #F5F6FF - app background color
            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

            // Add logo at the top
            const logoDataUrl = isDarkMode ? LogoDark : Logo; // SVG as data URL

            // Add header with logo
            try {
                doc.addImage(logoDataUrl, 'PNG', 14, 10, 20, 10);

                // Add title
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(175, 66, 246); // Purple color
                doc.text('PromptQCM', 40, 17);

                // Add subtitle
                doc.setFontSize(12);
                doc.setTextColor(0, 202, 195); // Teal color
                doc.text('Multiple Choice Questions', 40, 23);
            } catch (logoError) {
                console.error("Error adding logo:", logoError);
                // Continue without logo
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(175, 66, 246); // Purple color
                doc.text('PromptQCM', 14, 15);

                doc.setFontSize(14);
                doc.setTextColor(0, 202, 195); // Teal color
                doc.text('Multiple Choice Questions', 14, 22);
            }

            // Add divider line
            doc.setDrawColor(234, 239, 251); // Light blue color
            doc.setLineWidth(0.5);
            doc.line(14, 28, 196, 28);

            // Add QCM name if available
            if (qcmName) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(37, 37, 37); // Dark gray
                doc.text(qcmName, 14, 36);
            }

            // Add questions
            let yPos = qcmName ? 46 : 36;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(37, 37, 37); // Dark gray

            qcm.questions.forEach((q, qIndex) => {
                // Check if we need a new page
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                // Add question
                doc.setFont('helvetica', 'bold');
                doc.text(`${qIndex + 1}. ${q.question}`, 14, yPos);
                yPos += 8;

                // Add code block if present
                if (q.code && q.code.trim()) {
                    doc.setFont('courier', 'normal');
                    doc.setFontSize(10);
                    doc.setDrawColor(234, 239, 251);
                    doc.setFillColor(245, 246, 255);

                    const codeLines = q.code.split('\n');
                    const codeHeight = codeLines.length * 5 + 4;

                    doc.roundedRect(14, yPos - 4, 180, codeHeight, 2, 2, 'FD');

                    codeLines.forEach((line, i) => {
                        doc.text(line, 16, yPos + i * 5);
                    });

                    yPos += codeHeight + 4;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(12);
                }

                // Add options
                q.options.forEach((opt, i) => {
                    const letter = String.fromCharCode(65 + i); // A, B, C, D
                    const isCorrect = q.answer && q.answer.trim().toUpperCase() === letter;

                    if (isCorrect && showAnswers) {
                        doc.setTextColor(0, 202, 195); // Teal for correct answers
                        doc.setFont('helvetica', 'bold');
                    } else {
                        doc.setTextColor(37, 37, 37); // Dark gray
                        doc.setFont('helvetica', 'normal');
                    }

                    doc.text(`${letter}) ${opt}`, 20, yPos);
                    yPos += 6;
                });

                yPos += 4; // Space between questions
            });

            // Save the PDF
            doc.save(qcmName ? `${qcmName}.pdf` : 'promptqcm_export.pdf');
        } catch (err) {
            console.error('Error exporting PDF:', err);
            setError('Error exporting PDF. Please try again.');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleSaveQCM = async () => {
        if (!qcm || !selectedModuleId || !qcmName.trim()) {
            setError('Please provide a name and select a module before saving.');
            setTimeout(() => setError(null), 3000);
            return;
        }

        setSaveSuccess(false);
        try {
            await saveQCM({
                name: qcmName.trim(),
                moduleId: selectedModuleId,
                questions: qcm.questions
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving QCM:', err);
            setError('Error saving QCM. Please try again.');
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Chat Section */}
                <div className="w-full lg:w-1/2">
                    <div
                        className="rounded-2xl overflow-hidden shadow-lg flex flex-col"
                        style={{
                            backgroundColor: colors.bgPrimary,
                            height: '70vh'
                        }}
                    >
                        {/* Chat Header */}
                        <div className="p-4 border-b" style={{ borderColor: colors.borderColor }}>
                            <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Generate QCM</h2>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-[#00CAC3] to-[#AF42F6] text-white'
                                            : ''
                                            }`}
                                        style={{
                                            backgroundColor: msg.sender === 'user' ? '' : colors.bgAccent,
                                            color: msg.sender === 'user' ? 'white' : colors.textPrimary
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div
                                        className="max-w-[80%] rounded-lg p-3 flex items-center space-x-2"
                                        style={{
                                            backgroundColor: colors.bgAccent,
                                            color: colors.textPrimary
                                        }}
                                    >
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef}></div>
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSend} className="p-4 border-t" style={{ borderColor: colors.borderColor }}>
                            <div className="flex rounded-lg overflow-hidden">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                    placeholder="Describe the QCM you want to generate..."
                                    className="flex-1 px-4 py-2 focus:outline-none"
                                    style={{
                                        backgroundColor: colors.bgSecondary,
                                        color: colors.textPrimary,
                                        borderColor: colors.borderColor
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="px-4 py-2 text-white font-medium"
                                    style={{
                                        background: "linear-gradient(to right, #00CAC3, #AF42F6)",
                                        opacity: loading || !input.trim() ? 0.7 : 1
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                        </form>
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
                            <div className="flex space-x-2">
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
                                <button
                                    onClick={handleExportPDF}
                                    disabled={!qcm}
                                    className="px-3 py-1 text-sm rounded-lg"
                                    style={{
                                        backgroundColor: !qcm ? colors.bgAccent : '',
                                        background: qcm ? "linear-gradient(to right, #00CAC3, #AF42F6)" : '',
                                        color: qcm ? 'white' : colors.textSecondary,
                                        opacity: qcm ? 1 : 0.7
                                    }}
                                >
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        {/* QCM Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {error && (
                                <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            {saveSuccess && (
                                <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
                                    QCM saved successfully!
                                </div>
                            )}

                            {!qcm ? (
                                <div
                                    className="h-full flex flex-col items-center justify-center text-center p-6"
                                    style={{ color: colors.textSecondary }}
                                >
                                    <p className="mb-2">No QCM generated yet.</p>
                                    <p>Describe what kind of QCM you want in the chat.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Save QCM Form */}
                                    <div
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
                                                >
                                                    <option value="">Select a module</option>
                                                    {modules.map((module) => (
                                                        <option key={module.id} value={module.id}>
                                                            {module.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={handleSaveQCM}
                                                className="w-full py-2 rounded-lg text-white font-medium"
                                                style={{
                                                    background: "linear-gradient(to right, #00CAC3, #AF42F6)"
                                                }}
                                            >
                                                Save QCM
                                            </button>
                                        </div>
                                    </div>

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

                                            {q.code && (
                                                <pre
                                                    className="p-3 rounded-md mb-3 overflow-x-auto text-sm"
                                                    style={{
                                                        backgroundColor: colors.bgSecondary,
                                                        color: colors.textPrimary
                                                    }}
                                                >
                                                    {q.code}
                                                </pre>
                                            )}

                                            <div className="space-y-2 ml-4">
                                                {q.options.map((opt, i) => {
                                                    const letter = String.fromCharCode(65 + i); // A, B, C, D
                                                    const isCorrect = q.answer && q.answer.trim().toUpperCase() === letter;

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

export default Generate; 