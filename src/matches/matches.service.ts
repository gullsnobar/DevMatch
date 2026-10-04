import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  private async findUserOrFail(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async like(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new BadRequestException('Users cannot like themselves');
    }

    await this.findUserOrFail(senderId);
    const receiver = await this.findUserOrFail(receiverId);

    const existing = await this.prisma.like.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });

    if (existing) {
      throw new ConflictException('You have already liked this person');
    }

    await this.prisma.like.create({
      data: { senderId, receiverId, status: 'LIKE' },
    });

    const reverseLike = await this.prisma.like.findUnique({
      where: {
        senderId_receiverId: {
          senderId: receiverId,
          receiverId: senderId,
        },
      },
    });

    if (reverseLike?.status === 'LIKE') {
      const [userAId, userBId] = [Math.min(senderId, receiverId), Math.max(senderId, receiverId)];

      const match = await this.prisma.match.upsert({
        where: { userAId_userBId: { userAId, userBId } },
        update: {},
        create: { userAId, userBId },
      });

      return {
        message: "It's a match!",
        match: true,
        matchId: match.id,
        matchedWith: receiver,
      };
    }

    return { message: 'User liked successfully', match: false };
  }

  async pass(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new BadRequestException('Users cannot pass on themselves');
    }

    await this.findUserOrFail(senderId);
    await this.findUserOrFail(receiverId);

    const existing = await this.prisma.like.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });

    if (existing) {
      throw new ConflictException('You have already interacted with this person');
    }

    await this.prisma.like.create({
      data: { senderId, receiverId, status: 'PASS' },
    });

    return { message: 'Profile passed' };
  }

  async getDiscoverableUsers(userId: number) {
    await this.findUserOrFail(userId);

    const [interactions, matches] = await Promise.all([
      this.prisma.like.findMany({
        where: { senderId: userId },
        select: { receiverId: true },
      }),
      this.prisma.match.findMany({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
        select: { userAId: true, userBId: true },
      }),
    ]);

    const excluded = new Set<number>([userId]);
    for (const like of interactions) excluded.add(like.receiverId);
    for (const match of matches) {
      excluded.add(match.userAId);
      excluded.add(match.userBId);
    }

    return this.prisma.user.findMany({
      where: { id: { notIn: [...excluded] } },
      orderBy: { id: 'asc' },
    });
  }

  async getMatches(userId: number) {
    await this.findUserOrFail(userId);

    const matches = await this.prisma.match.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: { userA: true, userB: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      matches: matches.map((match) => {
        const other = match.userAId === userId ? match.userB : match.userA;
        return {
          id: other.id,
          name: other.name,
          username: other.username,
          role: other.role,
          matchedAt: match.createdAt,
        };
      }),
    };
  }

  async getIncomingLikes(userId: number) {
    await this.findUserOrFail(userId);

    const likes = await this.prisma.like.findMany({
      where: { receiverId: userId, status: 'LIKE' },
      include: { sender: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      likes: likes.map((like) => ({
        id: like.sender.id,
        name: like.sender.name,
        username: like.sender.username,
        role: like.sender.role,
      })),
    };
  }
}
