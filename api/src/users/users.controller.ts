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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '@common/dto/error-response.dto.js';
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a candidate account',
    description:
      'Creates the User (role CANDIDATE) and its CandidateProfile together ' +
      'in one transaction — this is the only place a CandidateProfile is ' +
      'ever created. HR sets a temporary password directly; there is no ' +
      'invite/self-registration flow yet.',
  })
  @ApiCreatedResponse({ type: CandidateResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateCandidateDto): Promise<CandidateResponseDto> {
    return this.usersService.createCandidate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List candidates' })
  @ApiOkResponse({ type: PaginatedCandidatesResponseDto })
  async findAll(
    @Query() query: ListCandidatesQueryDto,
  ): Promise<PaginatedCandidatesResponseDto> {
    return this.usersService.findAllCandidates(query.take, query.skip);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single candidate' })
  @ApiOkResponse({ type: CandidateResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<CandidateResponseDto> {
    return this.usersService.findCandidateById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a candidate's profile" })
  @ApiOkResponse({ type: CandidateResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
  ): Promise<CandidateResponseDto> {
    return this.usersService.updateCandidateProfile(id, dto);
  }
}
