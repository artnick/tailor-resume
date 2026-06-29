import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MasterResumeGetDto, MasterResumePutDto } from './dto/master.dto';
import { MasterService } from './master.service';

@ApiTags('master')
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Get()
  @ApiOperation({ summary: 'Get singleton master resume' })
  @ApiOkResponse({ type: MasterResumeGetDto })
  getMaster() {
    return this.masterService.getMaster();
  }

  @Put()
  @ApiOperation({ summary: 'Replace singleton master resume' })
  @ApiOkResponse({ type: MasterResumeGetDto })
  putMaster(@Body() body: MasterResumePutDto) {
    return this.masterService.putMaster(body);
  }
}
