const nodemailer = require('nodemailer');

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'smtp.mailtrap.io', 'outlook', etc., depending on your email service
  auth: {
    user: process.env.EMAIL_FROM, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// General function to send an email using Nodemailer
exports.sendEmail = async ({ toEmails, subject, textContent, htmlContent }) => {
  const recipients = Array.isArray(toEmails) ? toEmails.join(', ') : toEmails;

  const emailOptions = {
    from: `"${process.env.EMAIL_NAME || 'Your App Name'}" <${process.env.EMAIL_FROM}>`,
    to: recipients,
    subject: subject,
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

// Helper to send a notification email
exports.sendNotificationEmail = async (toEmails, subject, message) => {
  const htmlMessage = `<p>${message}</p>`;
  return await this.sendEmail({ toEmails, subject, textContent: message, htmlContent: htmlMessage });
};

// Example: Send invitation email
exports.sendInvitationEmail = async (toEmails, tripName, organizerName, invitationLink) => {
  const subject = `You're Invited to Join the Trip: ${tripName}`;
  const message = `
    Hi there! <br><br>
    ${organizerName} has invited you to join the trip "<strong>${tripName}</strong>".
    <br><br>
    <a href="${invitationLink}">Click here to join the trip</a>
    <br><br>
    Looking forward to having you on board!
  `;
  return await this.sendEmail({ toEmails, subject, textContent: message, htmlContent: message });
};
