var request = require('request');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');

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
    if (req.query.usr && req.query.pwd) {
        pool.query('SELECT * FROM users WHERE username = ?', req.query.usr, function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            if(results.length > 0) {
                bcrypt.compare(req.query.pwd, results[0].pass, function(err, res) {
                    if(res) {
                        req.session.loggedin = true;
                        req.session.usr = req.query.usr;
                        req.session.hashedpwd = results[0].pass;
                        console.log("hashed password: "+req.session.hashedpwd);
                        req.session.isUserAdmin = results[0].user_admin;
                        req.session.isAssetAdmin = results[0].asset_admin;
                        req.session.firstname = results[0].firstname;
                        req.session.lastname = results[0].lastname;
                        req.session.email = results[0].email;
                        var info = {
                            loggedin: req.session.loggedin,
                            isUserAdmin: req.session.isUserAdmin,
                            isAssetAdmin: req.session.isAssetAdmin,
                            firstname: req.session.firstname,
                            lastname: req.session.lastname
                        };
                    res.redirect('/search'); 
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
    req.session.destroy(err => {
        if(err) {
            res.redirect('/')
        }
        res.clearCookie('sid');
        res.redirect('/auth')
    })
};

exports.forgot_pwd = function(req, res) {
    res.render("username_form");
}

exports.reset_pwd = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin) {
        var info = {
            loggedin: req.session.loggedin,
            firstname: req.session.firstname,
            lastname: req.session.lastname
        };
        res.render("reset_pwd_form", info);
    }
    else {
        pool.query('SELECT * FROM users WHERE username = ?', req.query.usr, function (error, results, fields) {
            if (error) throw error;
            if(results) {
                req.session.loggedin = false;
                req.session.usr = req.query.usr;
                req.session.firstname = results[0].firstname;
                req.session.lastname = results[0].lastname;
                req.session.email = results[0].email;
                var email = results[0].email;
                var e = email.substr(0, 1) + '*****' + email.substr(email.indexOf("@")-2);
                var info = {
                    loggedin: false,
                    verified: false,
                    hidden_email: e
                };
                res.render("reset_pwd_form", info);    
            }
            else {
                res.render('username_form', {failmsg: 'Username not valid.'})
            }
        });
    }
};

exports.reset_pwd_result = function(req, res) {
    if(!req.session.verified && req.session.loggedin) {
        bcrypt.compare(req.query.curr, req.session.hashedpwd, function(err, res) {
            if(!res) {
                var info = {
                    loggedin: req.session.loggedin,
                    firstname: req.session.firstname,
                    lastname: req.session.lastname,
                    failmsg : "Invalid current password."
                }
                res.render("reset_pwd_form", info);
            } 
          });
    }
    if (req.query.new === req.query.confirm) {
        bcrypt.hash(req.query.new, 10, function(err, hash) {
            if (err) throw err;
            pool.query('UPDATE users SET pass = ? WHERE username = ?', [hash, req.session.usr], function (error, results, fields) {
                if (error) throw error;
                req.session.hashedpwd = hash;
                res.redirect('/search'); 
            });
        });
    }
    else {
        var info = {
            loggedin: req.session.loggedin,
            verified: req.session.verified,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            failmsg : "Passwords do not match."
        }
        res.render("reset_pwd_form", info);
    }
}

var rand, host, link;
exports.send_email = function(req, res) {
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;

    const output = `
    <h2>Email Verification</h2>
    <p>Hello ${req.session.firstname} ${req.session.lastname},</p>
    <p>Please click this link to verify your account and reset your password.</p>
    <a href=`+link+`>Click here to verify</a><br>
    <p>If this wasn't you, ignore this message</p>
    `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Hotmail",
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'lifamily4@hotmail.com', // generated ethereal user
            pass: 'Nightstorm606', // generated ethereal password
        },
    });

    // research how to put configuration in separate config file that main code can read
    
    var email = req.session.email;
    var e = email.substr(0, 1) + '*****' + email.substr(email.indexOf("@")-2);
    console.log("email: "+req.session.email);
    console.log("hidden email: "+e);        

    transporter.verify(function(error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
        }
    });

    let mailOptions = {
        from: '"SalubrisBio Asset Management" <lifamily4@hotmail.com>', // sender address
        to: req.session.email, // list of receivers
        subject: "Reset Password Email Verification", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));    
        
        var info = {
            loggedin: req.session.loggedin,
            verified: false,
            hidden_email: e,
            successmsg: 'Email succesfully sent. Please check your inbox for the verification link.'
        }
        res.render("reset_pwd_form", info);
    });
}

exports.verify_email = function(req, res) {
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email");
        req.session.verified = true;
        if(req.query.id==rand) {
            console.log("email is verified");
            var info = {
                email: req.session.email,
                loggedin: false,
                verified: req.session.verified
            }
            res.render("reset_pwd_form", info);
        }
        else {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    }
    else {
        res.end("<h1>Request is from unknown source.</h1>");
    }
}
