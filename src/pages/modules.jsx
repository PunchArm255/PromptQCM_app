import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiSettings, FiPlus, FiTrash2, FiX, FiEdit, FiFilter, FiGrid } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

export const Modules = () => {
    const { user } = useOutletContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [establishments, setEstablishments] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedEstablishment, setSelectedEstablishment] = useState('all');

    const [isAddingEstablishment, setIsAddingEstablishment] = useState(false);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newEstablishment, setNewEstablishment] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    // New module state
    const [newModule, setNewModule] = useState({
        name: '',
        description: '',
        type: '',
        establishmentId: null
    });

    useEffect(() => {
        // Load establishments from localStorage
        const storedEstablishments = localStorage.getItem('qcm_establishments');
        if (storedEstablishments) {
            setEstablishments(JSON.parse(storedEstablishments));
        } else {
            // Initial mock data if none exist
            const initialEstablishments = [
                { id: 1, name: 'University of Computer Science' },
                { id: 2, name: 'Business School' }
            ];
            setEstablishments(initialEstablishments);
            localStorage.setItem('qcm_establishments', JSON.stringify(initialEstablishments));
        }

        // Load modules from localStorage
        const storedModules = localStorage.getItem('qcm_modules');
        if (storedModules) {
            setModules(JSON.parse(storedModules));
        } else {
            // Initial mock data if none exist
            const initialModules = [
                {
                    id: 1,
                    name: 'Web Development',
                    description: 'HTML, CSS, JavaScript fundamentals',
                    type: 'Computer Science',
                    establishmentId: 1,
                    completedDocs: 5,
                    totalDocs: 10,
                    docs: []
                },
                {
                    id: 2,
                    name: 'Data Structures',
                    description: 'Algorithms and data structures',
                    type: 'Computer Science',
                    establishmentId: 1,
                    completedDocs: 3,
                    totalDocs: 8,
                    docs: []
                },
                {
                    id: 3,
                    name: 'Marketing Fundamentals',
                    description: 'Introduction to marketing concepts',
                    type: 'Business',
                    establishmentId: 2,
                    completedDocs: 2,
                    totalDocs: 5,
                    docs: []
                }
            ];
            setModules(initialModules);
            localStorage.setItem('qcm_modules', JSON.stringify(initialModules));
        }
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    const addEstablishment = () => {
        if (newEstablishment.trim()) {
            const newEstablishmentObj = {
                id: Date.now(),
                name: newEstablishment
            };

            const updatedEstablishments = [...establishments, newEstablishmentObj];
            setEstablishments(updatedEstablishments);
            localStorage.setItem('qcm_establishments', JSON.stringify(updatedEstablishments));

            setNewEstablishment('');
            setIsAddingEstablishment(false);
        }
    };

    const addModule = () => {
        if (newModule.name.trim() && newModule.description.trim() && newModule.type.trim() && newModule.establishmentId) {
            const newModuleObj = {
                id: Date.now(),
                name: newModule.name,
                description: newModule.description,
                type: newModule.type,
                establishmentId: newModule.establishmentId,
                completedDocs: 0,
                totalDocs: 0,
                docs: []
            };

            const updatedModules = [...modules, newModuleObj];
            setModules(updatedModules);
            localStorage.setItem('qcm_modules', JSON.stringify(updatedModules));

            // Reset form
            setNewModule({
                name: '',
                description: '',
                type: '',
                establishmentId: null
            });
            setIsAddingModule(false);
        }
    };

    const openAddModuleModal = () => {
        // If there are no establishments, show the add establishment modal first
        if (establishments.length === 0) {
            setIsAddingEstablishment(true);
        } else {
            // Preselect the first establishment or the currently selected one
            setNewModule(prev => ({
                ...prev,
                establishmentId: selectedEstablishment === 'all' ? establishments[0].id : parseInt(selectedEstablishment)
            }));
            setIsAddingModule(true);
        }
    };

    const toggleItemSelection = (type, id) => {
        const itemKey = `${type}-${id}`;
        if (selectedItems.includes(itemKey)) {
            setSelectedItems(selectedItems.filter(item => item !== itemKey));
        } else {
            setSelectedItems([...selectedItems, itemKey]);
        }
    };

    const deleteSelectedItems = () => {
        let updatedEstablishments = [...establishments];
        let updatedModules = [...modules];

        // Process deletions
        selectedItems.forEach(item => {
            const [type, idStr] = item.split('-');
            const id = parseInt(idStr);

            if (type === 'establishment') {
                // Delete establishment
                updatedEstablishments = updatedEstablishments.filter(est => est.id !== id);
                // Also delete all modules from this establishment
                updatedModules = updatedModules.filter(mod => mod.establishmentId !== id);
            } else if (type === 'module') {
                // Delete module
                updatedModules = updatedModules.filter(mod => mod.id !== id);
            }
        });

        // Update state and localStorage
        setEstablishments(updatedEstablishments);
        setModules(updatedModules);
        localStorage.setItem('qcm_establishments', JSON.stringify(updatedEstablishments));
        localStorage.setItem('qcm_modules', JSON.stringify(updatedModules));

        // Reset selected items and close settings
        setSelectedItems([]);
        setShowSettings(false);
    };

    // Filter modules based on selected establishment
    const filteredModules = selectedEstablishment === 'all'
        ? modules
        : modules.filter(module => module.establishmentId === parseInt(selectedEstablishment));

    // Animation configs
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const modalVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 500
            }
        },
        exit: {
            y: 20,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    greeting="Modules"
                    showExclamation={false}
                    onSearch={handleSearch}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2.5 rounded-full ${showSettings ? 'bg-[#AF42F6] text-white' : 'bg-[#F6F8FC] text-[#252525]'}`}
                >
                    <FiSettings size={20} />
                </motion.button>
            </div>

            {/* Modules Content */}
            <div className="bg-[#F5F6FF] rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                {/* Settings Mode */}
                {showSettings && (
                    <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#F6F8FC] rounded-xl">
                        <div>
                            <h3 className="font-semibold text-[#252525] mb-1">Module Settings</h3>
                            <p className="text-sm text-gray-500">{selectedItems.length} items selected</p>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={deleteSelectedItems}
                                disabled={selectedItems.length === 0}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${selectedItems.length === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-100 text-red-600'}`}
                            >
                                <FiTrash2 size={16} />
                                <span>Delete</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowSettings(false)}
                                className="bg-[#EAEFFB] text-[#252525] px-4 py-2 rounded-lg flex items-center gap-1.5"
                            >
                                <FiX size={16} />
                                <span>Close</span>
                            </motion.button>
                        </div>
                    </div>
                )}

                {/* Establishments Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold text-[#252525] mr-2">Establishments</h2>
                            <FiFilter className="text-gray-400" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsAddingEstablishment(true)}
                                className="bg-[#F6F8FC] text-[#AF42F6] px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                            >
                                <FiPlus size={16} />
                                <span>Add Establishment</span>
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <motion.button
                            whileHover={{ backgroundColor: selectedEstablishment === 'all' ? "#F6F8FC" : "#EAEFFB" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedEstablishment('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedEstablishment === 'all'
                                    ? "bg-[#F6F8FC] text-[#AF42F6] border border-[#E0E7EF]"
                                    : "bg-[#EAEFFB] text-[#6B7280]"
                                }`}
                        >
                            All Establishments
                        </motion.button>

                        {establishments.map((establishment) => (
                            <motion.div
                                key={establishment.id}
                                className="relative"
                                onClick={() => showSettings
                                    ? toggleItemSelection('establishment', establishment.id)
                                    : setSelectedEstablishment(establishment.id.toString())
                                }
                            >
                                <motion.button
                                    whileHover={{ backgroundColor: selectedEstablishment === establishment.id.toString() ? "#F6F8FC" : "#EAEFFB" }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedEstablishment === establishment.id.toString()
                                            ? "bg-[#F6F8FC] text-[#AF42F6] border border-[#E0E7EF]"
                                            : "bg-[#EAEFFB] text-[#6B7280]"
                                        } ${showSettings && selectedItems.includes(`establishment-${establishment.id}`)
                                            ? 'border-2 border-[#AF42F6]'
                                            : ''
                                        }`}
                                >
                                    {establishment.name}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Modules Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[#252525]">Modules</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openAddModuleModal}
                            className="bg-[#F6F8FC] text-[#AF42F6] px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                            <FiPlus size={16} />
                            <span>Add Module</span>
                        </motion.button>
                    </div>

                    {filteredModules.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredModules.map((module) => (
                                <motion.div
                                    key={module.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    className={`bg-white rounded-xl p-5 shadow-sm ${showSettings && selectedItems.includes(`module-${module.id}`)
                                            ? 'border-2 border-[#AF42F6]'
                                            : ''
                                        }`}
                                    onClick={() => showSettings
                                        ? toggleItemSelection('module', module.id)
                                        : console.log('Navigate to module', module.id)
                                    }
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-[#252525]">{module.name}</h3>
                                        <span className="px-2 py-1 bg-[#EAEFFB] text-xs rounded-lg text-[#6B7280]">
                                            {module.type}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{module.description}</p>

                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-[#6B7280]">Progress</span>
                                        <span className="font-semibold text-[#AF42F6]">
                                            {module.completedDocs}/{module.totalDocs} QCMs
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-[#EAEFFB] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(module.completedDocs / (module.totalDocs || 1)) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full bg-gradient-to-r from-[#00CAC3] to-[#AF42F6]"
                                        />
                                    </div>

                                    {/* Establishment tag */}
                                    <div className="mt-4 flex items-center">
                                        <FiGrid size={14} className="text-gray-400 mr-1.5" />
                                        <span className="text-xs text-gray-500">
                                            {establishments.find(e => e.id === module.establishmentId)?.name || 'Unknown'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center">
                            <div className="text-gray-400 mb-2">
                                <FiGrid size={40} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#252525] mb-1">No modules found</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                {selectedEstablishment === 'all'
                                    ? 'You haven\'t created any modules yet.'
                                    : 'No modules in this establishment.'}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={openAddModuleModal}
                                className="bg-[#F6F8FC] text-[#AF42F6] px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
                            >
                                <FiPlus size={16} />
                                <span>Add Module</span>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Establishment Modal */}
            <AnimatePresence>
                {isAddingEstablishment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold text-[#252525] mb-4">Add Establishment</h3>
                            <div className="mb-4">
                                <label htmlFor="establishmentName" className="block text-sm font-medium text-gray-700 mb-1">Establishment Name</label>
                                <input
                                    type="text"
                                    id="establishmentName"
                                    value={newEstablishment}
                                    onChange={(e) => setNewEstablishment(e.target.value)}
                                    placeholder="Enter establishment name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAddingEstablishment(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addEstablishment}
                                    disabled={!newEstablishment.trim()}
                                    className={`px-4 py-2 rounded-lg text-white ${!newEstablishment.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#AF42F6]'}`}
                                >
                                    Add Establishment
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Module Modal */}
            <AnimatePresence>
                {isAddingModule && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold text-[#252525] mb-4">Add Module</h3>

                            <div className="mb-4">
                                <label htmlFor="moduleName" className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                                <input
                                    type="text"
                                    id="moduleName"
                                    value={newModule.name}
                                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                                    placeholder="Enter module name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="moduleDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="moduleDescription"
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                    placeholder="Enter module description"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="moduleType" className="block text-sm font-medium text-gray-700 mb-1">Module Type</label>
                                <input
                                    type="text"
                                    id="moduleType"
                                    value={newModule.type}
                                    onChange={(e) => setNewModule({ ...newModule, type: e.target.value })}
                                    placeholder="e.g. Mathematics, Physics, Computer Science"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="establishmentSelect" className="block text-sm font-medium text-gray-700 mb-1">Establishment</label>
                                <select
                                    id="establishmentSelect"
                                    value={newModule.establishmentId || ''}
                                    onChange={(e) => setNewModule({ ...newModule, establishmentId: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                >
                                    <option value="">Select an establishment</option>
                                    {establishments.map(establishment => (
                                        <option key={establishment.id} value={establishment.id}>
                                            {establishment.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAddingModule(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addModule}
                                    disabled={!newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId}
                                    className={`px-4 py-2 rounded-lg text-white ${!newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#AF42F6]'
                                        }`}
                                >
                                    Add Module
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Modules;