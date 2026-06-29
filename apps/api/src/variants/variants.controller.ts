import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  VariantCreateDto,
  VariantGetDto,
  VariantListItemDto,
  VariantPutDto,
} from './dto/variant.dto';
import { VariantsService } from './variants.service';

@ApiTags('variants')
@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all variants' })
  @ApiOkResponse({ type: VariantListItemDto, isArray: true })
  listVariants() {
    return this.variantsService.listVariants();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new variant' })
  @ApiOkResponse({ type: VariantGetDto })
  createVariant(@Body() body: VariantCreateDto) {
    return this.variantsService.createVariant(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get variant with overlay' })
  @ApiOkResponse({ type: VariantGetDto })
  getVariant(@Param('id') id: string) {
    return this.variantsService.getVariant(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace variant overlay and metadata' })
  @ApiOkResponse({ type: VariantGetDto })
  putVariant(@Param('id') id: string, @Body() body: VariantPutDto) {
    return this.variantsService.putVariant(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a variant' })
  deleteVariant(@Param('id') id: string) {
    return this.variantsService.deleteVariant(id);
  }
}
