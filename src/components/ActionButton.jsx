import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ActionButton = ({
    to,
    text,
    icon,
    color = "#AF42F6", // Default color
    onClick
}) => {
    // Use the onClick prop if provided, otherwise create a Link component
    const ButtonContent = (
        <motion.button
            whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(0, 202, 195, 0.1), 0 10px 25px rgba(175, 66, 246, 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full flex items-center justify-center gap-3 px-0 py-6 bg-[#F5F6FF] rounded-xl shadow hover:shadow-lg transition-all duration-300 text-2xl font-bold text-[#252525]"
            style={{
                backgroundImage: 'linear-gradient(#F5F6FF, #F5F6FF), linear-gradient(to right, #00CAC3, #AF42F6)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                backgroundSize: '100% 100%, 100% 100%',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'transparent'
            }}
        >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F6F8FC] mr-2"
                style={{
                    backgroundImage: 'linear-gradient(#F6F8FC, #F6F8FC), linear-gradient(to right, #00CAC3, #AF42F6)',
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