import { useState } from 'react';
import { motion } from 'framer-motion';
import StatCard from './StatCard';

const ReportCard = ({ reportData }) => {
    const [selectedMonth, setSelectedMonth] = useState('Last 30 days');

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
            variants={cardVariants}
            className="bg-[#F5F6FF] rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col"
        >
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold text-[#252525]">Total hours spent</h2>
                <div className="flex gap-2">
                    {['Last 7 days', 'Last 30 days', 'All time'].map((period, index) => (
                        <motion.button
                            key={period}
                            whileHover={{ backgroundColor: selectedMonth === period ? "#F6F8FC" : "#EAEFFB" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedMonth(period)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedMonth === period
                                ? "bg-[#F6F8FC] text-[#AF42F6] border border-[#E0E7EF]"
                                : "bg-[#EAEFFB] text-[#6B7280]"
                                }`}
                        >
                            {period}
                        </motion.button>
                    ))}
                </div>
            </div>
            <div className="flex justify-around items-center mt-2">
                {reportData.map((item, index) => (
                    <StatCard key={index} item={item} index={index} />
                ))}
            </div>
        </motion.div>
    );
};

export default ReportCard; 