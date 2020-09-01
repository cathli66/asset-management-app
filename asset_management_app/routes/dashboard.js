var request = require('request');
var mysql = require('mysql');

var pool  = mysql.createPool(require('./mysqlpool_config.json'));

var overdue = [];
var duesoon = [];

function assetsByType (req, res, next) {
    res.locals.assetsByTypeArr = [['Type', 'Number of Assets']];
    pool.query('SELECT type_name, COUNT(*) AS total FROM asset_list JOIN asset_type ON asset_list.type_id = asset_type.id GROUP BY type_name', function (error, results, fields) {
        if (error) throw error;
        for (i = 0; i < results.length; i++) {
            res.locals.assetsByTypeArr[i+1] = [results[i].type_name, results[i].total];
            if (i == results.length - 1) {
                next();
            }
        }
    });
}

function supportCostByType (req, res, next) {
    res.locals.supportCostByTypeArr = [['Type', 'Total Annual Support Cost']];
    pool.query('SELECT type_name, SUM(annual_support_cost) AS total FROM asset_list JOIN asset_type ON asset_list.type_id = asset_type.id GROUP BY type_name', function (error, results, fields) {
        if (error) throw error;
        for (i = 0; i < results.length; i++) {
            res.locals.supportCostByTypeArr[i+1] = [results[i].type_name, results[i].total];
            if (i == results.length - 1) {
                next();
            }
        }
    });
}

function getData (req, res, next) {
    pool.query('SELECT * FROM asset_list', function (error, results, fields) {
        if (error) throw error;
        var currDate = new Date();
        res.locals.totalcost = 0;
        res.locals.resval = 0;
        res.locals.overdue = [];
        res.locals.duesoon = [];
        for (i = 0; i < results.length; i++) {
            res.locals.totalcost = res.locals.totalcost + results[i].purchase_price;
            res.locals.resval = res.locals.resval + results[i].residual_value;
            var assetDate = new Date(results[i].support_expiration);
            var monthDiff = assetDate.getMonth() - currDate.getMonth() + (12 * (assetDate.getFullYear() - currDate.getFullYear()))
            var fieldsObj = {"id": results[i].asset_id, 
                "name": results[i].asset_name, 
                "type": results[i].type_name, 
                "purchase_date": results[i].purchase_date, 
                "purchase_price": results[i].purchase_price.toFixed(2), 
                "manu": results[i].manufacturer, 
                "s_expire": results[i].support_expiration, 
                "annual_s_cost": results[i].annual_support_cost, 
                "dep_sched": results[i].depreciation_schedule, 
                "dep_amount": results[i].depreciated_amount, 
                "res_val": results[i].residual_value, 
                "firmware_lvl": results[i].firmware_level, 
                "os_type": results[i].os_type, 
                "os_ver": results[i].os_version,
                "s_con": results[i].support_contact, 
                "dep": results[i].department, 
                "sal_name": results[i].salution_name, 
                "serial": results[i].serial_number, 
                "internal_con": results[i].internal_contact }
            if (assetDate <= currDate) {
                res.locals.overdue.push(fieldsObj);
            }
            else if (monthDiff <= 1) {
                res.locals.duesoon.push(fieldsObj);
            }
            if (i == results.length - 1) {
                next();
            }
        }
    });
}

exports.display = [assetsByType, supportCostByType, getData, function(req, res) {
// exports.display = [function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        overdue = res.locals.overdue;
        duesoon = res.locals.duesoon
        var info = {
            isAssetAdmin: req.session.isAssetAdmin,
            isUserAdmin: req.session.isUserAdmin,
            loggedin: req.session.loggedin,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            numOverdue: res.locals.overdue.length,
            numDueSoon: res.locals.duesoon.length,
            assetsByType: res.locals.assetsByTypeArr,
            supportCostByType: res.locals.supportCostByTypeArr,
            assetsOverdue: overdue,
            assetsDueSoon: duesoon,
            totalCost: "$"+res.locals.totalcost.toLocaleString(),
            resVal: "$"+res.locals.resval.toLocaleString()
        }
        res.render('dash_display', info);    
    }
}];

exports.dueSoon_list = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        var info = {
            loggedin: req.session.loggedin,
            isAssetAdmin: req.session.isAssetAdmin,
            isUserAdmin: req.session.isUserAdmin,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            asset: duesoon
        };
        res.render('search_result', info);
    }
}

exports.overdue_list = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        console.log(overdue);
        var info = {
            loggedin: req.session.loggedin,
            isAssetAdmin: req.session.isAssetAdmin,
            isUserAdmin: req.session.isUserAdmin,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            asset: overdue
        };
        res.render('search_result', info);
    }
}

