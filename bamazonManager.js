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
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Quit"
            ],
            type: "list",
            name: "jobFunction"
        }
    ]).then(answers => {
        switch (answers.jobFunction) {
            case "View Products for Sale":
                console.log(`
#################################################
# List of all items in inventory:
#################################################
`);

                listItems(connection, TABLE_NAME, ITEM_LIST, null, start);
                break;
            case "View Low Inventory":
                console.log(`
#################################################
# Items with low inventory:
#################################################
`);
                listItems(connection, TABLE_NAME, ITEM_LIST, "WHERE stock_quantity < 5", start);
                break;
            case "Add to Inventory":
                console.log(`
#################################################
# Current stock levels::
#################################################
                `);   
                listItems(connection, TABLE_NAME, ITEM_LIST, null, ()=>{
                    addToIventory(connection, start);             
                });
                break;
            case "Add New Product":
                addNewProduct(connection, start);
                break;
            case "Quit":
                endConnection(connection);
                break;
        }
    });
}


function listItems(connection, tableName, fieldList, whereClause, callback) {
    let sqlText = "SELECT ?? FROM ??";
    if (whereClause) {
        sqlText += ` ${whereClause}`;
    }

    connection.query(sqlText, [fieldList, tableName], (err, res) => {
        if (err) throw err;
        console.table(res);
        console.log("");
        callback();
    })
}


function addToIventory(connection, callback){
    inquirer.prompt([
        {
            message:  "Enter the item_id of the product you want to add inventory to (Enter 0 to cancel): ",
            type: "number",
            name: "item_id"
        }
    ]).then(answers=>{
        if(answers.item_id > 0){
            updateInventory(connection,answers.item_id,callback);
        }
        else{
            callback();
        }
    });
}


function updateInventory(connection, itemId, callback){
    inquirer.prompt([
        {
            message: "Enter the amount of items to add to inventory: ",
            type: "number",
            name: "quantity"
        }
    ]).then(answers=>{
        connection.query("UPDATE products SET stock_quantity = ? + stock_quantity WHERE item_id = ?",[answers.quantity,itemId],(err,results,fields)=>{
            console.log("");
            if(results.changedRows > 0){
                console.log(`Successfully added ${answers.quantity} items to item_id [${itemId}].`);
            }
            else{
                console.log(`Error updating inventory. Please try again.`);                
            }
            console.log("");
            callback();
        });
    });
}

function addNewProduct(connection, callback){
    inquirer.prompt([
        {
            message: "Prouct Name: ",
            type: "input",
            name: "product_name"
        },
        {
            message: "Department: ",
            type: "input",
            name: "product_dept"
        },
        {
            message: "Price per unit: ",
            type: "number",
            name: "product_price"
        },
        {
            message: "Number of units to add to inventory: ",
            type: "number",
            name: "product_quantity"
        }
    ]).then(answers=>{
        const product = { 
            product_name: answers.product_name,
            department_name: answers.product_dept,
            price: answers.product_price,
            stock_quantity: answers.product_quantity
        };

        connection.query("INSERT INTO products SET ?",product,(err,results,fields)=>{
            if(err) throw err;

            console.log("");
            if(results.affectedRows == 1){    
                console.log("New product successfully added to inventory!");
            }
            else{
                console.log("Error adding to inventory.  Please try again.");
            }
            console.log("");
            callback();
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




/*
  Old code, delete before wrapping up

function promptForItem(connection) {
    inquirer.prompt([
        {
            message: "Enter the item_id of what you want to buy (Enter 0 to quit):",
            type: "number",
            name: "item_id_to_buy"
        }
    ]).then(answers => {
        if (answers.item_id_to_buy === 0) {
            endConnection(connection);
        }
        else {
            purchaseItem(connection, answers.item_id_to_buy);
        }
    })
}


function purchaseItem(connection, itemId) {
    inquirer.prompt([
        {
            message: "How many do you want to buy?  (Enter 0 to quit)",
            type: "number",
            name: "purchase_quantity"
        }
    ]).then(answers => {
        if (answers.purchase_quantity === 0) {
            endConnection(connection);
        }
        else {
            //See if there is enough in stock to fulfill the order
            connection.query("Select * from products where item_id = ?", itemId, (err, res) => {
                if (err) throw err;
                if (res.length != 1) throw err;

                //If there isn't enough in stock, don't complete the purchase
                if (res[0].stock_quantity < answers.purchase_quantity) {
                    console.log("");
                    console.log("Sorry there aren't enough in stock to fulfill your order.");
                    start();
                }
                //else complete the purchase and update the inventory level
                else {
                    console.log("");
                    console.log(`Ordering ${answers.purchase_quantity} of the ${res[0].product_name}.  Thank you for your purchase!`);

                    let new_quantity = res[0].stock_quantity - answers.purchase_quantity;
                    connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [new_quantity, itemId],
                        (function (price, quantity) {
                            return function (err, rows, fields) {
                                if (err) throw err;
                                // console.log(`Updating inventory`);
                                if (rows.changedRows != 1) {
                                    console.log(`Sorry there was an issue placing your order.  Please try again.`);
                                }
                                else {
                                    console.log(`Order successful.  Your total is ${(price * quantity).toFixed(2)}`)
                                }
                                start();
                            }
                        })(res[0].price, answers.purchase_quantity)
                    );
                }
            });
        }
    });
};

*/