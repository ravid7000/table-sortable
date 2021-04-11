import { h, FunctionalComponent } from "preact";
import OptionType from '../../types/options';

// components
import Cell from '../Cell';

interface TableProps {
  options?: Partial<OptionType>;
}

const Table: FunctionalComponent<TableProps> = ({ options }) => {
  return (
    <div className="ts-table">
      <div className="ts-table-head">
        <div className="ts-table-row">
          <div className="ts-table-header">Col 1</div>
          <div className="ts-table-header">Col 2</div>
        </div>
      </div>
      <div className="ts-table-body">
        <div className="ts-table-row">
          <Cell>Cell 1</Cell>
          <Cell>Cell 1</Cell>
        </div>
      </div>
    </div>
  );
}

export default Table;
