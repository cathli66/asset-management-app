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
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        // if the token does not exist, this means that the user has not logged in
        req.session.loggedin = false;
        res.render("auth_form");
    } 
    else {
        var info = {
            loggedin: req.session.loggedin
        }
        res.render('form_display', info)
    }
}

exports.auth_result = function(req, res) {
    req.session.usr = req.query.usr;
    req.sessinon.pwd = req.query.pwd;
    if (usr && pwd) {
        pool.query('SELECT * FROM users WHERE username = ?', usr, function (error, results, fields) {
            if (error) throw error;
            if (results && pwd == results[0].pass) {
                req.session.isUserAdmin = results[0].user_admin;
                req.session.isAssetAdmin = results[0].asset_admin;
                req.session.firstname = results[0].firstname;
                req.session.lastname = results[0].lastname;
                var info = {
                    isUserAdmin: req.session.isUserAdmin,
                    isAssetAdmin: req.session.isAssetAdmin,
                    firstname: req.session.firstname,
                    lastname: req.session.lastname
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

exports.logout = function(req, res) {
    req.session = null;                                       // programmatically deletes the cookie
    res.render("auth_form");
};