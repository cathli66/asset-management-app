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

exports.form_display = function(req, res) {
    res.render("form_display")
}

function get_name(req, res, next) {
    asset_name = req.query.name;
    res.locals.name_array = [];
    if (asset_name) {
        pool.query('SELECT * FROM asset_management.asset_list WHERE asset_name = ?', asset_name, function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < results.length; i++) {
                res.locals.name_array.push(results[i].asset_id);
            }
            next();
        });
    }
    else {
        next();
    }
}

function get_type(req, res, next) {
    type_id = parseInt(req.query.asset_type);
    res.locals.type_array = [];
    if (type_id) {
        pool.query('SELECT * FROM asset_management.asset_list WHERE type_id = ?', type_id, function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < results.length; i++) {
                res.locals.type_array.push(results[i].asset_id);
            }
            next();
        });
    }
    else {
        next();
    }
}

function get_manu(req, res, next) {
    manu = req.query.manu;
    res.locals.manu_array = [];
    if (manu) {
        pool.query('SELECT * FROM asset_management.asset_list WHERE manufacturer = ?', manu, function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < results.length; i++) {
                res.locals.manu_array.push(results[i].asset_id);
            }
            next();
        });
    }
    else {
        next();
    }
}

function get_price(req, res, next) {
    var r1_start = 0;
    var r2_start = 500;
    var r3_start = 1000;
    price_range = parseInt(req.query.price_range);
    res.locals.price_array = [];
    if (price_range) {
        query_str = 'SELECT * FROM asset_management.asset_list WHERE purchase_price BETWEEN ? and ?';
        if (price_range == 1) {
            pool.query(query_str, [r1_start, r2_start], function (error, results, fields) {
                if (error) throw error;
                for (i = 0; i < results.length; i++) {
                    res.locals.price_array.push(results[i].asset_id);
                }
                next();
            });
        }
        else if (price_range == 2) {
            pool.query(query_str, [r2_start, r3_start], function (error, results, fields) {
                if (error) throw error;
                for (i = 0; i < results.length; i++) {
                    res.locals.price_array.push(results[i].asset_id);
                }
                next();
            });  
        }
        else if (price_range == 3) {
            pool.query('SELECT * FROM asset_management.asset_list WHERE purchase_price >= ?', r3_start, function (error, results, fields) {
                if (error) throw error;
                for (i = 0; i < results.length; i++) {
                    res.locals.price_array.push(results[i].asset_id);
                }
                next();
            });
        }
    }
    else {
        next();
    }
}

function get_all_ids(req, res, next) {
    pool.query('SELECT * FROM asset_management.asset_list', function (error, results, fields) {
        res.locals.all_ids = [];
        for (i = 0; i < results.length; i++) {
            res.locals.all_ids.push(results[i].asset_id);
        }
        next();
    });
}

function get_dep(req, res, next) {
    dep = req.query.dep;
    res.locals.dep_array = [];
    if (dep) {
        pool.query('SELECT * FROM asset_management.asset_list WHERE department = ?', dep, function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < results.length; i++) {
                res.locals.dep_array.push(results[i].asset_id);
            }
            next();
        });
    }
    else {
        next();
    }
}

exports.advanced_search_result = [get_name, get_type, get_manu, get_price, get_dep, get_all_ids, function(req, res) {
    // console.log(res.locals.name_array.length);
    // console.log(res.locals.type_array.length);
    // console.log("");
    if (res.locals.name_array.length + res.locals.type_array.length + res.locals.manu_array.length + res.locals.price_array.length + res.locals.dep_array.length > 0) {
        if (!res.locals.name_array.length) {
            res.locals.name_array = res.locals.all_ids;
        }
        if (!res.locals.type_array.length) {
            res.locals.type_array = res.locals.all_ids;
        }
        if (!res.locals.manu_array.length) {
            res.locals.manu_array = res.locals.all_ids;
        }
        if (!res.locals.price_array.length) {
            res.locals.price_array = res.locals.all_ids;
        }
        if (!res.locals.dep_array.length) {
            res.locals.dep_array = res.locals.all_ids;
        }
        var id_list = _.intersection(res.locals.name_array, res.locals.type_array, res.locals.manu_array, res.locals.price_array, res.locals.dep_array);
        if (!id_list.length) {
            res.render("search_fail_msg");
        }
        var results_list = [];
        for (n = 0; n < id_list.length; n++) {
            id = id_list[n]
            pool.query('SELECT * FROM asset_management.asset_list WHERE asset_id = ?', id, function (error, results, fields) {
                if (error) throw error;
                for (i = 0; i < results.length; i++) {
                    var type_id = results[i].type_id;
                    if (type_id == 1) {  // better solution is to pool.query and join the asset and type tables using asynchronous functions but not sure how
                        asset_type = "Computer Server";
                    }
                    else if (type_id == 2) {
                        asset_type = "Desktop";
                    }
                    else if (type_id == 3) {
                        asset_type = "Laptop";
                    }
                    else {
                        asset_type = "Biotech Machine";
                    }
                    results_list.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: results[i].purchase_price.toFixed(2), 
                        manu: results[i].manufacturer, s_expire: results[i].support_expiration, annual_s_cost: results[i].annual_support_cost, dep_sched: results[i].depreciation_schedule, 
                        dep_amount: results[i].depreciated_amount, res_val: results[i].residual_value, firmware_lvl: results[i].firmware_level, os_type: results[i].os_type, os_ver: results[i].os_version,
                        s_con: results[i].support_contact, dep: results[i].department, sal_name: results[i].salution_name, serial: results[i].serial_number, internal_con: results[i].internal_contact});
                }
                if (results_list.length == id_list.length) {
                    var info = {
                        asset: results_list
                    };
                    res.render("search_result", info);
                }
            });
        }
    }
    else {
        var results_list = [];
        pool.query('SELECT * FROM asset_management.asset_list', function (error, results, fields) {
            if (error) throw error;
            for (i = 0; i < results.length; i++) {
                var type_id = results[i].type_id;
                if (type_id == 1) {  // better solution is to pool.query and join the asset and type tables using asynchronous functions but not sure how
                    asset_type = "Computer Server";
                }
                else if (type_id == 2) {
                    asset_type = "Desktop";
                }
                else if (type_id == 3) {
                    asset_type = "Laptop";
                }
                else {
                    asset_type = "Biotech Machine";
                }
                results_list.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: results[i].purchase_price.toFixed(2), 
                    manu: results[i].manufacturer, s_expire: results[i].support_expiration, annual_s_cost: results[i].annual_support_cost, dep_sched: results[i].depreciation_schedule, 
                    dep_amount: results[i].depreciated_amount, res_val: results[i].residual_value, firmware_lvl: results[i].firmware_level, os_type: results[i].os_type, os_ver: results[i].os_version,
                    s_con: results[i].support_contact, dep: results[i].department, sal_name: results[i].salution_name, serial: results[i].serial_number, internal_con: results[i].internal_contact});
            }
            var info = {
                asset: results_list
            };
            res.render("search_result", info);
        });
    }
}]
