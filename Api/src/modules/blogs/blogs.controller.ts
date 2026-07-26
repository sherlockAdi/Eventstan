import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ListBlogsQuery } from './dto/list-blogs.query';
import { BlogsService } from './blogs.service';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogs: BlogsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiQuery({ name: 'includeAll', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'featured', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ description: 'Lists blog posts.' })
  list(@Req() request: Request & { user?: AuthenticatedRequest['user'] }, @Query() query: ListBlogsQuery) {
    const includeAll = query.includeAll === 'true' && (request.user?.role === UserRole.ADMIN || request.user?.role === UserRole.SUPER_ADMIN);
    return this.blogs.list({
      includeAll,
      category: query.category,
      featured: query.featured === 'true' ? true : query.featured === 'false' ? false : undefined,
      search: query.search,
      status: query.status,
    });
  }

  @Get('slug/:slug')
  @UseGuards(OptionalAuthGuard)
  findBySlug(@Req() request: Request & { user?: AuthenticatedRequest['user'] }, @Param('slug') slug: string) {
    return this.blogs.findBySlug(slug, request.user);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Req() request: Request & { user?: AuthenticatedRequest['user'] }, @Param('id') id: string) {
    return this.blogs.findOne(id, request.user);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BLOG)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Creates a blog post.' })
  create(@Body() dto: CreateBlogDto) {
    return this.blogs.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BLOG)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: Partial<CreateBlogDto>) {
    return this.blogs.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BLOG)
  @ApiBearerAuth()
  patch(@Param('id') id: string, @Body() dto: Partial<CreateBlogDto>) {
    return this.blogs.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BLOG)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.blogs.updateStatus(id, status);
  }

  @Patch(':id/featured')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BLOG)
  @ApiBearerAuth()
  updateFeatured(@Param('id') id: string, @Body('isFeatured') isFeatured: boolean) {
    return this.blogs.updateFeatured(id, isFeatured);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BLOG)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.blogs.delete(id);
  }
}
