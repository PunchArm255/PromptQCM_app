import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useOutletContext } from 'react-router-dom';
import Logo from '../assets/icons/logo.svg';
import { generateQCMWithOpenRouter } from '../lib/openrouter';
import { getModules, createQCM } from '../appwrite/api';

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

const Generate = () => {
    const { user } = useOutletContext() || {};
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hi! Tell me what kind of QCM you want to generate. For example: "' + examplePrompt + '"' }
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
        // Fetch modules from Appwrite
        const fetchModules = async () => {
            const modRes = await getModules();
            setModules(modRes.documents || []);
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
        if (!qcm) return;
        const doc = new jsPDF();
        // Add logo at the top
        const img = new window.Image();
        img.src = Logo;
        doc.addImage(img, 'PNG', 14, 10, 30, 15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 37, 37);
        doc.text('QCM Generated by PromptQCM', 50, 18);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 37, 37);
        let y = 30;
        qcm.questions.forEach((q, i) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1}. ${q.question}`, 14, y);
            y += 8;
            if (q.code) {
                doc.setFont('courier', 'normal');
                doc.setTextColor(80, 80, 80);
                const codeLines = q.code.split('\n');
                codeLines.forEach(line => {
                    doc.text(`   ${line}`, 18, y);
                    y += 6;
                });
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(37, 37, 37);
            }
            q.options.forEach((opt, j) => {
                doc.text(`   ${String.fromCharCode(65 + j)}) ${opt}`, 18, y);
                y += 7;
            });
            if (showAnswers && q.answer) {
                doc.setTextColor(0, 150, 0);
                doc.text(`   Answer: ${q.answer}`, 18, y);
                doc.setTextColor(37, 37, 37);
                y += 7;
            }
            y += 3;
            if (y > 270) { doc.addPage(); y = 20; }
        });
        doc.save('qcm.pdf');
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
                    <h1 className="text-2xl font-bold text-[#252525]">AI QCM Generator</h1>
                </div>
                <div className="h-[400px] overflow-y-auto hide-scrollbar bg-white rounded-xl p-4 mb-4 border border-[#EAEFFB]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`mb-3 flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-base ${msg.sender === 'ai' ? 'bg-[#EAEFFB] text-[#252525]' : 'bg-gradient-to-r from-[#00CAC3] to-[#AF42F6] text-white'}`}>{msg.text}</div>
                        </div>
                    ))}
                    {error && <div className="text-red-500 text-center my-2">{error}</div>}
                    {loading && <div className="text-center text-[#AF42F6]">Generating QCM...</div>}
                    <div ref={chatEndRef}></div>
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 py-3 px-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#AF42F6] focus:border-transparent transition-all font-gotham"
                        placeholder="Describe your QCM (e.g. Write QCM about JavaScript, 10 questions, difficulty: medium, code snippets: no)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="py-3 px-6 rounded-xl text-base font-semibold text-white transition-all disabled:opacity-70 font-gotham"
                        style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                    >
                        {loading ? '...' : 'Send'}
                    </motion.button>
                </form>

                {qcm && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#252525]">Generated QCM</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAnswers(a => !a)}
                                    className="py-2 px-4 rounded-lg text-sm font-semibold text-white"
                                    style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                                >
                                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportPDF}
                                    className="py-2 px-4 rounded-lg text-sm font-semibold text-white"
                                    style={{ background: 'linear-gradient(to right, #AF42F6, #00CAC3)' }}
                                >
                                    Export PDF
                                </button>
                            </div>
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
                            {saveSuccess && <span className="text-green-600 font-semibold ml-2">Saved!</span>}
                        </form>
                        <div className="bg-white rounded-xl border border-[#EAEFFB] p-4">
                            {qcm.questions.map((q, i) => (
                                <div key={i} className="mb-6">
                                    <div className="font-semibold mb-2">{i + 1}. {q.question}</div>
                                    {q.code && (
                                        <pre className="bg-[#F5F6FF] rounded p-2 overflow-x-auto text-sm mb-2"><code>{q.code}</code></pre>
                                    )}
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

export default Generate; 