import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtFDAAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user || user.role !== 'FDA') {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}

@Injectable()
export class JwtFishSeedCompanyAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user || user.role !== 'Fish Seed Company') {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}