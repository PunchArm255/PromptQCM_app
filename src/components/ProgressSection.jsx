import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProgressModule from './ProgressModule';

const ProgressSection = ({ modules }) => {
    const scrollRef = useRef(null);

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    // Function to scroll horizontally when arrows are clicked
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="mb-8"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#252525]">Progress</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-[#F5F6FF] shadow-sm hover:bg-[#F6F8FC] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-[#F5F6FF] shadow-sm hover:bg-[#F6F8FC] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <Link to="/modules">
                        <motion.div
                            whileHover={{ backgroundColor: "#F6F8FC" }}
                            className="text-[#AF42F6] font-semibold py-2 px-4 rounded-lg shadow-sm bg-[#F5F6FF] ml-2"
                        >
                            View All
                        </motion.div>
                    </Link>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 py-2"
            >
                {modules.map((module, index) => (
                    <ProgressModule key={module.id} module={module} index={index} />
                ))}
            </div>
        </motion.div>
    );
};

export default ProgressSection; 