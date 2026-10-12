const nodemailer = require('nodemailer');
require('dotenv').config();

const emailUser = (process.env.EMAIL_USER || process.env.MAIL_EMAIL || '').trim();
// Handle app passwords with or without spaces
const emailPass = (process.env.EMAIL_PASS || process.env.MAIL_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Verify SMTP connection on startup
if (emailUser && emailPass) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ [Nodemailer SMTP Connection Error]:', error.message);
    } else {
      console.log(`✅ [Nodemailer SMTP]: Successfully authenticated with Gmail as ${emailUser}`);
    }
  });
} else {
  console.warn('⚠️ [Nodemailer Warning]: EMAIL_USER or EMAIL_PASS not set in .env');
}

// Helper to generate 6 digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send Signup Verification OTP Email
 */
const sendSignupOtpEmail = async (toEmail, userName, otp) => {
  console.log(`📧 [Mailer]: Preparing to send Signup OTP to: ${toEmail} from ${emailUser}...`);
  const mailOptions = {
    from: `"Raj Exam Vault" <${emailUser}>`,
    to: toEmail,
    subject: '🔐 Verify Your Email - Raj Exam Vault',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Raj Exam Vault</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Your Ultimate Exam Preparation Platform</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome, ${userName || 'Candidate'}! 👋</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Thank you for signing up. Please use the following 6-digit One-Time Password (OTP) to verify your email address and activate your account:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #4f46e5; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              ${otp}
            </div>
            <p style="color: #ef4444; font-size: 13px; font-weight: 600; margin-top: 12px;">⏳ This OTP is valid for 10 minutes only.</p>
          </div>
          
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            If you did not initiate this request, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          &copy; ${new Date().getFullYear()} Raj Exam Vault. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer Success]: Signup OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ [Mailer Error]: Failed to send Signup OTP to ${toEmail}:`, err.message);
    throw err;
  }
};

/**
 * Send Password Reset OTP Email
 */
const sendResetPasswordOtpEmail = async (toEmail, userName, otp) => {
  const mailOptions = {
    from: `"Raj Exam Vault" <${emailUser}>`,
    to: toEmail,
    subject: '🔑 Password Reset OTP - Raj Exam Vault',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Raj Exam Vault</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Account Security</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Hello, ${userName || 'User'} 🔒</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            We received a request to reset the password for your Raj Exam Vault account. Use the OTP below to proceed:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #dc2626; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">
              ${otp}
            </div>
            <p style="color: #dc2626; font-size: 13px; font-weight: 600; margin-top: 12px;">⏳ This OTP is valid for 10 minutes only.</p>
          </div>
          
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            If you did not request a password reset, please secure your account immediately or ignore this message.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          &copy; ${new Date().getFullYear()} Raj Exam Vault. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer Success]: Password Reset OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ [Mailer Error]: Failed to send Password Reset OTP to ${toEmail}:`, err.message);
    throw err;
  }
};

// Helper to generate 6-character UUID password
const generate6CharUuidPassword = () => {
  const crypto = require('crypto');
  // Use randomUUID stripped of hyphens and take 6 characters
  const rawUuid = crypto.randomUUID().replace(/[^a-zA-Z0-9]/g, '');
  return rawUuid.slice(0, 6).toUpperCase();
};

// Helper to generate secure invite token
const generateInviteToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send Admin Invitation & Setup Password Email
 */
