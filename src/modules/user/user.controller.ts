import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserResponse } from './types/UserResponse.interface';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/UpdateUserDto';

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
  @UseGuards(AuthGuard)
  async getCurrentUser(@User() user: UserEntity): Promise<UserResponse> {
    return await this.userService.buildResponse(user);
  }
  @Put()
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.userService.updateUser(
      currentUserId,
      updateUserDto,
    );
    return await this.userService.buildResponse(user);
  }
}
