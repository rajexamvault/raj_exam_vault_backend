const { Role, Permission, RolePermission } = require('../../models');

const SYSTEM_PERMISSIONS = [
  // Exam Permissions
  { name: 'exam:create', module: 'exams', description: 'Create new exam entries' },
  { name: 'exam:read', module: 'exams', description: 'View and browse exams' },
  { name: 'exam:update', module: 'exams', description: 'Edit exam details and guidelines' },
  { name: 'exam:delete', module: 'exams', description: 'Archive or delete exams' },

  // Stage / Subject / Topic / Syllabus Permissions
  { name: 'syllabus:create', module: 'syllabus', description: 'Add stages, subjects, topics and syllabus items' },
  { name: 'syllabus:read', module: 'syllabus', description: 'View syllabus structure' },
  { name: 'syllabus:update', module: 'syllabus', description: 'Modify stages, subjects, topics and syllabus items' },
  { name: 'syllabus:delete', module: 'syllabus', description: 'Delete stages, subjects, topics and syllabus items' },

  // Study Materials & Notes Permissions
  { name: 'material:create', module: 'materials', description: 'Upload notes, PDFs, and study guides' },
  { name: 'material:read', module: 'materials', description: 'Access study materials' },
  { name: 'material:update', module: 'materials', description: 'Edit study material details' },
  { name: 'material:delete', module: 'materials', description: 'Delete or archive study materials' },

  // PYQ Permissions
  { name: 'pyq:create', module: 'pyqs', description: 'Upload previous year papers and solution keys' },
  { name: 'pyq:read', module: 'pyqs', description: 'View and download PYQs' },
  { name: 'pyq:update', module: 'pyqs', description: 'Edit PYQ paper details' },
  { name: 'pyq:delete', module: 'pyqs', description: 'Remove PYQ papers' },

  // Question Bank Permissions
  { name: 'question:create', module: 'questions', description: 'Add questions to question bank' },
  { name: 'question:read', module: 'questions', description: 'View question bank' },
  { name: 'question:update', module: 'questions', description: 'Edit questions and explanations' },
  { name: 'question:delete', module: 'questions', description: 'Remove questions from bank' },

  // Mock Tests & Test Series Permissions
  { name: 'test:create', module: 'tests', description: 'Create mock tests and test series' },
  { name: 'test:read', module: 'tests', description: 'Access mock tests' },
  { name: 'test:update', module: 'tests', description: 'Modify mock tests and question mappings' },
  { name: 'test:delete', module: 'tests', description: 'Delete mock tests' },

  // Current Affairs Permissions
  { name: 'current_affairs:create', module: 'current_affairs', description: 'Create current affairs articles' },
  { name: 'current_affairs:read', module: 'current_affairs', description: 'Read current affairs' },
  { name: 'current_affairs:update', module: 'current_affairs', description: 'Edit current affairs' },
  { name: 'current_affairs:delete', module: 'current_affairs', description: 'Delete current affairs' },

  // Announcement Permissions
  { name: 'announcement:create', module: 'announcements', description: 'Publish announcements and alerts' },
  { name: 'announcement:read', module: 'announcements', description: 'View announcements' },
  { name: 'announcement:update', module: 'announcements', description: 'Edit announcements' },
  { name: 'announcement:delete', module: 'announcements', description: 'Remove announcements' },

  // User Management Permissions
  { name: 'user:create', module: 'users', description: 'Create user accounts' },
  { name: 'user:read', module: 'users', description: 'View aspirant directory and profiles' },
  { name: 'user:update', module: 'users', description: 'Update aspirant accounts' },
  { name: 'user:delete', module: 'users', description: 'Delete user accounts' },
  { name: 'user:block', module: 'users', description: 'Block or activate users' },

  // Staff & Admin Management Permissions
  { name: 'admin:create', module: 'admins', description: 'Invite and create staff/admins' },
  { name: 'admin:read', module: 'admins', description: 'View administrators list' },
  { name: 'admin:update', module: 'admins', description: 'Edit admin roles and statuses' },
  { name: 'admin:delete', module: 'admins', description: 'Remove staff or admin accounts' },

  // Analytics & Audit Logs
  { name: 'analytics:read', module: 'analytics', description: 'View platform metrics and telemetry' },
  { name: 'audit:read', module: 'audit', description: 'Inspect security audit logs' }
];

