
# Table Sortable
A jquery plugin to sort and paginate data in table form. [View full documentation](https://table-sortable.now.sh/story-latest.html) [View demo](https://table-sortable.now.sh/)

For version 1, See `v1` branch of this repo.

### Dependencies
Table Sortable has only one dependency [jquery](https://jquery.com/)

### How to use?

```js
var options = {
    data: [...],
    columns: {...},
    responsive: {
        1100: {
            columns: {...},
        },
    },
    rowsPerPage: 10,
    pagination: true,
};
var table = $('#table-sortable').tableSortable(options);
```

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/ravid7000/table-sortable)

<h3>Support</h3>
<p>
  <a href="https://www.buymeacoffee.com/raviddev">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="50" width="210" alt="raviddev" /></a>
</p><br>


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
