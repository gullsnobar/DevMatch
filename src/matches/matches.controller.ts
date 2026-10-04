import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto.js';
import { MatchesService } from './matches.service.js';

@Controller('users')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post(':id/like')
  like(@Param('id', ParseIntPipe) id: number, @Body() createLikeDto: CreateLikeDto) {
    return this.matchesService.like(createLikeDto.senderId, id);
  }

  @Post(':id/pass')
  pass(@Param('id', ParseIntPipe) id: number, @Body() createLikeDto: CreateLikeDto) {
    return this.matchesService.pass(createLikeDto.senderId, id);
  }

  @Get(':id/discover')
  getDiscoverable(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getDiscoverableUsers(id);
  }

  @Get(':id/matches')
  getMatches(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getMatches(id);
  }

  @Get(':id/likes')
  getIncomingLikes(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getIncomingLikes(id);
  }
}
