import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { Role, TokenType } from 'libs/utils/enum';
import { ContextProvider } from 'libs/utils/providers/context.provider';
import { ConfigService } from 'libs/modules/config/config.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const refreshToken = req.body.refreshToken;
        return refreshToken;
      },
      secretOrKey: configService.authentication.secret,
    });
  }

  async validate(args: { userId: number; role: Role; type: TokenType }) {

    if (args.type !== TokenType.REFRESH_TOKEN) {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.prismaService.user.findFirst({
      where: { id: args.userId, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized user');
    }

    ContextProvider.setAuthUser(user);
    return user;
  }
}
