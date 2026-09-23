import { HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '@db/prisma.service.js';
import { AppException } from '@common/errors/app.exception.js';
import { USERS_ERROR_CODES } from '@common/errors/error-codes.js';
import type { CandidateProfile, User } from '@generated/prisma/client.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { UpdateCandidateDto } from './dto/update-candidate.dto.js';
import { CandidateResponseDto } from './dto/candidate-response.dto.js';
import { PaginatedCandidatesResponseDto } from './dto/paginated-candidates-response.dto.js';

type CandidateWithProfile = User & { candidateProfile: CandidateProfile | null };

function toCandidateResponse(user: CandidateWithProfile): CandidateResponseDto {
  const { candidateProfile } = user;
  if (!candidateProfile) {
    // Should be unreachable — every CANDIDATE row is created together with
    // its profile in one transaction (see createCandidate). If this ever
    // fires, the app-layer invariant documented in the README was violated
    // some other way, so surface it as an internal error rather than paper
    // over it with fake defaults.
    throw new Error(`CANDIDATE user ${user.id} has no CandidateProfile row`);
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    profile: {
      phone: candidateProfile.phone,
      currentRole: candidateProfile.currentRole,
      yearsExperience: candidateProfile.yearsExperience,
      targetRole: candidateProfile.targetRole,
      resumeUrl: candidateProfile.resumeUrl,
      notes: candidateProfile.notes,
      skills: candidateProfile.skills,
    },
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCandidate(dto: CreateCandidateDto): Promise<CandidateResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new AppException(
        USERS_ERROR_CODES.EMAIL_ALREADY_EXISTS,
        'A user with this email already exists',
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: 'CANDIDATE',
          firstName: dto.firstName,
          lastName: dto.lastName,
          candidateProfile: {
            create: {
              phone: dto.phone,
              currentRole: dto.currentRole,
              yearsExperience: dto.yearsExperience,
              targetRole: dto.targetRole,
              resumeUrl: dto.resumeUrl,
              notes: dto.notes,
              skills: dto.skills,
            },
          },
        },
        include: { candidateProfile: true },
      });
      return created;
    });

    return toCandidateResponse(user);
  }

  async findAllCandidates(
    take: number,
    skip: number,
  ): Promise<PaginatedCandidatesResponseDto> {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { role: 'CANDIDATE' },
        include: { candidateProfile: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.user.count({ where: { role: 'CANDIDATE' } }),
    ]);

    return {
      data: users.map(toCandidateResponse),
      total,
      take,
      skip,
    };
  }

  async findCandidateById(id: string): Promise<CandidateResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { candidateProfile: true },
    });
    if (!user || user.role !== 'CANDIDATE') {
      throw new AppException(
        USERS_ERROR_CODES.CANDIDATE_NOT_FOUND,
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return toCandidateResponse(user);
  }

  async updateCandidateProfile(
    id: string,
    dto: UpdateCandidateDto,
  ): Promise<CandidateResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'CANDIDATE') {
      throw new AppException(
        USERS_ERROR_CODES.CANDIDATE_NOT_FOUND,
        'Candidate not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        candidateProfile: {
          update: {
            phone: dto.phone,
            currentRole: dto.currentRole,
            yearsExperience: dto.yearsExperience,
            targetRole: dto.targetRole,
            resumeUrl: dto.resumeUrl,
            notes: dto.notes,
            skills: dto.skills,
          },
        },
      },
      include: { candidateProfile: true },
    });

    return toCandidateResponse(updated);
  }
}
