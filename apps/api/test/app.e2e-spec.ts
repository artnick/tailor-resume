import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /health', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ status: 'ok', database: 'ok' }),
          );
        });
    });
  });

  describe('Master', () => {
    it('GET /master returns seeded master', () => {
      return request(app.getHttpServer())
        .get('/master')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              basics: expect.objectContaining({ name: 'Alex Ivanov' }),
              items: expect.any(Array),
              itemTags: expect.any(Array),
            }),
          );
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Variants', () => {
    let createdVariantId: string;

    it('GET /variants returns seeded variant', () => {
      return request(app.getHttpServer())
        .get('/variants')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: 'var_google',
                name: 'Google — Frontend',
              }),
            ]),
          );
        });
    });

    it('GET /variants/:id returns overlay', () => {
      return request(app.getHttpServer())
        .get('/variants/var_google')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              variant: expect.objectContaining({ id: 'var_google' }),
              tags: expect.any(Array),
              items: expect.any(Array),
            }),
          );
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('POST /variants creates empty variant', async () => {
      const res = await request(app.getHttpServer())
        .post('/variants')
        .send({ name: 'Test Variant' })
        .expect(201);

      expect(res.body.variant).toEqual(
        expect.objectContaining({
          name: 'Test Variant',
          templateId: 'classic',
        }),
      );
      expect(res.body.tags).toEqual([]);
      expect(res.body.items).toEqual([]);
      createdVariantId = res.body.variant.id;
    });

    it('POST /variants clones from base', async () => {
      const res = await request(app.getHttpServer())
        .post('/variants')
        .send({ name: 'Cloned', baseVariantId: 'var_google' })
        .expect(201);

      expect(res.body.variant.baseVariantId).toBe('var_google');
      expect(res.body.tags.length).toBeGreaterThan(0);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('PUT /variants/:id updates overlay', async () => {
      const getRes = await request(app.getHttpServer())
        .get(`/variants/${createdVariantId}`)
        .expect(200);

      const putRes = await request(app.getHttpServer())
        .put(`/variants/${createdVariantId}`)
        .send({
          name: 'Updated Variant',
          isFavorite: true,
          templateId: 'classic',
          tags: [{ tagId: 'tag_react', priority: 0 }],
          items: [
            {
              itemId: 'sum_intro',
              included: true,
              order: 0,
              chosenAlternativeId: 'sum_intro_fe',
              locked: false,
            },
          ],
          updatedAt: getRes.body.variant.updatedAt,
        })
        .expect(200);

      expect(putRes.body.variant.name).toBe('Updated Variant');
      expect(putRes.body.variant.isFavorite).toBe(true);
      expect(putRes.body.tags).toHaveLength(1);
      expect(putRes.body.items).toHaveLength(1);
    });

    it('DELETE /variants/:id removes variant', () => {
      return request(app.getHttpServer())
        .delete(`/variants/${createdVariantId}`)
        .expect(200)
        .then(() =>
          request(app.getHttpServer())
            .get(`/variants/${createdVariantId}`)
            .expect(404),
        );
    });
  });

  describe('Tags', () => {
    let customCategoryId: string;
    let customTagId: string;

    it('GET /tag-categories returns defaults', () => {
      return request(app.getHttpServer())
        .get('/tag-categories')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThanOrEqual(3);
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ key: 'technology', isDefault: true }),
            ]),
          );
        });
    });

    it('POST /tag-categories creates custom category', async () => {
      const res = await request(app.getHttpServer())
        .post('/tag-categories')
        .send({ key: 'custom_test', name: 'Custom Test' })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({ key: 'custom_test', isDefault: false }),
      );
      customCategoryId = res.body.id;
    });

    it('POST /tags creates tag in category', async () => {
      const res = await request(app.getHttpServer())
        .post('/tags')
        .send({ label: 'TestTag', categoryId: customCategoryId })
        .expect(201);

      expect(res.body).toEqual(expect.objectContaining({ label: 'TestTag' }));
      customTagId = res.body.id;
    });

    it('GET /tags filters by categoryId', () => {
      return request(app.getHttpServer())
        .get(`/tags?categoryId=${customCategoryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([
            expect.objectContaining({ label: 'TestTag' }),
          ]);
        });
    });

    it('PATCH /tags/:id updates label', () => {
      return request(app.getHttpServer())
        .patch(`/tags/${customTagId}`)
        .send({ label: 'UpdatedTag' })
        .expect(200)
        .expect((res) => {
          expect(res.body.label).toBe('UpdatedTag');
        });
    });

    it('DELETE /tag-categories/:id rejects default', () => {
      return request(app.getHttpServer())
        .delete('/tag-categories/cat_technology')
        .expect(400);
    });

    it('DELETE /tags/:id and category', async () => {
      await request(app.getHttpServer())
        .delete(`/tags/${customTagId}`)
        .expect(200);
      await request(app.getHttpServer())
        .delete(`/tag-categories/${customCategoryId}`)
        .expect(200);
    });
  });
});
