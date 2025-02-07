import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroBackground from './HeroBackground';

function Home() {
    const [roomId, setRoomId] = useState('');
    const [roomIdforcodeshare, setRoomIdforcodeshare] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const generateRoomId = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const createRoom = () => {
        const newRoomId = generateRoomId();
        navigate(`/room/${newRoomId}`);
    };

    const handleRoomIdChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only allow digits, max 4
        setRoomId(value);
        setError('');
    };

    const handleRoomIdforcodeshare = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only allow digits, max 4
        setRoomIdforcodeshare(value);
        setError('');
    }

    const validateAndJoin = (e, asViewer = false) => {
        e.preventDefault();
        if (roomId.length !== 4) {
            setError('Room ID must be 4 digits');
            return;
        }
        navigate(asViewer ? `/view/${roomId}` : `/room/${roomId}`);
    };

    const joinRoom = (e) => validateAndJoin(e, false);
    const joinAsViewer = (e) => validateAndJoin(e, true);

    const scrollToSharing = () => {
        const sharingSection = document.getElementById('sharing-options');
        sharingSection.scrollIntoView({ behavior: 'smooth' });
    };

    const features = [
        {
            title: "Real-time Screen Sharing",
            description: "Share your screen instantly with multiple viewers in high quality",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: "Collaborative Code Editor",
            description: "Write and edit code together in real-time with syntax highlighting",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        },
        {
            title: "Secure File Sharing",
            description: "Share files securely with end-to-end encryption",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <HeroBackground />

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10 z-50"
            >
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <span className="text-white font-medium">DevShare</span>
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/Adarsh7825/DevShares.git" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                            GitHub
                        </a>
                        <a href="#features" className="text-white/60 hover:text-white transition-colors">
                            Features
                        </a>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                            Share. Collaborate. Create.
                        </h1>
                        <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                            DevShare is your all-in-one platform for real-time screen sharing,
                            collaborative coding, and secure file sharing.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={scrollToSharing}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium text-lg shadow-lg shadow-purple-500/20"
                        >
                            Start Sharing Now
                        </motion.button>
                    </motion.div>

                    {/* Features Grid */}
                    <div id="features" className="grid md:grid-cols-3 gap-8 mb-20">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                            >
                                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Content (Existing Sections) */}
                    <div id="sharing-options" className="grid md:grid-cols-3 gap-8 scroll-mt-20">
                        {/* Screen Share Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                        >
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold text-white mb-2">Screen Share</h2>
                                    <p className="text-white/40 text-sm">
                                        Share your screen instantly with others
                                    </p>
                                </div>

                                <button
                                    onClick={createRoom}
                                    className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                                    </svg>
                                    Create Screen Room
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-black px-4 text-sm text-white/40">or join existing</span>
                                    </div>
                                </div>

                                <form onSubmit={joinRoom} className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            value={roomId}
                                            onChange={handleRoomIdChange}
                                            placeholder="Enter 4-digit Room ID"
                                            className="w-full bg-white/5 text-white placeholder-white/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 text-center text-2xl tracking-wider"
                                            maxLength={4}
                                        />
                                        {error && (
                                            <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                                    >
                                        Join Room
                                    </button>

                                    <button
                                        onClick={joinAsViewer}
                                        type="button"
                                        className="w-full bg-transparent hover:bg-white/5 text-white/60 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                                    >
                                        Join as Viewer
                                    </button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Code Share Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                        >
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold text-white mb-2">Code Share</h2>
                                    <p className="text-white/40 text-sm">
                                        Collaborate on code in real-time
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        const newRoomId = generateRoomId();
                                        navigate(`/code/${newRoomId}`);
                                    }}
                                    className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Create Code Room
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-black px-4 text-sm text-white/40">or join existing</span>
                                    </div>
                                </div>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    if (roomIdforcodeshare.length === 4) {
                                        navigate(`/code/${roomIdforcodeshare}`);
                                    }
                                }} className="space-y-3">
                                    <input
                                        type="text"
                                        value={roomIdforcodeshare}
                                        onChange={handleRoomIdforcodeshare}
                                        placeholder="Enter 4-digit Room ID"
                                        className="w-full bg-white/5 text-white placeholder-white/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 text-center text-2xl tracking-wider"
                                        maxLength={4}
                                    />

                                    <button
                                        type="submit"
                                        className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                                    >
                                        Join Code Room
                                    </button>
                                </form>
                            </div>
                        </motion.div>

                        {/* File Share Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                        >
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold text-white mb-2">File Share</h2>
                                    <p className="text-white/40 text-sm">
                                        Share files securely with others
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        navigate(`/fileshare`);
                                    }}
                                    className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    File Share
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-black/50 backdrop-blur-sm border-t border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">DevShare</h3>
                            <p className="text-white/60">
                                Simple and secure sharing platform for developers.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Links</h3>
                            <ul className="space-y-2 text-white/60">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="https://github.com/Adarsh7825/DevShares.git" className="hover:text-white transition-colors">GitHub</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <p className="text-white/60">
                                Have questions? Reach out to us at<br />
                                <a href="mailto:support@devshare.com" className="text-blue-400 hover:text-blue-300">
                                    support@devshare.com
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40">
                        <p>© {new Date().getFullYear()} DevShare. All rights reserved.</p>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
}

export default Home;