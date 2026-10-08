const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  await resend.emails.send({
    from: "MERN Auth <onboarding@resend.dev>",
    to: email,
    subject: "Your Authentication OTP",
    text: `Your OTP is ${otp}. This OTP is valid for 5 minutes.`,
  });
};

module.exports = {
  sendOTPEmail,
};