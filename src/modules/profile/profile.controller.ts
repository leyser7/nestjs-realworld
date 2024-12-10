import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResponse } from './types/profile.interface';
import { User } from '../user/decorators/user.decorator';
import { AuthGuard } from '../user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  @Get(':username')
  async getProfileByUsername(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.getProfileByUsername(
      currentUserId,
      username,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followUser(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.followUser(
      currentUserId,
      username,
    );
    return this.profileService.buildProfileResponse(profile);
  }
  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowUser(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.unfollowUser(
      currentUserId,
      username,
    );
    return this.profileService.buildProfileResponse(profile);
  }
}
