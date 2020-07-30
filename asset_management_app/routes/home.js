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

exports.main_display = function(req, res){
    pool.query('SELECT * FROM asset_management.asset_list', function (error, results, fields) {
        if (error) throw error;
        var s = [];
        for (i = 0; i < results.length; i++) {
            var type_id = results[i].type_id;
            var asset_type;
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
            s.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: "$"+results[i].purchase_price.toFixed(2)});
        }
        var info = {
            // authenticated: isAuthed,
            asset: s
        };
        res.render("main_display", info);
    });
};

exports.category_search_result = function(req, res){
    type_id = parseInt(req.query.type_id);
    pool.query('SELECT * FROM asset_management.asset_list WHERE type_id = ?', type_id, function (error, results, fields) {
        if (error) throw error;
        var s = [];
        for (i = 0; i < results.length; i++) {
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
            s.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: "$"+results[i].purchase_price.toFixed(2)});
        }
        var info = {
            asset: s
        };
        res.render("search_result", info);
    });
};

function get_id(req, res, next) {
    asset_id = parseInt(req.query.id);
    res.locals.id_array = [];
    if (req.query.id) {
        res.locals.id_array = [parseInt(req.query.id)];
    }
    next();
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
    type_id = parseInt(req.query.type);
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

function get_all_ids(req, res, next) {
    pool.query('SELECT * FROM asset_management.asset_list', function (error, results, fields) {
        res.locals.all_ids = [];
        for (i = 0; i < results.length; i++) {
            res.locals.all_ids.push(results[i].asset_id);
        }
        next();
    });
}

exports.advanced_search_result = [get_id, get_name, get_type, get_all_ids, function(req, res) {
    // console.log(res.locals.id_array.length);
    // console.log(res.locals.name_array.length);
    // console.log(res.locals.type_array.length);
    // console.log("");
    if (res.locals.id_array.length + res.locals.name_array.length + res.locals.type_array.length > 0) {
        if (!res.locals.id_array.length) {
            res.locals.id_array = res.locals.all_ids;
        }
        if (!res.locals.name_array.length) {
            res.locals.name_array = res.locals.all_ids;
        }
        if (!res.locals.type_array.length) {
            res.locals.type_array = res.locals.all_ids;
        }
        var id_list = _.intersection(res.locals.id_array, res.locals.name_array, res.locals.type_array);
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
                    results_list.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: "$"+results[i].purchase_price.toFixed(2)});
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
        pool.query('SELECT * FROM asset_management.asset_list', function (error, results, fields) {
            if (error) throw error;
            var results_list = [];
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
                results_list.push({id: results[i].asset_id, name: results[i].asset_name, type: asset_type, purchase_date: results[i].purchase_date, purchase_price: "$"+results[i].purchase_price.toFixed(2)});
            }
            var info = {
                asset: results_list
            };
            res.render("search_result", info);
        });
    }
}]

exports.edit_form = function(req, res) {
    var id = parseInt(req.query.id);
    pool.query('SELECT * FROM asset_management.asset_list WHERE asset_id = ?', id, function (error, results, fields) {
        if (error) throw error;
        var s = [];
        var type_id = results[0].type_id;
        var asset_type;
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
        s.push({id: results[0].asset_id, name: results[0].asset_name, type: asset_type, purchase_date: results[0].purchase_date, purchase_price: results[0].purchase_price.toFixed(2)});
        var info = {
            // authenticated: isAuthed,
            asset: s
        };
        res.render("edit_display", info);
    });
}

exports.edit_result = function(req, res) {
    var id = parseInt(req.query.id);
    var name = req.query.name;
    var type = parseInt(req.query.type);
    var purchase_date = req.query.purchase_date;
    var purchase_price = parseFloat(req.query.purchase_price);
    pool.query('UPDATE asset_list SET asset_name = ?, type_id = ?, purchase_date = ?, purchase_price = ? WHERE asset_id = ?', [name, type, purchase_date, purchase_price, id], function (error, results, fields) {
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
    res.render("add_new_display", info)
}]

exports.add_new_result = function(req, res) {
    var id = parseInt(req.query.id);
    var name = req.query.name;
    var type = parseInt(req.query.type);
    var purchase_date = req.query.purchase_date;
    var purchase_price = parseFloat(req.query.purchase_price);
    // if a field is not filled out, do something like this:
    // var dep_price = NULL
    // if (req.query.dep_price) {
    //     var dep_price = parseFloat(req.query.dep_price)
    // }
    pool.query('INSERT INTO asset_list VALUES(?, ?, ?, ?, ?)', [id, name, type, purchase_date, purchase_price], function (error, results, fields) {
        if (error) throw error;
        res.redirect('/');
    });
}