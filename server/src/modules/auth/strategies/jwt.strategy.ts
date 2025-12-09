import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { Role, TokenType } from 'libs/utils/enum';
import { ConfigService } from 'libs/modules/config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authentication.secret,
    });
  }

  async validate(args: { email: string; role: Role; type: TokenType }) {
    if (args.type !== TokenType.ACCESS_TOKEN) {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prismaService.user.findFirst({
      where: { email: args.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized user');
    }

    return user;
  }
}
