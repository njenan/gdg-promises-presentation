var fs = require('fs');
var csv = require('csv');

fs.readFile('./employees.csv', function (err, employeeData) {
    if (err) {
        console.error(err);
        return;
    }

    fs.readFile('./sales.csv', function (err, salesData) {
        if (err) {
            console.error(err);
            return;
        }

        csv.parse(employeeData, {columns: true}, function (err, employees) {
            if (err) {
                console.error(err);
                return;
            }

            csv.parse(salesData, {columns: true}, function (err, sales) {
                if (err) {
                    console.error(err);
                    return;
                }

                var calculatedPay = employees.map(function (employee) {
                    var basePay = parseInt(employee.salary);

                    if (employee.title === 'Salesperson') {
                        basePay += sales.filter(function (entry) {
                                return entry.employeeName === employee.name;
                            }).pop().totalSalesInDollars * 0.05;
                    }

                    return {
                        name: employee.name,
                        payDue: parseInt(basePay / 24)
                    };
                });

                csv.stringify(calculatedPay, {header: true}, function (err, payAsString) {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    fs.writeFile('./out.csv', payAsString);
                });
            });
        });
    });
});
