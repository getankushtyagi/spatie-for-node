"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiresAllRoles = exports.RequiresAnyRole = exports.RequiresAllPermissions = exports.RequiresAnyPermission = exports.RequiresRoles = exports.RequiresPermissions = exports.ROLES_KEY = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
exports.ROLES_KEY = 'roles';
const RequiresPermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequiresPermissions = RequiresPermissions;
const RequiresRoles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.RequiresRoles = RequiresRoles;
const RequiresAnyPermission = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, { permissions, logic: 'any' });
exports.RequiresAnyPermission = RequiresAnyPermission;
const RequiresAllPermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, { permissions, logic: 'all' });
exports.RequiresAllPermissions = RequiresAllPermissions;
const RequiresAnyRole = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, { roles, logic: 'any' });
exports.RequiresAnyRole = RequiresAnyRole;
const RequiresAllRoles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, { roles, logic: 'all' });
exports.RequiresAllRoles = RequiresAllRoles;
//# sourceMappingURL=requires-permissions.decorator.js.map