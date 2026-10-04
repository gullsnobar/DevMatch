import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

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
    const user = users.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  create(createUserDto: CreateUserDto) {
    const newUser = {
      id: users.length + 1,
      ...createUserDto,
    };

    users.push(newUser);
    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = users.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.username !== undefined)
      user.username = updateUserDto.username;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;

    return user;
  }

  remove(id: number) {
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    users.splice(index, 1);
    return { message: 'User deleted successfully' };
  }
}
