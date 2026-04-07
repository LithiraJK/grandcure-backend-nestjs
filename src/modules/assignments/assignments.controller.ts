import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestAssignmentDto } from './dto/request-assignment.dto';
import { Role } from '.prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
    role: Role;
  };
};

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT')
  @Post('request')
  requestAssignment(@Req() req: AuthenticatedRequest, @Body() dto: RequestAssignmentDto) {
    return this.assignmentsService.requestAssignment(req.user.id, req.user.role, dto.notes);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CARE_GIVER')
  @Get('pending')
  getPendingAssignments(@Req() req: AuthenticatedRequest) {
    return this.assignmentsService.getPendingAssignments(req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CARE_GIVER')
  @Patch(':id/accept')
  acceptAssignment(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.assignmentsService.acceptAssignment(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CARE_GIVER')
  @Patch(':id/complete')
  completeAssignment(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.assignmentsService.completeAssignment(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT')
  @Patch(':id/cancel')
  cancelAssignment(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.assignmentsService.cancelAssignment(id, req.user.id, req.user.role);
  }
}
