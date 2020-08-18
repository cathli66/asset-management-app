DROP DATABASE IF EXISTS asset_management;
CREATE DATABASE asset_management;
USE asset_management;

CREATE TABLE asset_type (
	id INT,
    type_name TEXT,
    type_description TEXT,
    PRIMARY KEY (id)
    );
INSERT INTO asset_type VALUES (1, "Computer Server", "Description for servers go here");
INSERT INTO asset_type VALUES (2, "Desktop", "Description for desktops go here");
INSERT INTO asset_type VALUES (3, "Laptop", "Description for laptops go here");
INSERT INTO asset_type VALUES (4, "Biotech Machine", "Description for Biotech Machines go here");

CREATE TABLE asset_list (
	asset_id INT,
    asset_name TEXT,
	type_id INT,
    purchase_date DATE, -- A date value in CCYY-MM-DD format
    purchase_price FLOAT,
    PRIMARY KEY (asset_id)
    );
INSERT INTO asset_list VALUES (135, "Server-1", 1, 2014-06-02, 250.00);
INSERT INTO asset_list VALUES (365, "Server-2", 1, 2017-12-15, 299.99);
INSERT INTO asset_list VALUES (145, "2016 Linux Desktop", 2, 2017-01-16, 700.00);
INSERT INTO asset_list VALUES (987, "2003 Windows Desktop", 2, 2003-11-08, 450.00);
INSERT INTO asset_list VALUES (246, "2019 MacBook Pro 13-inch", 3, 2019-12-25, 1099.99);
INSERT INTO asset_list VALUES (864, "2013 MacBook Air 11-inch", 3, 2014-09-20, 699.99);
INSERT INTO asset_list VALUES (152, "Pilot High Pressure Homogenizer", 4, 2018-03-03, 3999.99);
INSERT INTO asset_list VALUES (136, "Bioreactor System", 4, 2007-04-18, 750.25);
INSERT INTO asset_list VALUES (863, "Compact H2O2 Disinfection System", 4, 2017-02-21, 2099.99);


-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'asdf123';
-- flush privileges;
