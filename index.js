var mysql = require("mysql");
var inquirer = require("inquirer");
var figlet = require("figlet");
var table = require("console.table")

var connection = mysql.createConnection({

    host: "localhost",

    port: 3306,

    user: "root",

    password: process.env.MYSQL_PASSWORD,

    database: "etracker_db"

});

connection.connect(function (err) {
    if (err) throw err;
    titleText.then(start())
})


const titleText = new Promise(function (res, rej) {
    figlet('Employee Tracker', function (err, data) {
        if (err) {
            console.log('ERROR');
            console.dir(err);
            return;
        }
        console.log(data)
    })
    console.log("\n")
})


function start() {
    console.log("\n")

    inquirer.prompt({
        type: "list",
        message: "Choose an action: ",
        name: "actions",
        choices: [
            "View All Employees",
            "Add an Employee",
            "Delete Employee",
            "Add a Department",
            "Add a Role",
            "Change Employee Role",
            "View Departments",
            "Exit",
        ]


    })
        .then(function (res) {
            switch (res.actions) {

                case "View All Employees":
                    viewEmployees()
                    break;

                case "Add an Employee":
                    addEmployee();
                    break;

                case "Delete Employee":
                    deleteEmployee()
                    break;

                case "Add a Department":
                    addDepartment()
                    break;

                case "Add a Role":
                    addRole()
                    break;

                case "Change Employee Role":
                    changeRole()
                    break;

                case "View Departments":
                    viewDepartments()
                    break;

                case "Exit":
                    console.log("Thank you for using Employee Tracker!")
                    process.exit()

                default:
                    console.log("Please choose an option.")
                    start()
                    break;
            }
        })
};

function viewEmployees() {
    connection.query("SELECT * FROM employee;", function (err, res) {
        if (err) throw err
        console.table(res)
        moreActions()
    })
}


function addEmployee() {
    const roles = []
    const managers = []
    var roleID = ""
    var managerID = ""

    connection.query("SELECT * FROM role;", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roles.push(res[i].title)
        }
    })

    connection.query("SELECT * FROM employee;", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            let managerFirst = res[i].first_name
            let managerSecond = res[i].last_name
            managers.push(managerFirst + " " + managerSecond)
        }
    })

    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "Please enter first Name: "
        },
        {
            name: "last_name",
            type: "input",
            message: "Please enter last Name: "
        },
        {
            name: "role",
            type: "list",
            message: "Please select a role: ",
            choices: roles
        },


    ])
        .then(function (response) {
            let role = response.role
            connection.query("SELECT id FROM role WHERE title=?", [role], function (err, res) {
                if (err) throw err;
                roleID = parseInt(res[0].id)
            })
            inquirer.prompt({
                name: "add_manager",
                type: "confirm",
                message: "Would you like this employee to be a manager?"
            })
                .then(function (res) {
                    if (res.addManager != true) {
                        connection.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);", [response.first_name, response.last_name, roleID], function (err, res) {
                            if (err) throw err;
                            console.log(response.first_name + " " + response.last_name + " has been added!")
                            moreActions()

                        })

                    }

                    else {
                        inquirer.prompt(
                            {
                                name: "manager",
                                type: "list",
                                message: "Please select a manager ",
                                choices: managers
                            }
                        )
                            .then(function (res) {
                                let manager = res.manager
                                let manager_name = manager.split(" ")
                                connection.query("SELECT id FROM employee WHERE first_name=? AND last_name=?", [manager_name[0], manager_name[1]], function (err, res) {
                                    if (err) throw err;
                                    managerID = parseInt(res[0].id)

                                    connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);", [response.first_name, response.last_name, roleID, managerID], function (err, res) {
                                        if (err) throw err;

                                        console.log(response.first_name + " " + response.last_name + " has been added!")
                                        moreActions()

                                    })
                                })

                            })
                    }
                })
        })
}

