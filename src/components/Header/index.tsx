import { h, FunctionalComponent } from "preact";

import ColumnType from '../../types/column';

interface HeaderProps {
    columns: ColumnType[];
}

const Header: FunctionalComponent<HeaderProps> = ({ columns }) => {
    return (
        <thead>
            <tr>
                {columns && columns.length > 0 && columns.map((column) => (
                    <th key={column.dataKey}>{column.header}</th>
                ))}
            </tr>
        </thead>
    );
}

export default Header;
