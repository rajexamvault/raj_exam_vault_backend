const { 
  sendSignupOtpEmail, 
  sendResetPasswordOtpEmail, 
  sendAdminInvitationEmail,
  sendBugResolvedEmail 
} = require('../utils/mailer');

/**
 * Service to handle transactional and OTP emails
 */
class EmailService {
  static async sendSignupOtp(email, name, otp) {
    return await sendSignupOtpEmail(email, name, otp);
  }

  static async sendPasswordResetOtp(email, name, otp) {
    return await sendResetPasswordOtpEmail(email, name, otp);
  }

  static async sendAdminInvitation(email, name, tempPassword, setupLink, expiryHours = 24) {
    return await sendAdminInvitationEmail(email, name, tempPassword, setupLink, expiryHours);
  }

  static async sendBugResolved(email, name, bugTitle, resolutionNotes, checkLink) {
    return await sendBugResolvedEmail(email, name, bugTitle, resolutionNotes, checkLink);
  }
}

module.exports = EmailService;


