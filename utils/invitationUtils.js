const crypto = require('crypto');

// Generate a unique invitation link
exports.generateInvitationLink = (tripId, email) => {
  const token = crypto.randomBytes(16).toString('hex'); // Unique token
  return `https://www.gettraveltogether.com/invitations/${tripId}?email=${email}&token=${token}`;
};
