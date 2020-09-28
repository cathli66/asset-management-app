var request = require('request');
var mysql = require('mysql');
const csv = require('csv-parser');
const fs = require('fs');
const formidable = require('formidable');

var pool  = mysql.createPool(require('./mysqlpool_config.json'));

exports.upload_csv = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        // if the token does not exist, this means that the user has not logged in
        res.redirect("/auth");
    } 
    else {
        var info = {
            isAssetAdmin: req.session.isAssetAdmin,
            isUserAdmin: req.session.isUserAdmin,
            loggedin: req.session.loggedin,
            firstname: req.session.firstname,
            lastname: req.session.lastname
        }
        res.render('upload_form', info);
    }
}

// fs.createReadStream('./static/example.csv')
//     .pipe(csv({separator: '\t'}))
//     .on('data', (row) => {
//         Object.keys(row).forEach(function (key) {
//             if (row[key]) {
//                 pool.query('INSERT INTO asset_list (?) VALUES (?)', [key, row[key]], function (error, results, fields) {
//                     if (error) throw error;
//                 });
//             }
//         })
//     })
//     .on('end', () => {
//         console.log('CSV file successfully processed');
//     });

exports.upload_csv_result = function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = './static/csv/' + files.filetoupload.name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
        });
        fs.createReadStream(newpath)
        .pipe(csv({separator: '\t'}))
        .on('data', (row) => {
            console.log(row);
            var field = [];
            var data = [];
            pool.query('SELECT id FROM asset_type WHERE type_name = ?', row['asset_type'], function(error, results, fields) {
                if (error) throw error
                field.push('type_id');
                data.push(results[0].id);
                Object.keys(row).forEach(function (key) {
                    if (row[key] && key != "asset_type" && key != "asset_id") {
                        field.push(key);
                        var value = row[key];
                        if(!isNaN(row[key])) value = +row[key];
                        data.push(value);
                    }
                });
                var str1 = "?, ".repeat(field.length); 
                var qstring = str1.slice(0, str1.length - 2);
                var fieldstr = field.join(", ");
                var querystr = 'INSERT INTO asset_list ('+fieldstr+') VALUES ('+qstring+')';
                pool.query(querystr, data, function (error, results, fields) {
                    if (error) throw error;
                    // res.redirect('/upload_csv');
                    var info = {
                        isAssetAdmin: req.session.isAssetAdmin,
                        isUserAdmin: req.session.isUserAdmin,
                        loggedin: req.session.loggedin,
                        firstname: req.session.firstname,
                        lastname: req.session.lastname,
                        msg: 'Data from .csv file successfully uploaded.'
                    }
                    res.render('upload_form', info);
                });
            });
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
    });
};