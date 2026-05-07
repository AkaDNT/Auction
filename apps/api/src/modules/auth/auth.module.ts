import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { AuthPrismaRepository } from './auth.prisma.repository';
import { AUTH_REPOSITORY } from './auth.repository';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    AuthPrismaRepository,
    {
      provide: AUTH_REPOSITORY,
      useExisting: AuthPrismaRepository,
    },
  ],
  exports: [AuthService, AUTH_REPOSITORY],
})
export class AuthModule {}
