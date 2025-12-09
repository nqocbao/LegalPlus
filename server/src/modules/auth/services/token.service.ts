import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { ConfigService } from 'libs/modules/config/config.service';
import { TokenType } from 'libs/utils/enum';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) { }

  private async createAccessToken(data: { user_id: number; email: string; role: string }) {
    return await this.jwtService.signAsync(
      {
        user_id: data.user_id,
        email: data.email,
        type: TokenType.ACCESS_TOKEN,
        role: data.role,
      },
      { expiresIn: this.configService.authentication.accessExpireTime },
    );
  }

  private async createRefreshToken(data: { user_id: number; email: string; role: string }) {
    return await this.jwtService.signAsync(
      {
        user_id: data.user_id,
        email: data.email,
        type: TokenType.REFRESH_TOKEN,
        role: data.role,
      },
      { expiresIn: this.configService.authentication.refreshExpireTime },
    );
  }

  async signToken(user: User, isAccessToken = false) {
    const accessToken = await this.createAccessToken({
      user_id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.createRefreshToken({
      user_id: user.id,
      email: user.email,
      role: user.role,
    });

    if (isAccessToken) {
      return { accessToken };
    }
    return { accessToken, refreshToken };
  }

  async verifyAccessToken(authorization: string) {
    const accessToken = authorization.split('Bearer ')?.at(1);

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorize');
    }

    try {
      const decoded = await this.jwtService.verify(accessToken);

      if (decoded.type !== TokenType.ACCESS_TOKEN) {
        throw new UnauthorizedException('Unauthorize');
      }

      const user = await this.prismaService.user.findFirst({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedException('Unauthorize');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Unauthorize');
    }
  }
}
