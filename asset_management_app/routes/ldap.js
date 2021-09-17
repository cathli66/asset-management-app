var request = require('request');
var ldap = require('ldapjs');

var client = ldap.createClient({
    url: 'ldap://192.168.12.201:389'
});

exports.authenticate = function(req, res) {
    var result = '';
    client.bind("XIXITEST\\Administrator", "Test123456789", function (err) {
        if (err) {
            result += "Error in new connetion " + err;
            console.log(result);
            res.render("auth_form", {failmsg : "Invalid login name or password." });
			return;
        } else {
            result += "Reader Bind Success\n";
            var filter = `(uid=${req.body.usr})`; // for ex. (uid=guest1)
		    result += `LDAP filter: ${filter}\n`;
            var suffix = 'cn=Users,dc=XIXITEST,dc=internal';
            client.search(suffix, {filter:filter, scope:"sub"}, function (err, searchRes) {
                if (err) {
                    result += "Error in search " + err;
                    console.log(result);
                    res.render("auth_form", {failmsg : "Invalid login name or password." });
                }
                var searchList = [];
                searchRes.on("searchEntry", (entry) => {
                    // result += "Found entry: " + entry.attributes + "\n";
                    req.session.loggedin = true;
                    req.session.usr = req.body.usr;
                    req.session.isUserAdmin = false;
                    req.session.isAssetAdmin = false;
                    // req.session.firstname = results[0].firstname;
                    // req.session.lastname = results[0].lastname;
                    // req.session.email = results[0].email;
                    entry.attributes.forEach(function(attri){
                        // result += 'Attribute: ' + attri + '\n';
                        if(attri.type === "ou") {
                            var grpname = attri.vals[0];
                            result += "Group of entry: " + grpname + '\n';
                            if(grpname === "FinanceGrp") 
                                req.session.isAssetAdmin = true;
                            if(grpname === "ITopsGrp")
                                req.session.isUserAdmin = true;
                        }
                        else if(attri.type === "givenName") {
                            req.session.firstname = attri.vals[0];
                        }
                        else if(attri.type === 'sn') {
                            req.session.lastname = attri.vals[0]
                        }
                        else if(attri.type === 'email') {
                            req.session.email = attri.vals[0]
                        }
                    });
                    searchList.push(entry);
                });

                searchRes.on("error", (err) => {
                    result += "Search failed with " + err;
                    console.log(result);
                    res.render("auth_form", {failmsg : "Invalid login name or password." });
                });
                
                searchRes.on("end", (retVal) => {
                    result += "Search results length: " + searchList.length + "\n";
                    for(var i=0; i<searchList.length; i++) 
                        result += "DN:" + searchList[i].objectName + "\n";
                    // result += "Search retval:" + retVal + "\n";					
                    
                    if (searchList.length === 1) {					
                        client.bind(searchList[0].objectName, req.body.pwd, function(err) {
                            if (err) 
                                result += "Bind with real credential error: " + err;
                            else
                                result += "Bind with real credential is a success";
                                
                            console.log(result);
                            res.redirect('/search'); 
                        }); // client.bind(searchList ...     
                    } // if (searchList.length === 1)
                    else { 
                        result += "No unique user to bind";
                        console.log(result);
                        res.render("auth_form", {failmsg : "Invalid login name or password." });
                    }
                });   // searchRes.on("end",...)
            });
        }
    });
}

exports.new_user = function(req, res) {
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
        res.render("new_user_display", info);    
    }
}

