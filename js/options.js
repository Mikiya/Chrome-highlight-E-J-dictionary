/*
 * Highlight E-J dictionary
 *
 * Copyright (C) 2010    Mikiya Okuno
 *
 * This program is free software: you can redistribute it and/or modify
 * i t under the terms of the GNU General Public License as published by *
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.    If not, see <http://www.gnu.org/licenses/>.
 */

$(function() {
    var debug = false;
    /*
     * Load localized messages
     */
    load_i18n_messages();

    /*
     * Status bar functions
     */
    var statusbar_timer = null;
    $('#statusbar').hide();

    function show_info_low(id, msg) {
        $('#' + id + ' div').attr('class', 'ui-state-highlight ui-corner-all');
        $('#' + id + ' #statusicon').attr('class', 'ui-icon ui-icon-info');
        show_msg(id, 'INFO', msg);
    }

    function show_info(msg) {
        show_info_low('statusbar', msg);
    }

    function show_error_low(id, msg) {
        $('#' + id +' div').attr('class', 'ui-state-error ui-corner-all');
        $('#' + id + ' #statusicon').attr('class', 'ui-icon ui-icon-alert');
        show_msg(id, 'ERROR', msg);
    }

    function show_error(msg) {
        show_error_low('statusbar', msg);
    }

    function show_msg(id, title, msg) {
        title = title.length > 0 ? title + ':' : '';
        msg = chrome.i18n.getMessage(msg);
        $('#' + id + ' #message_title').text(title);
        $('#' + id + ' span#message').text(msg);

        clearTimeout(statusbar_timer);
        $('#' + id).hide();

        $('#' + id).show('drop', {}, 600, function() {});
        statusbar_timer = setTimeout(function() {
            $( '#' + id ).hide('drop', {direction: 'right'}, 600, function() {});
        }, 4000 );
    }

    function show_engine_dialog_info(msg) {
        show_info_low('engine_dialog_statusbar', msg);
    }

    function show_engine_dialog_error(msg) {
        show_error_low('engine_dialog_statusbar', msg);
    }

    /*
     * Default setting.
     */
    var _default_settings = {};
    function default_settings() {
        return $.extend(true, {}, _default_settings);
    }

    chrome.extension.sendRequest({action: 'getDefaultOptions'}, function(json) {
        if(json)
            _default_settings = JSON.parse(json);
        console.log(json);
        set_options(localStorage['options']);
    });

    /*
     * Buttons!
     */
    $('#menubar #about').click(function(e) {
        $('#copyright').dialog('open');
    });

    $('#menubar #discard').click(function(e) {
        set_options(localStorage['options']);
        clear_engine_dialog();
        clear_error_messages(option_validators);
        show_info('info_discarded');
    });

    $('#menubar #default').click(function(e) {
        set_options(JSON.stringify(default_settings()));
        clear_engine_dialog();
        clear_error_messages(option_validators);
        show_info('info_loaded_defaults');
    });

    $('#menubar #close').click(function(e) {
        window.close();

    });

    $('button#add_new_engine').click(function(e) {
        clear_engine_dialog();
        is_engine_updating = false;
        $('#new_engine_form').dialog('open');
        $('#engine_dialog_statusbar').hide();
    });

    function set_modkey_button_status(enabling_method) {
        if (enabling_method != 'select_then_key') {
            $('#enabling_method fieldset input').attr('disabled', 'disabled');
            $('#enabling_method fieldset').css({display: 'none'});
        } else {
            $('#enabling_method fieldset input').removeAttr('disabled');
            $('#enabling_method fieldset').css({display: 'block'});
        }
    }

    $('#enabling_method [name=popup_enable_method]').click(function(e) {
//        set_modkey_button_status(e.target.value);
    });

    $('#menubar #save').click(function(e) {
        if(!validate_options(option_validators)) {
            show_error('error_invalid_val');
        } else {
            localStorage['options'] = JSON.stringify(get_options());
            chrome.extension.sendRequest({action: 'updateContextMenu'});
            show_info('info_settings_saved');
        }
    });

    function get_options() {
        return {
            enabling_method: {
                method: $('#enabling_method input[name=popup_enable_method]:checked').val(),
                modkey: $('#enabling_method input[name=popup_enable_modifier_key]:checked').val()
            },
            enabled_builtin_engines: {
                iknow: $('#enabled_builtin_engines input[name=iknow]:checked').length == 1,
                eow: $('#enabled_builtin_engines input[name=eow]:checked').length == 1,
                wikipedia_en: $('#enabled_builtin_engines input[name=wikipedia_en]:checked').length == 1,
                google_translate: $('#enabled_builtin_engines input[name=google_translate]:checked').length == 1
            },
            appearance: {
                max_width: $('#appearance #max_width').val(),
                opacity: $('#appearance #opacity').val(),
                background: {
                    gradiation_top: $('#appearance #background #gradiation_top').val(),
                    gradiation_bottom: $('#appearance #background #gradiation_bottom').val()
                },
                fade: {
                    duration: $('#appearance #fade #duration').val(),
                    delay: $('#appearance #fade #delay').val(),
                    distance: $('#appearance #fade #distance').val()
                },
                button_text_color: $('#appearance #button #button_text_color').val(),
                button_text_hcolor: $('#appearance #button #button_text_hcolor').val()
            },
            engines: sort_search_engines()
        };
    }

    function set_options(json) {
        var o = default_settings();
        if (json)
            $.extend(true, o, JSON.parse(json));

        $('#enabling_method input[name=popup_enable_method][value=' + o.enabling_method.method + ']').attr('checked', 'checked');
        $('#enabling_method input[name=popup_enable_modifier_key][value=' + o.enabling_method.modkey + ']').attr('checked', 'checked');
        //set_modkey_button_status(o.enabling_method.method);

        $('#enabled_builtin_engines input[name=iknow]').attr('checked', o.enabled_builtin_engines.iknow);
        $('#enabled_builtin_engines input[name=eow]').attr('checked', o.enabled_builtin_engines.eow);
        $('#enabled_builtin_engines input[name=wikipedia_en]').attr('checked', o.enabled_builtin_engines.wikipedia_en);
        $('#enabled_builtin_engines input[name=google_translate]').attr('checked', o.enabled_builtin_engines.google_translate);

        $('#appearance #max_width').val(o.appearance.max_width);
        $('#appearance #opacity').val(o.appearance.opacity);
        $('#appearance #background #gradiation_top').val(o.appearance.background.gradiation_top);
        $('#appearance #background #gradiation_bottom').val(o.appearance.background.gradiation_bottom);
        $('#appearance #fade #duration').val(o.appearance.fade.duration);
        $('#appearance #fade #delay').val(o.appearance.fade.delay);
        $('#appearance #fade #distance').val(o.appearance.fade.distance);
        $('#appearance #button #button_text_color').val(o.appearance.button_text_color);
        $('#appearance #button #button_text_hcolor').val(o.appearance.button_text_hcolor);

        clear_engines();
        if (!o.engines) {
            for (var i = 0; i < builtin_engines.length; i++) {
                if (is_engine_enabled(builtin_engines[i].name)) {
                    add_builtin_engine(builtin_engines[i].name);
                }
            }
        } else {
            for (var i = 0; i < o.engines.length; i++) {
                add_new_engine(o.engines[i]);
            }
        }
    }

    function sort_search_engines() {
        var order = $('#custom_engines_list').sortable('toArray');
        var sorted_engines = [];

        for (var i = 0; i < order.length; i++) {
            order[i] = order[i].replace('custom_engine_item_', '');
            var engine_index = find_search_engine(order[i]);
            sorted_engines.push(search_engines[engine_index]);
        }

        return sorted_engines;
    }

    function get_builtin_engine_label(name) {
        for (var i = 0; i < builtin_engines.length; i++) {
            if (builtin_engines[i].name == name) {
                return builtin_engines[i].label;
            }
        }
        return null;
    }

    function add_builtin_engine(name) {
        add_new_engine({name: name, label: get_builtin_engine_label(name), builtin: true, context_menu: true});
    }

    var regex_collection = {
        not_empty: {
            exp: /./,
            error_msg: chrome.i18n.getMessage('must_not_be_empty')
        },
        float_0_to_1: {
            exp: /^1$|^0(\.\d+)?$/,
            error_msg: chrome.i18n.getMessage('zero_to_one')
        },
        digits_only: {
            exp: /^\d+$/,
            error_msg: chrome.i18n.getMessage('only_digits')
        },
        alpha_num_underline: {
            exp: /^\w+$/,
            error_msg: chrome.i18n.getMessage('alpha_num_underline')
        },
        html_color: {
            exp: /^[A-Za-z]+$|^#?[\da-f]{3}([\da-f]{3})?$/i,
            error_msg: chrome.i18n.getMessage('incorrect_html_color')
        },
        url: {
            exp: /^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/,
            error_msg: chrome.i18n.getMessage('invalid_url')
        }
    };

    var option_validators = [
        {
            selector: '#appearance #max_width',
            regex: regex_collection.digits_only,
            range: {min: 200, max: 1000}
        },
        {
            selector: '#appearance #opacity',
            regex: regex_collection.float_0_to_1
        },
        {
            selector: '#appearance #background #gradiation_top',
            regex: regex_collection.html_color
        },
        {
            selector: '#appearance #background #gradiation_bottom',
            regex: regex_collection.html_color
        },
        {
            selector: '#appearance #fade #duration',
            regex: regex_collection.digits_only,
            range: {min: 0, max: 10000}
        },
        {
            selector: '#appearance #fade #delay',
            regex: regex_collection.digits_only,
            range: {min: 0, max: 5000}
        },
        {
            selector: '#appearance #fade #distance',
            regex: regex_collection.digits_only,
            range: {min: 0, max: 1000}
        },
        {
            selector: '#appearance #button #button_text_color',
            regex: regex_collection.html_color
        },
        {
            selector: '#appearance #button #button_text_hcolor',
            regex: regex_collection.html_color
        },
    ];

    function validate_options(validators) {
        var ok = true;

        for (var i = 0; i < validators.length; i++) {
            var v = validators[i];
            var val = $(v.selector).val();
            $(v.selector).next('#error_msg').remove();
            if (!val) {
                if (v.optional)
                    continue;
                val = ''; // the value could be empty
            }
            var error = !val.match(v.regex.exp) ? 'invalid' : (
                (
                    v.range ? (
                        (v.range.max ? parseInt(val) > v.range.max : false) ||
                            (v.range.min ? parseInt(val) < v.range.min : false)
                    ) : false
                ) ? 'out-of-range' : null
            )
            if (error) {
                ok = false;
                mark_as_error(v.selector, error, v.regex.error_msg, v.range);
            }
        }

        return ok;
    }

    function mark_as_error(selector, err_type, err_msg, range) {
        $(selector).after(
            $('<span>').attr({
                id: 'error_msg'
            }).css({
                color: 'red',
                'margin-left': '8px',
                'margin-right': '24px'
            }).text(
                err_type == 'invalid' ? err_msg : (
                    chrome.i18n.getMessage('out_of_range') + ': '
                        + (range.min || '')
                        + ' ~ '
                        + (range.max || '')
                )
            )
        ).css({
            'border-color': 'red'
        }).focus(function() {
            $(this).unbind('focus');
            $(this).css({'border-color': 'black'});
            $(this).next('#error_msg').remove();
        });
    }

    function clear_error_messages(validators) {
        for (var i = 0; i < validators.length; i++) {
            var v = validators[i];
            $(v.selector).unbind('focus');
            $(v.selector).css({'border-color': 'black'});
            $(v.selector).next('#error_msg').remove();
        }
    }

    function load_i18n_messages() {
        function set_localized_message(obj, attr) {
            $(obj).text(
                chrome.i18n.getMessage($(obj).attr(attr))
            );
        }
        $('[msg]').each(function() {
            set_localized_message(this, 'msg');
        });
        $('[for]').each(function() {
            set_localized_message(this, 'for');
        });
    }

    var search_engines = [];
    var is_engine_updating = false;
    var original_engine_name = null;
    var builtin_engines = [
        {name: 'iknow', label: 'iKnow'},
        {name: 'eow', label: '英二郎 on the Web'},
        {name: 'wikipedia_en', label: 'Wikipedia(en)'},
        {name: 'google_translate', label: 'Google translate'},
    ]

    function is_builtin_engine(name) {
        for (var i = 0; i < builtin_engines.length; i++) {
            if (builtin_engines[i].name == name)
                return true;
        }
        return false;
    }

    function is_engine_enabled(name) {
        if (!is_builtin_engine(name))
            return false;

        return $('#enabled_builtin_engines input[name=' + name + ']:checked').length == 1;
    }

    function disable_builtin_engine(name) {
        $('#enabled_builtin_engines input[name=' + name + ']').attr('checked', false);
    }

    $('#enabled_builtin_engines input').change(function() {
        var name = $(this).val();

        correct_builtin_engine(name);
    });

    $('#new_engine_form input[name=custom_engine_method]').change(function() {
        adjust_engine_dialog_content();
    });

    function adjust_engine_dialog_content() {
        var method = $('#new_engine_form input[name=custom_engine_method]:checked').val();

        if (method == 'REST') {
            $('#new_engine_form #engine_post_params').hide();
        } else {
            $('#new_engine_form #engine_post_params').show();
        }
    }

    function correct_builtin_engine(name) {
        if (is_engine_enabled(name)) {
            if(find_search_engine(name) == null)
                add_builtin_engine(name);
        } else {
            remove_search_engine_by_name(name);
        }
    }

    function is_valid_search_engine(obj) {
        if (typeof obj != 'object')
            return false;

        if (typeof obj.name != 'string' || obj.name.length == 0)
            return false;
        if (is_builtin_engine(obj.name))
            return true;

        if (typeof obj.url != 'string' || obj.url.length == 0)
            return false;
        if (typeof obj.label != 'string' || obj.label.length == 0)
            return false;

        if (obj.method == 'REST') {
            // It's okay!
        } else if (obj.method == 'GET' || obj.method == 'POST') {
            if (obj.params) {
                for(var i = 0; i < obj.params.length; i++) {
                    p = obj.params[i];
                    if (typeof p.name != 'string' || p.length == 0)
                        return false;
                    if (typeof p.val != 'string' && typeof p.val != 'undefined')
                        return false;
                }
            }
            if (typeof obj.q_field != 'string' || obj.q_field.length == 0)
                return false;
        } else {
            return false;
        }

        return true;
    }

    function update_engine(obj) {
        var i = find_search_engine(original_engine_name);
        if (i != null)
            search_engines[i] = obj;
    }

    function add_new_engine(obj) {
        if (!is_valid_search_engine(obj))
            return;

        search_engines.push(obj);

        $('#custom_engines_list').append(
            $('<li/>').attr({
                id: 'custom_engine_item_' + obj.name,
                tag: 'custom_engine_item',
                name: obj.name,
                'class': 'ui-state-default'
            }).css({
                margin: '0 3px 3px 3px',
                padding: '0.4em',
                'padding-left': '1.5em',
                'font-size': '1em',
                height: '22px'
            }).append(
                $('<span/>').attr(
                    'class', 'ui-icon ui-icon-arrowthick-2-n-s'
                ).css({
                    position: 'absolute',
                    'margin-left': '-1.3em'            
                })
            ).append(
                $('<span/>').attr({
                    id: 'engine_label_in_list'
                }).text(
                    obj.label || (is_builtin_engine(obj.name) ? get_builtin_engine_label(obj.name) : '')
                )
            ).append(
                $('<span/>').append(
                    $('<input/>').attr({
                        id: 'display_in_context_nemu',
                        type: 'checkbox',
                        checked: obj.context_menu || false
                    }).change(function() {
                        var name = get_engine_name_from_element(this);
                        var index = find_search_engine(name);
                        search_engines[index].context_menu = $(this).attr('checked');
                    })
                ).append(
                    $('<span/>').text(
                        chrome.i18n.getMessage('display_in_context_nemu')
                    )
                ).css({
                    'margin-left': '10px',
                    'margin-right': '10px',
                    padding: '1px',
                    float: 'right',
                    border: '1px white solid',
                    'font-size': 'small'
                })
            ).append(
                $('<a/>').text(
                    chrome.i18n.getMessage('remove')
                ).css({
                    padding: '4px',
                    float: 'right'
                }).attr(
                    'href', '#'
                ).click(function() {
                    var name = get_engine_name_from_element(this);
                    if (is_builtin_engine(name))
                        disable_builtin_engine(name);
                    remove_search_engine_by_name(name);
                })
            ).append(
                is_builtin_engine(obj.name) ? '' :
                $('<a/>').text(
                    chrome.i18n.getMessage('edit')
                ).css({
                    padding: '4px',
                    float: 'right'
                }).attr({
                    'href': '#'
                }).click(function() {
                    edit_search_engine(
                        get_engine_name_from_element(this)
                    );
                })
            )
        );

        $('#custom_engines_list').sortable('refresh');
    }

    function remove_search_engine_by_name(name) {
        $('#custom_engines_list [tag=custom_engine_item][name=' + name + ']').remove();
        $('#custom_engines_list').sortable('refresh');
        remove_search_engine_record(name);
    }

    function remove_search_engine_record(name) {
        var i = find_search_engine(name);
        if (typeof i == 'undefined' || i == null)
            return;

        search_engines.splice(i, 1);
    }

    function get_engine_name_from_element(elm) {
        var p;

        if ($(elm).attr('tag') == 'custom_engine_item') {
            p = $(elm);
        } else {
            p = $(elm).parents('[tag=custom_engine_item]');
            if (!p) return null;
        }
        return p.attr('name');
    }

    function clear_engine_dialog() {
        $('#new_engine_form input:text').val('');
        $('#new_engine_form input#engine_url').val('http://');

        $('#new_engine_form input[name=custom_engine_method]').attr('checked', false);
        $('#new_engine_form input[name=custom_engine_method][value=REST]').attr('checked', true);
        $('#new_engine_form #engine_hiddens_list li').remove();
        $('#new_engine_form #engine_hiddens_list').sortable('refresh');

        clear_error_messages(new_engine_validators);
        adjust_engine_dialog_content();
    }

    function clear_engines() {
        $('#custom_engines_list').children('li').remove();
        search_engines = [];
    }

    function find_search_engine(name) {
        if (!name) return;
        for (var i = 0; i < search_engines.length; i++) {
            if(search_engines[i].name == name)
                return i;
        }
        if (debug)
            console.log('Engine not found:' + name);
        return null;
    }

    function get_search_engine_info() {
        var obj = {
            name: $('#new_engine_form #engine_name').val(),
            url: $('#new_engine_form #engine_url').val(),
            label: $('#new_engine_form #engine_label').val(),
            method: $('#new_engine_form input[name=custom_engine_method]:checked').val(),
            charset: $('#new_engine_form select#engine_charset>option:selected').val()
        };

        if (obj.method != 'REST') {
            obj.q_field = $('#new_engine_form #engine_field_name').val();
            var params = $('#new_engine_form #hidden_param_pair'); 
            if (params.length != 0) {
                obj.params = [];
                $.each(params, function() {
                    console.log($(this).children('#hidden_param_name'));
                    obj.params.push({
                        name: $(this).children('#hidden_param_name').val(),
                        val: $(this).children('#hidden_param_val').val()
                    });
                });
            }
        }

        return obj;
    }

    function set_search_engine_info(obj) {
        clear_engine_dialog();
        $('#new_engine_form #engine_name').val(obj.name);
        $('#new_engine_form #engine_url').val(obj.url);
        $('#new_engine_form #engine_label').val(obj.label);
        $('#new_engine_form input[name=custom_engine_method]').attr('checked', false);
        $('#new_engine_form input[name=custom_engine_method][value=' + obj.method + ']').attr('checked', true);
        $('#new_engine_form #engine_field_name').val(obj.q_field);
        $('#new_engine_form #engine_hiddens_list li').remove();

        if (obj.params) {
            for(var i = 0; i < obj.params.length; i++) {
                $('#new_engine_form #engine_hiddens_list').append(
                    new_hidden_param(obj.params[i].name, obj.params[i].val)
                );
            }
        }

        adjust_engine_dialog_content();
        $('#new_engine_form #engine_hiddens_list').sortable('refresh');
    }

    function edit_search_engine(name) {
        var engine_index = find_search_engine(name);
        if (engine_index == null) {
            show_error(chrome.i18n.getMessage('engine_not_found') + ': ' + name);
        }

        set_search_engine_info(search_engines[engine_index]);
        is_engine_updating = true;
        original_engine_name = name;
        $('#new_engine_form').dialog('open');
        $('#engine_dialog_statusbar').hide();
    }

    var new_engine_validators = [
        {
            selector: '#new_engine_form #engine_name',
            regex: regex_collection.alpha_num_underline
        },
        {
            selector: '#new_engine_form #engine_url',
            regex: regex_collection.url
        },
        {
            selector: '#new_engine_form #engine_label',
            regex: regex_collection.not_empty
        },
    ];

    var new_engine_post_validator = [
        {
            selector: '#new_engine_form #engine_field_name',
            regex: regex_collection.not_empty
        },
        {
            selector: '#new_engine_form #hidden_param_name',
            regex: regex_collection.not_empty,
            optional: true
        },
    ];

    function validate_search_engine_dialog() {
        var ok = true;

        if (!validate_options(new_engine_validators))
            ok = false;

        var method = $('#new_engine_form input[name=custom_engine_method]:checked').val();

        if (method != 'REST') {
            if (!validate_options(new_engine_post_validator))
                ok = false;
        }

        function mark_as_engine_error(msg) {
            mark_as_error(
                '#new_engine_form input#engine_name',
                'invalid',
                msg,
                null
            );
            ok = false;
        }

        // Check for duplicate name
        var name = $('#new_engine_form input#engine_name').val();
        if (is_builtin_engine(name)) {
            mark_as_engine_error(chrome.i18n.getMessage('duplicate_custom_engine_entry'));
        } else if (!is_engine_updating) {
            if (find_search_engine(name) != null) {
                mark_as_engine_error(chrome.i18n.getMessage('duplicate_custom_engine_entry'));
            }
        } else {
            var original_index = find_search_engine(original_engine_name);
            for (var i = 0; i < search_engines.length; i++) {
                if (search_engines[i].name == name && i != original_index) {
                    mark_as_engine_error(chrome.i18n.getMessage('duplicate_custom_engine_entry'));
                }
            }
        }

        return ok;
    }

    $('#new_engine_form').dialog({
        autoOpen: false,
        width: '700',
        height: 'auto',
        modal: true,
        title: chrome.i18n.getMessage('engine_dialog_title'),
        buttons: {
            OK: function() {
                if(!validate_search_engine_dialog(new_engine_validators)) {
                    show_engine_dialog_error('error_invalid_val');
                    return false;
                }
                var engine_info = get_search_engine_info();
                if(is_engine_updating) {
                    update_engine(engine_info);
                } else {
                    add_new_engine(engine_info);
                }
                $(this).dialog('close');
            },
            Calcel: function() {
                $(this).dialog('close');
            }
        },
        close: function() {
        }
    });

    function new_hidden_param(name, val) {
        var input_style = {
            'float': 'left',
            'font-size': '14px',
            padding: 0,
            'margin-left': '10px',
            'font-color': 'black',
            height: '20px'
        };

        return $('<li>').attr({
            id: 'hidden_param_pair',
            'class': 'ui-state-default'
        }).css({
            padding: '0.2em',
            'padding-left': '1.5em',
            'font-size': '1em',
            height: '24px'
        }).append(
            $('<span/>').attr(
                'class', 'ui-icon ui-icon-arrowthick-2-n-s'
            ).css({
                position: 'absolute',
                'margin-left': '-1.3em',
                'margin-top': '0.1em'
            })
        ).append(
            $('<label>').attr({
                'for': 'hidden_param_name',
            }).text(chrome.i18n.getMessage('param_name')).css(input_style)
        ).append(
            $('<input>').attr({
                id: 'hidden_param_name',
                type: 'text',
                value: name || ''
            }).css(input_style)
        ).append(
            $('<label>').attr({
                'for': 'hidden_param_val'                
            }).text(chrome.i18n.getMessage('param_val')).css(input_style)
        ).append(
            $('<input>').attr({
                id: 'hidden_param_val',
                type: 'text',
                value: val || ''
            }).css(input_style)
        ).append(
            $('<a/>').text(
                chrome.i18n.getMessage('remove')
            ).css({
                padding: '4px',
                float: 'right'
            }).attr(
                'href', '#'
            ).click(function() {
                $(this).parent('#hidden_param_pair').remove();
                $('#new_engine_form #engine_hiddens_list').sortable('refresh');
            })
        )
    }

    $('#new_engine_form #engine_hiddens_list').sortable().css({
        'list-style-type': 'none'
    });

    $('#new_engine_form #add_new_hidden_param').button().css({
        'font-size': '14px',
        width: '140px'
    }).click(function() {
        $('#new_engine_form #engine_hiddens_list').append(
            new_hidden_param()
        );
        $('#new_engine_form #engine_hiddens_list').sortable('refresh');
        $('#new_engine_form #engine_hiddens_list :text').removeAttr('disabled');
    });

    $("#accordion").accordion({
        autoHeight: false,
        navigation: true
    });

    copyright = $('#copyright');
    copyright .css({
        position: 'relative',
        'text-align': 'center',
        width: '400px',
        margin: '0 auto 0 auto',
        padding: '20px'
    });

    width = parseInt($(window).width()) - 150 - 40;
    if (width < 320)
        width = 320;
    $('#config_area').width(width);

    $('#menubar button').button().css({'font-size': '14px', width: '140px'});
    $('#accordion button').button().css({'font-size': '14px', width: '140px'});

    $('#custom_engines_list').sortable();
    $('#custom_engines_list').disableSelection();
    $('#custom_engines_list').css({
        'list-style-type': 'none',
        margin: 0,
        padding: 0,
        width: '60%'
    });

    $('#copyright').dialog({
        autoOpen: false,
        modal: true,
        width: 450,
        height: 270,
        buttons: { "OK": function() { $(this).dialog("close"); } }
    });

    console.log(_default_settings);
});