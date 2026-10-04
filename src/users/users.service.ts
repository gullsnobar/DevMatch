import { Injectable } from '@nestjs/common';

type CreateUserInput = {
  name: string;
  username: string;
  role: string;
};

const users = [
  {
    id: 1,
    name: 'Ali',
    username: 'ali-dev',
    role: 'Frontend Developer',
  },
  {
    id: 2,
    name: 'Ahmed',
    username: 'ahmed-code',
    role: 'Backend Developer',
  },
];

@Injectable()
export class UsersService {
  findAll() {
    return users;
  }

  findOne(id: number) {
    return users.find((user) => user.id === id) ?? null;
  }

  create(userData: CreateUserInput) {
    const newUser = {
      id: users.length + 1,
      ...userData,
    };

    users.push(newUser);
    return newUser;
  }
}