exports.new_user_result = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        if (req.body.password === req.body.confirm) {
            userDN = 'cn='+req.body.username+',cn=Users,dc=xixitest,dc=internal';

            var entry = {
                sn: [req.body.last],
                givenName: [req.body.first],
                cn: [req.body.first + ' ' + req.body.last], 
                email: [req.body.email],
                objectClass: ["top","person","organizationalPerson","user"]
            };
            client.add(userDN, entry, function (err) { 
                if (err) {
                    var info = {
                        authorized: req.session.isUserAdmin,
                        isAssetAdmin: req.session.isAssetAdmin,
                        isUserAdmin: req.session.isUserAdmin,
                        loggedin: req.session.loggedin,
                        firstname: req.session.firstname,
                        lastname: req.session.lastname,
                        msg : "Error in new user " + err
                    }
                    console.log("err in new user " + err);
                    res.render("new_user_display", info);
                } else {
                    console.log("added user")
                    var grp = [];
                    if (req.body.isUserAdmin == 1) {
                        grp.push('ITopsGrp');
                    }
                    if (req.body.isAssetAdmin == 1) {
                        grp.push('FinanceGrp');
                    }
                    var change = new ldap.Change({
                        operation: 'add',
                        modification: {
                            uniqueMember: userDN
                        }
                    });
                    client.modify(grp, change, function (err) {
                        if (err) {
                            console.log("err in add user in a group " + err);
                        } else {
                            console.log("added user in a group")
                            var info = {
                                authorized: req.session.isUserAdmin,
                                isAssetAdmin: req.session.isAssetAdmin,
                                isUserAdmin: req.session.isUserAdmin,
                                loggedin: req.session.loggedin,
                                firstname: req.session.firstname,
                                lastname: req.session.lastname,
                                msg : "User "+req.body.first+" "+req.body.last+" has been successfully added."
                            }
                            res.render('new_user_display', info); 
                        }
                    });
                }
            });
        }
        else {
            var info = {
                authorized: req.session.isUserAdmin,
                isAssetAdmin: req.session.isAssetAdmin,
                isUserAdmin: req.session.isUserAdmin,
                loggedin: req.session.loggedin,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                msg : "Passwords do not match."
            }
            res.render("new_user_display", info);
        }
    }
}

exports.display_users = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        client.bind("XIXITEST\\Administrator", "Test4321", function (err) {
            if (err) {
                result += "Error in new connetion " + err;
                console.log(result);
                res.render("auth_form", {failmsg : "Invalid login name or password." });
                return;
            } else {
                results_list = [];
                var filter = `(&(objectClass=user)(|(memberOf=CN=FinanceGrp,CN=Users,DC=xixitest,DC=internal)(memberOf=CN=ITopsGrp,CN=Users,DC=xixitest,DC=internal)))`; 
                var suffix = 'cn=Users,dc=XIXITEST,dc=internal';
                client.search(suffix, {filter:filter, scope:"sub"}, function (err, searchRes) {
                    if (err) {
                        console.log("Error in search " + err);
                    }
                    var searchList = [];
                    searchRes.on("searchEntry", (entry) => {
                        // console.log("Found entry: " + entry + "\n");
                        searchList.push(entry);
                    });

                    searchRes.on("error", (err) => {
                        console.log("Search failed with " + err);
                        return result;
                    });
                    
                    searchRes.on("end", (retVal) => {
                        results_list = [];
                        
                        for(var i=0; i<searchList.length; i++) {
                            var aadmin = false;
                            var uadmin = false;
                            var fn, ln, em;
                            searchList[i].attributes.forEach(function(attri){
                                if(attri.type === "ou") {
                                    var grpname = attri.vals[0];
                                    if(grpname === "FinanceGrp") 
                                        aadmin = true;
                                    if(grpname === "ITopsGrp")
                                        uadmin = true;
                                }
                                else if(attri.type === "givenName") {
                                    fn = attri.vals[0];
                                }
                                else if(attri.type === 'sn') {
                                    ln = attri.vals[0];
                                }
                                else if(attri.type === 'email') {
                                    em = attri.vals[0];
                                }
                            });
                            results_list.push({dn: searchList[i].objectName, asset_admin: aadmin, user_admin: uadmin, first: fn, last: ln, email: em});
                        }
                        var info = {
                            users: results_list,
                            isAssetAdmin: req.session.isAssetAdmin,
                            isUserAdmin: req.session.isUserAdmin,
                            loggedin: req.session.loggedin,
                            firstname: req.session.firstname,
                            lastname: req.session.lastname
                        };
                        res.render("ldap_user_display", info);
                    });   // searchRes.on("end",...)
                });
            }
        });
    }
}

exports.edit_user = function(req, res) {
    if (!('loggedin' in req.session) || !req.session.loggedin) {
        res.redirect('/auth');
    }
    else {
        var username = req.query.username;
        pool.query('SELECT * FROM users WHERE username = ?', username, function (error, results, fields) {
            if (error) throw error;
            var info = {
                authorized: req.session.isUserAdmin,
                username: results[0].username, 
                firstname: results[0].firstname, 
                lastname: results[0].lastname,
                email: results[0].email, 
                user_admin: results[0].user_admin, 
                asset_admin: results[0].asset_admin
            };
            res.render("edit_user_display", info);
        });
    } 
}

