const inquirer = require("inquirer");
const mysql = require("mysql");
const env = require("dotenv").config();

const connection = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    }
)


inquirer.prompt([
    {
        message: "Connect to the database?",
        name: "connect",
        type: "confirm"
    }
]).then(answers => {
    // console.log(answers)
    if (answers.connect) {
        connection.connect(err => {
            if (err) throw err;
            console.log("Connection established.");
            listItems(connection,"products");
            connection.end(err => {
                if (err) throw err;
                console.log("Connection closed.");
            });
        })
    }
    else{
        console.log("Ok I won't try to connect then.")
    }

});


function listItems(connection, tableName){
    connection.query("SELECT * FROM ??",[tableName],(err,res)=>{
        if(err) throw err;
        console.table(res);
    })
}