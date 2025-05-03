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
            className="flex gap-6 mb-8"
        >
            <ActionButton
                to="/generate-qcm"
                text="Generate QCM"
                icon={<img src={GenerateIcon} alt="Generate QCM" className="w-4 h-4" />}
            />

            <ActionButton
                to="/upload-qcm"
                text="Upload QCM"
                icon={<img src={UploadIcon} alt="Upload QCM" className="w-4 h-4" />}
            />
        </motion.div>
    );
};

export default QuickActions; 