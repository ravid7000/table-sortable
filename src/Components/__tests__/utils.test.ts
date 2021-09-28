import { createPagination } from '../utils';

describe('Test createPagination util', () => {
  test('should return 5 pages', () => {
    expect(createPagination({ currentPage: 1, totalPages: 5 })).toStrictEqual([1,2,3,4,5]);
  });

  test('should return pages equal to totalPages', () => {
    expect(createPagination({ currentPage: 1, totalPages: 3 })).toStrictEqual([1,2,3]);
    expect(createPagination({ currentPage: 1, totalPages: 1 })).toStrictEqual([1]);
    expect(createPagination({ currentPage: 1, totalPages: 0 })).toStrictEqual([]);
  })

  test('currentPage should be less than or equal to totalPages', () => {
    expect(createPagination({ currentPage: 4, totalPages: 3 })).toStrictEqual([1,2,3]);
    expect(createPagination({ currentPage: 3, totalPages: 3 })).toStrictEqual([1,2,3]);
  });

  test('increase/decrease currentPage should increase/decrease the pages', () => {
    expect(createPagination({ currentPage: 1, totalPages: 10 })).toStrictEqual([1,2,3,4,5]);
    // // set currentPage 3;
    expect(createPagination({ currentPage: 3, totalPages: 10 })).toStrictEqual([1,2,3,4,5]);
    // // set currentPage 2;
    expect(createPagination({ currentPage: 2, totalPages: 10 })).toStrictEqual([1,2,3,4,5]);
    // set currentPage 5;
    expect(createPagination({ currentPage: 5, totalPages: 10 })).toStrictEqual([3,4,5,6,7]);
    // set currentPage 8;
    expect(createPagination({ currentPage: 8, totalPages: 10 })).toStrictEqual([6,7,8,9,10]);
    // set currentPage 10;
    expect(createPagination({ currentPage: 10, totalPages: 10 })).toStrictEqual([6,7,8,9,10]);
    // set currentPage 11;
    expect(createPagination({ currentPage: 11, totalPages: 10 })).toStrictEqual([1,2,3,4,5]);
  })
})