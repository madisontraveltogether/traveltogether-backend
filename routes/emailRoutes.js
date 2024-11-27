const express = require('express');
const { sendEmail } = require('../utils/emailUtils');

const router = express.Router();

router.post('/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  try {
    const info = await sendEmail({ to, subject, text, html });
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

module.exports = router;
