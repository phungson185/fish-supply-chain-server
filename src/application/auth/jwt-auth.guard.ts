import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from 'src/domain/enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// @Injectable()
// export class JwtFDAAuthGuard extends AuthGuard('jwt') {
//   handleRequest(err, user, info) {
//     if (err || !user || user.role !== RoleType.FDA) {
//       throw err || new Error('FDA Unauthorized');
//     }
//     return user;
//   }
// }

// @Injectable()
// export class JwtFishSeedCompanyAuthGuard extends AuthGuard('jwt') {
//   handleRequest(err, user, info) {
//     if (err || !user || user.role !== RoleType.FishSeedCompany) {
//       console.log(user.role)
//       throw err || new Error('Fish Seed Company Unauthorized');
//     }
//     return user;
//   }
// }

// @Injectable()
// export class JwtFishFarmerAuthGuard extends AuthGuard('jwt') {
//   handleRequest(err, user, info) {
//     if (err || !user || user.role !== RoleType.FishFarmer) {
//       throw err || new Error('Fish Farmer Unauthorized');
//     }
//     return user;
//   }
// }