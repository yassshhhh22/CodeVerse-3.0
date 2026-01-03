import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email
export const sendEmail = async (options) => {
  try {
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

// Email templates
export const getWelcomeEmail = (name) => {
  return `
    <h1>Welcome ${name}!</h1>
    <p>Thank you for joining our hackathon platform.</p>
    <p>Get started by completing your profile.</p>
  `;
};

export const getResetPasswordEmail = (resetUrl) => {
  return `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>This link will expire in 10 minutes.</p>
  `;
};
