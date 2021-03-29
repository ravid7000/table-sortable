type DataCallback<D = unknown, R = unknown> = (data: D, row: unknown) => R;

type DOM = unknown;

type Responsive = {
    [key: number]: boolean;
}

type Column = {
    // HEADER
    header: string;
    headerClassName: string;
    headerRender: () => DOM;

    // CELL
    type: string | number | 'date' | 'checkbox';
    dateFormat: string;
    dataKey: string;
    className: string;
    styles: Record<string, unknown>;
    render: DataCallback;

    // OPTIONS
    responsive: Responsive;
    width: string | number;

    // CALLBACKS
    onHeaderClick: DataCallback;
    onCellClick: DataCallback;
    onSelect: DataCallback;
    onSelectAll: DataCallback;
};

export default Column;
