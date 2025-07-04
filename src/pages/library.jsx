import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiSettings, FiTrash2, FiX } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useDarkMode } from '../lib/DarkModeContext';
import { getUserPDFs, uploadPDF, deletePDF } from '../lib/appwriteService';
import { appwriteConfig } from '../lib/appwrite';
import DocumentCard from '../components/DocumentCard';

export const Library = () => {
    const { user } = useOutletContext();
    const { isDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    // Background colors based on dark mode
    const bgPrimary = isDarkMode ? "#1E1E1E" : "#F5F6FF";
    const bgSecondary = isDarkMode ? "#2D2D2D" : "#FFFFFF";
    const bgAccent = isDarkMode ? "#3D3D3D" : "#F6F8FC";
    const textPrimary = isDarkMode ? "#FFFFFF" : "#252525";
    const textSecondary = isDarkMode ? "#E0E0E0" : "#6B7280";
    const borderColor = isDarkMode ? "#3D3D3D" : "#E0E7EF";

    useEffect(() => {
        // Fetch PDFs from Appwrite Storage
        const fetchPDFs = async () => {
            try {
                console.log("Fetching PDFs...");
                const pdfs = await getUserPDFs();
                console.log("Fetched PDFs:", pdfs);

                if (pdfs && pdfs.length > 0) {
                    setDocuments(pdfs);
                } else {
                    setDocuments([]);
                }
            } catch (error) {
                console.error("Error fetching PDFs:", error);
                setDocuments([]);
            }
        };

        fetchPDFs();
    }, []);

    // Sort documents by creation date (if available)
    const sortedDocuments = [...documents].sort((a, b) =>
        new Date(b.$createdAt || 0) - new Date(a.$createdAt || 0)
    );

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    const handleDocumentClick = (doc) => {
        console.log("Opening document:", doc);

        // Use fileId from metadata if available, otherwise use $id
        const fileId = doc.fileId || doc.$id;

        // Generate the file URL using the fileId
        const url = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.pdfBucketId}/files/${fileId}/view?project=67fd12b0003328d94b7d`;
        console.log("Opening URL:", url);
        window.open(url, '_blank');
    };

    const toggleDocSelection = (docId) => {
        if (selectedDocs.includes(docId)) {
            setSelectedDocs(selectedDocs.filter(id => id !== docId));
        } else {
            setSelectedDocs([...selectedDocs, docId]);
        }
    };

    const deleteSelectedDocs = async () => {
        try {
            console.log("Deleting selected documents:", selectedDocs);

            for (const docId of selectedDocs) {
                console.log("Deleting document ID:", docId);
                await deletePDF(docId);
            }

            // Refresh document list
            console.log("Refreshing document list after deletion...");
            const pdfs = await getUserPDFs();
            setDocuments(pdfs || []);

            setSelectedDocs([]);
            setShowSettings(false);
        } catch (error) {
            console.error("Error deleting documents:", error);
        }
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        setUploadError('');
        const file = e.target.files[0];
        if (!file) return;

        console.log("File selected for upload:", file.name);
        setUploading(true);

        try {
            console.log("Starting upload...");
            // Upload PDF to Appwrite
            await uploadPDF(file);
            console.log("Upload successful");

            // Refresh document list
            console.log("Refreshing document list...");
            const pdfs = await getUserPDFs();
            console.log("Refreshed PDFs:", pdfs);

            setDocuments(pdfs || []);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error("Upload error:", err);
            setUploadError('Failed to upload PDF. Please try again.');
        } finally {
            setUploading(false);
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
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {sortedDocuments.length === 0 ? (
                            <div className="text-gray-500 col-span-full text-center py-8">No PDFs found in the library.</div>
                        ) : (
                            sortedDocuments.map((doc, index) => (
                                <div key={doc.$id} className="relative">
                                    {showSettings && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocs.includes(doc.$id)}
                                                onChange={() => toggleDocSelection(doc.$id)}
                                                className="w-4 h-4 accent-[#AF42F6]"
                                            />
                                        </div>
                                    )}
                                    <div onClick={() => !showSettings && handleDocumentClick(doc)}>
                                        <DocumentCard
                                            document={doc}
                                            index={index}
                                            isSelected={selectedDocs.includes(doc.$id)}
                                            onClick={showSettings ? () => toggleDocSelection(doc.$id) : null}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
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
                        onClick={handleUploadClick}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke={isDarkMode ? "#9CA3AF" : "#9CA3AF"}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p style={{ color: textSecondary }}>Click or drag and drop a PDF file here to upload</p>
                        <input
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        {uploading && <div className="mt-2 text-[#AF42F6] font-semibold">Uploading...</div>}
                        {uploadError && <div className="mt-2 text-red-500 font-semibold">{uploadError}</div>}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};