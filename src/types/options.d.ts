import Column from './column';

export type Collection = Record<string, unknown>[];

export enum SORT_ORDER {
  DEFAULT,
  ASC,
  DESC,
}

type Options = {
  column: Column[];
  data: Collection;

  // SORTING
  sorting: boolean | string[];
  sortingIcons: {
    asc: string;
    desc: string;
  };

  // PAGINATION
  rowsPerPage: number;
  totalPages: number;
  pagination: boolean | 'infinite';
  nextText: string;
  prevText: string;
  onPaginationChange: ((nextPage: number, updateTable: (data: unknown) => void) => void) | null;
  updateData: ((data: Collection) => void) | null;
  updateColumn: ((column: Column[]) => void) | null;
  updateTable: (() => void) | null;

  // STYLES
  className: string;
  rowClassName: string;
  columnClassName: string;
  styles: Record<string, unknown>;
  rowHeight: string | number;

  searchField: string;
}

export type PartialOptions = Partial<Options>;

export default Options;
