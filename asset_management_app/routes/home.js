var request = require('request');
var mysql = require('mysql');
var _ = require('underscore');
const { all, random } = require('underscore');
const { resolveNaptr } = require('dns');
const bcrypt = require('bcryptjs');

var pool  = mysql.createPool(require('./mysqlpool_config.json'));

exports.redir_auth = function(req, res) {
    // bcrypt.hash('Asdf1234', 10, function(err, hash) {
    //     console.log("got here");
    //     if (err) throw err;
    //     pool.query('INSERT INTO users VALUES ("cathli", ?, "Cathryn", "Li", "lifamily4@hotmail.com", true, true);', hash, function (error, results, fields) {
    //         if (error) throw error;
    //         console.log("user created "+results[0]); 
            
    //     });
    // }); 
    res.redirect('/auth');
    
}

// exports.main_display = function(req, res){
//     pool.query('SELECT * FROM asset_management.asset_list', function (error, results, fields) {
//         if (error) throw error;
//         var s = [];
//         for (i = 0; i < results.length; i++) {
//             var type_id = results[i].type_id;
//             var asset_type;
//             if (type_id == 1) {  // better solution is to pool.query and join the asset and type tables using asynchronous functions but not sure how
//                 asset_type = "Computer Server";
//             }
//             else if (type_id == 2) {
//                 asset_type = "Desktop";
//             }
//             else if (type_id == 3) {
//                 asset_type = "Laptop";
//             }
//             else {
//                 asset_type = "Biotech Machine";
//             }
//             s.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: results[i].purchase_price.toFixed(2), 
//                 manu: results[i].manufacturer, s_expire: results[i].support_expiration, annual_s_cost: results[i].annual_support_cost, dep_sched: results[i].depreciation_schedule, 
//                 dep_amount: results[i].depreciated_amount, res_val: results[i].residual_value, firmware_lvl: results[i].firmware_level, os_type: results[i].os_type, os_ver: results[i].os_version,
//                 s_con: results[i].support_contact, dep: results[i].department, sal_name: results[i].salution_name, serial: results[i].serial_number, internal_con: results[i].internal_contact});
//         }
//         var info = {
//             // authenticated: isAuthed,
//             asset: s
//         };
//         res.render("main_display", info);
//     });
// };

// exports.category_search_result = function(req, res){
//     type_id = parseInt(req.query.type_id);
//     pool.query('SELECT * FROM asset_management.asset_list WHERE type_id = ?', type_id, function (error, results, fields) {
//         if (error) throw error;
//         var s = [];
//         for (i = 0; i < results.length; i++) {
//             if (type_id == 1) {  // better solution is to pool.query and join the asset and type tables using asynchronous functions but not sure how
//                 asset_type = "Computer Server";
//             }
//             else if (type_id == 2) {
//                 asset_type = "Desktop";
//             }
//             else if (type_id == 3) {
//                 asset_type = "Laptop";
//             }
//             else {
//                 asset_type = "Biotech Machine";
//             }
//             s.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: "$"+results[i].purchase_price.toFixed(2)});
//         }
//         var info = {
//             asset: s
//         };
//         res.render("search_result", info);
//     });
// };

function get_all_ids(req, res, next) {
    pool.query('SELECT * FROM asset_management.asset_list', function (error, results, fields) {
        res.locals.all_ids = [];
        for (i = 0; i < results.length; i++) {
            res.locals.all_ids.push(results[i].asset_id);
        }
        next();
    });
}

function calcTypes(req, res, next) {
    pool.query('SELECT * FROM asset_type', function (error, results, fields) {
        res.locals.type_arr = [];
        if (error) throw error;
        for (i = 0; i < results.length; i++) {
            res.locals.type_arr.push({value: i+1, name: results[i].type_name});
            if (i == results.length - 1) {
                next();
            }
        }
    });
}

