import type { Basics, Item, Section } from '@repo/shared';
import { buildRenderModel } from '@repo/shared';
import { renderHtml } from '@repo/renderer';
import { Injectable, NotFoundException } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportVariantPdf(
    variantId: string,
    templateId?: string,
  ): Promise<Buffer> {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
      include: {
        master: {
          include: {
            items: { orderBy: { order: 'asc' } },
          },
        },
        items: true,
      },
    });

    if (variant == null) {
      throw new NotFoundException(`Variant "${variantId}" not found`);
    }

    const items: Item[] = variant.master.items.map(
      (item) =>
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

    const renderModel = buildRenderModel({
      basics: variant.master.basics as Basics,
      items,
      overlay: variant.items.map((item) => ({
        variantId: item.variantId,
        itemId: item.itemId,
        included: item.included,
        order: item.order,
        overrideData: item.overrideData as Item['data'] | null | undefined,
        chosenAlternativeId: item.chosenAlternativeId,
        locked: item.locked,
      })),
      templateId: templateId ?? variant.templateId,
    });

    const html = renderHtml(renderModel);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
