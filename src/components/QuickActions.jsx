import { motion } from 'framer-motion';
import ActionButton from './ActionButton';
import GenerateIcon from '../assets/icons/generate.svg';
import UploadIcon from '../assets/icons/upload.svg';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';
import GenerateIconDark from '../assets/icons/generateDark.svg';
import UploadIconDark from '../assets/icons/uploadDark.svg';

const QuickActions = () => {
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const { isDarkMode } = useDarkMode();
    const { translate } = useLanguage();

    return (
        <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
            <ActionButton
                to="/generate"
                text="Generate QCM"
                icon={<img src={isDarkMode ? GenerateIconDark : GenerateIcon} alt={translate("Generate QCM")} className="w-3 h-3 sm:w-4 sm:h-4" />}
            />

            <ActionButton
                to="/upload"
                text="Upload Document"
                icon={<img src={isDarkMode ? UploadIconDark : UploadIcon} alt={translate("Upload Document")} className="w-3 h-3 sm:w-4 sm:h-4" />}
            />
        </motion.div>
    );
};

export default QuickActions; 