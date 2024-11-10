const mailjet = require('node-mailjet').connect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

// General function to send an email using Mailjet
exports.sendEmail = async ({ toEmails, subject, textContent, htmlContent }) => {
  // Format recipients list
  const recipients = Array.isArray(toEmails)
    ? toEmails.map(email => ({ Email: email }))
    : [{ Email: toEmails }];

  const emailData = {
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_FROM,
          Name: process.env.EMAIL_NAME || "Your App Name",
        },
        To: recipients,
        Subject: subject,
        TextPart: textContent,
        HTMLPart: htmlContent || `<p>${textContent}</p>`, // HTML content or plain text as fallback
      },
    ],
  };

  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request(emailData);
    console.log('Email sent successfully:', request.body);
    return request.body;
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
