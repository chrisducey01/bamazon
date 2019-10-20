const inquirer = require("inquirer");
const mysql = require("mysql");
const env = require("dotenv").config();

const ITEM_LIST = ["item_id", "product_name", "price", "stock_quantity"];
const TABLE_NAME = "products";

const connection = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    }
)


function start() {
    inquirer.prompt([
        {
            message: "Pick a function:",
            choices: [
                "View Products Sales by Department",
                "Create New Department",
                "Quit"
            ],
            type: "list",
            name: "jobFunction"
        }
    ]).then(answers => {
        switch (answers.jobFunction) {
            case "View Products Sales by Department":
                console.log(`
#################################################
# Report of Sales Totals by Department:
#################################################
`);

                calcDeptTotals(connection, start);
                break;
            case "Create New Department":
                addNewDept(connection, start);
                break;
            case "Quit":
                endConnection(connection);
                break;
        }
    });
}


function calcDeptTotals(connection, callback){
    let sqlText = `
        select d.department_id, d.department_name, d.over_head_costs, 
            sum(p.product_sales) as product_sales, sum(p.product_sales) - d.over_head_costs as total_profit
        from products p 
        join departments d on p.department = d.department_id
        group by d.department_id
        order by d.department_name`;

    connection.query(sqlText,(err,results,fields)=>{
        console.table(results);
        callback();
    });
}


function addNewDept(connection, callback){
    inquirer.prompt([
        {
            message: "Enter new department name: ",
            type: "input",
            name: "department_name"
        },
        {
            message: "What are the overhead costs for the new department? ",
            type: "number",
            name: "over_head_costs"
        }
    ]).then(answers=>{
        connection.query("Select * from departments where department_name = ?",answers.department_name,(err,results,fields)=>{
            console.log("");
            if(results.length > 0){
                console.log("Department already exists.  Try entering a different department.");
                console.log("");
                callback();
            }
            else
            {
                //Department isn't a duplicate, go ahead and insert into db
                connection.query("INSERT INTO departments SET ?",{ department_name: answers.department_name, over_head_costs: answers.over_head_costs},(err,results,fields)=>{
                    if(err){
                        console.log("Error adding new department.  Please try again");
                        console.log("");
                    }
                    else{
                        console.log(`New department [${answers.department_name}] successfully added.`);
                        console.log("");
                    }
                    callback();
                });
            }
        });
    });
};


function endConnection(connection) {
    connection.end(err => {
        if (err) throw err;
        console.log("");
        console.log("Connection closed.");

    });
}


connection.connect(err => {
    if (err) throw err;
    console.log("Connection established.");
    start();
});

