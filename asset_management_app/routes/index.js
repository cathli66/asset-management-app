var search_form = require('./search_form.js'); // search assets and display results
var home = require('./home.js'); // edit/add asset and user tables
var auth = require('./auth.js'); // login, logout, reset pwd, email verification
var csv = require('./csv.js'); // upload/download asset data from/as csv file
var dash = require('./dashboard.js') // summarize/report totals, displays info in dashboard
var ldap = require('./ldap.js')

exports.do_set = function(app) {
    app.get('/', home.redir_auth);

    // asset search
    app.get('/search', search_form.form_display);
    app.get('/advanced_search_result', search_form.advanced_search_result);
    app.get('/page', search_form.page);

    // modifying asset MySql database
    app.get('/edit_form', home.edit_form);
    app.get('/edit_result', home.edit_result);
    app.get('/new_asset', home.new_asset);
    app.get('/new_asset_result', home.new_asset_result);
    app.get('/delete_asset', home.delete_asset);
    
    // authentication method
    app.get('/auth', auth.auth_form); 
    // app.post('/auth_result', auth.auth_result);
    app.post('/auth_result', ldap.authenticate)
    app.get('/logout', auth.logout);
    app.get('/reset_pwd', auth.reset_pwd);
    app.get('/reset_pwd_result', auth.reset_pwd_result);
    app.get('/forgot_pwd', auth.forgot_pwd);
    app.get('/send_email', auth.send_email);
    app.get('/verify', auth.verify_email);

    // upload through .csv file
    app.get('/upload_csv', csv.upload_csv);
    app.post('/upload_csv_result', csv.upload_csv_result);

    // modifying users through MySql
    // app.get('/new_user', home.new_user);
    // app.post('/new_user_result', home.new_user_result);
    // app.get('/display_users', home.display_users);
    // app.get('/edit_user_form', home.edit_user);
    // app.post('/edit_user_result', home.edit_user_result);
    // app.get('/delete_user', home.delete_user);
    app.get('/account_info', auth.account_info);
    app.post('/edit_account_result', auth.edit_account_result);

    // modifying users through LDAP
    app.get('/new_user', ldap.new_user);
    app.post('/new_user_result', ldap.new_user_result);
    app.get('/display_users', ldap.display_users);
    app.get('/edit_user_form', ldap.edit_user);
    app.post('/edit_user_result', ldap.edit_user_result);
    app.get('/delete_user', ldap.delete_user);

    // dashboard
    app.get('/dash', dash.display);
    app.get('/dueSoon_list', dash.dueSoon_list);
    app.get('/overdue_list', dash.overdue_list);
};