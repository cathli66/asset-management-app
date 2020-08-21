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
    res.render('dash_display')
}