// ==========================================
// 4.2 FRONTEND ROLE-BASED ACCESS HELPERS
// ==========================================
export const ROLE_PERMISSIONS = {
  Admin: [
    'manage_users',
    'gulayan:full',
    'prutasan:full',
    'babuyan:full',
    'expenses:manage',
    'profit:view',
    'reports:view',
    'analytics:view',
    'audit:view',
  ],
  'Gulayan Staff': ['gulayan:view_inventory', 'gulayan:add_sales'],
  'Prutasan Staff': ['prutasan:view_inventory', 'prutasan:add_sales'],
  'Babuyan Staff': [
    'babuyan:view_inventory',
    'babuyan:record_usage',
    'babuyan:edit_usage',
    'babuyan:growth_health',
  ],
};

export const canPerformAction = (user, permission) => {
  if (!user || user.status !== 'active') return false;
  if (user.role === 'Admin') return true;
  const perms = ROLE_PERMISSIONS[user.role] || [];
  return perms.includes(permission);
};