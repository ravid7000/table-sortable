import OptionType from '../types/options';

type PartialOption = Partial<OptionType>;

class TSTypeError extends TypeError {
  constructor(...args: any) {
    super(...args);
    this.name = 'TableSortable'
  }
}

export const validateData = (data: PartialOption['data']) => {
  if (!data || !Array.isArray(data)) {
    throw new TSTypeError(`Invalid data property. Data should be array of objects. Provided: ${data}`);
  }

  if (data[0] && Array.isArray(data[0])) {
    throw new TSTypeError(`Invalid data property. Data should be array of objects. Provided: ${data}`);
  }

  if (data[0] && (typeof data[0] !== 'object' || data[0] === null)) {
    throw new TSTypeError(`Invalid data property. Data should be array of objects. Provided: ${data}`);
  }
}

export const validateColumn = (column: PartialOption['column']) => {
  if (!column || !Array.isArray(column)) {
    throw new TSTypeError(`Invalid column property. Column should be array of objects. Provided: ${column}`);
  }
}

export const optionShapeValidator = (options: PartialOption = {}) => {
  if (typeof options !== 'object') {
    throw new TSTypeError(`Invalid config options property. See config. Provided: ${options}`);
  }

  // validate data
  validateData(options.data);

  // validate columns
  validateColumn(options.column);
}