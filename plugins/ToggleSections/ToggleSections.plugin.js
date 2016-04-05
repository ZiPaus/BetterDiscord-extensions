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
 */

var tssettings = {};
var containers = [
    { label: 'Server list', className: 'guilds-wrapper', position: 'right', enabled: null},
    { label: 'Channel list', className: 'channels-wrap', position: 'right', enabled: null},
    { label: 'User list', className: 'channel-members-wrap', position: 'left', enabled: null}
];

function ToggleSections() {}

ToggleSections.prototype.load = function() {};

ToggleSections.prototype.unload = function() {};

ToggleSections.prototype.start = function() {
    if(!localStorage.getItem("tssettings")) localStorage.setItem("tssettings", JSON.stringify({
        enabled: [true, true, true],
        color: null
    }));

    tssettings = JSON.parse(localStorage.getItem("tssettings"));

    this.onSwitch();
    this.addStyling();
};

ToggleSections.prototype.onSwitch = function() {
    var self = this;

    containers.forEach(function(container, i) {
        container.enabled = tssettings.enabled[i];
        self.attachHandler(container);
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

ToggleSections.prototype.attachHandler = function(container) {
    var section = $("."+container.className),
        initialWidth,
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

    this.handleClick = function() {
        if(!initialWidth) initialWidth = section.width();
        var toggleWidth = section.width() === initialWidth ? 0 : initialWidth;
        section.attr('style', 'width: '+ toggleWidth +'px !important');
        section.toggleClass("closed");
        section.children().css({ "opacity": toggleWidth == 0 ? 0 : 1 });
    }

	// bind handlers
	btn.bind("click", this.handleClick);
    $('.toggle-section').css({
        'border-color': 'transparent '+ tssettings.color
    });
}


ToggleSections.prototype.addStyling = function() {
    var css = [
        '.channel-members-wrap { min-width: 0; }',

        '.toggleable.closed { overflow: visible !important; }',

    	'.toggle-section {',
    		'position: absolute;',
    		'bottom: 0;',
            'z-index: 6;',
            'cursor: pointer;',
    		'opacity: 1 !important;',
            'border-width: 10px 0;',
    		'border-style: solid;',
            'border-color: transparent #3c3c3c;',
    	'}',

        '.toggle-section:hover { border-color: transparent #5a5a5a; }',

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
        $('.toggle-section').css({
            'border-color': 'transparent '+ newColor
        });
        tssettings.color = newColor;
        localStorage.setItem("tssettings", JSON.stringify(tssettings));
    })

    return settingsContainer;
};
