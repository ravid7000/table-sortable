import Column from './column';

export type Collection = unknown[];

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
    onPaginationChange: (nextPage: number, updateTable: (data: unknown) => void) => void;

    // STYLES
    className: string;
    rowClassName: string;
    columnClassName: string;
    styles: Record<string, unknown>;

    searchField: string;
}

export default Options;
