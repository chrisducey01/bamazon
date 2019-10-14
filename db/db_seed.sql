DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    item_id INT NOT NULL auto_increment,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY(item_id)
);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
('Teletubbies','Toys',4.99, 3000),
('Parks and Rec DVD''s','Electronics',79.99, 100)
;
