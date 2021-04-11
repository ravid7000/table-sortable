import Options from '../types/options';

export const defaultColumn: Options['column'][0] = {
  width: 100,
  type: 'text'
}

const defaultOptions: Options = {
  column: [],
  data: [],

  // SORTING
  sorting: false,
  sortingIcons: {
    asc: '',
    desc: '',
  },

  // PAGINATION
  rowsPerPage: 0,
  totalPages: 0,
  pagination: true,
  nextText: '',
  prevText: '',
  onPaginationChange: null,
  updateData: null,
  updateColumn: null,
  updateTable: null,

  // STYLES
  className: '',
  rowClassName: '',
  columnClassName: '',
  styles: {},
  rowHeight: 20,

  searchField: '',
};

export default defaultOptions;
