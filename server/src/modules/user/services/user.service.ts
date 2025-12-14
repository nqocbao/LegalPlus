import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "libs/modules/prisma/prisma.service";
import { ContextProvider } from "libs/utils/providers/context.provider";
import { GetAllUsersDto } from "../dto/get-all-users.dto";
import { assignPaging, returnPaging } from "libs/utils/helpers";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-uset.dto";
import { generateHash } from "libs/utils/util";
import { UpdateProfileDto } from "../dto/update-profile.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async getProfile() {
    const user: User = ContextProvider.getAuthUser();
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const foundUser = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    return foundUser;
  }

  async updateProfile(body: UpdateProfileDto) {
    const authUser: User = ContextProvider.getAuthUser();
    if (!authUser) {
      throw new UnauthorizedException('User not authenticated');
    }

    const updated = await this.prismaService.user.update({
      where: { id: authUser.id },
      data: {
        fullName: body.fullName ?? undefined,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async getAllUsers(query: GetAllUsersDto) {
    const paging = assignPaging(query);

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [paging.sortBy]: paging.sortOrder,
    };

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (paging.search) {
      where.OR = [
        { fullName: { contains: paging.search, mode: 'insensitive' } },
        { email: { contains: paging.search, mode: 'insensitive' } },
      ];
    }

    if (paging.role) {
      where.role = paging.role;
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip: paging.skip,
        take: paging.take,
        orderBy,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      this.prismaService.user.count({ where })
    ]);

    return returnPaging(users, total, paging);
  }

  async getOneUser(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(body: CreateUserDto) {
    const existEmail = await this.prismaService.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    if (existEmail) {
      throw new BadRequestException('Email already exists');
    }

    const newUser = await this.prismaService.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        passwordHash: generateHash(body.password),
        role: body.role,
      },
    });

    return newUser;
  }

  async updateUser(id: number, body: UpdateUserDto) {
    const existUser = await this.getOneUser(id);

    if (body.email && body.email !== existUser.email) {
      const existEmail = await this.prismaService.user.findUnique({
        where: { email: body.email },
        select: { id: true },
      });
      if (existEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        fullName: body.fullName,
        email: body.email,
        passwordHash: body.password ? generateHash(body.password) : undefined,
        role: body.role,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: number) {
    const existUser = await this.getOneUser(id);

    const deletedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return deletedUser;
  }
}