const sendAdminInvitationEmail = async (toEmail, userName, tempPassword, setupLink, expiryHours = 24) => {
  console.log(`📧 [Mailer]: Preparing to send Admin Invitation to: ${toEmail}...`);
  const mailOptions = {
    from: `"Raj Exam Vault" <${emailUser}>`,
    to: toEmail,
    subject: '🛡️ Admin Account Created - Set Your Password | Raj Exam Vault',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background: #0f224a; padding: 8px 16px; border-radius: 8px; margin-bottom: 8px;">
            <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 1px;">RAJ EXAM <span style="color: #ef4444;">VAULT</span></span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; font-weight: 600;">SUPERADMIN PORTAL ACCESS</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 10px; padding: 22px; margin-bottom: 20px; border: 1px solid #edf2f7;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome, ${userName || 'Administrator'}! 🌟</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            You have been added as an <strong>Admin</strong> on the <strong>Raj Exam Vault</strong> platform. Below are your account setup details and temporary credentials:
          </p>
          
          <div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px 20px; margin: 18px 0;">
            <div style="margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Assigned Email:</span>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${toEmail}</div>
            </div>
            <div>
              <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Generated Initial Password (UUID-based):</span>
              <div style="font-family: monospace; font-size: 20px; font-weight: 700; color: #4f46e5; letter-spacing: 3px; margin-top: 3px;">
                ${tempPassword}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0 20px 0;">
            <a href="${setupLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0f224a 0%, #1e3a8a 100%); color: #ffffff; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(15, 34, 74, 0.25);">
              🚀 Set Your Password & Activate Account
            </a>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 12px; margin-top: 15px;">
            <p style="color: #92400e; font-size: 13px; font-weight: 600; margin: 0; line-height: 1.5;">
              ⏱️ <strong>Important:</strong> This activation link is valid for <strong>${expiryHours} hours</strong>. If you do not set your password within this timeframe, the link will expire. You can request a new link at any time from the setup page.
            </p>
            <p style="color: #78350f; font-size: 12px; margin: 6px 0 0 0;">
              🔒 Once your new password is set, this activation link will be automatically deactivated for security.
            </p>
          </div>

          <div style="margin-top: 16px; font-size: 11px; color: #94a3b8; word-break: break-all;">
            If the button above does not work, copy and paste this link into your browser:<br/>
            <a href="${setupLink}" style="color: #3b82f6;">${setupLink}</a>
          </div>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          &copy; ${new Date().getFullYear()} Raj Exam Vault. Confidential administrator communication.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer Success]: Admin Invitation sent to ${toEmail}. MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ [Mailer Error]: Failed to send Admin Invitation to ${toEmail}:`, err.message);
    throw err;
  }
};

/**
 * Send Bug / Issue Resolved Notification Email
 */
const sendBugResolvedEmail = async (toEmail, userName, bugTitle, resolutionNotes, checkLink) => {
  console.log(`📧 [Mailer]: Preparing to send Bug Resolved email to: ${toEmail}...`);
  const finalCheckLink = checkLink || process.env.FRONTEND_URL || 'https://raj-exam-vault-frontend.vercel.app';
  
  const mailOptions = {
    from: `"Raj Exam Vault Support" <${emailUser}>`,
    to: toEmail,
    subject: `✅ Your Bug is Fixed! Now Check: ${bugTitle || 'Reported Issue'} | Raj Exam Vault`,
    html: `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #090D16 0%, #1e1b4b 100%); padding: 10px 22px; border-radius: 10px; margin-bottom: 8px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
            <span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 0.5px;">RAJ EXAM <span style="color: #ef4444;">VAULT</span></span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Quality & Bug Resolution Desk</p>
        </div>

        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-radius: 12px; padding: 24px; margin-bottom: 22px; border: 1px solid #a7f3d0;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="background: #10b981; color: #ffffff; font-size: 18px; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; text-align: center; line-height: 36px;">
              ✓
            </div>
            <div>
              <h2 style="font-size: 20px; color: #065f46; margin: 0; font-weight: 800;">Your Bug is Fixed! Now Check 🚀</h2>
              <p style="font-size: 13px; color: #047857; margin: 2px 0 0 0; font-weight: 500;">Hello ${userName || 'Aspirant'}, our technical team has resolved your issue.</p>
            </div>
          </div>
          
          <div style="background: #ffffff; border-radius: 10px; padding: 18px; border: 1px solid #d1fae5; margin-top: 16px;">
            <div style="margin-bottom: 10px;">
              <span style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">Reported Issue:</span>
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">
                "${bugTitle || 'Reported Bug'}"
              </div>
            </div>

            ${resolutionNotes ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
              <span style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Superadmin Resolution Note:</span>
              <div style="font-size: 14px; color: #334155; margin-top: 4px; line-height: 1.6; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #10b981;">
                ${resolutionNotes}
              </div>
            </div>
            ` : `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
              <div style="font-size: 14px; color: #334155; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #10b981;">
                The reported bug has been verified and permanently resolved. Please check now on your dashboard.
              </div>
            </div>
            `}
          </div>

          <div style="text-align: center; margin: 26px 0 16px 0;">
            <a href="${finalCheckLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; font-size: 15px; font-weight: 700; padding: 13px 34px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);">
              🔍 Check Now on Platform →
            </a>
          </div>

          <p style="font-size: 12px; color: #065f46; text-align: center; margin: 0; font-weight: 500;">
            Thank you for helping us make Raj Exam Vault faster, smoother, and error-free for every aspirant!
          </p>
        </div>

        <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          &copy; ${new Date().getFullYear()} Raj Exam Vault. Empowering Rajasthan Government Exam Aspirants.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer Success]: Bug Resolved notification sent to ${toEmail}. MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ [Mailer Error]: Failed to send Bug Resolved email to ${toEmail}:`, err.message);
    throw err;
  }
};

module.exports = {
  transporter,
  generateOtp,
  generate6CharUuidPassword,
  generateInviteToken,
  sendSignupOtpEmail,
  sendResetPasswordOtpEmail,
  sendAdminInvitationEmail,
  sendBugResolvedEmail
};

