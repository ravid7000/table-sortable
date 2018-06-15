# Table Sortable

A jquery plugin to sort and paginate data in table form.

### Requirements
##### Dependencies
1. [jquery](https://jquery.com/)
2. [Bootstrap CSS](http://getbootstrap.com/)

### Configuration

| Key                 | Value                                           | Default                                             |
| -------------       | -------------                                   | ------                                              |
| data                | `[ ]`                                           |                                                     |
| column              | `{ }`                                           |                                                     |
| sorting             | `true|false|[array of columns]`                 | `true`                                              |
| pagination          | `true|false|Number`                             | `true`                                              |
| paginationContainer | `<html-element|selector>`                    |                                                     |
| paginationLength    | `number`                                        | `5`                                                 |
| showPaginationLabel | `true|false`                                    | `true`                                              |
| processHtml         | `function(item, key, uniqueId)`                 |                                                     |
| columnsHtml         | `function(item, key)`                           |                                                     |
| searchField         | `<html-element|selector>`                    |                                                     |
| responsive          | `[]`                                            |                                                     |
| dateParsing         | `true|false`                                    | `true`                                              |
| generateUniqueIds   | `true|false`                                    | `true`                                              |
| sortingIcons        | `{ asc: '', dec: '' }`                          | `{ asc: '<span>▼</span>', dec: '<span>▲</span>' }`  |
| nextText            | `<html-element|selector>`                    | `<span>Next</span>`                                 |
| prevText            | `<html-element|selector>`                    | `<span>Prev</span>`                                 |
| events              | `{ onInit, onUpdate, onDistroy }:function`      |                                                     |
