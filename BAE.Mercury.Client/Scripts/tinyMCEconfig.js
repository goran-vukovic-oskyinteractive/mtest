/// <reference path="jquery-1.7.1.intellisense.js" />
/// <reference path="tiny_mce/tiny_mce.js" />

$(document).ready(function () {
    tinyMCE.init({
        mode: "exact",
        elements: 'richText',
        theme: "advanced",
        theme_advanced_toolbar_location: 'top',
        theme_advanced_toolbar_align: 'left',
        plugins: 'paste, style, spellchecker',
        theme_advanced_buttons1: 'bold, italic, underline, justifyleft, justifycenter, justifyright, justifyfull, formatselect, fontselect, fontsizeselect',
        theme_advanced_buttons2: 'search, replace, bullist, numlist, outdent, indent, undo, redo, forecolor, backcolor, spellchecker, pastetext',
        theme_advanced_buttons3:'',
        spellchecker_rpc_url: '/Message/CheckSpelling',
        spellchecker_languages: "+English (US)=en_US, English (UK)=en_GB, English (AU)=en_AU, English (CA)=en_CA, English (NZ)=en_NZ",

        paste_auto_cleanup_on_paste: true, // note: if this setting is disabled then 'paste as text' feature will no longer work.
        paste_retain_style_properties: 'background, border, color, font-family, font-size, font-weight, line-height, text-align, text-decoration, text-indent',

        width: '780px',
        height: '500px'

    });
});


