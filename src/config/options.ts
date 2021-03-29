import Options from '../types/options';

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
    onPaginationChange: () => 0,

    // STYLES
    className: '',
    rowClassName: '',
    columnClassName: '',
    styles: {},

    searchField: '',
};

export default defaultOptions;
