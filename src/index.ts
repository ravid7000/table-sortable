import habitat from "preact-habitat";

import OptionType from './types/options';

import "./styles/index.css";

import Widget from "./main";

const _habitat = habitat(Widget);

function tableSortable(options: Partial<OptionType>) {
  _habitat.render({
    selector: '[data-widget-host="habitat"]',
    clean: true,
    defaultProps: {
      options,
    }
  });

  return {
    updateTable: options.updateTable,
    updateColumn: options.updateColumn,
    updateData: options.updateData,
  }
}

tableSortable({
  column: [
    {
      header: 'SR No',
      dataKey: 'id',
    },
    {
      header: 'First Name',
      dataKey: 'first_name',
    },
    {
      header: 'Last Name',
      dataKey: 'last_name',
    },
  ],
  data: [
    {
      id: '0',
      first_name: 'Ravi',
      last_name: 'Dhiman',
    },
    {
      id: '1',
      first_name: 'Ravi',
      last_name: 'Dhiman',
    },
    {
      id: '2',
      first_name: 'Ravi',
      last_name: 'Dhiman',
    },
    {
      id: '3',
      first_name: 'Ravi',
      last_name: 'Dhiman',
    },
  ]
})