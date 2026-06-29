import type { Item, Section } from '@repo/shared';
import type { Basics, MasterResumeGet, MasterResumePut } from '@repo/shared';
import {
  toMasterResumeGet,
  toPersistentItem,
  validateMasterResumePut,
} from '@repo/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type MasterWithItems = Prisma.MasterResumeGetPayload<{
  include: {
    items: {
      include: {
        tags: true;
      };
    };
  };
}>;

@Injectable()
export class MasterService {
  constructor(private readonly prisma: PrismaService) {}

  async getMaster(): Promise<MasterResumeGet> {
    const master = await this.findOrCreateMaster();
    return this.toGetResponse(master);
  }

  async putMaster(payload: MasterResumePut): Promise<MasterResumeGet> {
    const master = await this.findOrCreateMaster();

    if (payload.updatedAt != null) {
      const clientUpdatedAt = new Date(payload.updatedAt);
      if (master.updatedAt.getTime() !== clientUpdatedAt.getTime()) {
        throw new ConflictException({
          message: 'Master resume was modified by another session',
          updatedAt: master.updatedAt.toISOString(),
        });
      }
    }

    const issues = validateMasterResumePut(payload, master.id);
    if (issues.length > 0) {
      throw new BadRequestException({ issues });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.masterResume.update({
        where: { id: master.id },
        data: {
          basics: payload.basics as Prisma.InputJsonValue,
        },
      });

      const payloadIds = payload.items.map((item) => item.id);
      if (payloadIds.length === 0) {
        await tx.item.deleteMany({ where: { masterId: master.id } });
      } else {
        await tx.item.deleteMany({
          where: {
            masterId: master.id,
            id: { notIn: payloadIds },
          },
        });
      }

      for (const wireItem of payload.items) {
        const persistentItem = toPersistentItem(wireItem, master.id);
        await tx.item.upsert({
          where: { id: wireItem.id },
          create: this.toItemCreateInput(persistentItem),
          update: this.toItemUpdateInput(persistentItem),
        });
      }

      await tx.itemTag.deleteMany({
        where: { item: { masterId: master.id } },
      });

      if (payload.itemTags.length > 0) {
        await tx.itemTag.createMany({
          data: payload.itemTags,
          skipDuplicates: true,
        });
      }
    });

    const updated = await this.loadMaster(master.id);
    if (updated == null) {
      throw new NotFoundException('Master resume not found after update');
    }

    return this.toGetResponse(updated);
  }

  private async findOrCreateMaster(): Promise<MasterWithItems> {
    const existing = await this.prisma.masterResume.findFirst({
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { tags: true },
        },
      },
    });

    if (existing != null) {
      return existing;
    }

    return this.prisma.masterResume.create({
      data: {
        basics: { name: '' },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { tags: true },
        },
      },
    });
  }

  private async loadMaster(id: string): Promise<MasterWithItems | null> {
    return this.prisma.masterResume.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { tags: true },
        },
      },
    });
  }

  private toGetResponse(master: MasterWithItems): MasterResumeGet {
    const items = master.items.map((item) => this.mapPrismaItem(item));
    const itemTags = master.items.flatMap((item) =>
      item.tags.map((tag) => ({
        itemId: tag.itemId,
        tagId: tag.tagId,
      })),
    );

    return toMasterResumeGet({
      id: master.id,
      basics: master.basics as Basics,
      items,
      itemTags,
      updatedAt: master.updatedAt,
    });
  }

  private mapPrismaItem(item: MasterWithItems['items'][number]): Item {
    return {
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
    } as Item;
  }

  private toItemCreateInput(item: Item): Prisma.ItemCreateInput {
    return {
      id: item.id,
      master: { connect: { id: item.masterId } },
      section: item.section,
      parent:
        item.parentId != null ? { connect: { id: item.parentId } } : undefined,
      isChoiceGroup: item.isChoiceGroup,
      isDefaultChoice: item.isDefaultChoice,
      pinned: item.pinned,
      data: item.data as Prisma.InputJsonValue,
      order: item.order,
    };
  }

  private toItemUpdateInput(item: Item): Prisma.ItemUpdateInput {
    return {
      section: item.section,
      parent:
        item.parentId != null
          ? { connect: { id: item.parentId } }
          : { disconnect: true },
      isChoiceGroup: item.isChoiceGroup,
      isDefaultChoice: item.isDefaultChoice,
      pinned: item.pinned,
      data: item.data as Prisma.InputJsonValue,
      order: item.order,
    };
  }
}
