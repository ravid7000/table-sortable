import { ColumnTypes } from './enums'

type DataCallback<D = unknown, R = unknown> = (data: D, row: R) => void

type OnSelectCallback<D = unknown, R = unknown> = (
  data: D,
  row: R,
  isSelected: boolean
) => boolean | void

type DOM = unknown

type Responsive = {
  [key: number]: boolean
}

type Column = Partial<{
  // HEADER
  header: string
  headerClassName: string
  headerRender: (header: keyof typeof ColumnTypes | string) => string
  hide: boolean
  sorting: boolean

  // CELL
  type: keyof typeof ColumnTypes
  dateFormat: string
  dataKey: string
  className: string
  render: (td: HTMLElement, item: unknown, row: unknown) => td

  // OPTIONS
  responsive: Responsive
  width: string | number

  // CALLBACKS
  onHeaderClick: (column: Column) => void
  onCellClick: DataCallback
  onSelect: OnSelectCallback
  onSelectAll: OnSelectCallback
}>

export default Column
