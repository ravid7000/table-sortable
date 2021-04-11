import { fromJS, List } from 'immutable';
import { useRef, useState, useEffect } from 'preact/hooks';

import OptionType, { PartialOptions, SORT_ORDER } from '../types/options';

import { optionShapeValidator, validateColumn, validateData } from '../config/validator';
import { getIn } from '../helpers/lodash';

let isInitialized = false;
let isMounted = false;

const useController = (options: PartialOptions = {}) => {
  optionShapeValidator(options);

  // STATES
  const dataOriginalStore = useRef<List<OptionType['data'][0]>>(List([]));

  const dataStore = useRef<List<OptionType['data'][0]>>(List([]));

  const columnStore = useRef<List<OptionType['column'][0]>>(List([]));

  const sortOrder = useRef<SORT_ORDER>(SORT_ORDER.DEFAULT);

  const [_, forceUpdate] = useState(0);

  // METHODS
  const updateDOM = () => {
    if (isMounted) {
      forceUpdate(count => count === 10 ? 0 : count + 1);
    }
  }

  const sortDataBy = (key: string) => {
    // GET NEXT ORDER
    if (sortOrder.current === SORT_ORDER.DEFAULT) {
      sortOrder.current = SORT_ORDER.ASC;
    }
    if (sortOrder.current === SORT_ORDER.ASC) {
      sortOrder.current = SORT_ORDER.DESC;
    }
    if (sortOrder.current === SORT_ORDER.DESC) {
      sortOrder.current = SORT_ORDER.DEFAULT;
    }

    if (sortOrder.current === SORT_ORDER.DEFAULT) {
      dataStore.current = dataOriginalStore.current.slice(0);
    } else {
      const reverse = sortOrder.current === SORT_ORDER.ASC ? 1 : -1
      dataStore.current.sortBy(value => getIn(key, value), (a: any, b: any) => {
        if (a > b) {
          return reverse * -1;
        }
        if (b > a) {
          return reverse * 1;
        }
        return 0;
      });
    }
    updateDOM();
  }

  // INITIALIZER
  if (!isInitialized) {
    dataOriginalStore.current = fromJS(options.data);
    dataStore.current = dataOriginalStore.current.slice(0);
    columnStore.current = fromJS(options.column);
    options.updateData = (data: OptionType['data']) => {
      validateData(data);
      dataStore.current = fromJS(data);
      updateDOM();
    }
    options.updateColumn = (column: OptionType['column']) => {
      validateColumn(column);
      columnStore.current = fromJS(column);
      updateDOM();
    }
    options.updateTable = updateDOM;
    isInitialized = true;
  }

  // EFFECT
  useEffect(() => {
    isMounted = true;
    return () => {
      isMounted = false;
      isInitialized = false;
    }
  }, []);

  return {
    dataList: dataStore.current,
    columnList: columnStore.current,
    sortOrder,
    isMounted,
    isInitialized,
    updateDOM,
    sortDataBy,
  }
}

export default useController;
