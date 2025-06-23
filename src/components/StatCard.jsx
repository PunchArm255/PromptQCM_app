import { motion } from 'framer-motion';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';

const StatCard = ({
    item,
    index,
    maxHours
}) => {
    const { isDarkMode, colors } = useDarkMode();
    const { translate } = useLanguage();

    // Calculate the percentage but cap it at 100% (which is 20h)
    const MAX_HOURS = 20;
    const percentage = Math.min((item.hours / MAX_HOURS), 1);

    // Determine gradient for the circle based on index
    const getGradientId = (idx) => {
        switch (idx) {
            case 0: return 'url(#gradient1)'; // Technologie du Web
            case 1: return 'url(#gradient2)'; // C++
            case 2: return 'url(#gradient3)'; // Java
            default: return 'url(#gradient1)';
        }
    };

    // Determine gradient for the text based on index
    const getTextGradient = (idx) => {
        switch (idx) {
            case 0: return 'linear-gradient(to right, #00CAC3, #AF42F6)';
            case 1: return 'linear-gradient(to right, #3B82F6, #8B5CF6)';
            case 2: return 'linear-gradient(to right, #F472B6, #EC4899)';
            default: return 'linear-gradient(to right, #00CAC3, #AF42F6)';
        }
    };

    // Background color for track circle
    const circleTrackColor = isDarkMode ? colors.bgAccent : "#E6E6E6";

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + (index * 0.2), type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center"
        >
            <div className="relative w-28 sm:w-32 md:w-36 h-28 sm:h-32 md:h-36 mb-3">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke={circleTrackColor} strokeWidth="10" />
                    <motion.path
                        d={`M50,10 A40,40 0 ${(percentage * 100) > 50 ? 1 : 0},1 ${50 + 40 * Math.sin(2 * Math.PI * percentage)
                            },${50 - 40 * Math.cos(2 * Math.PI * percentage)
                            }`}
                        fill="none"
                        stroke={getGradientId(index)}
                        strokeWidth="10"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: percentage }}
                        transition={{ duration: 1.5, delay: 0.5 + (index * 0.2), ease: "easeOut" }}
                    />
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00CAC3" />
                            <stop offset="100%" stopColor="#AF42F6" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F472B6" />
                            <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                    </defs>
                </svg>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + (index * 0.2) }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <span
                        className="text-2xl sm:text-3xl font-bold"
                        style={{
                            background: getTextGradient(index),
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {item.timeDisplay || `${item.hours}h`}
                    </span>
                </motion.div>
            </div>
            <p style={{ color: colors.textPrimary }} className="text-center text-sm sm:text-base font-medium">{translate(item.title)}</p>
            <p style={{ color: colors.textSecondary }} className="text-center text-xs">{translate("of 20h")}</p>
        </motion.div>
    );
};

export default StatCard;