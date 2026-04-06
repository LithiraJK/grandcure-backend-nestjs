import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AssignmentsModule],
})
export class AppModule {}
