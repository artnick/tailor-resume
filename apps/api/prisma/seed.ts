import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MASTER_ID = 'master_demo';
const VARIANT_ID = 'var_google';

const tagCategories: Prisma.TagCategoryCreateManyInput[] = [
  {
    id: 'cat_technology',
    key: 'technology',
    name: 'Technology',
    isDefault: true,
    color: '#2563eb',
  },
  {
    id: 'cat_theme',
    key: 'theme',
    name: 'Theme',
    isDefault: true,
    color: '#16a34a',
  },
  {
    id: 'cat_location',
    key: 'location',
    name: 'Location',
    isDefault: true,
    color: '#ea580c',
  },
];

const tags: Prisma.TagCreateManyInput[] = [
  { id: 'tag_react', label: 'React', categoryId: 'cat_technology' },
  { id: 'tag_vue', label: 'Vue', categoryId: 'cat_technology' },
  { id: 'tag_node', label: 'Node.js', categoryId: 'cat_technology' },
  { id: 'tag_postgres', label: 'PostgreSQL', categoryId: 'cat_technology' },
  { id: 'tag_optimization', label: 'optimization', categoryId: 'cat_theme' },
  { id: 'tag_ownership', label: 'ownership', categoryId: 'cat_theme' },
  { id: 'tag_teamwork', label: 'teamwork', categoryId: 'cat_theme' },
  { id: 'tag_spain', label: 'Spain', categoryId: 'cat_location' },
  { id: 'tag_remote', label: 'remote', categoryId: 'cat_location' },
];

const topLevelItems: Prisma.ItemCreateManyInput[] = [
  {
    id: 'sum_intro',
    masterId: MASTER_ID,
    section: 'summary',
    parentId: null,
    isChoiceGroup: true,
    pinned: true,
    data: {},
    order: 0,
  },
  {
    id: 'sum_spain',
    masterId: MASTER_ID,
    section: 'summary',
    parentId: null,
    data: { text: 'EU/Spain work permit, based in Barcelona.' },
    order: 1,
  },
  {
    id: 'work_acme',
    masterId: MASTER_ID,
    section: 'work',
    parentId: null,
    data: {
      company: 'Acme',
      position: 'Senior Software Engineer',
      startDate: '2021-03',
      endDate: null,
      location: 'Remote',
    },
    order: 0,
  },
  {
    id: 'work_globex',
    masterId: MASTER_ID,
    section: 'work',
    parentId: null,
    data: {
      company: 'Globex',
      position: 'Software Engineer',
      startDate: '2018-01',
      endDate: '2021-02',
      location: 'Madrid, Spain',
    },
    order: 1,
  },
  {
    id: 'skg_frontend',
    masterId: MASTER_ID,
    section: 'skillGroup',
    parentId: null,
    data: { name: 'Frontend' },
    order: 0,
  },
  {
    id: 'skg_backend',
    masterId: MASTER_ID,
    section: 'skillGroup',
    parentId: null,
    data: { name: 'Backend' },
    order: 1,
  },
];

const childItems: Prisma.ItemCreateManyInput[] = [
  {
    id: 'sum_intro_fs',
    masterId: MASTER_ID,
    section: 'summary',
    parentId: 'sum_intro',
    isDefaultChoice: true,
    data: {
      text: 'Fullstack engineer with 6+ years building product-focused web apps end-to-end.',
    },
    order: 0,
  },
  {
    id: 'sum_intro_fe',
    masterId: MASTER_ID,
    section: 'summary',
    parentId: 'sum_intro',
    data: {
      text: 'Frontend engineer focused on UX, performance and design-system work.',
    },
    order: 1,
  },
  {
    id: 'blt_acme_perf',
    masterId: MASTER_ID,
    section: 'bullet',
    parentId: 'work_acme',
    data: {
      text: 'Cut API p95 latency by 40% via query optimization and caching.',
    },
    order: 0,
  },
  {
    id: 'blt_acme_team',
    masterId: MASTER_ID,
    section: 'bullet',
    parentId: 'work_acme',
    data: {
      text: 'Led a team of 4 engineers, owning the checkout domain end-to-end.',
    },
    order: 1,
  },
  {
    id: 'blt_globex_build',
    masterId: MASTER_ID,
    section: 'bullet',
    parentId: 'work_globex',
    data: {
      text: 'Built a Vue-based analytics dashboard used by 10k+ daily users.',
    },
    order: 0,
  },
  {
    id: 'skill_react',
    masterId: MASTER_ID,
    section: 'skill',
    parentId: 'skg_frontend',
    data: { text: 'React' },
    order: 0,
  },
  {
    id: 'skill_vue',
    masterId: MASTER_ID,
    section: 'skill',
    parentId: 'skg_frontend',
    data: { text: 'Vue' },
    order: 1,
  },
  {
    id: 'skill_node',
    masterId: MASTER_ID,
    section: 'skill',
    parentId: 'skg_backend',
    data: { text: 'Node.js' },
    order: 0,
  },
  {
    id: 'skill_postgres',
    masterId: MASTER_ID,
    section: 'skill',
    parentId: 'skg_backend',
    data: { text: 'PostgreSQL' },
    order: 1,
  },
];

