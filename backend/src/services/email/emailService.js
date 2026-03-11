// backend/src/services/email/emailService.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Nodemailer transporter for development
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  const fromEmail = process.env.FROM_EMAIL || 'noreply@aimediaeditor.com';
  const fromName = process.env.FROM_NAME || 'AI Media Editor';

  // Use SendGrid in production
  if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY) {
    await sgMail.send({
      to,
      from: { email: fromEmail, name: fromName },
      subject,
      html,
      text
    });
  } else {
    // Use Nodemailer in development
    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      text
    });
  }
};

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Verify your email - AI Media Editor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to AI Media Editor!</h1>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666;">${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
    text: `Welcome to AI Media Editor! Verify your email: ${verifyUrl}`
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Reset your password - AI Media Editor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Password Reset</h1>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666;">${resetUrl}</p>
        <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`
  });
};

const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to AI Media Editor! 🎨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome, ${name}! 🎉</h1>
        <p>Thanks for joining AI Media Editor. We're excited to have you!</p>
        <h2>Get Started:</h2>
        <ul>
          <li>🖼️ Upload your first image</li>
          <li>✨ Try AI-powered enhancements</li>
          <li>🎨 Explore filters and effects</li>
          <li>📤 Export in any format</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/editor" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Start Creating
        </a>
      </div>
    `,
    text: `Welcome to AI Media Editor, ${name}! Start creating: ${process.env.FRONTEND_URL}/editor`
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};