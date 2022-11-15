import { Injectable, NotFoundException } from '@nestjs/common';
import { Board, BoardStatus } from './board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardRepository } from './board.repository';

@Injectable()
export class BoardsService {
  constructor(private readonly boardRepository: BoardRepository) {}
  getAllBoards(): Promise<Board[]> {
    return this.boardRepository.find({});
  }

  createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardRepository.create(createBoardDto);
  }

  async getBoardById(id: string): Promise<Board> {
    const found = await this.boardRepository.findOne({ _id: id });
    if (!found) throw new NotFoundException(`Can't find Board with ${id}`);
    return found;
  }

  deleteBoard(id: string) {
    this.boardRepository.deleteOne({ id });
  }

  async updateBoardStatus(id: string, status: BoardStatus): Promise<Board> {
    return this.boardRepository.findOneAndUpdate({ _id: id }, { status });
  }
}
