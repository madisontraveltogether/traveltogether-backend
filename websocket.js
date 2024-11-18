const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 5000 });

server.on('connection', (socket) => {
  console.log('New WebSocket connection established');

  socket.on('message', (message) => {
    console.log('Received:', message);
    socket.send('Hello from server');
  });

  socket.on('close', () => {
    console.log('WebSocket connection closed');
  });
});
