import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfilePrismaRepository } from './profile.prisma.repository';
import { PROFILE_REPOSITORY } from './profile.repository';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfilePrismaRepository,
    {
      provide: PROFILE_REPOSITORY,
      useExisting: ProfilePrismaRepository,
    },
  ],
  exports: [ProfileService, PROFILE_REPOSITORY],
})
export class ProfileModule {}
