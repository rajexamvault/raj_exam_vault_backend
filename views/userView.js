/**
 * View / DTO Formatter for User Model
 * Formats and sanitizes user data before sending JSON response to client
 */
const formatUserResponse = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username || null,
    category: user.category || 'General',
    phone: user.phone || null,
    whatsappNumber: user.whatsappNumber || null,
    dob: user.dob || null,
    targetExam: user.targetExam || null,
    higherQualification: user.higherQualification || null,
    age: user.age || null,
    state: user.state || 'Rajasthan',
    profileImage: user.profileImage || null,
    profileImagePublicId: user.profileImagePublicId || null,
    isProfileCompleted: !!user.isProfileCompleted,
    role: user.role,
    status: user.status || 'active',
    isPasswordSet: user.isPasswordSet !== undefined ? user.isPasswordSet : true,
    isVerified: user.isVerified,
    inviteTokenExpiry: user.inviteTokenExpiry || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const formatAdminResponse = (admin) => {
  if (!admin) return null;

  const isInviteExpired = admin.inviteTokenExpiry ? new Date(admin.inviteTokenExpiry) < new Date() : false;

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone || null,
    role: admin.role,
    status: admin.status || 'active',
    isVerified: admin.isVerified,
    isPasswordSet: admin.isPasswordSet,
    inviteTokenExpiry: admin.inviteTokenExpiry,
    isInviteExpired,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt
  };
};

module.exports = {
  formatUserResponse,
  formatAdminResponse
};

