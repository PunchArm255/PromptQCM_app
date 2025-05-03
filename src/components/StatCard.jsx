import { motion } from 'framer-motion';

const StatCard = ({ item, index, maxHours }) => {
    // Calculate the percentage but cap it at 100% (which is 20h)
    const MAX_HOURS = 20;
    const percentage = Math.min((item.hours / MAX_HOURS), 1);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + (index * 0.2), type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center"
        >
            <div className="relative w-36 h-36 mb-3">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E6E6E6" strokeWidth="10" />
                    <motion.path
                        d={`M50,10 A40,40 0 ${(percentage * 100) > 50 ? 1 : 0},1 ${50 + 40 * Math.sin(2 * Math.PI * percentage)
                            },${50 - 40 * Math.cos(2 * Math.PI * percentage)
                            }`}
                        fill="none"
                        stroke={index === 0 ? 'url(#gradient1)' : index === 1 ? 'url(#gradient2)' : '#9CA3AF'}
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
                        <linearGradient id="textGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00CAC3" />
                            <stop offset="100%" stopColor="#AF42F6" />
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
                        className="text-3xl font-bold"
                        style={{
                            background: index === 0 ? 'linear-gradient(to right, #00CAC3, #AF42F6)' :
                                index === 1 ? 'linear-gradient(to right, #3B82F6, #8B5CF6)' :
                                    '#9CA3AF',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {item.hours}h
                    </span>
                </motion.div>
            </div>
            <p className="text-center text-base font-medium text-[#252525]">{item.title}</p>
            <p className="text-center text-xs text-gray-400">of 20h</p>
        </motion.div>
    );
};

export default StatCard; 