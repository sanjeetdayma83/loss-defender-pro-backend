import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CompanyService } from '../../services/company/company.service';

import { CreateCompanyDto } from '../../dto/create-company.dto';
import { UpdateCompanyDto } from '../../dto/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Company' })
  create(
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Companies' })
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Company By Id' })
  findOne(
    @Param('id') id: string,
  ) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Company' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Company' })
  remove(
    @Param('id') id: string,
  ) {
    return this.companyService.remove(id);
  }
}