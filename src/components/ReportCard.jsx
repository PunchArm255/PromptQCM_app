import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';
import StatCard from './StatCard';

const ReportCard = ({ reportData }) => {
    const [selectedMonth, setSelectedMonth] = useState('Last 30 days');
    const [isMobile, setIsMobile] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollRef = useRef(null);
    const { colors } = useDarkMode();
    const { translate } = useLanguage();

    useEffect(() => {
        // Check if viewport is mobile
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 20 }
        }
    };

    // Function to scroll to specific slide
    const goToSlide = (index) => {
        if (scrollRef.current) {
            setActiveSlide(index);
            const cardWidth = 156; // width of stat card + margin
            scrollRef.current.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            style={{
                backgroundColor: colors.bgPrimary,
                boxShadow: colors.shadow
            }}
            className="rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col"
        >
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 md:mb-10">
                <h2 style={{ color: colors.textPrimary }} className="text-xl font-bold mb-3 md:mb-0">{translate("Total hours spent")}</h2>
                <div className="flex flex-wrap gap-2">
                    {['Last 7 days', 'Last 30 days', 'All time'].map((period, index) => (
                        <motion.button
                            key={period}
                            whileHover={{ opacity: 0.9 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedMonth(period)}
                            style={{
                                backgroundColor: selectedMonth === period ? colors.bgAccent : colors.bgElevated,
                                color: selectedMonth === period ? colors.purple : colors.textSecondary,
                                borderColor: selectedMonth === period ? colors.borderColor : 'transparent'
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedMonth === period ? "border" : ""
                                }`}
                        >
                            {translate(period)}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Mobile Carousel or Desktop View */}
            <div className={`${isMobile ? 'mt-2' : 'mt-6'}`}>
                <div
                    ref={scrollRef}
                    className={`
                        ${isMobile ? 'flex overflow-x-auto hide-scrollbar snap-x pb-4' : 'flex justify-around items-center'}
                    `}
                >
                    {reportData.map((item, index) => (
                        <div key={index} className={`${isMobile ? 'snap-center min-w-[12rem] flex justify-center' : ''}`}>
                            <StatCard item={item} index={index} />
                        </div>
                    ))}
                </div>

                {/* Mobile Carousel Indicators */}
                {isMobile && reportData.length > 1 && (
                    <div className="flex justify-center gap-2 mt-3">
                        {reportData.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all ${activeSlide === index ? 'w-6' : 'w-2'}`}
                                style={{
                                    backgroundColor: activeSlide === index ? colors.purple : colors.bgAccent
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ReportCard; 