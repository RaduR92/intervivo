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
  ApiConflictResponse,
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
import { CreateFeedbackDto } from './dto/create-feedback.dto.js';
import { UpdateFeedbackDto } from './dto/update-feedback.dto.js';
import { ListFeedbackQueryDto } from './dto/list-feedback-query.dto.js';
import { FeedbackResponseDto } from './dto/feedback-response.dto.js';
import { PaginatedFeedbackResponseDto } from './dto/paginated-feedback-response.dto.js';
import { FeedbackService } from './feedback.service.js';

@ApiTags('feedback')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(Role.HR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Write feedback for an interview session (HR only)',
    description:
      'One feedback per session. Defaults to a draft (isPublished: false) ' +
      "the candidate can't see until explicitly published.",
  })
  @ApiCreatedResponse({ type: FeedbackResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async create(
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List feedback',
    description:
      'HR sees drafts and published feedback for any candidate (optionally ' +
      'filtered by candidateId). A CANDIDATE only ever sees their own ' +
      'published feedback — drafts are invisible to them.',
  })
  @ApiOkResponse({ type: PaginatedFeedbackResponseDto })
  async findAll(
    @Query() query: ListFeedbackQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedFeedbackResponseDto> {
    return this.feedbackService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single feedback entry',
    description:
      'HR can fetch any. A CANDIDATE can only fetch their own published ' +
      "feedback — anything else (not theirs, or still a draft) reports " +
      "404, the same as one that doesn't exist.",
  })
  @ApiOkResponse({ type: FeedbackResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.HR)
  @ApiOperation({ summary: 'Edit feedback, including the publish toggle (HR only)' })
  @ApiOkResponse({ type: FeedbackResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.update(id, dto);
  }
}
