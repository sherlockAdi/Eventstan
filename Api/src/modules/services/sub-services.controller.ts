import { Body, Controller, Delete, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSubServiceDto } from './dto/create-sub-service.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller('sub-services')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class SubServicesController {
  constructor(private readonly services: ServicesService) {}

  @Put(':id')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: Partial<CreateSubServiceDto> & { status?: string },
  ) {
    await this.services.assertCanManageSubService(request.user, id);
    return this.services.updateSubService(id, dto);
  }

  @Delete(':id')
  async delete(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    await this.services.assertCanManageSubService(request.user, id);
    return this.services.deleteSubService(id);
  }
}
