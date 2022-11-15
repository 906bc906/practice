import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoardDocument = HydratedDocument<Board>;

export enum BoardStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@Schema({ versionKey: false })
export class Board {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  status: BoardStatus;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
