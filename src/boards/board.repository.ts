import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Board, BoardDocument, BoardStatus } from './board.schema';
import { Model, FilterQuery } from 'mongoose';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {}

  async find(boardFilterQuery: FilterQuery<Board>): Promise<Board[]> {
    return this.boardModel.find(boardFilterQuery);
  }

  async findOne(boardFilterQuery: FilterQuery<Board>): Promise<Board> {
    return this.boardModel.findOne(boardFilterQuery);
  }

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const { title, description } = createBoardDto;

    const newBoard = new this.boardModel({
      title,
      description: description + process.env.HELLO,
      status: BoardStatus.PUBLIC,
    });
    return newBoard.save();
  }

  async findOneAndUpdate(
    boardFilterQuery: FilterQuery<Board>,
    board: Partial<Board>,
  ): Promise<Board> {
    const result = await this.boardModel.findOneAndUpdate(
      boardFilterQuery,
      board,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  async deleteOne(boardFilterQuery: FilterQuery<Board>): Promise<number> {
    const result = await this.boardModel.deleteOne(boardFilterQuery);
    //{ acknowledged: true, deletedCount: 1 }
    if (result.deletedCount === 0) throw new NotFoundException();
    return result.deletedCount;
  }
}
