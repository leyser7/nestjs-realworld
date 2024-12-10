import { UserType } from '../../user/types/UserResponse.interface';

export type ProfileType = UserType & { following: boolean };

export interface ProfileResponse {
  profile: ProfileType;
}
