import { motion } from 'framer-motion';
import { useDarkMode } from '../lib/DarkModeContext';

const ProgressModule = ({ module, index, onPractice }) => {
    const { isDarkMode, colors } = useDarkMode();

    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 20 }
        }
    };

    // Get the actual values from the module
    const completedDocs = module.completedQcms || 0;

    // For display purposes, always show out of 10
    const displayTotal = 10;

    // Calculate progress percentage for the progress bar (based on saved QCMs)
    // If we have actual QCMs, use them for the progress percentage, otherwise use 0
    const progressPercentage = Math.min((module.savedQCMsCount || completedDocs) / displayTotal * 100, 100);

    return (
        <motion.div
            key={module.id}
            variants={cardVariants}
            style={{
                backgroundColor: colors.bgPrimary,
                color: colors.textPrimary,
                boxShadow: colors.shadow
            }}
            className={`rounded-2xl p-3 sm:p-5 md:p-7 flex flex-col min-w-[220px] sm:min-w-[250px] md:min-w-[280px] max-w-[340px] ${index === 0 ? 'w-72 sm:w-80 md:w-96' : 'w-64 sm:w-72 md:w-80'} cursor-pointer`}
            onClick={() => onPractice && onPractice(module)}
        >
            <h3 className="font-bold text-lg sm:text-xl mb-2 truncate">{module.name}</h3>
            <p style={{ color: colors.textSecondary }} className="text-xs sm:text-sm mb-3 sm:mb-5 line-clamp-2">{module.description}</p>
            <div className="mt-auto">
                <div className="flex items-center mt-3">
                    <div
                        className="flex-1 rounded-full h-2 overflow-hidden"
                        style={{ backgroundColor: isDarkMode ? "#4B5563" : "#EDF2F7" }}
                    >
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${progressPercentage}%`,
                                background: 'linear-gradient(to right, #00CAC3, #AF42F6)'
                            }}
                        ></div>
                    </div>
                    <span style={{ color: colors.textSecondary }} className="ml-2 text-xs">
                        {module.savedQCMsCount || completedDocs}/{displayTotal}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProgressModule; 