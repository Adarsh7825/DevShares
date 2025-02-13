// Music room state management
const musicRooms = new Map();

export const setupMusicHandlers = (io, socket) => {
    // Join music room
    socket.on('join-music-room', (roomId) => {
        socket.join(roomId);
        
        if (!musicRooms.has(roomId)) {
            musicRooms.set(roomId, {
                currentTrack: null,
                isPlaying: false,
                position: 0,
                participants: new Set()
            });
        }
        
        const room = musicRooms.get(roomId);
        room.participants.add(socket.id);
        
        // Send current state to new participant
        socket.emit('music-state-sync', {
            currentTrack: room.currentTrack,
            isPlaying: room.isPlaying,
            position: room.position
        });
        
        io.to(roomId).emit('participants-update', Array.from(room.participants));
    });

    // Handle play event
    socket.on('music-play', ({ roomId, track, position }) => {
        const room = musicRooms.get(roomId);
        if (room) {
            room.currentTrack = track;
            room.isPlaying = true;
            room.position = position;
            
            socket.to(roomId).emit('music-state-update', {
                isPlaying: true,
                track,
                position
            });
        }
    });

    // Handle pause event
    socket.on('music-pause', ({ roomId, position }) => {
        const room = musicRooms.get(roomId);
        if (room) {
            room.isPlaying = false;
            room.position = position;
            
            socket.to(roomId).emit('music-state-update', {
                isPlaying: false,
                position
            });
        }
    });

    // Handle seek event
    socket.on('music-seek', ({ roomId, position }) => {
        const room = musicRooms.get(roomId);
        if (room) {
            room.position = position;
            socket.to(roomId).emit('music-seek', { position });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        for (const [roomId, room] of musicRooms.entries()) {
            if (room.participants.has(socket.id)) {
                room.participants.delete(socket.id);
                io.to(roomId).emit('participants-update', Array.from(room.participants));
                
                if (room.participants.size === 0) {
                    musicRooms.delete(roomId);
                }
            }
        }
    });
}; 