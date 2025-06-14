import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../lib/DarkModeContext';

const ActionButton = ({
    to,
    text,
    icon,
    color = "#AF42F6", // Default color
    onClick
}) => {
    const { isDarkMode, colors } = useDarkMode();

    // Use the onClick prop if provided, otherwise create a Link component
    const ButtonContent = (
        <motion.button
            whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(0, 202, 195, 0.1), 0 10px 25px rgba(175, 66, 246, 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full flex items-center justify-center gap-3 px-3 sm:px-0 py-4 sm:py-6 rounded-xl shadow hover:shadow-lg transition-all duration-300 text-base sm:text-2xl font-bold"
            style={{
                backgroundColor: colors.bgPrimary,
                color: colors.textPrimary,
                backgroundImage: `linear-gradient(${colors.bgPrimary}, ${colors.bgPrimary}), linear-gradient(to right, #00CAC3, #AF42F6)`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                backgroundSize: '100% 100%, 100% 100%',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'transparent'
            }}
        >
            <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-1 sm:mr-2"
                style={{
                    backgroundColor: colors.bgAccent,
                    backgroundImage: `linear-gradient(${colors.bgAccent}, ${colors.bgAccent}), linear-gradient(to right, #00CAC3, #AF42F6)`,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    backgroundSize: '100% 100%, 100% 100%',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: 'transparent'
                }}
            >
                {icon}
            </span>
            {text}
        </motion.button>
    );

    if (onClick) {
        return ButtonContent;
    }

    return (
        <Link to={to} className="flex-1">
            {ButtonContent}
        </Link>
    );
};

export default ActionButton; 