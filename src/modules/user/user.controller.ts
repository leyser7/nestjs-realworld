import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  async createUser(
    @Body('user') createUserDto: createUserDto,
  ): Promise<UserEntity> {
    return await this.userService.createUser(createUserDto);
  }
}
