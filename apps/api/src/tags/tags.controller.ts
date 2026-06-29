import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  TagCategoryCreateDto,
  TagCategoryPatchDto,
  TagCategoryResponseDto,
  TagCreateDto,
  TagPatchDto,
  TagResponseDto,
} from './dto/tag.dto';
import { TagsService } from './tags.service';

@ApiTags('tags')
@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('tag-categories')
  @ApiOperation({ summary: 'List tag categories' })
  @ApiOkResponse({ type: TagCategoryResponseDto, isArray: true })
  listCategories() {
    return this.tagsService.listCategories();
  }

  @Post('tag-categories')
  @ApiOperation({ summary: 'Create a tag category' })
  @ApiOkResponse({ type: TagCategoryResponseDto })
  createCategory(@Body() body: TagCategoryCreateDto) {
    return this.tagsService.createCategory(body);
  }

  @Patch('tag-categories/:id')
  @ApiOperation({ summary: 'Update a tag category' })
  @ApiOkResponse({ type: TagCategoryResponseDto })
  patchCategory(@Param('id') id: string, @Body() body: TagCategoryPatchDto) {
    return this.tagsService.patchCategory(id, body);
  }

  @Delete('tag-categories/:id')
  @ApiOperation({ summary: 'Delete a tag category' })
  deleteCategory(@Param('id') id: string) {
    return this.tagsService.deleteCategory(id);
  }

  @Get('tags')
  @ApiOperation({ summary: 'List tags' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiOkResponse({ type: TagResponseDto, isArray: true })
  listTags(@Query('categoryId') categoryId?: string) {
    return this.tagsService.listTags(categoryId);
  }

  @Post('tags')
  @ApiOperation({ summary: 'Create a tag' })
  @ApiOkResponse({ type: TagResponseDto })
  createTag(@Body() body: TagCreateDto) {
    return this.tagsService.createTag(body);
  }

  @Patch('tags/:id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiOkResponse({ type: TagResponseDto })
  patchTag(@Param('id') id: string, @Body() body: TagPatchDto) {
    return this.tagsService.patchTag(id, body);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Delete a tag' })
  deleteTag(@Param('id') id: string) {
    return this.tagsService.deleteTag(id);
  }
}
