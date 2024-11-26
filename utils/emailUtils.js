const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD, // Or app-specific password
  },
});

// General function to send an email
exports.sendEmail = async ({ toEmails, subject, textContent, htmlContent }) => {
  const recipients = Array.isArray(toEmails) ? toEmails.join(', ') : toEmails;

  const emailOptions = {
    from: `"TravelTogether" <${process.env.EMAIL_FROM}>`,
    to: recipients,
    subject,
    text: textContent,
    html: htmlContent || `<p>${textContent}</p>`,
  };

  try {
    const info = await transporter.sendMail(emailOptions);
    console.log('Email sent successfully:', info.response);
    return info.response;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};

// Helper to send an invitation email
exports.sendInvitationEmail = async (toEmail, tripName, organizerName, invitationLink) => {
  const subject = `You're Invited to Join the Trip: ${tripName}`;
  const message = `
    <p>Hi there!</p>
    <p>${organizerName} has invited you to join the trip <strong>${tripName}</strong>.</p>
    <p><a href="${invitationLink}" target="_blank">Click here to join the trip</a></p>
    <p>Looking forward to having you on board!</p>
  `;
  return await this.sendEmail({ toEmails: toEmail, subject, htmlContent: message });
};
