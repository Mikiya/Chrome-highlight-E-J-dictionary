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

var val = {desc: 'this is a test', struct: {x: 1, y: 2}, chars: ['a', 'b']};
localStorage.test = JSON.stringify(val);
console.log(localStorage.test);

$(function() {
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

    /*
     * Status bar functions
     */
    var statusbar_timer = null;
    $('#statusbar').hide();

    function show_info(title, msg) {
        title = title.length > 0 ? title + ':' : '';
        $('#statusbar #message_title').text(title);
        $('#statusbar span#message').text(msg);

        clearTimeout(statusbar_timer);
        $('#statusbar').hide();

        $('#statusbar').show('drop', {}, 600, function() {});
        statusbar_timer = setTimeout(function() {
            $( "#statusbar" ).hide('drop', {}, 600, function() {});
        }, 4000 );
    }

    /*
     * Buttons!
     */
    $('#menubar #about').click(function(e) {
        $('#copyright').dialog('open');
    });

    var default_settings = JSON.stringify({
        enabling_method: {
            method: 'select',
            modkey: 'shift'
        },
        enabled_builtin_engines: {
            iknow: true,
            eow: true,
            wikipedia_en: true,
            google_translate: true
        }
    });

    $('#menubar #discard').click(function(e) {
        set_options(localStorage['options']);
        show_info('INFO', 'changes to options have been discarded.');
    });

    $('#menubar #default').click(function(e) {
        set_options(default_settings);
        show_info('INFO', 'default settings are loaded.');
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
        set_modkey_button_status(e.target.value);
    });

    $('#menubar #save').click(function(e) {
        localStorage['options'] = JSON.stringify(get_options());
        show_info('INFO', 'settings saved.');
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
            }
        };
    }

    function set_options(json) {
        var o = JSON.parse(json);
        $('#enabling_method input[name=popup_enable_method][value=' + o.enabling_method.method + ']').attr('checked', 'checked');
        $('#enabling_method input[name=popup_enable_modifier_key][value=' + o.enabling_method.modkey + ']').attr('checked', 'checked');
        set_modkey_button_status(o.enabling_method.method);

        $('#enabled_builtin_engines input[name=iknow]').attr('checked', o.enabled_builtin_engines.iknow);
        $('#enabled_builtin_engines input[name=eow]').attr('checked', o.enabled_builtin_engines.eow);
        $('#enabled_builtin_engines input[name=wikipedia_en]').attr('checked', o.enabled_builtin_engines.wikipedia_en);
        $('#enabled_builtin_engines input[name=google_translate]').attr('checked', o.enabled_builtin_engines.google_translate);
    }

    set_options(localStorage['options']);
});