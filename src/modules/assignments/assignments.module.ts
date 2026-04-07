import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, RolesGuard],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
