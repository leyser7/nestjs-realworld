import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserResponse } from './types/UserResponse.interface';
import { get } from 'http';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponse> {
    const user = await this.userService.createUser(createUserDto);
    return await this.userService.buildResponse(user);
  }
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponse> {
    const user = await this.userService.loginUser(loginUserDto);
    return await this.userService.buildResponse(user);
  }
  @Get()
  async getCurrentUser(@Req() request: any): Promise<UserResponse> {
    return await this.userService.buildResponse(request.user);
  }
}
