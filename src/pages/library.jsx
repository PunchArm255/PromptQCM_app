import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import DocumentCard from '../components/DocumentCard';
import SearchBar from '../components/SearchBar';

export const Library = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    // Mock data for documents
    const documents = [
        { id: 1, name: 'QCM Technologie du Web.pdf', date: '10/12/2023' },
        { id: 2, name: 'QCM Java Basics.pdf', date: '12/12/2023' },
        { id: 3, name: 'QCM C++ Advanced.pdf', date: '15/12/2023' },
        { id: 4, name: 'QCM System Architecture.pdf', date: '18/12/2023' },
        { id: 5, name: 'QCM Database Design.pdf', date: '20/12/2023' },
        { id: 6, name: 'QCM UI/UX Principles.pdf', date: '22/12/2023' },
    ];

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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-8 py-8"
        >
            {/* Header */}
            <PageHeader
                greeting="Library"
                showExclamation={false}
                onSearch={handleSearch}
            />

            {/* Library Content */}
            <div className="bg-[#F5F6FF] rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-[#252525] mb-4">All Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc, index) => (
                            <DocumentCard key={doc.id} document={doc} index={index} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-[#252525] mb-4">Upload New Document</h2>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-[#F6F8FC] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="text-gray-600">Drag and drop files here, or click to browse</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Library;