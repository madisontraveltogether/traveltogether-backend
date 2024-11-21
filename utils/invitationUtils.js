// utils/invitationUtils.js
const crypto = require('crypto');

exports.generateInvitationLink = (tripId, email) => {
  const token = crypto.randomBytes(16).toString('hex'); // Unique token
  return `https://www.gettraveltogether.com/invitations/${tripId}?email=${email}&token=${token}`;
};
