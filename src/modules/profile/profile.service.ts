import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponse, ProfileType } from './types/profile.interface';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private followRepository: Repository<FollowEntity>,
  ) {}
  async getProfileByUsername(currentUserId: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });
    return { ...user, following: !!follow };
  }
  buildProfileResponse(profile: ProfileType): ProfileResponse {
    delete profile.email;
    return { profile };
  }
  async followUser(currentUserId: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (currentUserId === user.id) {
      throw new HttpException('Follower and following user can not be the same', HttpStatus.BAD_REQUEST);
    }
    const following = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });
    if (!following) {
      const follow = new FollowEntity();
      follow.followerId = currentUserId;
      follow.followingId = user.id;
      await this.followRepository.save(follow);
    }
    return { ...user, following: true };
  }
  async unfollowUser(currentUserId: number, username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (currentUserId === user.id) {
      throw new HttpException('Follower and following user can not be the same', HttpStatus.BAD_REQUEST);
    }
    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });
    return { ...user, following: false };
  }
}
