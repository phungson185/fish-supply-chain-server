import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto<T> {
  @ApiProperty()
  public total: number;
  @ApiProperty()
  public currentPage: number;
  @ApiProperty()
  public size: number;
  @ApiProperty()
  public pages: number;
  @ApiProperty()
  public hasNext: Boolean;
  @ApiProperty()
  public hasPrevious: Boolean;
  @ApiProperty()
  public items: T[];

  public constructor();
  public constructor(total: number, page: number, size: number);
  public constructor(items: T[], total: number, page: number, size: number);

  public constructor(...args: any[]) {
    if (args.length === 3) {
      this.total = Number(args[0]);
      this.currentPage = Number(args[1]);
      this.size = Number(args[2]);
      this.items = [];
      this.pages =
        Number(args[0]) === 0 ? 0 : Math.ceil((1.0 * this.total) / this.size);
    }
    if (args.length === 4) {
      this.total = args[1];
      this.currentPage = args[2];
      this.size = args[3];
      this.items = args[0];
      this.pages =
        Number(args[1]) === 0 ? 0 : Math.ceil((1.0 * this.total) / this.size);
    }
    this.hasNext = this.pages > this.currentPage;
    this.hasPrevious = this.currentPage > 1;
  }
}
