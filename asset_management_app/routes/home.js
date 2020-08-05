var request = require('request');
var mysql = require('mysql');
var _ = require('underscore');
const { all, random } = require('underscore');
const { resolveNaptr } = require('dns');

var pool  = mysql.createPool({
    user            : 'root',
    password        : 'Nightstorm66',
    host            : 'localhost',
    port            : 3306,
    database        : 'asset_management'
});

exports.redir_search = function(req, res) {
    res.redirect('/search')
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

exports.edit_form = function(req, res) {
    var id = parseInt(req.query.id);
    pool.query('SELECT * FROM asset_management.asset_list WHERE asset_id = ?', id, function (error, results, fields) {
        if (error) throw error;
        var s = [];
        s.push({id: results[0].asset_id, name: results[0].asset_name, type: results[0].type_id, purchase_date: results[0].purchase_date, purchase_price: results[0].purchase_price.toFixed(2), 
        manu: results[0].manufacturer, s_expire: results[0].support_expiration, annual_s_cost: results[0].annual_support_cost, dep_sched: results[0].depreciation_schedule, 
        dep_amount: results[0].depreciated_amount, res_val: results[0].residual_value, firmware_lvl: results[0].firmware_level, os_type: results[0].os_type, os_ver: results[0].os_version,
        s_con: results[0].support_contact, dep: results[0].department, sal_name: results[0].salution_name, serial: results[0].serial_number, internal_con: results[0].internal_contact});
        var info = {
            // authenticated: isAuthed,
            asset: s
        };
        res.render("edit_display", info);
    });
}

exports.edit_result = function(req, res) {
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

exports.add_new = [get_all_ids, function(req, res) {
    var new_id = Math.floor(Math.random() * 899 + 100);
    while (res.locals.all_ids.includes(new_id)) {
        new_id = Math.floor(Math.random() * 899 + 100);
    }
    var info = {
        asset : [{id: new_id}]
    };
    res.render("add_new_display", info);
}]

exports.add_new_result = function(req, res) {
    var data_arr = [];
    Object.keys(req.query).forEach(function (item) {
        if (req.query[item]) {
            data_arr.push(req.query[item]);
        }
        else {
            data_arr.push(null);
        }
    })
    pool.query('INSERT INTO asset_list VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', data_arr, function (error, results, fields) {
        if (error) throw error;
        res.redirect('/');
    });
}