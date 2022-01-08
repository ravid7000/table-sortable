export enum SORT_ORDER {
  DEFAULT = 'DEFAULT',
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ColumnTypes {
  text = 'text',
  number = 'number',
  date = 'date',
  checkbox = 'checkbox',
}

export const ColumnAlignment = {
  [ColumnTypes.text]: '',
  [ColumnTypes.number]: 'right',
  [ColumnTypes.date]: 'right',
  [ColumnTypes.checkbox]: 'center',
}

export const UNIQUE_ID_KEY = '__ts_id'
