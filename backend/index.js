import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import archiver from 'archiver';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: 'dttp21lrm',
    api_key: '456246775975728',
    api_secret: 'Bjv_I2xy7Xe4dOJBymp9xXsoutc'
});

app.use(cors());
app.use(express.json());

// Configure multer storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: 'file-share',
        resource_type: 'auto',
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `${path.parse(file.originalname).name}-${uniqueSuffix}`;
        }
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Store file information
const fileStore = new Map();

// Generate a unique 4-digit code
function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// File upload endpoint
// Modify upload endpoint
app.post('/upload', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const code = generateCode();

        // Store multiple file information
        const uploadedFiles = req.files.map(file => ({
            id: file.public_id,
            name: file.originalname,
            url: file.path,
            size: file.size
        }));

        fileStore.set(code, {
            files: uploadedFiles,
            uploadedAt: Date.now()
        });

        res.json({
            success: true,
            code,
            files: uploadedFiles.map(file => ({
                name: file.name,
                size: file.size
            }))
        });

        // Cleanup files after 24 hours
        setTimeout(() => {
            const fileInfo = fileStore.get(code);
            if (fileInfo) {
                fileInfo.files.forEach(file => {
                    cloudinary.v2.uploader.destroy(file.id);
                });
                fileStore.delete(code);
            }
        }, 24 * 60 * 60 * 1000);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

app.get('/download/:code', async (req, res) => {
    const { code } = req.params;
    const fileInfo = fileStore.get(code);

    if (!fileInfo || !fileInfo.files || fileInfo.files.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Files not found or expired'
        });
    }

    try {
        // Get the current file to download
        const currentFile = fileInfo.files[0];

        // Fetch the file from Cloudinary
        const fileResponse = await fetch(currentFile.url);

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${currentFile.name}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Stream the file content
        fileResponse.body.pipe(res);

        // Remove the downloaded file from the list
        fileInfo.files.shift();

        // If no more files, clean up the store
        if (fileInfo.files.length === 0) {
            fileStore.delete(code);
        } else {
            // Update the store with remaining files
            fileStore.set(code, fileInfo);
        }

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file'
        });
    }
});


app.use(cors());
app.use(express.json());

// Store active rooms and their states - will persist even when empty
const rooms = new Map();

// Generate 4-digit room ID
const generateRoomId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Get users in a room
const getRoomUsers = (roomId) => {
    const room = rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                activeSharer: null,
                users: new Map(),
            });
        }

        const room = rooms.get(roomId);
        room.users.set(socket.id, { id: socket.id });

        // Notify room about new user
        io.to(roomId).emit('user-joined', {
            userId: socket.id,
            activeSharer: room.activeSharer,
            users: getRoomUsers(roomId)
        });

        // Notify the new user if someone is sharing
        if (room.activeSharer) {
            socket.emit('sharer-changed', room.activeSharer);
        }
    });

    // WebRTC Signaling
    socket.on('start-sharing', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (room && !room.activeSharer) {
            room.activeSharer = socket.id;
            io.to(roomId).emit('sharer-changed', socket.id);
        }
    });

    socket.on('stop-sharing', (roomId) => {
        const room = rooms.get(roomId);
        if (room && room.activeSharer === socket.id) {
            room.activeSharer = null;
            io.to(roomId).emit('sharer-changed', null);
        }
    });

    // WebRTC Signaling events
    socket.on('offer', ({ roomId, offer, recipientId }) => {
        // Send offer to specific recipient
        socket.to(recipientId).emit('offer', {
            offer,
            sharerId: socket.id
        });
    });

    socket.on('answer', ({ roomId, answer, sharerId }) => {
        socket.to(roomId).emit('answer', { answer, viewerId: socket.id });
    });

    socket.on('ice-candidate', ({ roomId, candidate, recipientId }) => {
        socket.to(roomId).emit('ice-candidate', {
            candidate,
            senderId: socket.id
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        rooms.forEach((room, roomId) => {
            if (room.users.has(socket.id)) {
                room.users.delete(socket.id);
                if (room.activeSharer === socket.id) {
                    room.activeSharer = null;
                    io.to(roomId).emit('sharer-changed', null);
                }
                io.to(roomId).emit('user-left', {
                    userId: socket.id,
                    users: getRoomUsers(roomId)
                });
            }
            // Clean up empty rooms
            if (room.users.size === 0) {
                rooms.delete(roomId);
            }
        });
    });

    socket.on('join-code-room', (roomId) => {
        socket.join(roomId);

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                code: '// Start coding here...',
                language: 'javascript',
                users: new Map(),
                lastActive: Date.now() // Add timestamp for potential future cleanup
            });
        }

        const room = rooms.get(roomId);
        room.users.set(socket.id, { id: socket.id });
        room.lastActive = Date.now(); // Update last active timestamp

        // Send current room state to the new user
        socket.emit('room-state', {
            code: room.code,
            language: room.language
        });

        // Notify all users about the updated user list
        const users = Array.from(room.users.values());
        io.to(roomId).emit('code-users-update', users);
    });

    socket.on('code-change', ({ roomId, newCode }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.code = newCode;
            room.lastActive = Date.now();
            socket.to(roomId).emit('code-change', {
                newCode,
                source: socket.id
            });
        }
    });

    socket.on('language-change', ({ roomId, newLanguage }) => {
        const room = rooms.get(roomId);
        if (room) {
            room.language = newLanguage;
            room.lastActive = Date.now();
            socket.to(roomId).emit('language-change', {
                newLanguage,
                source: socket.id
            });
        }
    });

    // Add selection change handler
    socket.on('selection-change', ({ roomId, selections }) => {
        socket.to(roomId).emit('selection-change', {
            selections,
            source: socket.id
        });
    });

    // Only remove user from room, but keep room data
    socket.on('disconnect', () => {
        rooms.forEach((room, roomId) => {
            if (room.users.has(socket.id)) {
                room.users.delete(socket.id);
                room.lastActive = Date.now();

                // Notify remaining users
                const users = Array.from(room.users.values());
                io.to(roomId).emit('code-users-update', users);
            }
        });
    });
});

// Optional: Cleanup very old rooms (e.g., older than 30 days)
// You can adjust or remove this based on your needs
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ROOM_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, roomId) => {
        if (now - room.lastActive > MAX_ROOM_AGE) {
            rooms.delete(roomId);
            console.log(`Cleaned up inactive room: ${roomId}`);
        }
    });
}, CLEANUP_INTERVAL);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
