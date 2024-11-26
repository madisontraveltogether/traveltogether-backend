const logActivity = async (tripId, userId, action) => {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');
  
    trip.activityLogs.push({
      user: userId,
      action,
      timestamp: new Date(),
    });
  
    await trip.save();
  };
  