var search_form = require('./search_form.js');
var home = require('./home.js');
var auth = require('./auth.js');

exports.do_set = function(app) {
    app.get('/', home.redir_auth);
    app.get('/search', search_form.form_display);
    app.get('/advanced_search_result', search_form.advanced_search_result);
    app.get('/page', search_form.page);
    app.get('/edit_form', home.edit_form);
    app.get('/edit_result', home.edit_result);
    app.get('/new_asset', home.new_asset);
    app.get('/new_asset_result', home.new_asset_result);
    app.get('/delete_asset', home.delete_asset);
    app.get('/new_user', home.new_user);
    app.get('/new_user_result', home.new_user_result);
    app.get('/auth', auth.auth_form);
    app.get('/auth_result', auth.auth_result);
    app.get('/logout', auth.logout);
    app.get('/reset_pwd', auth.reset_pwd);
    app.get('/reset_pwd_result', auth.reset_pwd_result);
    app.get('/forgot_pwd', auth.forgot_pwd);
    app.get('/send_email', auth.send_email);
    app.get('/verify', auth.verify_email);
};