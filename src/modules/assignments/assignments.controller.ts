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

type AuthenticatedRequest = Request & {
  user: {
    id: number;
    role: Role;
  };
};

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('request')
  requestAssignment(@Req() req: AuthenticatedRequest, @Body() dto: RequestAssignmentDto) {
    return this.assignmentsService.requestAssignment(req.user.id, req.user.role, dto.notes);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  getPendingAssignments(@Req() req: AuthenticatedRequest) {
    return this.assignmentsService.getPendingAssignments(req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  acceptAssignment(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.assignmentsService.acceptAssignment(id, req.user.id, req.user.role);
  }
}
