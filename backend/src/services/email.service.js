const nodemailer = require("nodemailer");
const dns = require("dns").promises;

let transporter;

const getTransporter = async () => {
  if (!transporter) {
    const [ipv4Address] = await dns.resolve4(process.env.EMAIL_HOST);

    transporter = nodemailer.createTransport({
      host: ipv4Address,
      port: 465,
      secure: true,
      tls: {
        servername: process.env.EMAIL_HOST,
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

const sendOTPEmail = async (email, otp) => {
  const emailTransporter = await getTransporter();

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your Authentication OTP",
    text: `Your OTP is ${otp}. This OTP is valid for 5 minutes.`,
  });
};

module.exports = {
  sendOTPEmail,
};