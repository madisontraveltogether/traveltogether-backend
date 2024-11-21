const Invitation = require('../models/invitationModel');
const Trip = require('../models/tripModel');
const User = require('../models/userModel');

// Get all invitations for the logged-in user
exports.getUserInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ user: req.user.userId })
      .populate('trip', 'name destination organizer')
      .populate('trip.organizer', 'name email');
    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept an invitation
exports.acceptInvitation = async (req, res) => {
  const { invitationId } = req.params;

  try {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    const { tripId, email } = invitation;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Add the user to the trip's guest list
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    trip.guests.push({ user: user.id, rsvpStatus: 'pending' });
    user.invitedTrips.push(tripId);

    await Promise.all([trip.save(), user.save()]);

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({ message: 'Invitation accepted', trip });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.declineInvitation = async (req, res) => {
  const { invitationId } = req.params;

  try {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) return res.status(404).json({ message: 'Invitation not found' });

    // Mark invitation as declined
    invitation.status = 'declined';
    await invitation.save();

    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Decline an invitation
exports.declineInvitation = async (req, res) => {
  const { invitationId } = req.params;

  try {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already responded to' });
    }

    invitation.status = 'declined';
    await invitation.save();
    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
