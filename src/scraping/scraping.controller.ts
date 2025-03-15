import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { CreateScrapingResultDto } from './dto/create-scraping-result.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Article } from '@prisma/client';

@Controller('scraping')
@UseGuards(JwtAuthGuard)
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post()
  async create(@Body() createScrapingResultDto: CreateScrapingResultDto, @Req() req) {
    // ユーザーIDを設定
    createScrapingResultDto.userId = req.user.id;
    return this.scrapingService.create(createScrapingResultDto);
  }

  @Get()
  async findByUserId(@Req() req) {
    return this.scrapingService.findByUserId(req.user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScrapingResultDto: Partial<CreateScrapingResultDto>,
  ) {
    return this.scrapingService.update(id, updateScrapingResultDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.scrapingService.delete(id);
  }
}
