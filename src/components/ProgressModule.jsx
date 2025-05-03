import { motion } from 'framer-motion';

const ProgressModule = ({ module, index }) => {
    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 20 }
        }
    };

    return (
        <motion.div
            key={module.id}
            variants={cardVariants}
            className={`bg-[#F5F6FF] rounded-2xl p-7 flex flex-col min-w-[280px] max-w-[340px] ${index === 0 ? 'w-96' : 'w-80'} shadow-[0_10px_30px_rgba(0,0,0,0.03)]`}
        >
            <h3 className="font-bold text-xl mb-2">{module.title}</h3>
            <p className="text-gray-500 text-sm mb-5">{module.description}</p>
            <div className="mt-auto">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-[#AF42F6]">{module.progress}/{module.total}</span>
                </div>
                <motion.div
                    className="h-2.5 w-full bg-[#EAEFFB] rounded-full overflow-hidden"
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(module.progress / module.total) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 + (index * 0.2) }}
                        className="h-full rounded-full bg-gradient-to-r from-[#00CAC3] to-[#AF42F6]"
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProgressModule; 