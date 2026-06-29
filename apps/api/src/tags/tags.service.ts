import type {
  TagCategory,
  TagCategoryCreate,
  TagCategoryPatch,
  TagCreate,
  TagPatch,
} from '@repo/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(): Promise<TagCategory[]> {
    return this.prisma.tagCategory.findMany({ orderBy: { key: 'asc' } });
  }

  async createCategory(payload: TagCategoryCreate): Promise<TagCategory> {
    const existing = await this.prisma.tagCategory.findUnique({
      where: { key: payload.key },
    });

    if (existing != null) {
      throw new ConflictException(
        `Tag category with key "${payload.key}" already exists`,
      );
    }

    return this.prisma.tagCategory.create({
      data: {
        key: payload.key,
        name: payload.name,
        color: payload.color ?? null,
      },
    });
  }

  async patchCategory(
    id: string,
    payload: TagCategoryPatch,
  ): Promise<TagCategory> {
    const existing = await this.prisma.tagCategory.findUnique({
      where: { id },
    });

    if (existing == null) {
      throw new NotFoundException(`Tag category "${id}" not found`);
    }

    if (
      existing.isDefault &&
      payload.key != null &&
      payload.key !== existing.key
    ) {
      throw new BadRequestException('Cannot change key of a default category');
    }

    if (payload.key != null && payload.key !== existing.key) {
      const keyTaken = await this.prisma.tagCategory.findUnique({
        where: { key: payload.key },
      });
      if (keyTaken != null) {
        throw new ConflictException(
          `Tag category with key "${payload.key}" already exists`,
        );
      }
    }

    return this.prisma.tagCategory.update({
      where: { id },
      data: {
        key: payload.key,
        name: payload.name,
        color: payload.color,
      },
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const existing = await this.prisma.tagCategory.findUnique({
      where: { id },
    });

    if (existing == null) {
      throw new NotFoundException(`Tag category "${id}" not found`);
    }

    if (existing.isDefault) {
      throw new BadRequestException('Cannot delete a default tag category');
    }

    await this.prisma.tagCategory.delete({ where: { id } });
  }

  async listTags(categoryId?: string) {
    return this.prisma.tag.findMany({
      where: categoryId != null ? { categoryId } : undefined,
      orderBy: [{ categoryId: 'asc' }, { label: 'asc' }],
    });
  }

  async createTag(payload: TagCreate) {
    const category = await this.prisma.tagCategory.findUnique({
      where: { id: payload.categoryId },
    });

    if (category == null) {
      throw new NotFoundException(
        `Tag category "${payload.categoryId}" not found`,
      );
    }

    const existing = await this.prisma.tag.findUnique({
      where: {
        categoryId_label: {
          categoryId: payload.categoryId,
          label: payload.label,
        },
      },
    });

    if (existing != null) {
      throw new ConflictException(
        `Tag "${payload.label}" already exists in this category`,
      );
    }

    return this.prisma.tag.create({
      data: {
        label: payload.label,
        categoryId: payload.categoryId,
      },
    });
  }

  async patchTag(id: string, payload: TagPatch) {
    const existing = await this.prisma.tag.findUnique({ where: { id } });

    if (existing == null) {
      throw new NotFoundException(`Tag "${id}" not found`);
    }

    const categoryId = payload.categoryId ?? existing.categoryId;
    const label = payload.label ?? existing.label;

    if (categoryId !== existing.categoryId) {
      const category = await this.prisma.tagCategory.findUnique({
        where: { id: categoryId },
      });
      if (category == null) {
        throw new NotFoundException(`Tag category "${categoryId}" not found`);
      }
    }

    if (label !== existing.label || categoryId !== existing.categoryId) {
      const duplicate = await this.prisma.tag.findUnique({
        where: {
          categoryId_label: { categoryId, label },
        },
      });
      if (duplicate != null && duplicate.id !== id) {
        throw new ConflictException(
          `Tag "${label}" already exists in this category`,
        );
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        label: payload.label,
        categoryId: payload.categoryId,
      },
    });
  }

  async deleteTag(id: string): Promise<void> {
    const existing = await this.prisma.tag.findUnique({ where: { id } });

    if (existing == null) {
      throw new NotFoundException(`Tag "${id}" not found`);
    }

    await this.prisma.tag.delete({ where: { id } });
  }
}
