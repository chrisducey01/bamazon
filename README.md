# Bamazon

Bamazon is a CLI application that simulates an e-commerce site.  There are multiple interfaces based on role (customer, supervisor, manager).   

# Getting Started

## Prerequisites

1.  MySQL instance installed on your local machine (used to track inventory and sales)
2.  Node and NPM installed on your local machine

## Installing

Follow the instructions in this section to get the app setup to run on your machine.

1.  Clone the git project to your machine (example below is using ssh)
    ``` bash
    git clone git@github.com:chrisducey01/bamazon.git
    ```

2.  Install the node module dependencies from the package.json file
    ``` bash
    npm install
    ```

3.  Create a .env file in the top level directory.  This will contain the variables to connect to your local MySQL database.
* The contents of the .env file should look similar to below.  You will need to update, at minimum the DB_USER and DB_PASSWORD values to the db account you have setup in MySQL (replace everything to the right of the equals sign, including the carats <>):
    ```
    # MySQL DB Variables
    DB_USER=<user id>
    DB_PASSWORD=<password>
    DB_DATABASE=bamazon
    DB_HOST=localhost
    DB_PORT=3306
    ```

4.  Locate the db_schema.sql file in the db folder of the bamazon project.  Execute the sql commands in your local MySQL instance to create the database and table definitions.

5.  Locate the db_seed.sql file in the db folder of the bamazon project.  Execute the sql commands to populate the tables created in step 4 with sample data.

# Running the app

There are 3 JavaScript files represent different user types that would interact with the online store.  All 3 implement the Inquirer node package to prompt the user from the command line.  The syntax to run each of these apps assumes that you are already within the top-level project folder.

## Bamazon Customer
The `bamazonCustomer.js` file should be executed for a customer wanting to buy something in the store.  The syntax for starting this app is:
``` bash
node bamazonCustomer.js
```

## Bamazon Manager
The `bamazonManager.js` file should be executed for the online store manager to interact with the products for sale and to add inventory.  The syntax for starting this app is:
``` bash
node bamazonManager.js
```

## Bamazon Supervisor
The `bamazonSupervisor.js` file should be executed for the online store supervisor to see sales reports and add new sales departments.  The syntax for starting this app is:
``` bash
node bamazonSupervisor.js
```

## Authors

* **Christopher Ducey** - *Initial work* - [chrisducey01](https://github.com/chrisducey01)
