import { Module } from '@nestjs/common';
import { NotebooksModule } from './notebooks/notebooks.module';

@Module({
  imports: [NotebooksModule],
})
export class AppModule {}
