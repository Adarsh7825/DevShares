import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <nav className="bg-black/50 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
                    <span className="text-white font-medium">DevShare</span>
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            DevShare
                        </h1>
                        <p className="text-white/40">
                            Share your screen or code in real-time
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Screen Share Section */}
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

                        {/* Code Share Section */}
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

                        {/* File Share Section */}
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
                    </div>
                </div>
            </main>

            <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-center">
                    <span className="text-white/40 text-sm">
                        Simple and secure sharing platform
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default Home;