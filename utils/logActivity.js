const logActivity = async (tripId, userId, action) => {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');
  
    const activity = { user: userId, action, timestamp: new Date() };
    trip.activityLogs.push(activity);
  
    await trip.save();
  
    // Emit real-time update
    const io = require('../server').io; // Assuming you set up socket.io in `server.js`
    io.to(tripId).emit('activityLogged', activity);
  };
  