// Trip Management
exports.createTrip = async (req, res) => {
  const { name, location, startDate, endDate, privacy } = req.body;
  const organizer = req.user.userId;

  if (!name) {
    return res.status(400).json({ message: "Trip name is required" });
  }

  try {
    const trip = new Trip({
      name,
      location: location || null,
      startDate: startDate || null,
      endDate: endDate || null,
      privacy: privacy || "private",
      organizer,
    });

    await trip.save();

    await User.findByIdAndUpdate(organizer, { $push: { joinedTrips: trip._id } });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Failed to create trip", error: error.message });
  }
};

exports.getTripById = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trip details", error: error.message });
  }
};

exports.updateTrip = async (req, res) => {
  const { tripId } = req.params;
  const updates = req.body;

  try {
    const trip = await Trip.findByIdAndUpdate(tripId, updates, { new: true });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: "Failed to update trip", error: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findByIdAndDelete(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete trip", error: error.message });
  }
};

// Guest Management
exports.getGuests = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId).populate("guests.user", "name email");
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.status(200).json(trip.guests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch guests", error: error.message });
  }
};

exports.addGuest = async (req, res) => {
  const { tripId } = req.params;
  const { userId, rsvpStatus = "pending" } = req.body;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.guests.some((guest) => guest.user.toString() === userId)) {
      return res.status(400).json({ message: "Guest already added" });
    }

    trip.guests.push({ user: userId, rsvpStatus });
    await trip.save();

    res.status(201).json(trip.guests);
  } catch (error) {
    res.status(500).json({ message: "Failed to add guest", error: error.message });
  }
};

// Invitation
exports.generateInviteLink = async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const inviteLink = `https://gettraveltogether.com/trips/join?code=${trip.inviteCode}`;
    res.status(200).json({ inviteLink });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate invite link", error: error.message });
  }
};

exports.joinTripByCode = async (req, res) => {
  const { code } = req.body;

  try {
    const trip = await Trip.findOne({ inviteCode: code });
    if (!trip) return res.status(404).json({ message: "Invalid code" });

    const userId = req.user.userId;

    if (!trip.guests.some((guest) => guest.user.toString() === userId)) {
      trip.guests.push({ user: userId, rsvpStatus: "pending" });
      await trip.save();
    }

    res.status(200).json({ message: "Successfully joined the trip", trip });
  } catch (error) {
    res.status(500).json({ message: "Failed to join trip", error: error.message });
  }
};
