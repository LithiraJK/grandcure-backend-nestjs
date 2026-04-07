import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from '../../common/interfaces/user-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';

// Strategy to validate JWT tokens and extract user information for authenticated requests.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const jwtSecret = process.env.JWT_SECRET ?? 'dev_jwt_secret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: UserPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isBlocked: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked by an administrator');
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}