import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DocumentCard from './DocumentCard';

const RecentsCard = ({ documents }) => {
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

    return (
        <motion.div
            variants={cardVariants}
            className="bg-[#F5F6FF] rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col"
        >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-[#252525]">Recents</h2>
                <Link to="/library">
                    <motion.div
                        whileHover={{ backgroundColor: "#F6F8FC" }}
                        className="text-[#AF42F6] font-semibold py-2 px-4 rounded-lg shadow-sm bg-[#F5F6FF]"
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
                {documents.map((doc, index) => (
                    <DocumentCard key={doc.id} document={doc} index={index} />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default RecentsCard; 