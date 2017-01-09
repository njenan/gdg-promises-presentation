var fs = require('fs');
var csv = require('csv');

var filesLoaded = 0;
var employeeData;
var salesData;

fs.readFile('./employees.csv', function(err, data) {
    if (err) {
        console.error(err);
        return;
    }

    employeeData = data;

    filesLoaded++;

    parseData(employeeData, salesData);
});

fs.readFile('./sales.csv', function(err, data) {
    if (err) {
        console.error(err);
        return;
    }

    salesData = data;

    filesLoaded++;

    parseData(employeeData, salesData);
});



var filesParsed = 0;

function parseData(rawEmployeeData, rawSalesData){
    if (filesLoaded < 2) {
        return;
    }
    
    var employees;
    var sales;

    csv.parse(rawEmployeeData, {columns: true}, function(err, data) {
        if (err) {
            console.error(err);
            return;
        }
        
        employees = data;

        filesParsed++;

        computePay(employees, sales);
    });

    csv.parse(rawSalesData, {columns: true}, function(err, data) {
        if (err) {
            console.error(err);
            return;
        }
        
        sales = data;

        filesParsed++;

        computePay(employees, sales);
    });
}

function computePay(employees, sales) {
    if (filesParsed < 2) {
        return;
    }
    
    var calculatedPay = employees.map(function(employee) {
        var basePay = parseInt(employee.salary);

        if (employee.title === 'Salesperson') {
            basePay += sales.filter(function(entry) {
                return entry.employeeName === employee.name;
            }).pop().totalSalesInDollars * 0.05;
        }

        return {
            name: employee.name,
            payDue: parseInt(basePay / 12 / 2)
        };
    });

    csv.stringify(calculatedPay, {header:true}, function(err, payAsString) {
        if (err) {
            console.error(err);
            return;
        }

        fs.writeFile('./out.csv', payAsString);
    });
}
