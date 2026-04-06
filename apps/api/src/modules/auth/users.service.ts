import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@repo/db';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, password: string, role: Role = Role.USER) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });
  }
}
