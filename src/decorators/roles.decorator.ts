import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../types/enums/roles.enum';

export const ROLES_KEY = 'role';
export const Roles = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);