const SYSTEM_ROLES = [
  {
    name: 'superadmin',
    displayName: 'Root SuperAdmin',
    description: 'Full unrestricted platform access and permission control',
    isSystem: true,
    permissions: ['*'] // wildcard = all permissions
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Operational management of exams, materials, users, and content',
    isSystem: true,
    permissions: [
      'exam:create', 'exam:read', 'exam:update',
      'syllabus:create', 'syllabus:read', 'syllabus:update',
      'material:create', 'material:read', 'material:update', 'material:delete',
      'pyq:create', 'pyq:read', 'pyq:update', 'pyq:delete',
      'question:create', 'question:read', 'question:update',
      'test:create', 'test:read', 'test:update',
      'current_affairs:create', 'current_affairs:read', 'current_affairs:update',
      'announcement:create', 'announcement:read', 'announcement:update',
      'user:read', 'user:block',
      'admin:read',
      'analytics:read'
    ]
  },
  {
    name: 'content_manager',
    displayName: 'Content Manager',
    description: 'Manages syllabus, study materials, notes, PDFs, and current affairs',
    isSystem: true,
    permissions: [
      'exam:read',
      'syllabus:create', 'syllabus:read', 'syllabus:update',
      'material:create', 'material:read', 'material:update', 'material:delete',
      'pyq:create', 'pyq:read', 'pyq:update', 'pyq:delete',
      'current_affairs:create', 'current_affairs:read', 'current_affairs:update',
      'announcement:read'
    ]
  },
  {
    name: 'question_manager',
    displayName: 'Question Manager',
    description: 'Manages question bank, mock tests, test series, and answer keys',
    isSystem: true,
    permissions: [
      'exam:read', 'syllabus:read',
      'question:create', 'question:read', 'question:update', 'question:delete',
      'test:create', 'test:read', 'test:update', 'test:delete',
      'pyq:read'
    ]
  },
  {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'User assistance, announcements, and moderation',
    isSystem: true,
    permissions: [
      'exam:read', 'material:read', 'pyq:read',
      'user:read', 'user:block',
      'announcement:create', 'announcement:read', 'announcement:update'
    ]
  },
  {
    name: 'user',
    displayName: 'Aspirant / Student',
    description: 'Registered student candidate accessing study vault',
    isSystem: true,
    permissions: [
      'exam:read',
      'syllabus:read',
      'material:read',
      'pyq:read',
      'test:read',
      'current_affairs:read',
      'announcement:read'
    ]
  }
];

/**
 * Seed or update system permissions and default roles
 */
const seedRbac = async () => {
  try {
    // 1. Seed Permissions
    const permissionMap = new Map();
    for (const p of SYSTEM_PERMISSIONS) {
      const [perm] = await Permission.findOrCreate({
        where: { name: p.name },
        defaults: p
      });
      permissionMap.set(p.name, perm.id);
    }

    const allPermissionIds = Array.from(permissionMap.values());

    // 2. Seed Roles and Associations
    for (const r of SYSTEM_ROLES) {
      const [role] = await Role.findOrCreate({
        where: { name: r.name },
        defaults: {
          displayName: r.displayName,
          description: r.description,
          isSystem: r.isSystem
        }
      });

      let targetPermIds = [];
      if (r.permissions.includes('*')) {
        targetPermIds = allPermissionIds;
      } else {
        targetPermIds = r.permissions
          .map((pName) => permissionMap.get(pName))
          .filter(Boolean);
      }

      // Sync role permissions
      for (const pId of targetPermIds) {
        await RolePermission.findOrCreate({
          where: {
            roleId: role.id,
            permissionId: pId
          }
        });
      }
    }

    console.log('✅ RBAC Roles & Permissions initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Warning initializing RBAC database tables:', err.message);
  }
};

module.exports = {
  seedRbac,
  SYSTEM_PERMISSIONS,
  SYSTEM_ROLES
};
