import express from 'express';
const router = express.Router();

// Store active music rooms
const musicRooms = new Map();

// Create a new music room
router.post('/create', (req, res) => {
    const { roomName, createdBy } = req.body;
    const roomId = Math.random().toString(36).substring(7);

    musicRooms.set(roomId, {
        roomName,
        createdBy,
        currentTrack: null,
        isPlaying: false,
        participants: [],
        playlist: [],
        currentPosition: 0
    });

    res.json({ roomId, room: musicRooms.get(roomId) });
});

// Get all active rooms
router.get('/rooms', (req, res) => {
    const rooms = Array.from(musicRooms.entries()).map(([id, room]) => ({
        id,
        ...room
    }));
    res.json(rooms);
});

// Get specific room details
router.get('/room/:roomId', (req, res) => {
    const room = musicRooms.get(req.params.roomId);
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
});

// Update room playlist
router.post('/room/:roomId/playlist', (req, res) => {
    const { tracks } = req.body;
    const room = musicRooms.get(req.params.roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    room.playlist = tracks;
    res.json(room);
});

export { router, musicRooms };