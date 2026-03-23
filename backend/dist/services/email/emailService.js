// backend/src/services/email/emailService.js
const nodemailer = require('nodemailer');
const config = require('../../config/app');
const logger = require('../../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email?.smtp?.host || process.env.SMTP_HOST,
  port: config.email?.smtp?.port || parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: config.email?.smtp?.user || process.env.SMTP_USER,
    pass: config.email?.smtp?.pass || process.env.SMTP_PASS
  }
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    logger.warn('Email transporter verification failed:', error.message);
  } else {
    logger.info('Email transporter ready');
  }
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Object} options - Additional options
 */
async function sendEmail(to, subject, html, options = {}) {
  const {
    text,
    from = `${config.email?.fromName || 'AI Media Editor'} <${config.email?.fromAddress || 'noreply@aimediaeditor.com'}>`,
    replyTo,
    cc,
    bcc,
    attachments
  } = options;
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || stripHtml(html),
      html,
      replyTo,
      cc,
      bcc,
      attachments
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(to, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AI Media Editor!</h1>
        </div>
        <div class="content">
          <p>Hi ${name || 'there'},</p>
          <p>Welcome to AI Media Editor! We're excited to have you on board.</p>
          <p>Get started with:</p>
          <ul>
            <li>🎨 Professional image editing tools</li>
            <li>🤖 AI-powered background removal and enhancement</li>
            <li>📹 Video editing and effects</li>
            <li>🎵 Audio processing and editing</li>
          </ul>
          <a href="${config.frontendUrl}/editor" class="button">Start Editing</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AI Media Editor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail(to, 'Welcome to AI Media Editor!', html);
}

/**
 * Send verification email
 */
async function sendVerificationEmail(to, token) {
  const verificationUrl = `${config.frontendUrl}/verify-email/${token}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verificationUrl}" class="button">Verify Email</a>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    </body>
    </html>
  `;
  return await sendEmail(to, 'Verify Your Email Address', html);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${config.frontendUrl}/reset-password/${token}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>Or copy and paste this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <div class="warning">
          <strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail(to, 'Password Reset Request', html);
}

/**
 * Send payment failed notification
 */
async function sendPaymentFailedEmail(to, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="warning">
          <h2>Payment Failed</h2>
        </div>
        <p>Hi ${name || 'there'},</p>
        <p>We were unable to process your payment for your AI Media Editor subscription.</p>
        <p>Please update your payment information to continue enjoying uninterrupted access.</p>
        <a href="${config.frontendUrl}/settings/billing" class="button">Update Payment Method</a>
      </div>
    </body>
    </html>
  `;
  return await sendEmail(to, 'Payment Failed - Action Required', html);
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentFailedEmail,
  transporter
};