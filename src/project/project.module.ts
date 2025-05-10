import { Module } from '@nestjs/common';
import { PrismaModule } from '../share/prisma/prisma.module';
import { ProjectDao } from './dao/project.dao';

@Module({
  imports: [PrismaModule],
  providers: [ProjectDao],
  exports: [ProjectDao],
})
export class ProjectModule {}
