import { Injectable } from '@nestjs/common';
import { CreateDeveloperDto } from './dto/create-developer.dto.js';

@Injectable()
export class DevelopersService {
  private developers = [
    {
      id: 1,
      name: 'Gull',
      role: 'Software Engineer',
      skills: ['NestJS', 'React', 'Node.js'],
    },
  ];

  getDevelopers() {
    return this.developers;
  }

  createDeveloper(createDeveloperDto: CreateDeveloperDto) {
    const newDeveloper = {
      id: this.developers.length + 1,
      ...createDeveloperDto,
    };

    this.developers.push(newDeveloper);

    return newDeveloper;
  }
}