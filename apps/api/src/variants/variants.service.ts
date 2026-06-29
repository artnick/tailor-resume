import type {
  Item,
  Section,
  VariantGet,
  VariantListItem,
  VariantPut,
} from '@repo/shared';
import type { VariantCreate } from '@repo/shared';
import { validateVariantPut } from '@repo/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type VariantWithRelations = Prisma.VariantGetPayload<{
  include: {
    tagSelections: true;
    items: true;
  };
}>;

@Injectable()
export class VariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async listVariants(): Promise<VariantListItem[]> {
    const master = await this.findOrCreateMaster();
    const variants = await this.prisma.variant.findMany({
      where: { masterId: master.id },
      orderBy: { updatedAt: 'desc' },
    });

    return variants.map((variant) => this.toListItem(variant));
  }

  async createVariant(payload: VariantCreate): Promise<VariantGet> {
    const master = await this.findOrCreateMaster();

    if (payload.baseVariantId != null) {
      const base = await this.prisma.variant.findFirst({
        where: { id: payload.baseVariantId, masterId: master.id },
        include: { tagSelections: true, items: true },
      });

      if (base == null) {
        throw new NotFoundException(
          `Base variant "${payload.baseVariantId}" not found`,
        );
      }

      const created = await this.prisma.variant.create({
        data: {
          masterId: master.id,
          name: payload.name,
          templateId: payload.templateId ?? base.templateId,
          baseVariantId: base.id,
          targetCompany: payload.targetCompany ?? base.targetCompany,
          jobDescription: payload.jobDescription ?? base.jobDescription,
          tagSelections: {
            create: base.tagSelections.map((tag) => ({
              tagId: tag.tagId,
              priority: tag.priority,
            })),
          },
          items: {
            create: base.items.map((item) => ({
              itemId: item.itemId,
              included: item.included,
              order: item.order,
              overrideData:
                item.overrideData == null
                  ? Prisma.JsonNull
                  : (item.overrideData as Prisma.InputJsonValue),
              chosenAlternativeId: item.chosenAlternativeId,
              locked: item.locked,
            })),
          },
        },
        include: { tagSelections: true, items: true },
      });

      return this.toGetResponse(created);
    }

    const created = await this.prisma.variant.create({
      data: {
        masterId: master.id,
        name: payload.name,
        templateId: payload.templateId ?? 'classic',
        targetCompany: payload.targetCompany ?? null,
        jobDescription: payload.jobDescription ?? null,
      },
      include: { tagSelections: true, items: true },
    });

    return this.toGetResponse(created);
  }

  async getVariant(id: string): Promise<VariantGet> {
    const master = await this.findOrCreateMaster();
    const variant = await this.loadVariant(id, master.id);

    if (variant == null) {
      throw new NotFoundException(`Variant "${id}" not found`);
    }

    return this.toGetResponse(variant);
  }

  async putVariant(id: string, payload: VariantPut): Promise<VariantGet> {
    const master = await this.findOrCreateMaster();
    const existing = await this.loadVariant(id, master.id);

    if (existing == null) {
      throw new NotFoundException(`Variant "${id}" not found`);
    }

    if (payload.updatedAt != null) {
      const clientUpdatedAt = new Date(payload.updatedAt);
      if (existing.updatedAt.getTime() !== clientUpdatedAt.getTime()) {
        throw new ConflictException({
          message: 'Variant was modified by another session',
          updatedAt: existing.updatedAt.toISOString(),
        });
      }
    }

    const masterItems = await this.loadMasterItems(master.id);
    const knownTagIds = new Set(
      (await this.prisma.tag.findMany({ select: { id: true } })).map(
        (tag) => tag.id,
      ),
    );

    const issues = validateVariantPut(masterItems, payload, knownTagIds);
    if (issues.length > 0) {
      throw new BadRequestException({ issues });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.variant.update({
        where: { id },
        data: {
          name: payload.name,
          isFavorite: payload.isFavorite,
          templateId: payload.templateId,
          baseVariantId: payload.baseVariantId ?? null,
          targetCompany: payload.targetCompany ?? null,
          jobDescription: payload.jobDescription ?? null,
        },
      });

      await tx.variantTag.deleteMany({ where: { variantId: id } });
      if (payload.tags.length > 0) {
        await tx.variantTag.createMany({
          data: payload.tags.map((tag) => ({
            variantId: id,
            tagId: tag.tagId,
            priority: tag.priority,
          })),
        });
      }

      const payloadItemIds = payload.items.map((item) => item.itemId);
      if (payloadItemIds.length === 0) {
        await tx.variantItem.deleteMany({ where: { variantId: id } });
      } else {
        await tx.variantItem.deleteMany({
          where: {
            variantId: id,
            itemId: { notIn: payloadItemIds },
          },
        });
      }

      for (const item of payload.items) {
        await tx.variantItem.upsert({
          where: {
            variantId_itemId: { variantId: id, itemId: item.itemId },
          },
          create: {
            variantId: id,
            itemId: item.itemId,
            included: item.included,
            order: item.order,
            overrideData:
              item.overrideData == null
                ? Prisma.JsonNull
                : (item.overrideData as Prisma.InputJsonValue),
            chosenAlternativeId: item.chosenAlternativeId ?? null,
            locked: item.locked,
          },
          update: {
            included: item.included,
            order: item.order,
            overrideData:
              item.overrideData == null
                ? Prisma.JsonNull
                : (item.overrideData as Prisma.InputJsonValue),
            chosenAlternativeId: item.chosenAlternativeId ?? null,
            locked: item.locked,
          },
        });
      }
    });

    const updated = await this.loadVariant(id, master.id);
    if (updated == null) {
      throw new NotFoundException(`Variant "${id}" not found after update`);
    }

    return this.toGetResponse(updated);
  }

  async deleteVariant(id: string): Promise<void> {
    const master = await this.findOrCreateMaster();
    const existing = await this.loadVariant(id, master.id);

    if (existing == null) {
      throw new NotFoundException(`Variant "${id}" not found`);
    }

    await this.prisma.variant.delete({ where: { id } });
  }

  private async findOrCreateMaster() {
    const existing = await this.prisma.masterResume.findFirst();
    if (existing != null) {
      return existing;
    }

    return this.prisma.masterResume.create({
      data: { basics: { name: '' } },
    });
  }

  private async loadVariant(
    id: string,
    masterId: string,
  ): Promise<VariantWithRelations | null> {
    return this.prisma.variant.findFirst({
      where: { id, masterId },
      include: {
        tagSelections: { orderBy: { priority: 'asc' } },
        items: true,
      },
    });
  }

  private async loadMasterItems(masterId: string): Promise<Item[]> {
    const items = await this.prisma.item.findMany({
      where: { masterId },
      orderBy: { order: 'asc' },
    });

    return items.map(
      (item): Item =>
        ({
          id: item.id,
          masterId: item.masterId,
          section: item.section as Section,
          parentId: item.parentId,
          isChoiceGroup: item.isChoiceGroup,
          isDefaultChoice: item.isDefaultChoice,
          pinned: item.pinned,
          data: item.data as Item['data'],
          order: item.order,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }) as Item,
    );
  }

  private toListItem(
    variant: Prisma.VariantGetPayload<object>,
  ): VariantListItem {
    return {
      id: variant.id,
      name: variant.name,
      isFavorite: variant.isFavorite,
      templateId: variant.templateId,
      baseVariantId: variant.baseVariantId,
      targetCompany: variant.targetCompany,
      jobDescription: variant.jobDescription,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }

  private toGetResponse(variant: VariantWithRelations): VariantGet {
    return {
      variant: this.toListItem(variant),
      tags: variant.tagSelections.map((tag) => ({
        tagId: tag.tagId,
        priority: tag.priority,
      })),
      items: variant.items.map((item) => ({
        itemId: item.itemId,
        included: item.included,
        order: item.order,
        overrideData:
          item.overrideData as VariantGet['items'][number]['overrideData'],
        chosenAlternativeId: item.chosenAlternativeId,
        locked: item.locked,
      })),
    };
  }
}
