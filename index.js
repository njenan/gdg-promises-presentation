var P = require('bluebird');

var fs = P.promisifyAll(require('fs'));
var csv = P.promisifyAll(require('csv'));


P.all([fs.readFileAsync('./employees.csv'), fs.readFileAsync('./sales.csv')])
    .then(function (array) {
        var salesData = array.pop();
        var employeeData = array.pop();

        return P.all([csv.parseAsync(employeeData, {columns: true}), csv.parseAsync(salesData, {columns: true})]);
    })
    .then(function (array) {
        var sales = array.pop();
        var employees = array.pop();

        var calculatedPay = employees.map(function (employee) {
            var basePay = parseInt(employee.salary);

            if (employee.title === 'Salesperson') {
                basePay += sales.filter(function (entry) {
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
