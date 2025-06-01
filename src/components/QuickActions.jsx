import { motion } from 'framer-motion';
import ActionButton from './ActionButton';
import GenerateIcon from '../assets/icons/generate.svg';
import UploadIcon from '../assets/icons/upload.svg';

const QuickActions = () => {
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
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
            <ActionButton
                to="/generate"
                text="Generate QCM"
                icon={<img src={GenerateIcon} alt="Generate QCM" className="w-3 h-3 sm:w-4 sm:h-4" />}
            />

            <ActionButton
                to="/upload"
                text="Upload QCM"
                icon={<img src={UploadIcon} alt="Upload QCM" className="w-3 h-3 sm:w-4 sm:h-4" />}
            />
        </motion.div>
    );
};

export default QuickActions; 