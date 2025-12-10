import { CoreControllers } from "libs/utils/decorators/controller-customer.decorator";
import { UserService } from "./services/user.service";
import { Auth } from "libs/utils/decorators";
import { Body, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { Role } from "libs/utils/enum";
import { GetAllUsersDto } from "./dto/get-all-users.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-uset.dto";

@CoreControllers({
  path: 'users',
  tag: 'User',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @Auth()
  @Get('me')
  async getProfile() {
    return await this.userService.getProfile();
  }

  @Auth([Role.ADMIN])
  @Get()
  async getAllUsers(
    @Query() query: GetAllUsersDto,
  ) {
    return await this.userService.getAllUsers(query);
  }

  @Auth([Role.ADMIN])
  @Get(':id')
  async getOneUser(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.userService.getOneUser(id);
  }

  @Auth([Role.ADMIN])
  @Post()
  async createUser(
    @Body() body: CreateUserDto,
  ) {
    return await this.userService.createUser(body);
  }

  @Auth([Role.ADMIN])
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, body);
  }

  @Auth([Role.ADMIN])
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.userService.deleteUser(id);
  }
}
