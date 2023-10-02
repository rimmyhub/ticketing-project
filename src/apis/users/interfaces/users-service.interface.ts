import { CreateUserDto } from '../dto/create-user.dto';

export interface IUsersServiceCreateUser {
  createUserDto: CreateUserDto;
}

export interface IUsersServiceFindByEmail {
  email: string;
}
