import { Injectable } from '@nestjs/common';
import { ScrapingResultDao } from './dao/scraping-result.dao';
import { CreateScrapingResultDto } from './dto/create-scraping-result.dto';

@Injectable()
export class ScrapingService {
  constructor(private readonly scrapingResultDao: ScrapingResultDao) {}

  /**
   * スクレイピング結果を保存
   * @param createScrapingResultDto 
   * @returns 
   */
  async create(createScrapingResultDto: CreateScrapingResultDto) {
    return this.scrapingResultDao.create(createScrapingResultDto);
  }

  /**
   * ユーザーIDに紐づくスクレイピング結果を取得
   * @param userId 
   * @returns 
   */
  async findByUserId(userId: number) {
    return this.scrapingResultDao.findByUserId(userId);
  }

  /**
   * スクレイピング結果を更新
   * @param id 
   * @param data 
   * @returns 
   */
  async update(id: string, data: Partial<CreateScrapingResultDto>) {
    return this.scrapingResultDao.update(id, data);
  }

  /**
   * スクレイピング結果を削除
   * @param id 
   * @returns 
   */
  async delete(id: string) {
    return this.scrapingResultDao.delete(id);
  }
}
