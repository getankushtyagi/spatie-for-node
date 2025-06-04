"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoAdminOverride = exports.AllowAdminOverride = exports.ADMIN_OVERRIDE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ADMIN_OVERRIDE_KEY = 'admin_override';
const AllowAdminOverride = () => (0, common_1.SetMetadata)(exports.ADMIN_OVERRIDE_KEY, true);
exports.AllowAdminOverride = AllowAdminOverride;
const NoAdminOverride = () => (0, common_1.SetMetadata)(exports.ADMIN_OVERRIDE_KEY, false);
exports.NoAdminOverride = NoAdminOverride;
//# sourceMappingURL=admin-override.decorator.js.map