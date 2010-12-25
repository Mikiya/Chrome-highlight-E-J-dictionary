var context_menues = [];

function do_search_by_context_menu(info, tab) {
    var e;
    for (var i = 0; i , context_menues.length; i++) {
        if (context_menues[i].id == info.menuItemId) {
            e = context_menues[i].engine;
            break;
        }
    }

    if (e.name == 'google_translate') {
        jQuery.getJSON(
            e.language_detect_api_url,
            {
                q: info.selectionText,
                v: e.api_version
            },
            function(data) {
                if (data.responseStatus != 200)
                    return;

                var detected_lang = data.responseData.language;
                var lang_arg;
                if (detected_lang == 'en') {
                    lang_arg = 'en|ja|';
                } else if (detected_lang == 'ja') {
                    lang_arg = 'ja|en|';
                } else {
                    lang_arg = 'auto|ja|';
                    return;
                }

                $('<form>').attr({
                    target: '_blank',
                    action: e.url + lang_arg + info.selectionText
                }).appendTo('body').submit().remove();
            }
        );
    } else if (e.method == 'REST') {
        $('<form>').attr({
            target: '_blank',
            action: e.url + info.selectionText
        }).appendTo('body').submit().remove();
    } else if (e.method == 'POST' || e.method == 'GET') {
        var form = $('<form>').attr({
            target: '_blank',
            action: e.url
        }).append(
            $('<input/>').attr({
                type: 'hidden',
                name: e.q_field,
                value: info.selectionText
            })
        );

        if (e.hiddens) {
            for (var i = 0; i < e.hiddens.length; i++) {
                form.append(
                    $('<input/>').attr({
                        type: 'hidden',
                        name: e.hiddens[i].name,
                        value: e.hiddens[i].val
                    })
                );
            }
        }

        form.appendTo('body').submit().remove();
    }
}

function update_context_menu() {
    var builtin_search_engines = {
        iknow: {
            name: 'iknow',
            url: 'http://smart.fm/jisho/',
            label: 'iKnow',
            method: 'REST'
        },
        eow: {
            name: 'eow',
            url: 'http://eow.alc.co.jp/',
            label: chrome.i18n.getMessage('ctx_engine_eow'),
            method: 'REST'
        },
        wikipedia_en: {
            name: 'wikipedia_en',
            url: 'http://en.wikipedia.org/w/index.php',
            hiddens: {title: 'Special:Search'},
            label: chrome.i18n.getMessage('ctx_engine_wikipedia_en'),
            method: 'POST',
            q_field: 'search'
        },
        google_translate: {
            name: 'google_translate',
            url: 'http://translate.google.com/#',
            label: chrome.i18n.getMessage('ctx_engine_google_translate'),
            method: 'REST',
            api_version: '1.0',
            language_detect_api_url: 'https://ajax.googleapis.com/ajax/services/language/detect'
        }
    };

    chrome.contextMenus.removeAll();
    context_menues = [];

    var o = JSON.parse(localStorage['options']);
    if (o.engines) {
        for (var i = 0; i < o.engines.length; i++) {
            var e = o.engines[i];
            if (!e.context_menu) continue;
            if (builtin_search_engines[e.name])
                e = builtin_search_engines[e.name];

            var menu_id = chrome.contextMenus.create({
                title: chrome.i18n.getMessage('ctx_prefix') + e.label + chrome.i18n.getMessage('ctx_suffix'),
                contexts: ['selection'],
                onclick: do_search_by_context_menu
            });
            context_menues.push({
                id: menu_id,
                engine: e
            });
        }
    }
}

update_context_menu();