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
  ApiCookieAuth,
  ApiConflictResponse,
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
import { CandidateResponseDto } from './dto/candidate-response.dto.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { ListCandidatesQueryDto } from './dto/list-candidates-query.dto.js';
import { PaginatedCandidatesResponseDto } from './dto/paginated-candidates-response.dto.js';
import { UpdateCandidateDto } from './dto/update-candidate.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
@Controller('users/candidates')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.HR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a candidate account (HR only)',
    description:
      'Creates the User (role CANDIDATE) and its CandidateProfile together ' +
      'in one transaction — this is the only place a CandidateProfile is ' +
      'ever created. HR sets a temporary password directly; there is no ' +
      'invite/self-registration flow yet.',
  })
  @ApiCreatedResponse({ type: CandidateResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateCandidateDto): Promise<CandidateResponseDto> {
    return this.usersService.createCandidate(dto);
  }

  @Get()
  @Roles(Role.HR)
  @ApiOperation({ summary: 'List candidates (HR only)' })
  @ApiOkResponse({ type: PaginatedCandidatesResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  async findAll(
    @Query() query: ListCandidatesQueryDto,
  ): Promise<PaginatedCandidatesResponseDto> {
    return this.usersService.findAllCandidates(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single candidate',
    description:
      'HR can fetch any candidate. A CANDIDATE can only fetch themself — ' +
      "any other id reports 404, the same as one that doesn't exist.",
  })
  @ApiOkResponse({ type: CandidateResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CandidateResponseDto> {
    return this.usersService.findCandidateById(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Update a candidate's profile",
    description:
      'HR can update any candidate. A CANDIDATE can only update themself.',
  })
  @ApiOkResponse({ type: CandidateResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CandidateResponseDto> {
    return this.usersService.updateCandidateProfile(id, dto, user);
  }
}
