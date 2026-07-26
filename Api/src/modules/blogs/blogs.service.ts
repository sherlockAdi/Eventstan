import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogPost, BlogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UploadsService } from '../uploads/uploads.service';

type BlogListFilters = {
  includeAll?: boolean;
  category?: string;
  featured?: boolean;
  search?: string;
  status?: string;
};

@Injectable()
export class BlogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  private normalizeStatus(status?: string | BlogStatus | null) {
    if (!status) return undefined;
    const normalized = String(status).trim().toLowerCase();
    if (normalized === 'draft') return BlogStatus.DRAFT;
    if (normalized === 'published') return BlogStatus.PUBLISHED;
    if (normalized === 'archived') return BlogStatus.ARCHIVED;
    throw new BadRequestException('Invalid blog status');
  }

  private toIso(value?: Date | null) {
    return value ? value.toISOString() : null;
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private calculateReadTime(content: string) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  private isBase64Image(value: string) {
    return /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value.trim());
  }

  private toUploadFile(dataUrl: string) {
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl.trim());
    if (!match) {
      throw new BadRequestException('Invalid image data');
    }

    const mimetype = match[1].toLowerCase();
    const base64 = match[2].replace(/\s+/g, '');
    const buffer = Buffer.from(base64, 'base64');

    if (!buffer.length) {
      throw new BadRequestException('Invalid image data');
    }

    const extension =
      mimetype === 'image/png' ? '.png'
        : mimetype === 'image/webp' ? '.webp'
          : mimetype === 'image/gif' ? '.gif'
            : mimetype === 'image/svg+xml' ? '.svg'
              : '.jpg';

    return {
      buffer,
      mimetype,
      originalname: `blog-image${extension}`,
      size: buffer.length,
    };
  }

  private async storeBase64Image(dataUrl: string, folder: string) {
    const file = this.toUploadFile(dataUrl);
    const uploaded = await this.uploads.uploadImage(file, folder);
    return uploaded.url;
  }

  private async normalizeImageField(value?: string | null, folder = 'blogs/images') {
    if (!value?.trim()) return null;
    const trimmed = value.trim();
    if (!this.isBase64Image(trimmed)) return trimmed;
    return this.storeBase64Image(trimmed, folder);
  }

  private async normalizeContentImages(content: string) {
    const matches = content.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+/gi) ?? [];
    if (!matches.length) return content;

    const uniqueMatches = Array.from(new Set(matches.map((value) => value.trim())));
    const uploads = new Map<string, string>();

    for (const match of uniqueMatches) {
      uploads.set(match, await this.storeBase64Image(match, 'blogs/content'));
    }

    let normalized = content;
    for (const [dataUrl, url] of uploads.entries()) {
      normalized = normalized.split(dataUrl).join(url);
    }

    return normalized;
  }

  private async ensureUniqueSlug(base: string, excludeId?: string) {
    const cleanBase = this.slugify(base) || `post-${Date.now()}`;
    let candidate = cleanBase;
    let suffix = 2;

    while (true) {
      const existing = await this.prisma.blogPost.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (!existing) return candidate;
      candidate = `${cleanBase}-${suffix}`;
      suffix += 1;
    }
  }

  private async canViewUnpublished(user?: AuthenticatedUser) {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  }

  private serialize(post: BlogPost) {
    const status = post.status.toLowerCase();
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      cover_image: post.coverImage,
      category: post.category,
      tags: post.tags,
      status,
      isFeatured: post.isFeatured,
      is_featured: post.isFeatured,
      authorName: post.authorName,
      author_name: post.authorName,
      authorAvatar: post.authorAvatar,
      author_avatar: post.authorAvatar,
      authorBio: post.authorBio,
      author_bio: post.authorBio,
      metaTitle: post.metaTitle,
      meta_title: post.metaTitle,
      metaDescription: post.metaDescription,
      meta_description: post.metaDescription,
      ogImage: post.ogImage,
      og_image: post.ogImage,
      publishedAt: this.toIso(post.publishedAt),
      published_at: this.toIso(post.publishedAt),
      readTime: post.readTime,
      read_time: post.readTime,
      createdAt: post.createdAt.toISOString(),
      created_at: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      updated_at: post.updatedAt.toISOString(),
      relatedServiceIds: post.relatedServiceIds,
      related_services: post.relatedServiceIds,
      relatedPackageIds: post.relatedPackageIds,
      related_packages: post.relatedPackageIds,
    };
  }

  private async findOrThrow(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(dto: CreateBlogDto) {
    if (!dto.title.trim()) throw new BadRequestException('Title is required');
    if (!dto.content.trim()) throw new BadRequestException('Content is required');
    if (!dto.category.trim()) throw new BadRequestException('Category is required');

    const slug = await this.ensureUniqueSlug(dto.slug ?? dto.title);
    const status = this.normalizeStatus(dto.status) ?? BlogStatus.DRAFT;
    const content = await this.normalizeContentImages(dto.content);
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : status === BlogStatus.PUBLISHED ? new Date() : null;

    const post = await this.prisma.blogPost.create({
      data: {
        title: dto.title.trim(),
        slug,
        excerpt: dto.excerpt?.trim() || null,
        content,
        coverImage: await this.normalizeImageField(dto.coverImage, 'blogs/cover'),
        category: dto.category.trim(),
        tags: dto.tags ?? [],
        status,
        isFeatured: dto.isFeatured ?? false,
        authorName: dto.authorName?.trim() || null,
        authorAvatar: dto.authorAvatar?.trim() || null,
        authorBio: dto.authorBio?.trim() || null,
        metaTitle: dto.metaTitle?.trim() || null,
        metaDescription: dto.metaDescription?.trim() || null,
        ogImage: await this.normalizeImageField(dto.ogImage, 'blogs/og'),
        publishedAt,
        readTime: dto.readTime ?? this.calculateReadTime(content),
        relatedServiceIds: dto.relatedServiceIds ?? [],
        relatedPackageIds: dto.relatedPackageIds ?? [],
      },
    });

    return this.serialize(post);
  }

  async list(filters: BlogListFilters = {}) {
    const where: Prisma.BlogPostWhereInput = {};

    if (!filters.includeAll) {
      where.status = BlogStatus.PUBLISHED;
    }

    const normalizedStatus = this.normalizeStatus(filters.status);
    if (normalizedStatus) {
      where.status = normalizedStatus;
    }

    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    if (filters.featured !== undefined) {
      where.isFeatured = filters.featured;
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const posts = await this.prisma.blogPost.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return posts.map((post) => this.serialize(post));
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const post = await this.findOrThrow(id);
    if (post.status !== BlogStatus.PUBLISHED && !(await this.canViewUnpublished(user))) {
      throw new NotFoundException('Blog post not found');
    }
    return this.serialize(post);
  }

  async findBySlug(slug: string, user?: AuthenticatedUser) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');
    if (post.status !== BlogStatus.PUBLISHED && !(await this.canViewUnpublished(user))) {
      throw new NotFoundException('Blog post not found');
    }
    return this.serialize(post);
  }

  async update(id: string, dto: Partial<CreateBlogDto>) {
    const existing = await this.findOrThrow(id);
    const title = dto.title?.trim() ?? existing.title;
    const content = dto.content !== undefined ? await this.normalizeContentImages(dto.content) : existing.content;
    const category = dto.category?.trim() ?? existing.category;
    const slugSource = dto.slug?.trim() || (dto.title !== undefined ? title : existing.slug);
    const slug = dto.slug !== undefined || dto.title !== undefined ? await this.ensureUniqueSlug(slugSource, id) : existing.slug;
    const status = dto.status !== undefined ? this.normalizeStatus(dto.status) ?? existing.status : existing.status;
    const publishedAt = dto.publishedAt !== undefined
      ? new Date(dto.publishedAt)
      : status === BlogStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title } : {}),
        ...(dto.slug !== undefined || dto.title !== undefined ? { slug } : {}),
        ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt?.trim() || null } : {}),
        ...(dto.content !== undefined ? { content } : {}),
        ...(dto.coverImage !== undefined ? { coverImage: await this.normalizeImageField(dto.coverImage, 'blogs/cover') } : {}),
        ...(dto.category !== undefined ? { category } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.status !== undefined ? { status } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.authorName !== undefined ? { authorName: dto.authorName?.trim() || null } : {}),
        ...(dto.authorAvatar !== undefined ? { authorAvatar: dto.authorAvatar?.trim() || null } : {}),
        ...(dto.authorBio !== undefined ? { authorBio: dto.authorBio?.trim() || null } : {}),
        ...(dto.metaTitle !== undefined ? { metaTitle: dto.metaTitle?.trim() || null } : {}),
        ...(dto.metaDescription !== undefined ? { metaDescription: dto.metaDescription?.trim() || null } : {}),
        ...(dto.ogImage !== undefined ? { ogImage: await this.normalizeImageField(dto.ogImage, 'blogs/og') } : {}),
        ...(dto.publishedAt !== undefined || (dto.status !== undefined && status === BlogStatus.PUBLISHED && !existing.publishedAt) ? { publishedAt } : {}),
        ...(dto.readTime !== undefined ? { readTime: dto.readTime } : dto.content !== undefined ? { readTime: this.calculateReadTime(content) } : {}),
        ...(dto.relatedServiceIds !== undefined ? { relatedServiceIds: dto.relatedServiceIds } : {}),
        ...(dto.relatedPackageIds !== undefined ? { relatedPackageIds: dto.relatedPackageIds } : {}),
      },
    });

    return this.serialize(post);
  }

  async updateStatus(id: string, statusValue: string) {
    const status = this.normalizeStatus(statusValue);
    if (!status) throw new BadRequestException('Invalid blog status');
    return this.update(id, { status });
  }

  async updateFeatured(id: string, isFeatured: boolean) {
    return this.update(id, { isFeatured });
  }

  async delete(id: string) {
    await this.findOrThrow(id);
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
