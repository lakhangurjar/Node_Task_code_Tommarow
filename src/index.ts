import express from 'express';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/authMiddleware';

dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse cookies
app.use(cookieParser());

// Authentication routes
app.use('/api/auth', authRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', (room: string) => {
        socket.join(room);
        io.to(room).emit('message', `User joined room ${room}`);
    });

    socket.on('message', (message) => {
        const room = Array.from(socket.rooms)[1];
        if (room) {
            io.to(room).emit('message', message);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Define a route to check the server status
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
