import { h, FunctionalComponent } from "preact";

import ColumnType from '../../types/column';

interface ColumnProps {
    row: unknown;
    config: ColumnType;
}

const Column: FunctionalComponent<ColumnProps> = () => {
    return <div>column</div>;
}

export default Column;
