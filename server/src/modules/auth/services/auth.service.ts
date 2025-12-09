import { BadRequestException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'libs/modules/prisma/prisma.service';
import { generateHash, validateHash } from 'libs/utils/util';
import { TokenService } from './token.service';
import { UserRegisterDto } from '../dto/register.dto';
import { Role } from 'libs/utils/enum';
import { UserLoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) { }

  async getUserByEmail(email: string) {
    return await this.prismaService.user.findFirst({ where: { email } });
  }

  async register(
    body: UserRegisterDto,
  ) {
    const existingUser = await this.getUserByEmail(body.email);

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = generateHash(body.password);

    const newUser = await this.prismaService.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        passwordHash: hashedPassword,
        role: Role.USER,
      },
    });

    return this.tokenService.signToken(newUser);
  }

  async login(body: UserLoginDto) {
    const user = await this.getUserByEmail(body.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatchPassword = await validateHash(body.password, user.passwordHash);

    if (!isMatchPassword) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    return this.tokenService.signToken(user);
  }

  async generateNewToken(user: User, isAccessToken = false) {
    return this.tokenService.signToken(user, isAccessToken);
  }
}
