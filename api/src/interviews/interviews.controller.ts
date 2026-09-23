import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@common/dto/error-response.dto.js';
import { Roles } from '@common/decorators/roles.decorator.js';
import { Role } from '@generated/prisma/enums.js';
import { CurrentUser } from '@auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '@auth/interfaces/jwt-payload.interface.js';
import { CreateInterviewSessionDto } from './dto/create-interview-session.dto.js';
import { UpdateInterviewSessionDto } from './dto/update-interview-session.dto.js';
import { ListInterviewSessionsQueryDto } from './dto/list-interview-sessions-query.dto.js';
import { InterviewSessionResponseDto } from './dto/interview-session-response.dto.js';
import { PaginatedInterviewSessionsResponseDto } from './dto/paginated-interview-sessions-response.dto.js';
import { InterviewsService } from './interviews.service.js';

@ApiTags('interviews')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @Roles(Role.HR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule an interview session (HR only)' })
  @ApiCreatedResponse({ type: InterviewSessionResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async create(
    @Body() dto: CreateInterviewSessionDto,
  ): Promise<InterviewSessionResponseDto> {
    return this.interviewsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List interview sessions',
    description:
      'HR sees any candidate (optionally filtered by candidateId); a ' +
      'CANDIDATE is always forced to their own sessions. ?section=upcoming ' +
      'or ?section=history splits by status.',
  })
  @ApiOkResponse({ type: PaginatedInterviewSessionsResponseDto })
  async findAll(
    @Query() query: ListInterviewSessionsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedInterviewSessionsResponseDto> {
    return this.interviewsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single interview session',
    description:
      "HR can fetch any session. A CANDIDATE can only fetch their own — " +
      "any other id reports 404, the same as one that doesn't exist.",
  })
  @ApiOkResponse({ type: InterviewSessionResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InterviewSessionResponseDto> {
    return this.interviewsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.HR)
  @ApiOperation({
    summary: 'Reschedule, reassign, or change the status of a session (HR only)',
  })
  @ApiOkResponse({ type: InterviewSessionResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewSessionDto,
  ): Promise<InterviewSessionResponseDto> {
    return this.interviewsService.update(id, dto);
  }
}
