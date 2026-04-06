import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignmentStatus, Role } from '.prisma/client';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

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
}
