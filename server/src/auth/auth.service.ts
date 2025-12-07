import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HashService } from './hash.service';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async register(dto: RegisterDto): Promise<{ token: string }> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const exists = await this.users.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    const user = this.users.create({
      email: dto.email,
      passwordHash: await this.hashService.hash(dto.password),
      role: 'user',
    });
    await this.users.save(user);

    return { token: this.sign(user) };
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await this.hashService.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { token: this.sign(user) };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.users.findOne({ where: { id: userId } });
  }

  private sign(user: User): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
