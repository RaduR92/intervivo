import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@db/prisma.service.js';
import { AppException } from '@common/errors/app.exception.js';
import { INTERVIEWS_ERROR_CODES } from '@common/errors/error-codes.js';
import type { AuthenticatedUser } from '@auth/interfaces/jwt-payload.interface.js';
import type { InterviewSession } from '@generated/prisma/client.js';
import { InterviewStatus, Role } from '@generated/prisma/enums.js';
import { CreateInterviewSessionDto } from './dto/create-interview-session.dto.js';
import { UpdateInterviewSessionDto } from './dto/update-interview-session.dto.js';
import { ListInterviewSessionsQueryDto } from './dto/list-interview-sessions-query.dto.js';
import { InterviewSessionResponseDto } from './dto/interview-session-response.dto.js';
import { PaginatedInterviewSessionsResponseDto } from './dto/paginated-interview-sessions-response.dto.js';

const PERSON_SELECT = { id: true, firstName: true, lastName: true, email: true } as const;

type SessionWithPeople = InterviewSession & {
  candidate: { id: string; firstName: string; lastName: string; email: string };
  interviewer: { id: string; firstName: string; lastName: string; email: string };
};

function toResponse(session: SessionWithPeople): InterviewSessionResponseDto {
  return {
    id: session.id,
    candidate: session.candidate,
    interviewer: session.interviewer,
    scheduledAt: session.scheduledAt,
    durationMinutes: session.durationMinutes,
    position: session.position,
    type: session.type,
    status: session.status,
    meetingLink: session.meetingLink,
    notes: session.notes,
    createdAt: session.createdAt,
  };
}

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInterviewSessionDto): Promise<InterviewSessionResponseDto> {
    const [candidate, interviewer] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.candidateId } }),
      this.prisma.user.findUnique({ where: { id: dto.interviewerId } }),
    ]);
    if (!candidate || candidate.role !== Role.CANDIDATE) {
      throw new AppException(
        INTERVIEWS_ERROR_CODES.INVALID_CANDIDATE,
        'candidateId does not refer to a CANDIDATE user',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!interviewer || interviewer.role !== Role.HR) {
      throw new AppException(
        INTERVIEWS_ERROR_CODES.INVALID_INTERVIEWER,
        'interviewerId does not refer to an HR user',
        HttpStatus.BAD_REQUEST,
      );
    }

    const session = await this.prisma.interviewSession.create({
      data: {
        candidateId: dto.candidateId,
        interviewerId: dto.interviewerId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes,
        position: dto.position,
        type: dto.type,
        meetingLink: dto.meetingLink,
        notes: dto.notes,
      },
      include: { candidate: { select: PERSON_SELECT }, interviewer: { select: PERSON_SELECT } },
    });

    return toResponse(session);
  }

  async findAll(
    query: ListInterviewSessionsQueryDto,
    requester: AuthenticatedUser,
  ): Promise<PaginatedInterviewSessionsResponseDto> {
    const candidateId = requester.role === Role.CANDIDATE ? requester.id : query.candidateId;

    // An exact status wins over the upcoming/history grouping if both are given.
    const statusFilter: { status?: InterviewStatus | { in: InterviewStatus[] } } = query.status
      ? { status: query.status }
      : query.section === 'upcoming'
        ? { status: InterviewStatus.SCHEDULED }
        : query.section === 'history'
          ? { status: { in: [InterviewStatus.COMPLETED, InterviewStatus.CANCELLED] } }
          : {};

    const typeFilter = query.type ? { type: query.type } : {};

    const searchFilter = query.search
      ? {
          OR: [
            { position: { contains: query.search, mode: 'insensitive' as const } },
            {
              candidate: {
                firstName: { contains: query.search, mode: 'insensitive' as const },
              },
            },
            {
              candidate: {
                lastName: { contains: query.search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const where = {
      ...(candidateId ? { candidateId } : {}),
      ...statusFilter,
      ...typeFilter,
      ...searchFilter,
    };

    const [sessions, total] = await this.prisma.$transaction([
      this.prisma.interviewSession.findMany({
        where,
        include: { candidate: { select: PERSON_SELECT }, interviewer: { select: PERSON_SELECT } },
        orderBy: { scheduledAt: query.section === 'history' ? 'desc' : 'asc' },
        take: query.take,
        skip: query.skip,
      }),
      this.prisma.interviewSession.count({ where }),
    ]);

    return { data: sessions.map(toResponse), total, take: query.take, skip: query.skip };
  }

  async findOne(id: string, requester: AuthenticatedUser): Promise<InterviewSessionResponseDto> {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id },
      include: { candidate: { select: PERSON_SELECT }, interviewer: { select: PERSON_SELECT } },
    });
    if (!session || (requester.role === Role.CANDIDATE && session.candidateId !== requester.id)) {
      throw new AppException(
        INTERVIEWS_ERROR_CODES.SESSION_NOT_FOUND,
        'Interview session not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return toResponse(session);
  }

  async update(
    id: string,
    dto: UpdateInterviewSessionDto,
  ): Promise<InterviewSessionResponseDto> {
    const existing = await this.prisma.interviewSession.findUnique({ where: { id } });
    if (!existing) {
      throw new AppException(
        INTERVIEWS_ERROR_CODES.SESSION_NOT_FOUND,
        'Interview session not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.interviewerId) {
      const interviewer = await this.prisma.user.findUnique({ where: { id: dto.interviewerId } });
      if (!interviewer || interviewer.role !== Role.HR) {
        throw new AppException(
          INTERVIEWS_ERROR_CODES.INVALID_INTERVIEWER,
          'interviewerId does not refer to an HR user',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const session = await this.prisma.interviewSession.update({
      where: { id },
      data: {
        interviewerId: dto.interviewerId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        durationMinutes: dto.durationMinutes,
        position: dto.position,
        type: dto.type,
        status: dto.status,
        meetingLink: dto.meetingLink,
        notes: dto.notes,
      },
      include: { candidate: { select: PERSON_SELECT }, interviewer: { select: PERSON_SELECT } },
    });

    return toResponse(session);
  }
}
