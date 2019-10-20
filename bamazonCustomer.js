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


function start(){
    listAllItems(connection, TABLE_NAME, ITEM_LIST, promptForItem);
}


function listAllItems(connection, tableName, fieldList, callback) {
    console.log(`
#################################################
# List of all items for sale:
#################################################
`);
    connection.query("SELECT ?? FROM ??", [fieldList, tableName], (err, res) => {
        if (err) throw err;
        console.table(res);
        callback(connection);
    })
}


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
                    let purchase_total = (res[0].price * answers.purchase_quantity).toFixed(2);
                    connection.query("UPDATE products SET stock_quantity = ?, product_sales = product_sales + ? WHERE item_id = ?", [new_quantity, purchase_total, itemId],
                        (function (total) {
                            return function (err, rows, fields) {
                                if (err) throw err;
                                // console.log(`Updating inventory`);
                                if (rows.changedRows != 1) {
                                    console.log(`Sorry there was an issue placing your order.  Please try again.`);
                                }
                                else {
                                    console.log(`Order successful.  Your total is ${total}`);
                                }
                                start();
                            }
                        })(purchase_total)
                    );
                }
            });
        }
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