exports.edit_form = [calcTypes, function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        var id = parseInt(req.query.id);
        pool.query('SELECT * FROM asset_list JOIN asset_type ON asset_list.type_id = asset_type.id WHERE asset_id = ?', id, function (error, results, fields) {
            if (error) throw error;
            var s = {id: results[0].asset_id, name: results[0].asset_name, type_id: results[0].type_id, type_name: results[0].type_name, purchase_date: results[0].purchase_date, purchase_price: results[0].purchase_price.toFixed(2), 
            manu: results[0].manufacturer, s_expire: results[0].support_expiration, annual_s_cost: results[0].annual_support_cost, dep_sched: results[0].depreciation_schedule, 
            dep_amount: results[0].depreciated_amount, res_val: results[0].residual_value, firmware_lvl: results[0].firmware_level, os_type: results[0].os_type, os_ver: results[0].os_version,
            s_con: results[0].support_contact, dep: results[0].department, sal_name: results[0].salution_name, serial: results[0].serial_number, internal_con: results[0].internal_contact};
            var info = {
                authorized: req.session.isAssetAdmin,
                asset: s,
                isAssetAdmin: req.session.isAssetAdmin,
                isUserAdmin: req.session.isUserAdmin,
                loggedin: req.session.loggedin,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                type: res.locals.type_arr
            };
            res.render("edit_display", info);
        });
    } 
}];

exports.edit_result = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin && req.session.isAssetAdmin) {
        var data_arr = [];
        Object.keys(req.query).forEach(function (item) {
            if (req.query[item]) {
                data_arr.push(req.query[item]);
            }
            else {
                data_arr.push(null);
            }
        })
        // put first index on the last
        data_arr.push(data_arr.shift());
        var query_str = 'UPDATE asset_list SET asset_name = ?, type_id = ?, purchase_date = ?, purchase_price = ?, manufacturer = ?, support_expiration = ?, annual_support_cost = ?, depreciation_schedule = ?, depreciated_amount = ?, residual_value = ?, firmware_level = ?, os_type = ?, os_version = ?, support_contact = ?, department = ?, salution_name = ?, serial_number = ?, internal_contact = ? WHERE asset_id = ?';
        pool.query(query_str, data_arr, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/');
        });
    }
    else {
        res.redirect('/');
    }
}

exports.new_asset = [get_all_ids, function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        var new_id = Math.floor(Math.random() * 899 + 100);
        while (res.locals.all_ids.includes(new_id)) {
            new_id = Math.floor(Math.random() * 899 + 100);
        }
        var info = {
            authorized: req.session.isAssetAdmin,
            asset : [{id: new_id}], 
            isAssetAdmin: req.session.isAssetAdmin,
            isUserAdmin: req.session.isUserAdmin,
            loggedin: req.session.loggedin,
            firstname: req.session.firstname,
            lastname: req.session.lastname
        };
        res.render("add_new_display", info);    
    }
}]

exports.new_asset_result = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin && req.session.isAssetAdmin) {
        var data_arr = [];
        Object.keys(req.query).forEach(function (item) {
            if (req.query[item]) {
                data_arr.push(req.query[item]);
            }
            else {
                data_arr.push(null);
            }
        });
        pool.query('INSERT INTO asset_list VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', data_arr, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/');
        });
    }
    else {
        res.redirect('/');
    }
}

exports.delete_asset = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin && req.session.isAssetAdmin) {
        var id = req.query.id;
        pool.query('DELETE FROM asset_list WHERE asset_id = ?', id, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/');
        });
    }
    else {
        res.redirect('/');
    }
}

exports.new_user = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        var info = {
            authorized: req.session.isUserAdmin,
            isAssetAdmin: req.session.isAssetAdmin,
            isUserAdmin: req.session.isUserAdmin,
            loggedin: req.session.loggedin,
            firstname: req.session.firstname,
            lastname: req.session.lastname
        }
        res.render("new_user_display", info);    
    }
}

