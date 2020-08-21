var request = require('request');
var mysql = require('mysql');

var pool  = mysql.createPool({
    user            : 'root',
    password        : 'Nightstorm66',
    host            : 'localhost',
    port            : 3306,
    database        : 'asset_management'
});

exports.display = function(req, res) {
    var info = {
        isAssetAdmin: req.session.isAssetAdmin,
        isUserAdmin: req.session.isUserAdmin,
        loggedin: req.session.loggedin,
        firstname: req.session.firstname,
        lastname: req.session.lastname
    }
    res.render('dash_display', info)
}