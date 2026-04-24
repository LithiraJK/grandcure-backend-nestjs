import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard to protect routes that require JWT authentication.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