exports.new_user_result = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        if (req.body.password === req.body.confirm) {
            bcrypt.hash(req.body.password, 10, function(err, hash) {
                if (err) throw err;
                var uadmin = 0;
                var aadmin = 0;
                if (req.body.isUserAdmin == 1) {
                    uadmin = 1;
                }
                if (req.body.isAssetAdmin == 1) {
                    aadmin = 1;
                }
                var data_arr = [req.body.username, hash, req.body.first, req.body.last, req.body.email, uadmin, aadmin];
                pool.query('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)', data_arr, function (error, results, fields) {
                    if (error) {
                        var info = {
                            authorized: req.session.isUserAdmin,
                            isAssetAdmin: req.session.isAssetAdmin,
                            isUserAdmin: req.session.isUserAdmin,
                            loggedin: req.session.loggedin,
                            firstname: req.session.firstname,
                            lastname: req.session.lastname,
                            msg : "A user with this username has already been created. Please provide a unique username."
                        }
                        res.render("new_user_display", info);
                    }
                    else {
                        var info = {
                            authorized: req.session.isUserAdmin,
                            isAssetAdmin: req.session.isAssetAdmin,
                            isUserAdmin: req.session.isUserAdmin,
                            loggedin: req.session.loggedin,
                            firstname: req.session.firstname,
                            lastname: req.session.lastname,
                            msg : "User "+req.body.first+" "+req.body.last+" has been successfully added."
                        }
                        res.render('new_user_display', info); 
                    }
                });
            });
        }
        else {
            var info = {
                authorized: req.session.isUserAdmin,
                isAssetAdmin: req.session.isAssetAdmin,
                isUserAdmin: req.session.isUserAdmin,
                loggedin: req.session.loggedin,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                msg : "Passwords do not match."
            }
            res.render("new_user_display", info);
        }
    }
}

exports.display_users = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        results_list = [];
        pool.query('SELECT * FROM users', function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < results.length; i++) {
                results_list.push({username: results[i].username, firstname: results[i].firstname, lastname: results[i].lastname,
                                email: results[i].email, user_admin: results[i].user_admin, asset_admin: results[i].asset_admin});
            }
            var info = {
                users: results_list,
                isAssetAdmin: req.session.isAssetAdmin,
                isUserAdmin: req.session.isUserAdmin,
                loggedin: req.session.loggedin,
                firstname: req.session.firstname,
                lastname: req.session.lastname
            };
            res.render("user_display", info);
        });
    }
}

exports.edit_user = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        var username = req.query.username;
        pool.query('SELECT * FROM users WHERE username = ?', username, function (error, results, fields) {
            if (error) throw error;
            var info = {
                authorized: req.session.isUserAdmin,
                username: results[0].username, 
                firstname: results[0].firstname, 
                lastname: results[0].lastname,
                email: results[0].email, 
                user_admin: results[0].user_admin, 
                asset_admin: results[0].asset_admin
            };
            res.render("edit_user_display", info);
        });
    } 
}

exports.edit_user_result = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin && req.session.isUserAdmin) {
        var uadmin = 0;
        var aadmin = 0;
        if (req.body.isUserAdmin == 1) uadmin = 1;
        if (req.body.isAssetAdmin == 1) aadmin = 1;
        var data_arr = [req.body.first, req.body.last, req.body.email, uadmin, aadmin, req.body.username];
        var query_str = 'UPDATE users SET firstname = ?, lastname = ?, email = ?, user_admin = ?, asset_admin = ? WHERE username = ?';
        pool.query(query_str, data_arr, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/display_users');
        });
    }
    else {
        res.redirect('/auth');
    }
}

exports.delete_user = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin && req.session.isUserAdmin) {
        var username = req.query.username;
        pool.query('DELETE FROM users WHERE username = ?', username, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/display_users');
        });
    }
    else {
        res.redirect('/auth');
    }
}