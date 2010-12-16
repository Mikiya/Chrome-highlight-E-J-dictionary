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
        height: 200
    });

    $('#menubar #about').click(function(e) {
        console.log('Button clicked');
        $('#copyright').dialog('open');
    });

    $('#menubar #close').click(function(e) {
        window.close();
    });

    function set_modkey_button_status(enabling_method) {
        if (enabling_method == 'select') {
            $('#enabling_method fieldset input').attr('disabled', 'disabled');
            $('#enabling_method fieldset').css({
                'text-decoration': 'line-through',
                'color': 'darkgray'
            });
        } else {
            $('#enabling_method fieldset input').removeAttr('disabled');
            $('#enabling_method fieldset').css({
                'text-decoration': 'none',
                'color': 'white'
            });
        }
    }

    $('#enabling_method [name=popup_enable_method]').click(function(e) {
        _modkey_button_status(e.target.value);
    });
});