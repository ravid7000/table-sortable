import { h, FunctionalComponent } from "preact";
import OptionType from '../../types/options';
import "./styles.scss";

interface TableProps {
    options?: OptionType;
}

const Table: FunctionalComponent<TableProps> = () => {
    return (
        <table className="ts-table-root">
            <thead>
                <tr>
                    <th>Col 1</th>
                    <th>Col 2</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>column 1 data</td>
                    <td>column 2 data</td>
                </tr>
                <tr>
                    <td>column 3 data</td>
                    <td>column 4 data</td>
                </tr>
                <tr>
                    <td>column 3 data</td>
                    <td>column 4 data</td>
                </tr>
                <tr>
                    <td>column 3 data</td>
                    <td>column 4 data</td>
                </tr>
            </tbody>
        </table>
    );
}

export default Table;
