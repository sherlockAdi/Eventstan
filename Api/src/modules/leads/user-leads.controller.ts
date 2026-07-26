import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserLeadDto } from './dto/create-user-lead.dto';
import { UpdateUserLeadDto } from './dto/update-user-lead.dto';
import { UserLeadsService } from './user-leads.service';

@ApiTags('user-leads')
@Controller('user-leads')
export class UserLeadsController {
  constructor(private readonly leads: UserLeadsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Creates a user lead.' })
  create(@Body() dto: CreateUserLeadDto) {
    return this.leads.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Lists user leads.' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  list(@Query('status') status?: string, @Query('search') search?: string) {
    return this.leads.list(status, search);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Gets a user lead by id.' })
  findOne(@Param('id') id: string) {
    return this.leads.get(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Updates a user lead.' })
  update(@Param('id') id: string, @Body() dto: UpdateUserLeadDto) {
    return this.leads.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Deletes a user lead.' })
  remove(@Param('id') id: string) {
    return this.leads.delete(id);
  }
}
