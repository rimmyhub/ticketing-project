import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUsersServiceFindUser {
  userId: string;
}

export interface IUsersServiceCreateUser {
  createUserDto: CreateUserDto;
}

export interface IUsersServiceFindByEmail {
  email: string;
}

export interface IUsersServiceFindById {
  userId: string;
}

export interface IUsersServiceUpdateUser {
  updateUserDto: UpdateUserDto;
  userId: string;
}

export interface IUsersServiceDeleteUser {
  userId: string;
}
