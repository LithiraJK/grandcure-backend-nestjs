import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterRole } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../../utils/cloudinary.service';

type UploadedDocumentFile = {
  buffer: Buffer;
  mimetype: string;
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
        isBlocked: true,
        isAvailable: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        designation: true,
        hourlyRate: true,
        profileImageUrl: true,
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
        latitude: dto.latitude,
        longitude: dto.longitude,
        phoneNumber: dto.phoneNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        address: dto.address,
        designation: dto.designation,
        hourlyRate: dto.hourlyRate,
        profileImageUrl: dto.profileImageUrl,
        idDocumentUrl: dto.idDocumentUrl,
        certDocumentUrl: dto.certDocumentUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        isAvailable: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        designation: true,
        hourlyRate: true,
        profileImageUrl: true,
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

  async setAvailability(userId: number, isAvailable: boolean) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isAvailable },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        isAvailable: true,
      },
    });

    return {
      message: 'Caregiver availability updated successfully',
      result: updated,
    };
  }

  async uploadProfileDocuments(
    userId: number,
    files: {
      profileImage?: UploadedDocumentFile[];
      idDocument?: UploadedDocumentFile[];
      certDocument?: UploadedDocumentFile[];
    },
  ) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const profileImageFile = files?.profileImage?.[0];
    const idDocumentFile = files?.idDocument?.[0];
    const certDocumentFile = files?.certDocument?.[0];

    if (!profileImageFile && !idDocumentFile && !certDocumentFile) {
      throw new BadRequestException('At least one file is required');
    }

    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

    if (profileImageFile && !allowedMimeTypes.has(profileImageFile.mimetype)) {
      throw new BadRequestException('profileImage must be a JPEG, PNG, or WEBP image');
    }

    if (idDocumentFile && !allowedMimeTypes.has(idDocumentFile.mimetype)) {
      throw new BadRequestException('idDocument must be a JPEG, PNG, or WEBP image');
    }

    if (certDocumentFile && !allowedMimeTypes.has(certDocumentFile.mimetype)) {
      throw new BadRequestException('certDocument must be a JPEG, PNG, or WEBP image');
    }

    const profileFolderName = `users/${userId}/profile`;
    const documentFolderName = `users/${userId}/documents`;

    const [profileUploadResult, idUploadResult, certUploadResult] = await Promise.all([
      profileImageFile
        ? this.cloudinaryService.uploadImageToCloudinary(profileImageFile.buffer, profileFolderName)
        : Promise.resolve(undefined),
      idDocumentFile
        ? this.cloudinaryService.uploadImageToCloudinary(idDocumentFile.buffer, documentFolderName)
        : Promise.resolve(undefined),
      certDocumentFile
        ? this.cloudinaryService.uploadImageToCloudinary(certDocumentFile.buffer, documentFolderName)
        : Promise.resolve(undefined),
    ]);

    return {
      message: 'Documents uploaded successfully',
      result: {
        profileImageUrl: profileUploadResult?.url,
        idDocumentUrl: idUploadResult?.url,
        certDocumentUrl: certUploadResult?.url,
      },
    };
  }
}