function deleteEmployee() {
    var employees = [];
    var employeeId = "";
    var query = "SELECT employee.id, first_name, last_name, title FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id"

    connection.query(query, function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {
            employees.push(res[i].id + " " + res[i].first_name + " " + res[i].last_name + " | " + res[i].title);
        }

        inquirer
            .prompt({
                name: "employee",
                type: "list",
                message: "Who would you like to remove?",
                choices: employees
            })
            .then(function (answer) {
                let oldId = answer.employee.split(" ");
                employeeId = oldId[0];
                var query = "DELETE FROM employee WHERE id = ?;"

                connection.query(query, [employeeId], function (err, res) {
                    if (err) throw err;
                    console.log(answer.employee + " has been removed.");

                    moreActions();
                });
            });

    })
};

function addDepartment() {
    inquirer
        .prompt({
            name: "department",
            type: "input",
            message: "Please enter the department: "
        })
        .then(function (response) {
            connection.query("INSERT INTO department (name) VALUES (?);", [response.department], function (err, res) {
                if (err) throw err
                console.log(response.department + " has been added!")
                moreActions()
            })
        })
}

function addRole() {
    departments = []
    departmentID = ""

    connection.query("SELECT * FROM department;", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name)
        }
    })

    inquirer
        .prompt([
            {
                name: "roleTitle",
                type: "input",
                message: "Please enter the role: "
            },
            {
                name: "roleSalary",
                type: "input",
                message: "Please enter the salary: "
            },
            {
                name: "roleDepartment",
                type: "list",
                message: "Please select a department: ",
                choices: departments
            }
        ])
        .then(function (response) {
            let salary = parseFloat(response.roleSalary)
            let selectedDepartment = response.roleDepartment
            console.log(selectedDepartment)
            connection.query("SELECT id FROM department WHERE name=?;", [selectedDepartment], function (err, res) {
                if (err) throw err;
                departmentID = parseInt(res[0].id)
                connection.query("INSERT INTO role (title, salary, department_id) VALUE (?, ?, ?);", [response.roleTitle, salary, departmentID], function (err, res) {
                    if (err) throw err;
                    console.log(response.roleTitle + " has been added!")
                    moreActions()
                })
            })

        })
}

function changeRole() {
    var query = "SELECT employee.id, first_name, last_name, title FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id"

    connection.query(query, function (err, res) {
        if (err) throw err;

        var employees = [];
        var employeeId = "";
        var newRole = ""

        for (let i = 0; i < res.length; i++) {
            employees.push(res[i].id + " " + res[i].first_name + " " + res[i].last_name + " | " + res[i].title);
        }

        inquirer
            .prompt({
                name: "employee",
                type: "list",
                message: "Enter in the employee you would like to update: ",
                choices: employees
            })
            .then(function (answer) {
                let oldId = answer.employee.split(" ");
                employeeId = oldId[0];

                connection.query("SELECT * from role;", function (err, res) {
                    if (err) throw err;
                    var rolesList = [];

                    for (let i = 0; i < res.length; i++) {
                        rolesList.push(res[i].id + " " + res[i].title);
                    }

                    inquirer
                        .prompt({
                            name: "newRole",
                            type: "list",
                            message: "A new role",
                            choices: rolesList
                        }).then(function (answer) {

                            newRole = answer.newRole.split(" ");
                            var query = "UPDATE employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id SET role_id = ? WHERE employee.id = ?;"

                            connection.query(query, [newRole[0], employeeId], function (err, res) {
                                if (err) throw err;
                                console.log("Role has been changed to " + newRole[1] + " " + newRole[2]);

                                moreActions();
                            });
                        });
                })
            })
    })
};


function viewDepartments() {
    connection.query("SELECT * FROM department;", function (err, res) {
        if (err) throw err
        console.table(res)
        moreActions()
    })
}

function moreActions() {
    inquirer
        .prompt({
            name: "continue",
            type: "confirm",
            message: "Would you like to perform another action?"
        })
        .then(function (res) {
            if (res.continue != true) {
                console.log("Thank you!")
                process.exit()
            }
            else {
                start()
            }
        })
};