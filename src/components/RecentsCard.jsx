import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../lib/DarkModeContext';
import DocumentCard from './DocumentCard';

const RecentsCard = ({ documents }) => {
    const { colors } = useDarkMode();

    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 20 }
        }
    };

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

    const handleDocumentClick = (doc) => {
        // Open the PDF file in a new tab
        if (doc.fileUrl) {
            window.open(doc.fileUrl, '_blank');
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            style={{
                backgroundColor: colors.bgPrimary,
                boxShadow: colors.shadow
            }}
            className="rounded-2xl p-8 flex flex-col"
        >
            <div className="flex justify-between items-center mb-8">
                <h2 style={{ color: colors.textPrimary }} className="text-xl font-bold">Recents</h2>
                <Link to="/library">
                    <motion.div
                        whileHover={{ opacity: 0.9 }}
                        style={{
                            backgroundColor: colors.bgAccent,
                            color: colors.purple
                        }}
                        className="font-semibold py-2 px-4 rounded-lg shadow-sm"
                    >
                        View All
                    </motion.div>
                </Link>
            </div>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {documents.length === 0 ? (
                    <p style={{ color: colors.textSecondary }} className="text-center py-4">No recent documents</p>
                ) : (
                    documents.map((doc, index) => (
                        <div key={doc.$id} onClick={() => handleDocumentClick(doc)}>
                            <DocumentCard document={doc} index={index} />
                        </div>
                    ))
                )}
            </motion.div>
        </motion.div>
    );
};

export default RecentsCard; 