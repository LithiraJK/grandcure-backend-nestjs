import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isBlocked: true,
        phoneNumber: true,
        idDocumentUrl: true,
        certDocumentUrl: true,
      },
      orderBy: { id: 'asc' },
    });

    return {
      message: 'Users fetched successfully',
      result: users,
    };
  }

  async toggleUserVerification(id: number) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, isVerified: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isVerified: !existing.isVerified },
      select: { id: true, isVerified: true },
    });

    return {
      message: 'User verification status updated successfully',
      result: updated,
    };
  }

  async toggleUserBlock(id: number) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, isBlocked: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: !existing.isBlocked },
      select: { id: true, isBlocked: true },
    });

    return {
      message: 'User block status updated successfully',
      result: updated,
    };
  }

  async getAllAssignments() {
    const assignments = await this.prisma.assignment.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        careGiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Assignments fetched successfully',
      result: assignments,
    };
  }
}
