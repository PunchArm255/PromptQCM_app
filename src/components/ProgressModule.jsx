import { motion } from 'framer-motion';

const ProgressModule = ({ module, index, onPractice }) => {
    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 20 }
        }
    };

    // Calculate completion based on a fixed denominator of 10
    const completedDocs = module.completedQcms || 0;

    // For display purposes, show completed QCMs out of 10
    const displayTotal = 10;

    // Calculate progress percentage based on actual QCM count for the progress bar
    const totalQcms = module.qcmCount || 1;
    const progressPercentage = Math.min((completedDocs / totalQcms) * 100, 100);

    return (
        <motion.div
            key={module.id}
            variants={cardVariants}
            className={`bg-[#F5F6FF] rounded-2xl p-3 sm:p-5 md:p-7 flex flex-col min-w-[220px] sm:min-w-[250px] md:min-w-[280px] max-w-[340px] ${index === 0 ? 'w-72 sm:w-80 md:w-96' : 'w-64 sm:w-72 md:w-80'} shadow-[0_10px_30px_rgba(0,0,0,0.03)] cursor-pointer`}
            onClick={() => onPractice && onPractice(module)}
        >
            <h3 className="font-bold text-lg sm:text-xl mb-2 truncate">{module.name}</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-5 line-clamp-2">{module.description}</p>
            <div className="mt-auto">
                <div className="flex items-center mt-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${progressPercentage}%`,
                                background: 'linear-gradient(to right, #00CAC3, #AF42F6)'
                            }}
                        ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                        {completedDocs}/{displayTotal}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProgressModule; 