/*
 * Highlight E-J dictionary
 *
 * Copyright (C) 2010  Mikiya Okuno
 *
 * This program is free software: you can redistribute it and/or modify
 * i t under the terms of the GNU General Public License as published by *
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/*
 * Ugly! Of course, I prefer to make it a closuer, but jQuery's $(document).ready()
 * doesn't work in certain situations. I named a function using its hash on
 * Chrome Web Store, so I believe the function name doesn't clash with others.
 */
function nohcjacbfnpdidonckmhkjfneoaifnfj() {
  /* Configuration variables */
  var enable_alc_search = true;
  var enable_google_translate = true;

  var my_id = 'nippondanji_je_search_tooltip';
  var tooltip_css_class = 'highlight_je_search_box';
  var max_phrase_len = 1000;
  var max_phrase_display = 100;
  var time_fading = 200;
  var fadein_delay = 200;
  var distance = 40;
  var opacity = 0.9;
  var alc_url = 'http://eow.alc.co.jp/';
  var alc_url_suffix = '/UTF-8/';
  var alc_desc = '>> アルクで「';
  var alc_desc_suffix = '」を検索';
  var max_width = 320;
  var button_text_color = 'white';
  var button_text_hcolor = 'mistyrose';
  var item_size_margin = 20;
  var tooltip_adjustment = {x: -80, y: -8};

  var translate_title = '>> Google Translate: (';
  var translate_title_suffix = ')';
  var google_translate_api_version = '1.0';
  var language_detect_api_url = 'https://ajax.googleapis.com/ajax/services/language/detect';
  var translate_api_url = 'https://ajax.googleapis.com/ajax/services/language/translate';

  /* The variables */
  var debug = false;
  var tooltip_status = 'hidden';
  var words = '';
  var words_displayed = '';
  var the_timer = null;
  var range_searched = null;

  if (debug)
    console.log('========== initializing highlight_je_dic ========== ');

  function chrome_getJSON(url, data, callback) {
    chrome.extension.sendRequest({action:'getJSON', url:url, data: data}, callback);
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

    if (enable_alc_search)
      setup_alc_search(the_list);

    if (enable_google_translate)
      setup_google_translate(the_list);

    $('body').append(tooltip_element);
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

  function setup_alc_search(the_list) {
    var list_item = create_list_item();
    list_item.attr('name', 'alcsearch');
    list_item.appendTo(the_list);

    var the_form = $('<form />');
    the_form.attr('target', '_blank');
    the_form.attr('method', 'GET');
    the_form.css({
      padding: 0,
      margin: 0
    });
    the_form.appendTo(list_item);

    var input = $('<input />');
    input.attr('type', 'submit');
    input.css({
      padding: 0,
      margin: 0,
      border: 'transparent',
      'background-color': 'transparent',
      'text-align': 'left !important',
      'font-weight': 'bold',
      'font-size': '12px',
      'color': button_text_color,
      position: 'relative'
    });
    input.mouseover(function(e) { input.css({ 'color': button_text_hcolor})});
    input.mouseout(function(e) {input.css({ 'color': button_text_color})});
    input.click(hide_tooltip);
    input.appendTo(the_form);
  }

  function setup_google_translate(the_list) {
    var list_item = create_list_item();
    list_item.appendTo(the_list);
    list_item.attr('name', 'googletranslate');

    var title_area = $('<div />');
    title_area.attr('name', 'translate_title');
    title_area.css({
      'text-align': 'left !important',
      padding: 0,
      margin: 0,
      'font-weight': 'bold',
      'font-size': '12px',
      align: 'left',
      display: 'none'
    });
    title_area.appendTo(list_item);

    var result_area = $('<div />');
    result_area.attr('name', 'translate_result');
    result_area.css({
      border: '1px solid lightgray',
      color: 'black',
      'background-color': 'aliceblue',
      'text-align': 'left !important',
      padding: 0,
      margin: 0,
      'font-size': '12px',
      display: 'none'
    });
    result_area.appendTo(list_item);
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

  function is_range_empty(r) {
    return (
       r.startOffset == r.endOffset && r.startContainer == r.endContainer
    );
  }

  function setup_search_box(w, p) {
    if (words == words_displayed &&
      (tooltip_status == 'fading-in' || tooltip_status == 'shown')) {
      return;
    }

    embed_form();
    configure_items(w);
    fadein_tooltip(p);
  }

  function configure_items(w) {
    if (enable_alc_search)
      configure_alc_search(w);

    if (enable_google_translate)
      configure_google_search(w);
  }

  function configure_alc_search(w) {
    var url = alc_url + encodeURI(w) + alc_url_suffix;
    w = w.length > max_phrase_display ? w.substring(0, max_phrase_display) + '...' : w;
    var desc = alc_desc + w + alc_desc_suffix;
    $('#' + my_id + ' form').attr('action', url);
    $('#' + my_id + ' input').attr('value', desc);
    if (debug) console.log('Submit button text: ' + desc);
  }

  function configure_google_search(w) {
    if (debug)
      console.log('enabling ajax for word: ' + w);
    chrome_getJSON(
      language_detect_api_url,
      {
        q: w,
        v: google_translate_api_version
      },
      function(data) {
        if (debug)
          console.log(data);

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
        }
        if (debug)
          console.log('got language successfully: ' + detected_lang);

        var title_area = $('#' + my_id + ' div[name=translate_title]');
        title_area.show();
        title_area.text(translate_title + lang_desc + translate_title_suffix);
        title_area.css({padding: '2px'});
        adjust_size_and_position();

        chrome_getJSON(
          translate_api_url,
          {
            q: w,
            v: google_translate_api_version,
            langpair: lang_arg
          },
          function(data) {
            if (data.responseStatus != 200)
              return;

            var result_area = $('#' + my_id + ' div[name=translate_result]');
            result_area.show();
            result_area.css({padding: '2px'});
            result_area.html(data.responseData.translatedText);

            adjust_size_and_position();
          }
        );
      }
    );
  }

  function adjust_size_and_position() {
    var the_tooltip = $('#' + my_id);

    // Adjust children sizes first.
    if (enable_alc_search)
      adjust_alcsearch_size();

    if (enable_google_translate)
      adjust_google_translate_size();

    // Finally adjust tooltip size.
    the_tooltip.css({
      left: p.left + tooltip_adjustment['x'],
      top: p.top - the_tooltip.height() + tooltip_adjustment['y']
    });
  }

  function adjust_alcsearch_size () {
    var the_input = $('#' + my_id + ' input');
    the_input.css({width: 'auto', 'word-wrap': 'normal'});
    var width = Math.min(max_width - item_size_margin, the_input.width());
    wrap = the_input.width() == width ? 'normal' : 'break-word';
    the_input.css({width: width, 'word-wrap': wrap});

    var list_item = $('#' + my_id + ' li[name=alcsearch]');
    list_item.height(the_input.height());

    var form = $('#' + my_id + ' form');
    form.height(the_input.height());
  }

  function adjust_google_translate_size() {
    var height = 0;

    var result_area = $('#' + my_id + ' div[name=translate_result]');
    result_area.css({width: 'auto'});
    if (result_area.width() > (max_width - item_size_margin)) {
      result_area.width(max_width - item_size_margin);
    }
    height += result_area.height();
    height += result_area.css('padding-top') + result_area.css('padding-bottom');

    var title_area = $('#' + my_id + ' div[name=translate_title]');
    height += title_area.height();
    height += title_area.css('padding-top') + title_area.css('padding-bottom');

    var list_item = $('#' + my_id + ' li[name=googletranslate]');
    list_item.height(height);
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
        left: '+=' + distance + 'px',
        opacity: opacity
      }, time_fading, 'swing', function() {
        // once the animation is complete, set the tracker variables
        tooltip_status = 'shown';
      });
    }, fadein_delay);
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
      left: '+=' + distance + 'px',
      opacity: 0
    }, time_fading, 'swing', function() {
      // once the animation is complete, set the tracker variables
      tooltip_status = 'hidden';
      words_displayed = '';

      if (tooltip_status == 'fading-out')
        the_tooltip.css('display', 'none');
        the_tooltip.remove();
    });
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

  function update(e) {
    if (e.button == 2) return; // right-click

    // No items are enabled.
    if (!(enable_alc_search || enable_google_translate))
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
      //  console.log("The selected range is identical to the previous one.");
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
  $('*').mousedown(update).mouseup(update);
};

/*
 * Don't have to wait until page is ready. In some cases, $(document).ready()
 * doesn't work properly. Let's call the function directly instead.
 */
nohcjacbfnpdidonckmhkjfneoaifnfj();
