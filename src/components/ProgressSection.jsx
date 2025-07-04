import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';
import ProgressModule from './ProgressModule';

const ProgressSection = ({ modules, onPractice }) => {
    const scrollRef = useRef(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
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

            // Update active slide for indicators on mobile
            if (isMobile) {
                const newSlide = direction === 'left'
                    ? Math.max(0, activeSlide - 1)
                    : Math.min(modules.length - 1, activeSlide + 1);
                setActiveSlide(newSlide);

                // Scroll to the specific card
                const cardWidth = 220 + 16; // card width + gap
                current.scrollTo({
                    left: newSlide * cardWidth,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Go to specific slide (for dot indicators)
    const goToSlide = (index) => {
        if (scrollRef.current) {
            setActiveSlide(index);
            const cardWidth = 220 + 16; // card width + gap
            scrollRef.current.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            className="mb-8"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 style={{ color: colors.textPrimary }} className="text-xl font-bold">{translate("Progress")}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        style={{
                            backgroundColor: colors.bgPrimary,
                            color: colors.textPrimary
                        }}
                        className="p-2 rounded-full shadow-sm hover:bg-opacity-80 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        style={{
                            backgroundColor: colors.bgPrimary,
                            color: colors.textPrimary
                        }}
                        className="p-2 rounded-full shadow-sm hover:bg-opacity-80 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <Link to="/modules">
                        <motion.div
                            whileHover={{ opacity: 0.9 }}
                            style={{
                                backgroundColor: colors.bgPrimary,
                                color: colors.purple
                            }}
                            className="font-semibold py-2 px-4 rounded-lg shadow-sm ml-2"
                        >
                            {translate("View All")}
                        </motion.div>
                    </Link>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 py-2 snap-x"
            >
                {modules.map((module, index) => (
                    <div key={module.id} className="snap-start">
                        <ProgressModule module={module} index={index} onPractice={onPractice} />
                    </div>
                ))}
            </div>

            {/* Mobile Carousel Indicators */}
            {isMobile && modules.length > 1 && (
                <div className="flex justify-center gap-2 mt-1">
                    {modules.map((_, index) => (
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
        </motion.div>
    );
};

export default ProgressSection; 