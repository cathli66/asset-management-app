var request = require('request');
var mysql = require('mysql');

var pool  = mysql.createPool({
    user            : 'root',
    password        : 'Nightstorm66',
    host            : 'localhost',
    port            : 3306,
    database        : 'asset_management'
});

exports.auth_form = function(req, res) {
    res.render("auth_form");
}

exports.auth_result = function(req, res) {
    var usr = req.query.usr;
    var pwd = req.query.pwd
    if (usr && pwd) {
        pool.query('SELECT * FROM users WHERE username = ?', usr, function (error, results, fields) {
            if (error) throw error;
            if (pwd == results[0].pass) {
                var info = {
                    isAdmin: results[0].admin_role,
                    firstname: results[0].firstname,
                    lastname: results[0].lastname
                };
                res.render("form_display", info);    
            }
            else {
                var info = {
                    failmsg : "Invalid login name or password."
                };
                res.render("auth_form", info);
            }
        });
    }
    else {
        var info = {
            failmsg : "Please enter your username and password."
        };
        res.render("auth_form", info);
    }
}