const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendOTPEmail = async (email, otp) => {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "MERN Auth",
      email: process.env.EMAIL_FROM,
    },
    to: [
      {
        email,
      },
    ],
    subject: "Your Authentication OTP",
    textContent: `Your OTP is ${otp}. This OTP is valid for 5 minutes.`,
  });
};

module.exports = {
  sendOTPEmail,
};