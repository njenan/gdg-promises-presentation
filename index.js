var fs = require('fs');
var csv = require('csv');

var readFile = function (path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

Promise.all([readFile('./employees.csv'), readFile('./sales.csv')])
    .then(function (array) {
        var salesData = array.pop();
        var employeeData = array.pop();

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
                        payDue: parseInt((basePay / 24) * 0.7)
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
    })
    .catch(console.error);
