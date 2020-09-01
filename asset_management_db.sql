DROP DATABASE IF EXISTS asset_management;
CREATE DATABASE asset_management;
USE asset_management;


CREATE TABLE users (
	username VARCHAR(50),
    pass TEXT,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(50),
    user_admin BOOLEAN,
    asset_admin BOOLEAN,
    PRIMARY KEY (username)
	);

CREATE TABLE asset_type (
	id INT AUTO_INCREMENT,
    type_name VARCHAR(50),
    type_description TEXT,
    PRIMARY KEY (id)
    );
INSERT INTO asset_type VALUES (1, "Server", "Description for servers go here");
INSERT INTO asset_type VALUES (2, "Desktop", "Description for desktops go here");
INSERT INTO asset_type VALUES (3, "Laptop", "Description for laptops go here");
INSERT INTO asset_type VALUES (4, "Biotech Machine", "Description for biotech machines go here");
INSERT INTO asset_type VALUES (5, "Software", "Description for software go here");
INSERT INTO asset_type VALUES (6, "Firewall", "Description for firewalls go here");

CREATE TABLE asset_list (
	asset_id INT NOT NULL AUTO_INCREMENT,
    asset_name VARCHAR(50) NOT NULL,
	type_id INT NOT NULL,
    purchase_date VARCHAR(10) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    manufacturer VARCHAR(50),
    support_expiration VARCHAR(10),
    annual_support_cost DECIMAL(10,2),
    depreciation_schedule VARCHAR(50),
    depreciated_amount DECIMAL(10,2),
    residual_value DECIMAL(10,2),
    firmware_level VARCHAR(50),
    os_type VARCHAR(50),
    os_version VARCHAR(50),
    support_contact VARCHAR(50),
    department VARCHAR(50),
    salution_name VARCHAR(50),
    serial_number VARCHAR(50),
    internal_contact VARCHAR(50),
    PRIMARY KEY (asset_id)
    );
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (135, "Server-1", 1, "2006-06-02", 250.00, "2010-06-02", 20.99);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (365, "Server-2", 1, "2017-12-15", 299.99, "2020-12-15", 200);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (145, "2016 Linux Desktop", 2, "2017-01-16", 700.00, "2019-01-16", 499.99);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (987, "2003 Windows Desktop", 2, "2003-11-08", 450.00, "2013-11-08", 30.25);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (246, "2019 MacBook Pro 13-inch", 3, "2019-12-25", 1099.99, "2022-12-15", 500.50);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (864, "2013 MacBook Air 11-inch", 3, "2014-09-20", 699.99);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (152, "Pilot High Pressure Homogenizer", 4, "2018-03-03", 3999.99, "2020-03-03", 59.99);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (136, "Bioreactor System", 4, "2007-04-18", 750.25);
INSERT INTO asset_list(asset_id, asset_name, type_id, purchase_date, purchase_price, support_expiration, annual_support_cost) VALUES (863, "Compact H2O2 Disinfection System", 4, "2017-02-21", 2099.99, "2020-02-21", 500);


ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Nightstorm66';
flush privileges;
