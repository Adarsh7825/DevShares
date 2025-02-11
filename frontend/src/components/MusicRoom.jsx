import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { useSocket } from '../context/SocketContext';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const MusicRoom = ({ roomId }) => {
    const { socket } = useSocket();
    const {
        currentTrack,
        isPlaying,
        volume,
        searchTracks,
        playTrack,
        pauseTrack,
        resumeTrack,
        seekToPosition,
        setAudioVolume,
        getCurrentTime,
        getDuration
    } = useMusic();

    const [room, setRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef(null);

    useEffect(() => {
        if (socket && roomId) {
            socket.emit('join-music-room', roomId);

            socket.on('music-room-update', (updatedRoom) => {
                setRoom(updatedRoom);
            });

            socket.on('music-state-update', async ({ isPlaying, track, position }) => {
                try {
                    if (isPlaying) {
                        await playTrack(track);
                        seekToPosition(position);
                    } else {
                        pauseTrack();
                    }
                } catch (error) {
                    console.error('Playback error:', error);
                }
            });

            socket.on('music-seek', ({ position }) => {
                seekToPosition(position);
            });

            return () => {
                socket.emit('leave-music-room', roomId);
                socket.off('music-room-update');
                socket.off('music-state-update');
                socket.off('music-seek');
            };
        }
    }, [socket, roomId]);

    // Update progress bar
    useEffect(() => {
        if (isPlaying) {
            progressInterval.current = setInterval(() => {
                const currentTime = getCurrentTime();
                const duration = getDuration();
                if (duration) {
                    setProgress((currentTime / duration) * 100);
                }
            }, 1000);
        } else {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isPlaying]);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setError(null);

        try {
            const results = await searchTracks(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to search tracks. Please try again.');
        }
    };

    const handlePlay = async (track) => {
        setError(null);

        try {
            await playTrack(track);
            socket.emit('music-play', {
                roomId,
                track,
                position: 0
            });
        } catch (error) {
            console.error('Play error:', error);
            setError('Failed to play track. Please try again.');
        }
    };

    const handlePause = () => {
        try {
            pauseTrack();
            socket.emit('music-pause', {
                roomId,
                position: getCurrentTime()
            });
        } catch (error) {
            console.error('Pause error:', error);
            setError('Failed to pause track. Please try again.');
        }
    };

    const handleSeek = (e) => {
        const clickPosition = e.nativeEvent.offsetX / e.target.offsetWidth;
        const newPosition = clickPosition * getDuration();
        seekToPosition(newPosition);
        socket.emit('music-seek', {
            roomId,
            position: newPosition
        });
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setAudioVolume(newVolume);
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Music Room</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-500 text-white rounded">
                    {error}
                </div>
            )}

            {/* Search Section */}
            <div className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search for songs..."
                        className="flex-1 p-2 rounded bg-gray-700 text-white"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Search
                    </button>
                </div>

                {/* Search Results */}
                <div className="mt-4 space-y-2">
                    {searchResults.map((track) => (
                        <div
                            key={track.id}
                            className="flex items-center justify-between p-2 bg-gray-700 rounded"
                        >
                            <div className="flex items-center gap-2">
                                <img
                                    src={track.thumbnail}
                                    alt={track.name}
                                    className="w-10 h-10 rounded"
                                />
                                <div>
                                    <p className="text-white font-medium">{track.name}</p>
                                    <p className="text-gray-400 text-sm">
                                        {track.channelTitle}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handlePlay(track)}
                                className="p-2 text-green-500 hover:text-green-400"
                            >
                                <FaPlay />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Playback Controls */}
            {currentTrack && (
                <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={currentTrack.thumbnail}
                                alt="Thumbnail"
                                className="w-16 h-16 rounded"
                            />
                            <div>
                                <p className="text-white font-medium">
                                    {currentTrack.name}
                                </p>
                                <p className="text-gray-400">
                                    {currentTrack.channelTitle}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => seekToPosition(getCurrentTime() - 10)}
                                className="text-white hover:text-green-500"
                            >
                                <FaBackward />
                            </button>
                            <button
                                onClick={isPlaying ? handlePause : resumeTrack}
                                className="text-white hover:text-green-500"
                            >
                                {isPlaying ? <FaPause /> : <FaPlay />}
                            </button>
                            <button
                                onClick={() => seekToPosition(getCurrentTime() + 10)}
                                className="text-white hover:text-green-500"
                            >
                                <FaForward />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="relative w-full h-1 bg-gray-600 rounded cursor-pointer"
                        onClick={handleSeek}
                    >
                        <div
                            className="absolute h-full bg-green-500 rounded"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => setAudioVolume(volume === 0 ? 100 : 0)}
                            className="text-white hover:text-green-500"
                        >
                            {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24"
                        />
                    </div>
                </div>
            )}

            {/* Room Participants */}
            <div className="mt-6">
                <h3 className="text-white font-medium mb-2">Participants</h3>
                <div className="flex flex-wrap gap-2">
                    {room?.participants.map((participantId) => (
                        <div
                            key={participantId}
                            className="px-3 py-1 bg-gray-700 rounded-full text-white text-sm"
                        >
                            {participantId.slice(0, 6)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MusicRoom;