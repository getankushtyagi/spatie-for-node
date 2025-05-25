import { SetMetadata } from '@nestjs/common';

export const ADMIN_OVERRIDE_KEY = 'admin_override';

export const AllowAdminOverride = () => SetMetadata(ADMIN_OVERRIDE_KEY, true);
export const NoAdminOverride = () => SetMetadata(ADMIN_OVERRIDE_KEY, false);