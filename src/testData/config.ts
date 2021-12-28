enum ColumnTypes {
  text = 'text',
  number = 'number',
  date = 'date',
  checkbox = 'checkbox',
}

export const columns = [
  {
    header: '',
    dataKey: 'checked',
    type: ColumnTypes.checkbox,
  },
  {
    header: 'City',
    dataKey: 'city',
    type: ColumnTypes.text,
  },
  {
    header: 'Country',
    dataKey: 'country',
    type: ColumnTypes.text,
  },
  {
    header: 'Year',
    dataKey: 'year',
    type: ColumnTypes.number,
  },
  {
    header: 'Value',
    dataKey: 'value',
    type: ColumnTypes.number,
  },
  {
    header: 'Sex',
    dataKey: 'sex',
    type: ColumnTypes.text,
  },
  {
    header: 'Reliability',
    dataKey: 'reliabilty',
    type: ColumnTypes.text,
  },
]

export function fetchTestData() {
  return fetch(
    'https://countriesnow.space/api/v0.1/countries/population/cities'
  )
    .then((res) => res.json())
    .then((res) => res.data)
    .then((data) => {
      return {
        data: data.map((item) => {
          return {
            ...item,
            ...item.populationCounts[0],
          }
        }),
        columns,
      }
    })
}
