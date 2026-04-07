import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AssignmentsModule, ReviewsModule],
})
export class AppModule {}
