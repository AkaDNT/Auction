import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { JwtAccessStrategy } from './jwt-access.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtAccessStrategy],
  exports: [AuthService],
})
export class AuthModule {}
