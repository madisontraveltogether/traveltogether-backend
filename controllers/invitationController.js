const Trip = require('../models/tripModel');
const User = require('../models/userModel');
const { generateInvitationLink } = require('../utils/invitationUtils');
const { sendInvitationEmail } = require('../utils/emailUtils');


// Generate and send an invitation
exports.inviteUserToTrip = async (req, res) => {
  const { tripId } = req.params;
  const { email } = req.body;

  try {
    const trip = await Trip.findById(tripId).populate('organizer', 'name');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if the email is already invited
    if (trip.pendingInvites.some((invite) => invite.email === email)) {
      return res.status(400).json({ message: 'Email already invited' });
    }

    // Generate the invitation link
    const invitationLink = generateInvitationLink(tripId, email);

    // Add the email to pendingInvites
    trip.pendingInvites.push({ email, status: 'pending' });
    await trip.save();

    // Send the invitation email
    await sendInvitationEmail(email, trip.name, trip.organizer.name, invitationLink);

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error inviting user:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
