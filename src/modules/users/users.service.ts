import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterRole } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(name: string, email: string, password: string, role: RegisterRole) {
  const hashed = await bcrypt.hash(password, 10);

  return this.prisma.user.create({
    data: { name, email, password: hashed, role },
  });
}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlock: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        designation: true,
        hourlyRate: true,
        idDocumentUrl: true,
        certDocumentUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User profile fetched successfully',
      result: user,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: dto.phoneNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        address: dto.address,
        designation: dto.designation,
        hourlyRate: dto.hourlyRate,
        idDocumentUrl: dto.idDocumentUrl,
        certDocumentUrl: dto.certDocumentUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlock: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        designation: true,
        hourlyRate: true,
        idDocumentUrl: true,
        certDocumentUrl: true,
        createdAt: true,
      },
    });

    return {
      message: 'User profile updated successfully',
      result: updated,
    };
  }
}