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
    /*
     * Status bar functions
     */
    var statusbar_timer = null;
    $('#statusbar').hide();

    function show_info(msg) {
        $('#statusbar div').attr('class', 'ui-state-highlight ui-corner-all');
        $('#statusbar #statusicon').attr('class', 'ui-icon ui-icon-info');
        show_msg('INFO', msg);
    }

    function show_error(msg) {
        $('#statusbar div').attr('class', 'ui-state-error ui-corner-all');
        $('#statusbar #statusicon').attr('class', 'ui-icon ui-icon-alert');
        show_msg('ERROR', msg);
    };

    function show_msg(title, msg) {
        title = title.length > 0 ? title + ':' : '';
        msg = chrome.i18n.getMessage(msg);
        $('#statusbar #message_title').text(title);
        $('#statusbar span#message').text(msg);

        clearTimeout(statusbar_timer);
        $('#statusbar').hide();

        $('#statusbar').show('drop', {}, 600, function() {});
        statusbar_timer = setTimeout(function() {
            $( "#statusbar" ).hide('drop', {direction: 'right'}, 600, function() {});
        }, 4000 );
    }

    /*
     * Buttons!
     */
    $('#menubar #about').click(function(e) {
        $('#copyright').dialog('open');
    });

    function default_settings() {
        return {
            enabling_method: {
                method: 'select',
                modkey: 'shift'
            },
            enabled_builtin_engines: {
                iknow: true,
                eow: true,
                wikipedia_en: true,
                google_translate: true
            },
            appearance: {
                max_width: 320,
                opacity: 0.9,
                background: {
                    gradiation_top: 'slategray',
                    gradiation_bottom: 'black'
                },
                dummy: 123,
                fade: {
                    duration: 200,
                    delay: 200,
                    distance: 40
                },
                button_text_color: 'white',
                button_text_hcolor: 'red'
            }
        };
    }

    $('#menubar #discard').click(function(e) {
        set_options(localStorage['options']);
        show_info('info_discarded');
    });

    $('#menubar #default').click(function(e) {
        set_options(JSON.stringify(default_settings()));
        show_info('info_loaded_defaults');
    });

    $('#menubar #close').click(function(e) {
        window.close();

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
        if(!validate_options()) {
            show_error('error_invalid_val');
        } else {
            localStorage['options'] = JSON.stringify(get_options());
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
            }
        };
    }

    function set_options(json) {
        var o = default_settings();
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
        html_color: {
            exp: /^[A-Za-z]+$|^#?[\da-f]{3}([\da-f]{3})?$/i,
            error_msg: chrome.i18n.getMessage('incorrect_html_color')
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

    function validate_options() {
        var ok = true;
        $('input').next('#error_msg').remove();

        for (var i = 0; i < option_validators.length; i++) {
            var v = option_validators[i];
            var val = $(v.selector).val();
            if (!val) {
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
                $(v.selector).after(
                    $('<span>').attr({
                        id: 'error_msg'
                    }).css({
                        color: 'red',
                        'margin-left': '8px',
                        'margin-right': '24px'
                    }).text(
                        error == 'invalid' ? v.regex.error_msg : (
                            'Out of range: '
                                + (v.range.min || '')
                                + ' ~ '
                                + (v.range.max || '')
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
        }

        return ok;
    };

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

    /*
     * Load localized messages
     */
    load_i18n_messages();

    $( "#accordion" ).accordion({
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

    $('#copyright').dialog({
        autoOpen: false,
        modal: true,
        width: 450,
        height: 270,
        buttons: { "OK": function() { $(this).dialog("close"); } }
    });

    set_options(localStorage['options']);
});