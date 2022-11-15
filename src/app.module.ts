import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017'), BoardsModule],
})
export class AppModule {}
