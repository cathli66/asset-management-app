var search_form = require('./search_form.js');
var home = require('./home.js');

exports.do_set = function(app) {
    app.get('/', home.redir_search);
    app.get('/search', search_form.form_display);
    // app.get('/category_search_result', home.category_search_result);
    app.get('/advanced_search_result', search_form.advanced_search_result);
    app.get('/edit_form', home.edit_form);
    app.get('/edit_result', home.edit_result);
    app.get('/add_new', home.add_new);
    app.get('/add_new_result', home.add_new_result);
};