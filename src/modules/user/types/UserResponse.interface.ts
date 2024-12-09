import { UserEntity } from '../user.entity';

type UserType = Omit<UserEntity, 'hashPassword' | 'comparePassword'>;

export interface UserResponse {
  user: UserType & { token: string };
}
