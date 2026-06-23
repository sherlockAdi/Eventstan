import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VendorOnboardingBypass } from '../auth/vendor-onboarding.decorator';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ReplySupportTicketDto } from './dto/reply-support-ticket.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
import { SupportService } from './support.service';

@ApiTags('support')
@Controller('support')
@UseGuards(AuthGuard, RolesGuard)
@VendorOnboardingBypass()
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('tickets')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOkResponse({ description: 'Lists support tickets for the current vendor or all tickets for admins.' })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.support.findAll(request.user);
  }

  @Post('tickets')
  @Roles(UserRole.VENDOR)
  @ApiCreatedResponse({ description: 'Creates a new vendor support ticket.' })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateSupportTicketDto) {
    return this.support.createTicket(request.user, dto);
  }

  @Get('tickets/:id')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOkResponse({ description: 'Fetches a single support ticket with its conversation.' })
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.support.findOne(request.user, id);
  }

  @Post('tickets/:id/replies')
  @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ description: 'Adds a reply to an existing support ticket.' })
  reply(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ReplySupportTicketDto,
  ) {
    return this.support.reply(request.user, id, dto);
  }

  @Patch('tickets/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOkResponse({ description: 'Updates ticket status for admins.' })
  updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSupportTicketStatusDto,
  ) {
    return this.support.updateStatus(request.user, id, dto);
  }
}
