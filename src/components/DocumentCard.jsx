import { motion } from 'framer-motion';
import { useDarkMode } from '../lib/DarkModeContext';
import DocIcon from '../assets/icons/doc.svg';
import DocIconDark from '../assets/icons/docDark.svg';

const DocumentCard = ({ document, index, onClick, isSelected }) => {
    const { isDarkMode, colors } = useDarkMode();

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    // Format date from ISO string
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get file name from metadata or fallback to Appwrite storage file name
    const fileName = document.fileName || document.name || "Untitled PDF";

    return (
        <motion.div
            variants={itemVariants}
            custom={index}
            whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? colors.bgAccent : "#F0F4FF" }}
            style={{
                backgroundColor: isSelected ? (isDarkMode ? colors.bgAccent : "#F0F4FF") : 'transparent',
                color: colors.textPrimary
            }}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all`}
            onClick={() => onClick && onClick(document)}
        >
            <div
                style={{ backgroundColor: isDarkMode ? "#4B5563" : "#EDF2F7" }}
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
            >
                <img src={isDarkMode ? DocIconDark : DocIcon} alt="Document" className="w-5 h-5" />
            </div>
            <div>
                <p style={{ color: colors.textPrimary }} className="font-medium">{fileName}</p>
                <p style={{ color: colors.textSecondary }} className="text-xs">{formatDate(document.$createdAt)}</p>
            </div>
        </motion.div>
    );
};

export default DocumentCard; 