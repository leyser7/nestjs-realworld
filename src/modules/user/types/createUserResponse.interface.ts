import { UserEntity } from '../user.entity';

type UserType = Omit<UserEntity, 'hashPassword'>;

export interface CreateUserResponse {
  user: UserType & { token: string };
}
