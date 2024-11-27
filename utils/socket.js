module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
  
      // Listen for events
      socket.on('joinTrip', (tripId) => {
        socket.join(tripId);
        console.log(`Client joined trip room: ${tripId}`);
      });
  
      socket.on('leaveTrip', (tripId) => {
        socket.leave(tripId);
        console.log(`Client left trip room: ${tripId}`);
      });
  
      // Handle disconnections
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  };
  