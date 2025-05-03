import { motion } from 'framer-motion';
import DocIcon from '../assets/icons/doc.svg';

const DocumentCard = ({ document, index }) => {
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            custom={index}
            whileHover={{ scale: 1.02, backgroundColor: "#F6F8FC" }}
            className="flex items-center p-3 rounded-lg cursor-pointer transition-all"
        >
            <div className="w-10 h-10 rounded-lg bg-[#E8EDFE] flex items-center justify-center mr-3">
                <img src={DocIcon} alt="Document" className="w-5 h-5" />
            </div>
            <div>
                <p className="font-medium text-[#252525]">{document.name}</p>
                <p className="text-xs text-gray-400">{document.date}</p>
            </div>
        </motion.div>
    );
};

export default DocumentCard; 