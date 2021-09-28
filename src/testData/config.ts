enum ColumnTypes {
  text = 'text',
  number = 'number',
  date = 'date',
  checkbox = 'checkbox',
}

export const columns = [
  {
    header: 'ID',
    dataKey: 'id',
    headerClassName: 'id-header',
    type: ColumnTypes.number,
    headerRender: (header) => {
      return `##${header}`;
    }
  },
  {
    header: 'Name',
    dataKey: 'name',
    type: ColumnTypes.text,
  },
  {
    header: 'Username',
    dataKey: 'username',
    type: ColumnTypes.text,
  },
  {
    header: 'Website',
    dataKey: 'website',
    type: ColumnTypes.text,
  },
  {
    header: 'Phone',
    dataKey: 'phone',
    type: ColumnTypes.text,
  },
  {
    header: 'Company Name',
    dataKey: 'company.name',
    type: ColumnTypes.text,
  },
  {
    header: 'City',
    dataKey: 'address.city',
    type: ColumnTypes.text,
  },
  {
    header: 'Zip-Code',
    dataKey: 'address.zipcode',
    type: ColumnTypes.text,
    render: (td) => {
      console.log(td);
      return td;
    }
  },
];

export function fetchTestData() {
  return fetch('https://jsonplaceholder.typicode.com/users')
    .then(res => res.json())
    .then(data => {
      return {
        data,
        columns,
      }
    })
}