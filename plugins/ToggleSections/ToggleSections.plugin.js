//META{"name":"ToggleSections"}*//

/*
    Installation
    ------------
    1. Save this file in %appdata%/BetterDiscord/plugins as ToggleSections.plugin.js
    2. Refresh Discord (ctrl+R) or simply restart it
    3. Go to Settings > BetterDiscord > Plugins and enable the plugin

    Changelog
    ---------
    v1.0 (April 3rd 2016): Initial version
    v1.1 (April 5th 2016): Added initial settings (choose which buttons to show, modify button color)
    v1.2 (April 6th 2016): Improved settings, bug fixes
 */

var tssettings = {};
var containers = [
    { label: 'Server list', className: 'guilds-wrapper', position: 'right', enabled: null, closed: null },
    { label: 'Channel list', className: 'channels-wrap', position: 'right', enabled: null, closed: null },
    { label: 'User list', className: 'channel-members-wrap', position: 'left', enabled: null, closed: null }
];

function ToggleSections() {}

ToggleSections.prototype.load = function() {};

ToggleSections.prototype.unload = function() {};

ToggleSections.prototype.start = function() {
    if(!localStorage.getItem("tssettings")) localStorage.setItem("tssettings", JSON.stringify({
        enabled: [true, true, true],
        closed: [false, false, false],
        color: "#3C3C3C"
    }));

    tssettings = JSON.parse(localStorage.getItem("tssettings"));

    this.onSwitch();
    this.addStyling();
};

ToggleSections.prototype.onSwitch = function() {
    var self = this;

    containers.forEach(function(container, i) {
        container.enabled = tssettings.enabled[i];
        container.closed = tssettings.closed[i];
        self.attachHandler(container, i);
    });
};

ToggleSections.prototype.stop = function() {
    $("#toggle-sections").remove();
    for (var i = 0; i < containers.length; i++) {
        $('#toggle-'+ containers[i].className).unbind("click");
        $('#toggle-'+ containers[i].className).remove();
    }
};

ToggleSections.prototype.getName = function() {
	return "Toggle Sections";
};

ToggleSections.prototype.getDescription = function() {
	return "Allows you to hide sections of the program (check settings to modify)";
};

ToggleSections.prototype.getVersion = function() {
	return "1.1";
};

ToggleSections.prototype.getAuthor = function() {
	return "kettui";
};

ToggleSections.prototype.attachHandler = function(container, i) {
    var section = $("."+container.className),
        initialWidth,
        self = this,
        buttonExists = $("#toggle-"+ container.className).length > 0;
    if(buttonExists && !container.enabled) {
        $("#toggle-"+ container.className).unbind("click");
        $("#toggle-"+ container.className).remove();
        return;
    }

    if(buttonExists || !container.enabled) return;

    section.append('<div class="toggle-section '+ container.position +'" id="toggle-'+ container.className +'"></div>');
    section.addClass("toggleable");

    var btn = $('#toggle-'+ container.className +'');

    var handleClick = function() {
        section.toggleClass("closed");
        var isClosed = container.closed ? false : true;
        container.closed = isClosed;
        tssettings.closed[i] = isClosed;
        self.updateSettings();
        toggleSection();
    };

    var toggleSection = function() {
        if(!initialWidth) initialWidth = section.width();
        var isClosed = container.closed;
        var sectionWidth = isClosed ? 0 : initialWidth;

        isClosed ? section.addClass("closed") : section.removeClass("closed");
    };

    if(container.closed) toggleSection();

	btn.bind("click", handleClick);
    $('.toggle-section').css({
        'border-color': 'transparent '+ tssettings.color
    });
}


ToggleSections.prototype.addStyling = function() {
    if($("#toggle-sections").length) $("#toggle-sections").html("");

    var css = [
        '.channel-members-wrap { min-width: 0; }',

        '.toggleable.closed { overflow: visible !important; width: 0 !important; }',
        '.toggleable.closed > *:not(.toggle-section) { opacity: 0 !important; }',

    	'.toggle-section {',
    		'position: absolute;',
    		'bottom: 0;',
            'z-index: 6;',
            'cursor: pointer;',
    		'opacity: .4 !important;',
            'border-width: 10px 0;',
    		'border-style: solid;',
            'border-color: transparent '+tssettings.color,
    	'}',

        '.toggle-section:hover { opacity: 1 !important; }',

    	'.toggle-section.right { right: 0; border-right-width: 10px; }',

    	'.toggleable.closed .toggle-section.right {',
    		'right: -10px;',
    		'border-left-width: 10px;',
    		'border-right-width: 0;',
    	'}',

    	'.toggle-section.left { left: 0; border-left-width: 10px }',

    	'.toggleable.closed .toggle-section.left {',
    		'left: -10px;',
    		'border-right-width: 10px;',
    		'border-left-width: 0;',
    	'}',

    	'.channel-members-wrap.closed .toggle-section { left: -30px; }'
    ];

    // Ensure that the containers are positioned relatively
    for (var i = 0; i < containers.length; i++) {
        css.push('.'+containers[i].className+'{ position: relative; transition: width 150ms; }');
    }

    css = css.join(' ');

    if ($("#toggle-sections").length == 0) {
        $("head").append('<style id="toggle-sections"></style>');
    }

    $("#toggle-sections").append(css);
}

ToggleSections.prototype.getSettingsPanel = function () {
    var self = this;
    var settingsContainer = $('<div/>', { id: "ts-settings" });
    var colorPicker = $("<input/>", {
        type: "color",
        class: "swatch default",
        id: "color-picker"
    });
    colorPicker.prop("value", tssettings.color);

    for (var i = 0; i < containers.length; i++) {
        var container = containers[i];

        var checkbox = $('<input />', {
            type: 'checkbox',
            'data-i': i,
            id: 'ts-'+ container.className,
            checked: container.enabled ? true : false,
            click: function() {
                var elem = $(this),
                    isChecked = elem.attr("checked"),
                    u = parseInt(elem.attr('data-i'));

                isChecked ? elem.prop("checked", false) : elem.prop("checked", true);
                containers[u].enabled = containers[u].enabled ? false : true;

                tssettings.enabled[u] = containers[u].enabled;
                localStorage.setItem("tssettings", JSON.stringify(tssettings));

                ToggleSections.prototype.onSwitch();
            }
        });

        var checkboxLabel = $('<span />', {
            text: container.label
        });

        settingsContainer.append(checkbox, checkboxLabel, '<br/>');
    }

    settingsContainer.append('<span>Button color:</span>', colorPicker);

    colorPicker.on("change", function() {
        var newColor = $(this).prop("value");
        tssettings.color = newColor;
        self.updateSettings();
        self.addStyling();
    })

    return settingsContainer;
};

ToggleSections.prototype.updateSettings = function() {
    localStorage.setItem("tssettings", JSON.stringify(tssettings));
};
