import { IsInt } from 'class-validator';

// No auth system exists yet, so the "current user" is sent explicitly
// in the request body for demo purposes.
export class CreateLikeDto {
  @IsInt()
  senderId: number;
}
