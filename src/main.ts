import App from './App.svelte';

// store
import { isOptionsValid } from './Store/validators'
import { collection, options } from './Store'

// types
import type { PartialOptions } from './options';

// test data
import { fetchTestData } from './testData/config';

// utils
import cloneDeep from "lodash.clonedeep";

const app = new App({
  target: document.body,
});

function createTable(el: HTMLElement, config: PartialOptions) {
  if (!isOptionsValid(config)) {
    throw Error('TableSortable options are not valid. Please see the docs for valid options.')
  }

  collection.set(cloneDeep(config.data));
  options.update(opt => {
    return {
      ...opt,
      ...config,
    }
  });
}


fetchTestData().then(({ data, columns }) => {
  createTable(document.body, {
    data,
    columns,
    rowsPerPage: 5,
  })
})

export default app;