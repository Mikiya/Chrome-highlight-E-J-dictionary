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


(function () {
    /* Configuration variables */
    var enabled_modules = {
        iknow: true,
        eow: true,
        google_translate: true,
        wikipedia_en: true
    };

    var my_id = 'highlight_ej_search_tooltip';
    var tooltip_css_class = 'highlight_ej_search_box';
    var max_phrase_len = 1000;

    var appearance = {
        max_width: 320,
        padding: 20,
        adjust: {
            x: -120,
            y: -8
        },
        fade: {
            duration: 200,
            delay: 200,
            distance: 40
        },
        opacity: 0.9,
        button_text_color: 'white',
        button_text_hcolor: 'mistyrose'
    };

    /* Modules */
    var the_modules = new Array();

    /*
     * Modules displayed within the tooltip. Each module should implement three functions:
     * setup(), configure() and adjust_size().
     */
    function SimpleSearchModule() {
        this.name = null;
        this.url = null;
        this.label = null;
        this.method = null;
        this.hiddens = null;
        this.q_field = null;

        this.setup = function(the_list) {
            var list_item = create_list_item();
            list_item.attr('uuid', this.uuid);
            list_item.appendTo(the_list);

            var the_form = create_empty_form();
            if (this.method)
                the_form.attr({method: this.method});
            the_form.attr('uuid', this.uuid);
            the_form.appendTo(list_item);

            var input = $('<input />');
            input.attr({
                type: 'submit',
                uuid: this.uuid
            });
            input.css({'color': appearance.button_text_color});
            input.mouseover(function(e) { input.css({ 'color': appearance.button_text_hcolor})});
            input.mouseout(function(e) {input.css({ 'color': appearance.button_text_color})});
            input.click(hide_tooltip);
            input.appendTo(the_form);
        };

        this.configure = function(w) {
            var url = this.url;
            var form = $('#' + my_id + ' form[uuid=' + this.uuid + ']');
            if (this.hiddens) {
                for (key in this.hiddens) {
                    create_hidden(key, this.hiddens[key], form);
                }
            }
            if (this.q_field) {
                create_hidden(this.q_field, encodeURI(w), form);
            } else {
                url = url + encodeURI(w);
            }
            form.attr('action', url);

            $('#' + my_id + ' input[uuid=' + this.uuid + ']').attr('value', this.label);
            if (debug) console.log('Submit button text: ' + this.label);
        };

        this.adjust_size = function() {
            var the_input = adjust_input_size(this.uuid);

            var list_item = $('#' + my_id + ' li[uuid=' + this.uuid + ']');
            list_item.height(the_input.height());

            var form = $('#' + my_id + ' form');
            form.height(the_input.height());
        }
    }

    var google_translate_module = {
        name: 'Google Translate',

        /* Configuration variables */
        title: '>> Google Translate: (',
        title_suffix: ')',
        api_version: '1.0',
        language_detect_api_url: 'https://ajax.googleapis.com/ajax/services/language/detect',
        translate_api_url: 'https://ajax.googleapis.com/ajax/services/language/translate',
        search_url: 'http://translate.google.com/#',

        setup: function(the_list) {
            var list_item = create_list_item();
            list_item.appendTo(the_list);
            list_item.attr('uuid', this.uuid);
            list_item.attr('name', 'googletranslate');

            var title_area_frame = $('<div />');
            title_area_frame.css({padding: 0, 'margin-top': '3px', 'margin-bottom': '3px'});
            title_area_frame.appendTo(list_item);

            var title_area_form = create_empty_form();
            title_area_form.attr('uuid', this.uuid);
            title_area_form.css('display', 'none');
            title_area_form.appendTo(title_area_frame);

            var title_area = $('<input />');
            title_area.attr({
                type: 'submit',
                name: 'translate_title',
                uuid: this.uuid
            });
            console.log(title_area);
            title_area.css({
                'color': appearance.button_text_color,
                display: 'none'
            });
            title_area.mouseover(function(e) { title_area.css({ 'color': appearance.button_text_hcolor})});
            title_area.mouseout(function(e) {title_area.css({ 'color': appearance.button_text_color})});
            title_area.click(hide_tooltip);
            title_area.appendTo(title_area_form);

            var result_area = $('<blockquote />');
            result_area.attr('name', 'translate_result');
            result_area.css({display: 'none'});
            result_area.appendTo(list_item);
        },

        configure: function(w) {
            if (debug)
                console.log('enabling ajax for word: ' + w);

            chrome_getJSON(
                this.language_detect_api_url,
                {
                    q: w,
                    v: this.api_version
                },
                function(data) {
                    if (debug)
                        console.log(data);

                    module = google_translate_module;

                    if (data.responseStatus != 200)
                        return;
                    if (debug)
                        console.log('got json successfully.');

                    var detected_lang = data.responseData.language;
                    var lang_desc;
                    var lang_arg;
                    if (detected_lang == 'en') {
                        lang_desc = 'en -> ja';
                        lang_arg = 'en|ja';
                    } else if (detected_lang == 'ja') {
                        lang_desc = 'ja -> en';
                        lang_arg = 'ja|en';
                    } else {
                        if (debug)
                            console.log('bad language:' + data.responseData.language);
                        return;
                    }
                    if (debug)
                        console.log('got language successfully: ' + detected_lang);

                    var url = module.search_url + lang_arg + '|' + encodeURI(w);
                    var title_form = $('#' + my_id + ' form[uuid=' + module.uuid + ']');
                    title_form.attr('action', url);
                    title_form.show();

                    var title_area = $('#' + my_id + ' input[name=translate_title][uuid=' + module.uuid + ']');
                    title_area.show();
                    title_area.css({'margin-bottom': '4px', height: 'auto'});
                    title_area.attr('value', module.title + lang_desc + module.title_suffix);
                    adjust_size_and_position();

                    chrome_getJSON(
                        module.translate_api_url,
                        {
                            q: w,
                            v: module.api_version,
                            langpair: lang_arg
                        },
                        function(data) {
                            if (data.responseStatus != 200)
                                return;

                            var result_area = $('#' + my_id + ' blockquote[name=translate_result]');
                            result_area.show();
                            result_area.css({padding: '4px', margin: '4px', opacity: appearance.opacity});
                            result_area.html(data.responseData.translatedText);

                            adjust_size_and_position();
                        }
                    );
                }
            );
        },

        adjust_size: function() {
            var height = 0;

            var title_area = adjust_input_size(this.uuid);
            height += title_area.height();
            height += parseInt(title_area.css('padding-top')) + parseInt(title_area.css('padding-bottom'));
            height += parseInt(title_area.css('margin-top')) + parseInt(title_area.css('margin-bottom'));
            $('#' + my_id + ' form[uuid=' + this.uuid + ']').height(height);

            var result_area = $('#' + my_id + ' blockquote[name=translate_result]');
            result_area.css({width: 'auto'});
            if (result_area.width() > (appearance.max_width - appearance.padding)) {
                result_area.width(appearance.max_width - appearance.padding);
            }
            height += result_area.height();
            height += result_area.css('padding-top') + result_area.css('padding-bottom');

            var list_item = $('#' + my_id + ' li[name=googletranslate]');
            list_item.height(height);
        }
    };

    function setup_modules(enabled) {
        if (enabled.iknow) {
            the_modules.push($.extend(new SimpleSearchModule(), {
                name: 'iKnow dictonary search',
                url: 'http://smart.fm/jisho/',
                label: '>> iKnowで検索'
            }));
        };
        
        if (enabled.eow) {
            the_modules.push($.extend(new SimpleSearchModule(), {
                name: 'ALC',
                url: 'http://eow.alc.co.jp/',
                label: '>> 英二郎 on the WEBで検索'
            }));
        }
        
        if (enabled.wikipedia_en) {
            the_modules.push($.extend(new SimpleSearchModule(), {
                name: 'Wikipedia(en)',
                url: 'http://en.wikipedia.org/w/index.php',
                hiddens: {title: 'Special:Search'},
                method: 'POST',
                q_field: 'search',
                label: '>> Wikipedia英語版で検索'
            }));
        }
        
        if (enabled.google_translate)
            the_modules.push(google_translate_module);

        /* Generate UUIDs for modules */
        for (var i = 0; i < the_modules.length; i++) {
            the_modules[i].uuid = generate_uuid();
        }
    }
    
    /* The global variables */
    var debug = true;
    var tooltip_status = 'hidden';
    var words = '';
    var words_displayed = '';
    var the_timer = null;
    var range_searched = null;
    var saved_page_width = 0;

    if (debug)
        console.log('========== initializing highlight_je_dic ========== ');

    /*
     * Utility functions
     */

    function chrome_getJSON(url, data, callback) {
        chrome.extension.sendRequest({action:'getJSON', url: url, data: data}, callback);
    }

    function chrome_localStorage(key, callback) {
        chrome.extension.sendRequest({action:'getStorage', key: key, kind: 'local'}, callback);
    }

    // example) chrome_localStorage('test', function(o) { some_obj = JSON.parse(o); });

    function chrome_sessionStorage(key, callback) {
        chrome.extension.sendRequest({action:'getStorage', key: key, kind: 'session'}, callback);
    }

    function generate_uuid() {
        var toHex = function(n, digits) {
            var s = n.toString(16);
            s = (new Array(Math.max(1, digits - s.length + 1))).join('0') + s;
            return s.split('');
        }
        var hyphens = [8, 13, 18, 23];
        
        var res = new Array();
        for (var i = 0; i < 4; i++) {
            res = res.concat(toHex(Math.random() * 0x100000000, 8));
        }

        res[14] = '4';
        res[19] = ((parseInt(res[19]) & 0x3) | 0x8).toString(16);
        
        for (var i = 0; i < hyphens.length; i++)
            res.splice(hyphens[i], 0, '-');
 
        return res.join('');
    }


    function normalize_text(str) {
        str = str.replace(/\n/g, " ");
        str = $.trim(str.replace(/(　| )+/g, " "));

        if (str.length > max_phrase_len)
            str = '';

        return str;
    }

    function compare_range(r1, r2) {
        if (r1 == null || r2 == null) return false;
        return (
            r1.startContainer == r2.startContainer &&
            r1.startOffset == r2.startOffset &&
            r1.endContainer == r2.endContainer &&
            r1.endOffset == r2.endOffset
        );
    }

    function is_range_empty(r) {
        return (
             r.startOffset == r.endOffset && r.startContainer == r.endContainer
        );
    }

    /* jQuery supplemental functions */
    function adjust_input_size(uuid) {
        var the_input = $('#' + my_id + ' input[uuid=' + uuid + ']');
        the_input.css({width: 'auto', 'word-wrap': 'normal'});
        var width = Math.min(appearance.max_width - appearance.padding, the_input.width());
        wrap = the_input.width() == width ? 'normal' : 'break-word';
        the_input.css({width: width, 'word-wrap': wrap});

        return the_input;
    }

    /* Embed the popup (tooltip style) form */
    function embed_form() {
        var tooltip_element = $('<div />');
        tooltip_element.hide();
        tooltip_element.attr('id', my_id);
        tooltip_element.css({
            padding: 0,
            margin: 0,
            position: 'absolute',
            'z-index': 999
        });
        var tooltip_mid_element = $('<div />');
        tooltip_mid_element.attr('class', tooltip_css_class);
        tooltip_mid_element.appendTo(tooltip_element);
        var the_list = $('<ul />');
        the_list.css({
            margin: 0,
            padding: 0,
            position: 'relative',
            left: 0
        });
        the_list.appendTo(tooltip_mid_element);

        for (var i = 0; i < the_modules.length; i++) {
            console.log(the_modules[i].name);
            the_modules[i].setup(the_list);
        }

        $('body').append(tooltip_element);
    }

    function create_empty_form() {
        var the_form = $('<form />');
        the_form.attr('target', '_blank');
        the_form.attr('method', 'GET');
        the_form.css({
            padding: 0,
            margin: 0
        });
        return the_form;
    }

    function create_list_item() {
        var li = $('<li />');
        li.css({
            'list-style': 'none',
            margin: '2px',
            padding: 0,
            position: 'relative',
            height: '100%',
            left: 0
        });

        return li;
    }

    function create_hidden(key, val, form) {
        var h = $('<input />');
        h.attr({
            type: 'hidden',
            name: key,
            value: val
        });
        if (form)
            h.appendTo(form);
        return h;
    }

    function get_selected_region_geometry(range) {
        var next_range = document.createRange();
        next_range.setStart(range.endContainer, range.endOffset);
        next_range.setEnd(range.endContainer, range.endOffset);

        var next_text_span = document.createElement('span');
        next_range.insertNode(next_text_span);
        var the_span = $(next_text_span);

        var point = the_span.offset();
        if (debug)
            console.log('Offset to display: (x=' + point.left + ', y=' + point.top + ')');

        var parent = next_text_span.parentNode;
        if (parent != null) {
            parent.removeChild(next_text_span);
        }

        return point;
    }

    function setup_search_box(w, p) {
        if (words == words_displayed &&
            (tooltip_status == 'fading-in' || tooltip_status == 'shown')) {
            return;
        }

        saved_page_width = document.documentElement.scrollWidth || document.body.scrollWidth;
        embed_form();
        configure_items(w);
        fadein_tooltip(p);
    }

    function configure_items(w) {
        for (var i = 0; i < the_modules.length; i++) {
            the_modules[i].configure(w);
        }
    }

    function adjust_size_and_position() {
        var the_tooltip = $('#' + my_id);

        // Adjust children sizes first.
        for (var i = 0; i < the_modules.length; i++) {
            the_modules[i].adjust_size();
        }

        // Finally adjust tooltip size.
        var left = p.left + appearance.adjust.x;
        if (left < 0)
            left = 0;
        if (left + the_tooltip.width() > saved_page_width)
            left = saved_page_width - the_tooltip.width();
        console.log(saved_page_width + ":" + left + ":" + the_tooltip.width());
        var top = p.top - the_tooltip.height() + appearance.adjust.y;
        /*
         * I skip the following code, as it's not a big problem which we cannot
         * see translation for small portion within a page, compared to making it
         * inaccessible by covering them with tooltip.
         */
        //if (top < 0)
        //    top = 0;
        the_tooltip.css({
            left: left,
            top: top
        });
    }

    function fadein_tooltip(p) {
        if (the_timer) clearTimeout(the_timer);
        tooltip_status = 'fading-in';

        var the_tooltip = $('#' + my_id);
        if (debug)
            console.log('tooltip height is ' + the_tooltip.height());

        // Draw the tooltip first.
        words_displayed = words;
        the_tooltip.css({
            display: 'block',
            opacity: 0
        });

        adjust_size_and_position();

        the_timer = setTimeout(function() {
            the_tooltip.animate({
                left: '+=' + appearance.fade.distance + 'px',
                opacity: appearance.opacity
            }, appearance.fade.duration, 'swing', function() {
                // once the animation is complete, set the tracker variables
                tooltip_status = 'shown';
            });
        }, appearance.fade.delay);
    }

    function hide_tooltip() {
        fadeout_tooltip();
        words = '';
    }

    function fadeout_tooltip() {
        if (tooltip_status == 'fading-out' || tooltip_status == 'hidden') return;

        if (the_timer) clearTimeout(the_timer);
        tooltip_status = 'fading-out';

        var the_tooltip = $('#' + my_id);

        the_tooltip.animate({
            left: '+=' + appearance.fade.distance + 'px',
            opacity: 0
        }, appearance.fade.duration, 'swing', function() {
            // once the animation is complete, set the tracker variables
            tooltip_status = 'hidden';
            words_displayed = '';

            if (tooltip_status == 'fading-out')
                the_tooltip.css('display', 'none');
                the_tooltip.remove();
        });
    }

    /*
     * The main function which is called when a user selects texts.
     */
    function update(e) {
        if (e.button == 2) return; // right-click

        // No items are enabled.
        if (the_modules.length == 0)
            return;

        var s = window.getSelection();
        if (s.rangeCount < 1) {
            hide_tooltip();
            return;
        }
        var r = window.getSelection().getRangeAt(0);
        if (is_range_empty(r)) {
            hide_tooltip();
            return;
        }

        if (compare_range(r, range_searched)) {
            //if (debug)
            //    console.log("The selected range is identical to the previous one.");
            return;
        }

        words = normalize_text(r.toString());
        if (words.length == 0 || words == '') {
            hide_tooltip();
            return;
        }

        p = get_selected_region_geometry(r);
        s.addRange(r);

        setup_search_box(words, p);
    };

    /* Enable this extension within pages */
    chrome_localStorage('options', function(json) {
        var o = JSON.parse(json);
        if (debug)
            console.log(o);

        setup_modules(o.enabled_builtin_engines);
        $.extend(appearance, o.appearance);
        setup_event_listener(o.enabling_method);
    });

    function setup_event_listener(o) {
        function hide_tooltip(e) {
            if (tooltip_status == 'shown' && $('#' + my_id).has(e.target).length == 0)
                fadeout_tooltip();
        }

        if (o.method == 'select_then_key') {
            $('*').keydown(function(e) {
                if ((o.modkey == 'shift' && e.keyCode == 16) ||
                    (o.modkey == 'ctrl' && e.keyCode == 17) ||
                    (o.modkey == 'alt' && e.keyCode == 18))
                    update(e);
            });
            $('*').mousedown(hide_tooltip).mouseup(hide_tooltip);
        } else if (o.method == 'select_with_key') {
            function update_wrapper(e) {
                if (e.ctrlKey)
                    update(e);
                else
                    hide_tooltip(e);
            }
            $('*').mousedown(update_wrapper).mouseup(update_wrapper);
        } else { // o.method == select
            $('*').mousedown(update).mouseup(update);
        }
    }

}) ();
