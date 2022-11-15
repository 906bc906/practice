import { BadRequestException, PipeTransform } from '@nestjs/common';
import { BoardStatus } from '../board.schema';

export class BoardStatusValidationPipe implements PipeTransform {
  readonly StatusOptions = [BoardStatus.PRIVATE, BoardStatus.PUBLIC];

  transform(value: any) {
    if (typeof value !== 'string' || !this.isStatusValid(value.toUpperCase())) {
      throw new BadRequestException(`${value} isn't in the status options`);
    }
    return value;
  }

  private isStatusValid(status: any) {
    const index = this.StatusOptions.indexOf(status);
    return index !== -1;
  }
}
