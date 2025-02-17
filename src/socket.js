import { io } from 'socket.io-client';

const URL = 'http://localhost:8080';

const socket = io(URL, {
     autoConnect: false
});

// socket.connect();

// socket.on('connect', () => {
//     console.log('Connected to server');
// });

// socket.on('disconnect', () => {
//     console.log('Disconnected from server');
// });

const joinRoom = (room) => {
    socket.emit('joinRoom', room);
    console.log(`Joined room: ${room}`);
};

const leaveRoom = (room) => {
    socket.emit('leaveRoom', room);
    console.log(`Left room: ${room}`);
};

export { socket, joinRoom, leaveRoom };
