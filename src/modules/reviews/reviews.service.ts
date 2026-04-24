import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '.prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(patientId: number, role: Role, dto: CreateReviewDto) {
    if (role !== Role.PATIENT) {
      throw new ForbiddenException('Only PATIENT can create reviews');
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: dto.assignmentId },
      include: { review: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.patientId !== patientId) {
      throw new ForbiddenException('You can review only your own assignments');
    }

    if (assignment.status !== 'COMPLETED') {
      throw new ConflictException('You can review only completed assignments');
    }

    if (!assignment.careGiverId) {
      throw new ConflictException('Cannot review assignment without a caregiver');
    }

    if (assignment.review) {
      throw new ConflictException('This assignment already has a review');
    }

    const review = await this.prisma.review.create({
      data: {
        assignmentId: assignment.id,
        patientId,
        careGiverId: assignment.careGiverId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    return {
      message: 'Review created successfully',
      result: review,
    };
  }

  async getCareGiverReviews(careGiverId: number) {
    const careGiver = await this.prisma.user.findUnique({
      where: { id: careGiverId },
      select: { id: true, role: true, name: true },
    });

    if (!careGiver || careGiver.role !== Role.CARE_GIVER) {
      throw new NotFoundException('Caregiver not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: { careGiverId },
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

    const averageRating =
      reviews.length > 0
        ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2))
        : 0;

    return {
      message: 'Caregiver reviews fetched successfully',
      result: {
        careGiverId,
        careGiverName: careGiver.name,
        averageRating,
        totalReviews: reviews.length,
        reviews,
      },
    };
  }
}