const itemTags: Prisma.ItemTagCreateManyInput[] = [
  { itemId: 'skill_react', tagId: 'tag_react' },
  { itemId: 'skill_vue', tagId: 'tag_vue' },
  { itemId: 'skill_node', tagId: 'tag_node' },
  { itemId: 'skill_postgres', tagId: 'tag_postgres' },
  { itemId: 'blt_acme_perf', tagId: 'tag_optimization' },
  { itemId: 'blt_acme_team', tagId: 'tag_ownership' },
  { itemId: 'blt_acme_team', tagId: 'tag_teamwork' },
  { itemId: 'blt_globex_build', tagId: 'tag_vue' },
  { itemId: 'sum_spain', tagId: 'tag_spain' },
];

const variantTags: Prisma.VariantTagCreateManyInput[] = [
  { variantId: VARIANT_ID, tagId: 'tag_optimization', priority: 0 },
  { variantId: VARIANT_ID, tagId: 'tag_ownership', priority: 1 },
  { variantId: VARIANT_ID, tagId: 'tag_react', priority: 2 },
];

const variantItems: Prisma.VariantItemCreateManyInput[] = [
  {
    variantId: VARIANT_ID,
    itemId: 'sum_intro',
    included: true,
    order: 0,
    chosenAlternativeId: 'sum_intro_fe',
    locked: true,
  },
  { variantId: VARIANT_ID, itemId: 'sum_spain', included: false, order: 1 },
  { variantId: VARIANT_ID, itemId: 'work_acme', included: true, order: 0 },
  {
    variantId: VARIANT_ID,
    itemId: 'blt_acme_perf',
    included: true,
    order: 0,
    overrideData: { text: 'Reduced API p95 latency by 40% (Node/Postgres).' },
    locked: true,
  },
  { variantId: VARIANT_ID, itemId: 'blt_acme_team', included: true, order: 1 },
  { variantId: VARIANT_ID, itemId: 'work_globex', included: true, order: 1 },
  {
    variantId: VARIANT_ID,
    itemId: 'blt_globex_build',
    included: true,
    order: 0,
  },
  { variantId: VARIANT_ID, itemId: 'skg_frontend', included: true, order: 0 },
  { variantId: VARIANT_ID, itemId: 'skill_react', included: true, order: 0 },
  { variantId: VARIANT_ID, itemId: 'skill_vue', included: true, order: 1 },
  { variantId: VARIANT_ID, itemId: 'skg_backend', included: true, order: 1 },
  { variantId: VARIANT_ID, itemId: 'skill_node', included: true, order: 0 },
  { variantId: VARIANT_ID, itemId: 'skill_postgres', included: true, order: 1 },
];

async function main() {
  await prisma.masterResume.deleteMany();
  await prisma.tagCategory.deleteMany();

  await prisma.masterResume.create({
    data: {
      id: MASTER_ID,
      basics: {
        name: 'Alex Ivanov',
        label: 'Fullstack Engineer',
        email: 'alex@example.com',
        phone: '+34 600 000 000',
        location: { city: 'Barcelona', country: 'Spain' },
        profiles: [{ network: 'GitHub', url: 'https://github.com/alex' }],
      },
    },
  });

  await prisma.tagCategory.createMany({ data: tagCategories });
  await prisma.tag.createMany({ data: tags });

  await prisma.item.createMany({ data: topLevelItems });
  await prisma.item.createMany({ data: childItems });
  await prisma.itemTag.createMany({ data: itemTags });

  await prisma.variant.create({
    data: {
      id: VARIANT_ID,
      masterId: MASTER_ID,
      name: 'Google — Frontend',
      templateId: 'classic',
      targetCompany: 'Google',
      jobDescription:
        'Frontend engineer role with a focus on performance and ownership.',
    },
  });

  await prisma.variantTag.createMany({ data: variantTags });
  await prisma.variantItem.createMany({ data: variantItems });

  const [items, tagCount, overlay] = await Promise.all([
    prisma.item.count(),
    prisma.tag.count(),
    prisma.variantItem.count(),
  ]);

  console.log(
    `Seed complete: ${items} items, ${tagCount} tags, ${overlay} overlay rows.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
