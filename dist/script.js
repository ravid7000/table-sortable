var data = [
    {
        formCode: 531718,
        formName: 'Investment Form',
        fullName: 'Test User',
        appointmentDate: '13 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 531790,
        formName: 'Investment Form 2',
        fullName: 'Test User',
        appointmentDate: '12 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 531334,
        formName: 'Investment Form 3',
        fullName: 'Test User',
        appointmentDate: '10 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5317,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5318,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5319,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5320,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5321,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5322,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5323,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5324,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5325,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5326,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5327,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5328,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
    {
        formCode: 5329,
        formName: 'Investment Form 4',
        fullName: 'Test User',
        appointmentDate: '17 March, 2017',
        appointmentTime: '1:30PM',
        phone: '9876543210'
    },
]

var columns = {
    'formCode': 'Form Code',
    'formName': 'Form Name',
    'fullName': 'Full Name',
    'appointmentDate': 'Appointment Date',
    'appointmentTime': 'Appointment Time',
    'phone': 'Phone'
}

var TestData = {
    data: data,
    columns: columns
}

var table = $('#root').tableSortable({
    data: TestData.data,
    columns: TestData.columns,
    dateParsing: true,
    processHtml: function(row, key) {
        if (key === 'avatar_url') {
            return '<a href="' + row[key] + '" target="_blank">View Avatar</a>'
        }
        if (key === 'url') {
            return '<a href="' + row[key] + '" target="_blank">Github Link</a>'
        }
        if (key === 'site_admin' && row[key]) {
            return '<span class="btn btn-warning btn-sm">Admin</span>'
        }
        return row[key]
    },
    columnsHtml: function(value, key) {
        return value;
    },
    pagination: 2,
    showPaginationLabel: true,
    prevText: 'Prev',
    nextText: 'Next',
    searchField: $('input'),
    responsive: [
        {
            maxWidth: 992,
            minWidth: 769,
            columns: TestData.col,
            pagination: true,
            paginationLength: 3
        },
        {
            maxWidth: 768,
            minWidth: 0,
            columns: TestData.colXS,
            pagination: true,
            paginationLength: 2
        }
    ]
})