exports.edit_user_result = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin && req.session.isUserAdmin) {
        var uadmin = 0;
        var aadmin = 0;
        if (req.body.isUserAdmin == 1) uadmin = 1;
        if (req.body.isAssetAdmin == 1) aadmin = 1;
        var data_arr = [req.body.first, req.body.last, req.body.email, uadmin, aadmin, req.body.username];
        var query_str = 'UPDATE users SET firstname = ?, lastname = ?, email = ?, user_admin = ?, asset_admin = ? WHERE username = ?';
        pool.query(query_str, data_arr, function (error, results, fields) {
            if (error) throw error;
            res.redirect('/display_users');
        });
    }
    else {
        res.redirect('/auth');
    }
}

exports.delete_user = function(req, res) {
    if ('loggedin' in req.session && req.session.loggedin && req.session.isUserAdmin) {
        var username = req.query.username;
        client.del('cn='+username+',cn=Users,dc=xixitext,dc=internal', function (err) {
            if (err) {
                console.log("err in delete new user " + err);
            } else {
                console.log("deleted user")
            }
        });
    }
    else {
        res.redirect('/auth');
    }
}


// functions for active directory retreiving and editing

/*use this to search user, add your condition inside filter*/
function searchUser(filter, password) {
    var opts = {
        filter: '(&(l=Seattle)(email=*@foo.com))',
        scope: 'sub',
        attributes: ['dn', 'sn', 'cn']
    };
    
    client.search('o=example', opts, function(err, res) {
        assert.ifError(err);
        
        res.on('searchEntry', function(entry) {
            console.log('entry: ' + JSON.stringify(entry.object));
        });
        res.on('searchReference', function(referral) {
            console.log('referral: ' + referral.uris.join());
        });
        res.on('error', function(err) {
            console.error('error: ' + err.message);
        });
        res.on('end', function(result) {
            console.log('status: ' + result.status);
        });
    });
}

/*use this to add user*/
function addUser() {
    var entry = {
        sn: 'bar',
        email: ['foo@bar.com', 'foo1@bar.com'],
        objectclass: 'inetOrgPerson'
    };
    client.add('cn=foo12,ou=users,ou=system', entry, function (err) {
        if (err) {
            console.log("err in new user " + err);
        } else {
            console.log("added user")
        }
    });
}

/*use this to delete user*/
function deleteUser() {
    client.del('cn=foo1,ou=users,ou=system', function (err) {
        if (err) {
            console.log("err in delete new user " + err);
        } else {
            console.log("deleted user")
        }
    });
}

/*use this to add user to group*/
function addUserToGroup(groupname) {
    var change = new ldap.Change({
        operation: 'add',
        modification: {
            uniqueMember: 'cn=jill,ou=users,ou=system'
        }
    });

    client.modify(groupname, change, function (err) {
        if (err) {
            console.log("err in add user in a group " + err);
        } else {
            console.log("added user in a group")
        }
    });
}

/*use this to delete user from group*/
function deleteUserFromGroup(groupname) {
    var change = new ldap.Change({
        operation: 'delete',
        modification: {
            uniqueMember: 'cn=hiii,ou=users,ou=system'
        }
    });

    client.modify(groupname, change, function (err) {
        if (err) {
            console.log("err in delete  user in a group " + err);
        } else {
            console.log("deleted  user from a group")
        }
    });
}

/*use this to update user attributes*/
function updateUser(dn) {
    var change = new ldap.Change({
        operation: 'add',  //use add to add new attribute
        //operation: 'replace', // use replace to update the existing attribute
        modification: {
            displayName: '657'
        }
    });

    client.modify(dn, change, function (err) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("add update user");
        }
    });
}

/*use this to compare user is already existed or not*/
function compare(dn) {
    client.compare(dn, 'sn', '1263', function (err, matched) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("result :" + matched);
        }
    });
}

/*use this to modify the dn of existing user*/
function modifyDN(dn) {

    client.modifyDN(dn, 'cn=ba4r', function (err) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("result :");
        }
    });
}