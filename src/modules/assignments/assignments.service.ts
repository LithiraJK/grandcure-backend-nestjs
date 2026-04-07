import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignmentStatus, Role } from '.prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestAssignment(patientId: number, role: Role, notes?: string) {
    if (role !== Role.PATIENT) {
      throw new ForbiddenException('Only PATIENT can create assignment requests');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        patientId,
        notes,
      },
    });

    return {
      message: 'Assignment request created successfully',
      result: assignment,
    };
  }

  async getPendingAssignments(careGiverRole: Role) {
    if (careGiverRole !== Role.CARE_GIVER) {
      throw new ForbiddenException('Only CARE_GIVER can view pending assignments');
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { status: AssignmentStatus.PENDING },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Pending assignments fetched successfully',
      result: assignments,
    };
  }

  async acceptAssignment(id: number, careGiverId: number, careGiverRole: Role) {
    if (careGiverRole !== Role.CARE_GIVER) {
      throw new ForbiddenException('Only CARE_GIVER can accept assignments');
    }

    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== AssignmentStatus.PENDING) {
      throw new ConflictException('Only pending assignments can be accepted');
    }

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.ACCEPTED,
        careGiverId,
      },
    });

    return {
      message: 'Assignment accepted successfully',
      result: updated,
    };
  }

  async completeAssignment(id: number, careGiverId: number, careGiverRole: Role) {
    if (careGiverRole !== Role.CARE_GIVER) {
      throw new ForbiddenException('Only CARE_GIVER can complete assignments');
    }

    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== AssignmentStatus.ACCEPTED) {
      throw new ConflictException('Only accepted assignments can be completed');
    }

    if (assignment.careGiverId !== careGiverId) {
      throw new ForbiddenException('Only the assigned caregiver can complete this assignment');
    }

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: { status: AssignmentStatus.COMPLETED },
    });

    return {
      message: 'Assignment completed successfully',
      result: updated,
    };
  }

  async cancelAssignment(id: number, patientId: number, patientRole: Role) {
    if (patientRole !== Role.PATIENT) {
      throw new ForbiddenException('Only PATIENT can cancel assignments');
    }

    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.patientId !== patientId) {
      throw new ForbiddenException('Only the owner patient can cancel this assignment');
    }

    if (
      assignment.status !== AssignmentStatus.PENDING &&
      assignment.status !== AssignmentStatus.ACCEPTED
    ) {
      throw new ConflictException('Only pending or accepted assignments can be cancelled');
    }

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: { status: AssignmentStatus.CANCELLED },
    });

    return {
      message: 'Assignment cancelled successfully',
      result: updated,
    };
  }
}
