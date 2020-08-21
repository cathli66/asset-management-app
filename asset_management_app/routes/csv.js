var request = require('request');
var mysql = require('mysql');
const csv = require('csv-parser');
const fs = require('fs');
const formidable = require('formidable');

var pool  = mysql.createPool({
    user            : 'root',
    password        : 'Nightstorm66',
    host            : 'localhost',
    port            : 3306,
    database        : 'asset_management'
});

exports.upload_csv = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        // if the token does not exist, this means that the user has not logged in
        res.render("auth_form");
    } 
    else {
        res.render('upload_form', {isAssetAdmin: req.session.isAssetAdmin});
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
            res.render('upload_form', {msg: "File uploaded and moved!"});
        });
        fs.createReadStream(newpath)
        .pipe(csv({separator: '\t'}))
        .on('data', (row) => {
            console.log(row);
            var fields = [];
            var data = [];
            Object.keys(row).forEach(function (key) {
                if (row[key]) {
                    fields.push(key);
                    data.push(row[key]);
                }
            });
            var data_arr = fields.concat(data);
            var str1 = "?, ".repeat(fields.length); 
            var qstring = str1.slice(0, str1.length - 2)
            pool.query('INSERT INTO asset_list ('+qstring+') VALUES ('+qstring+')', data_arr, function (error, results, fields) {
                if (error) throw error;
                res.redirect('/upload_csv');
            });
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
    });
};