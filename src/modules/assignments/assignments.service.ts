import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignmentStatus, Role } from '.prisma/client';
import { calculateDistance } from '../../common/utils/distance.util';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestAssignment(patientId: number, role: Role, type?: string, notes?: string) {
    if (role !== Role.PATIENT) {
      throw new ForbiddenException('Only PATIENT can create assignment requests');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        patientId,
        type,
        notes,
      },
    });

    return {
      message: 'Assignment request created successfully',
      result: assignment,
    };
  }

  async getPendingAssignments(careGiverId: number, careGiverRole: Role) {
    if (careGiverRole !== Role.CARE_GIVER) {
      throw new ForbiddenException('Only CARE_GIVER can view pending assignments');
    }

    const careGiver = await this.prisma.user.findUnique({
      where: { id: careGiverId },
      select: { latitude: true, longitude: true },
    });

    if (!careGiver || careGiver.latitude == null || careGiver.longitude == null) {
      throw new BadRequestException('Caregiver coordinates are not set');
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { status: AssignmentStatus.PENDING },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const nearbyAssignments = assignments
      .filter(
        (assignment) =>
          assignment.patient.latitude != null && assignment.patient.longitude != null,
      )
      .map((assignment) => {
        const distanceKm = calculateDistance(
          careGiver.latitude as number,
          careGiver.longitude as number,
          assignment.patient.latitude as number,
          assignment.patient.longitude as number,
        );

        return {
          ...assignment,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((assignment) => assignment.distanceKm <= 15);

    return {
      message: 'Nearby pending assignments fetched successfully',
      result: nearbyAssignments,
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

    if (assignment.status !== AssignmentStatus.IN_PROGRESS) {
      throw new ConflictException('Only in-progress assignments can be completed');
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

  async startAssignment(id: number, careGiverId: number, careGiverRole: Role) {
    if (careGiverRole !== Role.CARE_GIVER) {
      throw new ForbiddenException('Only CARE_GIVER can start assignments');
    }

    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== AssignmentStatus.ACCEPTED) {
      throw new ConflictException('Only accepted assignments can be started');
    }

    if (assignment.careGiverId !== careGiverId) {
      throw new ForbiddenException('Only the assigned caregiver can start this assignment');
    }

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: { status: AssignmentStatus.IN_PROGRESS },
    });

    return {
      message: 'Assignment started successfully',
      result: updated,
    };
  }

  async getPatientHistory(patientId: number, patientRole: Role) {
    if (patientRole !== Role.PATIENT) {
      throw new ForbiddenException('Only PATIENT can view patient assignment history');
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { patientId },
      include: {
        careGiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Patient assignment history fetched successfully',
      result: assignments,
    };
  }

  async getCareGiverHistory(careGiverId: number, careGiverRole: Role) {
    if (careGiverRole !== Role.CARE_GIVER) {
      throw new ForbiddenException('Only CARE_GIVER can view caregiver assignment history');
    }

    const assignments = await this.prisma.assignment.findMany({
      where: {
        careGiverId,
        status: {
          in: [AssignmentStatus.ACCEPTED, AssignmentStatus.COMPLETED],
        },
      },
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
      message: 'Caregiver assignment history fetched successfully',
      result: assignments,
    };
  }
}
