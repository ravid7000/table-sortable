# Table Sortable

A jquery plugin to sort and paginate data in table form.

### Requirements
##### Dependencies
Table Sortable has only one dependency [jquery](https://jquery.com/)

### Configuration

| Key                 | Value                                           | Default                                             |
| -------------       | -------------                                   | ------                                              |
| data                | `[]`                                            |                                                     |
| column              | `{}`                                            |                                                     |
| sorting             | `true/false/[array of columns]`                 | `true`                                              |
| pagination          | `true/false/Number`                             | `true`                                              |
| paginationContainer | `html-element/selector`                       |                                                     |
| paginationLength    | `number`                                        | `5`                                                 |
| showPaginationLabel | `true/false`                                    | `true`                                              |
| processHtml         | `function(item, key, uniqueId) {}`              |                                                     |
| columnsHtml         | `function(item, key) {}`                        |                                                     |
| searchField         | `html-element/selector`                      |                                                     |
| responsive          | `[]`                                            |                                                     |
| dateParsing         | `true/false`                                    | `true`                                              |
| generateUniqueIds   | `true/false`                                    | `true`                                              |
| sortingIcons        | `{ asc: '', dec: '' }`                          | `{asc: '<span>▼</span>', dec: '<span>▲</span>' }`  |
| nextText            | `html-element/selector`                      | `<span>Next</span>`                                 |
| prevText            | `html-element/>selector`                      | `<span>Prev</span>`                                 |
| events              | `onInit, onUpdate, onDistroy`                   |                                                     |


See [src/test.js](https://github.com/ravid7000/table-sortable/blob/master/src/test.js) file for all configurations

### Licence

MIT License

Copyright (c) 2018 Ravi Dhiman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
