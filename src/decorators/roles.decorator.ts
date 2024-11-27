import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../types/enums/roles.enum';

export const ROLE_KEY = 'role';
export const Roles = (role: RolesEnum) => SetMetadata(ROLE_KEY, role);
