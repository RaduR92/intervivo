import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service.js';
import { AppException } from '@common/errors/app.exception.js';
import { FEEDBACK_ERROR_CODES } from '@common/errors/error-codes.js';
import type { AuthenticatedUser } from '@auth/interfaces/jwt-payload.interface.js';
import type { Feedback } from '@generated/prisma/client.js';
import { Role } from '@generated/prisma/enums.js';
import { CreateFeedbackDto } from './dto/create-feedback.dto.js';
import { UpdateFeedbackDto } from './dto/update-feedback.dto.js';
import { ListFeedbackQueryDto } from './dto/list-feedback-query.dto.js';
import { FeedbackResponseDto } from './dto/feedback-response.dto.js';
import { PaginatedFeedbackResponseDto } from './dto/paginated-feedback-response.dto.js';

const PERSON_SELECT = { id: true, firstName: true, lastName: true, email: true } as const;
const SESSION_SUMMARY_SELECT = { id: true, position: true, scheduledAt: true } as const;

type FeedbackWithRelations = Feedback & {
  author: { id: string; firstName: string; lastName: string; email: string };
  session: { id: string; position: string; scheduledAt: Date };
};

function toResponse(feedback: FeedbackWithRelations): FeedbackResponseDto {
  return {
    id: feedback.id,
    session: feedback.session,
    author: feedback.author,
    rating: feedback.rating,
    recommendation: feedback.recommendation,
    comments: feedback.comments,
    isPublished: feedback.isPublished,
    publishedAt: feedback.publishedAt,
    createdAt: feedback.createdAt,
  };
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateFeedbackDto,
    authorId: string,
  ): Promise<FeedbackResponseDto> {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) {
      throw new AppException(
        FEEDBACK_ERROR_CODES.SESSION_NOT_FOUND,
        'Interview session not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const existing = await this.prisma.feedback.findUnique({
      where: { sessionId: dto.sessionId },
    });
    if (existing) {
      throw new AppException(
        FEEDBACK_ERROR_CODES.FEEDBACK_ALREADY_EXISTS,
        'Feedback already exists for this session',
        HttpStatus.CONFLICT,
      );
    }

    const isPublished = dto.isPublished ?? false;
    const feedback = await this.prisma.feedback.create({
      data: {
        sessionId: dto.sessionId,
        authorId,
        candidateId: session.candidateId,
        rating: dto.rating,
        recommendation: dto.recommendation,
        comments: dto.comments,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { author: { select: PERSON_SELECT }, session: { select: SESSION_SUMMARY_SELECT } },
    });

    return toResponse(feedback);
  }

  async findAll(
    query: ListFeedbackQueryDto,
    requester: AuthenticatedUser,
  ): Promise<PaginatedFeedbackResponseDto> {
    const where =
      requester.role === Role.CANDIDATE
        ? { candidateId: requester.id, isPublished: true }
        : query.candidateId
          ? { candidateId: query.candidateId }
          : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        include: { author: { select: PERSON_SELECT }, session: { select: SESSION_SUMMARY_SELECT } },
        orderBy: { createdAt: 'desc' },
        take: query.take,
        skip: query.skip,
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return { data: items.map(toResponse), total, take: query.take, skip: query.skip };
  }

  async findOne(id: string, requester: AuthenticatedUser): Promise<FeedbackResponseDto> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: { author: { select: PERSON_SELECT }, session: { select: SESSION_SUMMARY_SELECT } },
    });
    const hidden =
      !feedback ||
      (requester.role === Role.CANDIDATE &&
        (feedback.candidateId !== requester.id || !feedback.isPublished));
    if (hidden) {
      throw new AppException(
        FEEDBACK_ERROR_CODES.FEEDBACK_NOT_FOUND,
        'Feedback not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return toResponse(feedback);
  }

  async update(id: string, dto: UpdateFeedbackDto): Promise<FeedbackResponseDto> {
    const existing = await this.prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      throw new AppException(
        FEEDBACK_ERROR_CODES.FEEDBACK_NOT_FOUND,
        'Feedback not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const publishedAt =
      dto.isPublished === undefined
        ? undefined
        : dto.isPublished
          ? (existing.publishedAt ?? new Date())
          : null;

    const feedback = await this.prisma.feedback.update({
      where: { id },
      data: {
        rating: dto.rating,
        recommendation: dto.recommendation,
        comments: dto.comments,
        isPublished: dto.isPublished,
        publishedAt,
      },
      include: { author: { select: PERSON_SELECT }, session: { select: SESSION_SUMMARY_SELECT } },
    });

    return toResponse(feedback);
  }
}
