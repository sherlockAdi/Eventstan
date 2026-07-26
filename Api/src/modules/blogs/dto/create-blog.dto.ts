import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'Top 10 Wedding Venue Trends for 2025' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'top-10-wedding-venue-trends-for-2025' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'A short summary of the article.' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: '<p>Full article content</p>' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ example: 'Venues' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ type: [String], example: ['Wedding', 'Venues'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: BlogStatus, example: BlogStatus.DRAFT })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 'Sarah Johnson' })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @ApiPropertyOptional({ example: 'Wedding planner with 10+ years of experience' })
  @IsOptional()
  @IsString()
  authorBio?: string;

  @ApiPropertyOptional({ example: 'Top Wedding Venue Trends 2025' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Venue trends for 2025 weddings.' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/og-image.jpg' })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiPropertyOptional({ example: '2026-07-09T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ example: 6, description: 'Estimated read time in minutes. If omitted, the API can auto-calculate it from content.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readTime?: number;

  @ApiPropertyOptional({ type: [String], example: ['svc_1', 'svc_2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedServiceIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['pkg_1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedPackageIds?: string[];
}
