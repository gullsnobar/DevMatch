import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateDeveloperDto } from './dto/create-developer.dto.js';
import { DevelopersService } from './developers.service.js';

@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get()
  getDevelopers() {
    return this.developersService.getDevelopers();
  }

  @Post()
  createDeveloper(@Body() createDeveloperDto: CreateDeveloperDto) {
    return this.developersService.createDeveloper(createDeveloperDto);
  }
}