var request = require('request');
var mysql = require('mysql');

var pool  = mysql.createPool(require('./mysqlpool_config.json'));

exports.display = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        var info = {
            isAssetAdmin: req.session.isAssetAdmin,
            isUserAdmin: req.session.isUserAdmin,
            loggedin: req.session.loggedin,
            firstname: req.session.firstname,
            lastname: req.session.lastname
        }
        res.render('dash_display', info)    
    }
}