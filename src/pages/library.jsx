import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiSettings, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import DocumentCard from '../components/DocumentCard';
import { useDarkMode } from '../lib/DarkModeContext';

export const Library = () => {
    const { user } = useOutletContext();
    const { isDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isAddingDummyDoc, setIsAddingDummyDoc] = useState(false);
    const [newDocName, setNewDocName] = useState('');

    // Background colors based on dark mode
    const bgPrimary = isDarkMode ? "#1E1E1E" : "#F5F6FF";
    const bgSecondary = isDarkMode ? "#2D2D2D" : "#FFFFFF";
    const bgAccent = isDarkMode ? "#3D3D3D" : "#F6F8FC";
    const textPrimary = isDarkMode ? "#FFFFFF" : "#252525";
    const textSecondary = isDarkMode ? "#E0E0E0" : "#6B7280";
    const borderColor = isDarkMode ? "#3D3D3D" : "#E0E7EF";

    useEffect(() => {
        // Load documents from localStorage on component mount
        const storedDocs = localStorage.getItem('qcm_documents');
        if (storedDocs) {
            setDocuments(JSON.parse(storedDocs));
        } else {
            // Initial mock data for documents if none exist
            const initialDocs = [
                { id: 1, name: 'QCM Technologie du Web.pdf', date: '10/12/2023', lastAccessed: Date.now() - 5000 },
                { id: 2, name: 'QCM Java Basics.pdf', date: '12/12/2023', lastAccessed: Date.now() - 10000 },
                { id: 3, name: 'QCM C++ Advanced.pdf', date: '15/12/2023', lastAccessed: Date.now() - 15000 },
                { id: 4, name: 'QCM System Architecture.pdf', date: '18/12/2023', lastAccessed: Date.now() - 20000 },
                { id: 5, name: 'QCM Database Design.pdf', date: '20/12/2023', lastAccessed: Date.now() - 25000 },
                { id: 6, name: 'QCM UI/UX Principles.pdf', date: '22/12/2023', lastAccessed: Date.now() - 30000 },
            ];
            setDocuments(initialDocs);
            localStorage.setItem('qcm_documents', JSON.stringify(initialDocs));
        }
    }, []);

    // Sort documents by last accessed time
    const sortedDocuments = [...documents].sort((a, b) => b.lastAccessed - a.lastAccessed);

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    const handleDocumentClick = (docId) => {
        // Update the lastAccessed time for the clicked document
        const updatedDocs = documents.map(doc =>
            doc.id === docId ? { ...doc, lastAccessed: Date.now() } : doc
        );
        setDocuments(updatedDocs);

        // Save to localStorage
        localStorage.setItem('qcm_documents', JSON.stringify(updatedDocs));
    };

    const toggleDocSelection = (docId) => {
        if (selectedDocs.includes(docId)) {
            setSelectedDocs(selectedDocs.filter(id => id !== docId));
        } else {
            setSelectedDocs([...selectedDocs, docId]);
        }
    };

    const deleteSelectedDocs = () => {
        const updatedDocs = documents.filter(doc => !selectedDocs.includes(doc.id));
        setDocuments(updatedDocs);
        localStorage.setItem('qcm_documents', JSON.stringify(updatedDocs));
        setSelectedDocs([]);
        setShowSettings(false);
    };

    const addDummyDoc = () => {
        if (newDocName.trim()) {
            const newDoc = {
                id: Date.now(),
                name: newDocName.endsWith('.pdf') ? newDocName : newDocName + '.pdf',
                date: new Date().toLocaleDateString(),
                lastAccessed: Date.now()
            };

            const updatedDocs = [...documents, newDoc];
            setDocuments(updatedDocs);
            localStorage.setItem('qcm_documents', JSON.stringify(updatedDocs));

            setNewDocName('');
            setIsAddingDummyDoc(false);
        }
    };

    // Animation configs
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const modalVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 500
            }
        },
        exit: {
            y: 20,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    greeting="Library"
                    showExclamation={false}
                    onSearch={handleSearch}
                    showSearchBar={false}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    style={{
                        backgroundColor: showSettings ? "#AF42F6" : bgAccent,
                        color: showSettings ? "#FFFFFF" : textPrimary
                    }}
                    className="p-2.5 rounded-full"
                >
                    <FiSettings size={20} />
                </motion.button>
            </div>

            {/* Library Content */}
            <div style={{ backgroundColor: bgPrimary }} className="rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                {/* Settings Mode */}
                {showSettings && (
                    <div
                        style={{ backgroundColor: bgAccent }}
                        className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl"
                    >
                        <div>
                            <h3 style={{ color: textPrimary }} className="font-semibold mb-1">Document Settings</h3>
                            <p style={{ color: textSecondary }} className="text-sm">{selectedDocs.length} documents selected</p>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={deleteSelectedDocs}
                                disabled={selectedDocs.length === 0}
                                style={{
                                    backgroundColor: selectedDocs.length === 0
                                        ? 'rgba(209, 213, 219, 0.8)'
                                        : 'rgba(254, 226, 226, 0.8)',
                                    color: selectedDocs.length === 0
                                        ? 'rgba(107, 114, 128, 0.8)'
                                        : 'rgba(220, 38, 38, 0.8)'
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${selectedDocs.length === 0 ? 'cursor-not-allowed' : ''}`}
                            >
                                <FiTrash2 size={16} />
                                <span>Delete</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowSettings(false)}
                                style={{ backgroundColor: isDarkMode ? "#2D2D2D" : "#EAEFFB", color: textPrimary }}
                                className="px-4 py-2 rounded-lg flex items-center gap-1.5"
                            >
                                <FiX size={16} />
                                <span>Close</span>
                            </motion.button>
                        </div>
                    </div>
                )}

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 style={{ color: textPrimary }} className="text-xl font-bold">All Documents</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAddingDummyDoc(true)}
                            style={{ backgroundColor: bgAccent, color: "#AF42F6" }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                            <FiPlus size={16} />
                            <span>Add Dummy</span>
                        </motion.button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedDocuments.map((doc, index) => (
                            <div
                                key={doc.id}
                                onClick={() => showSettings ? toggleDocSelection(doc.id) : handleDocumentClick(doc.id)}
                                className={`${showSettings && selectedDocs.includes(doc.id) ? 'border-2 border-[#AF42F6] rounded-lg' : ''}`}
                            >
                                <DocumentCard
                                    document={doc}
                                    index={index}
                                    isDarkMode={isDarkMode}
                                    bgColor={bgSecondary}
                                    textColor={textPrimary}
                                    textSecondary={textSecondary}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Upload New Document</h2>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                            borderColor: isDarkMode ? "#3D3D3D" : "rgb(209, 213, 219)",
                            backgroundColor: isDarkMode ? "rgba(45, 45, 45, 0.3)" : "rgba(255, 255, 255, 0.5)"
                        }}
                        className="border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:bg-[#F6F8FC] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke={isDarkMode ? "#9CA3AF" : "#9CA3AF"}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p style={{ color: textSecondary }}>Drag and drop files here, or click to browse</p>
                    </motion.div>
                </div>
            </div>

            {/* Add Dummy Doc Modal */}
            <AnimatePresence>
                {isAddingDummyDoc && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ backgroundColor: bgSecondary }}
                            className="rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Add Dummy Document</h3>
                            <div className="mb-4">
                                <label htmlFor="docName" style={{ color: textSecondary }} className="block text-sm font-medium mb-1">Document Name</label>
                                <input
                                    type="text"
                                    id="docName"
                                    value={newDocName}
                                    onChange={(e) => setNewDocName(e.target.value)}
                                    placeholder="Enter document name"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAddingDummyDoc(false)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addDummyDoc}
                                    disabled={!newDocName.trim()}
                                    style={{
                                        backgroundColor: !newDocName.trim() ? "#9CA3AF" : "#AF42F6",
                                        color: "#FFFFFF"
                                    }}
                                    className={`px-4 py-2 rounded-lg ${!newDocName.trim() ? 'cursor-not-allowed' : ''}`}
                                >
                                    Add Document
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Library;