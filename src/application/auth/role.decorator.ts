import { SetMetadata } from '@nestjs/common';
import { RoleType } from 'src/domain/enum';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);