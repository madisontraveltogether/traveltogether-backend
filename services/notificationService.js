const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE } = process.env;

// Configure transporter with environment variables
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE || 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// General function to send email notifications
exports.sendNotification = async (email, subject, message) => {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${email}`);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
};

// Notify users of a new expense
exports.notifyNewExpense = async (trip, expense) => {
  const subject = `New Expense Added to Trip: ${trip.name}`;
  const message = `${expense.payer.name} added a new expense "${expense.title}" for ${expense.amount} on your trip "${trip.name}".`;

  // Notify all guests in the trip
  for (const guest of trip.guests) {
    await this.sendNotification(guest.email, subject, message);
  }
};

// Notify user of task assignment
exports.notifyTaskAssignment = async (trip, task, assignedUser) => {
  const subject = `New Task Assigned in Trip: ${trip.name}`;
  const message = `You have been assigned a new task titled "${task.title}" with a due date of ${task.dueDate}. Check the details on your trip dashboard for "${trip.name}".`;

  await this.sendNotification(assignedUser.email, subject, message);
};

// Notify users of new poll
exports.notifyNewPoll = async (trip, poll) => {
  const subject = `New Poll Created in Trip: ${trip.name}`;
  const message = `A new poll "${poll.question}" has been created for your trip "${trip.name}". Participate by voting on your trip dashboard.`;

  // Notify all guests in the trip
  for (const guest of trip.guests) {
    await this.sendNotification(guest.email, subject, message);
  }
};

// Send reminder notifications for upcoming events
exports.sendEventReminder = async (trip, event) => {
  const subject = `Upcoming Event in Trip: ${trip.name}`;
  const message = `Reminder: The event "${event.title}" is happening soon on ${event.startTime}. Check the itinerary on your trip dashboard.`;

  // Notify all guests in the trip
  for (const guest of trip.guests) {
    await this.sendNotification(guest.email, subject, message);
  }
};
