var P = require('bluebird');

var fs = P.promisifyAll(require('fs'));
var csv = P.promisifyAll(require('csv'));


P.props({
    employees: fs.readFileAsync('./employees.csv'),
    sales: fs.readFileAsync('./sales.csv')
})
    .then(function (data) {
        return P.props({
            employees: csv.parseAsync(data.employees, {columns: true}),
            sales: csv.parseAsync(data.sales, {columns: true})
        });
    })
    .then(function (data) {
        var calculatedPay = data.employees.map(function (employee) {
            var basePay = parseInt(employee.salary);

            if (employee.title === 'Salesperson') {
                basePay += data.sales.filter(function (entry) {
                        return entry.employeeName === employee.name;
                    }).pop().totalSalesInDollars * 0.05;
            }

            return {
                name: employee.name,
                payDue: parseInt((basePay / 24) * 0.7)
            };
        });

        return csv.stringifyAsync(calculatedPay, {header: true})
    })
    .then(function (payAsString) {
        return fs.writeFileAsync('./out.csv', payAsString);
    })
    .catch(console.error);
