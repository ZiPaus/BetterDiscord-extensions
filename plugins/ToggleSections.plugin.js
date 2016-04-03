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
 */

var containers = [
    { label: 'Server list', className: 'guilds-wrapper', position: 'right', enabled: true},
    { label: 'Channel list', className: 'channels-wrap', position: 'right', enabled: true},
    { label: 'User list', className: 'channel-members-wrap', position: 'left', enabled: false}
];

function ToggleSections() {}

ToggleSections.prototype.load = function() {};

ToggleSections.prototype.unload = function() {};

ToggleSections.prototype.start = function() {
    this.onSwitch();
    this.addStyling();
};

ToggleSections.prototype.onSwitch = function() {
    var self = this;

    containers.forEach(function(container) {
        var elem = $("."+ container.className);
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
	return "Allows you to hide sections of the program";
};

ToggleSections.prototype.getVersion = function() {
	return "1.0";
};

ToggleSections.prototype.getAuthor = function() {
	return "kettui";
};

ToggleSections.prototype.attachHandler = function(container) {
    var section = $("."+container.className),
        initialWidth,
        buttonExists = $("#toggle-"+ container.className).length > 0;
        console.log(buttonExists, container.enabled);
    if(buttonExists && !container.enabled) {
        console.log("sup");
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
    		'border-top: 10px solid transparent;',
    		'border-bottom: 10px solid transparent;',
    	'}',

    	'.toggle-section:hover {	border-left-color: rgb(90, 90, 90) !important; border-right-color: rgb(90, 90, 90) !important; }',

    	'.toggle-section.right {	right: 0; border-right: 10px solid rgb(60, 60, 60);	}',
    	'.toggleable.closed .toggle-section.right {',
    		'right: -10px;',
    		'border-left: 10px solid rgb(60, 60, 60);',
    		'border-right: none;',
    	'}',

    	'.toggle-section.left { left: 0;	border-left: 10px solid rgb(60, 60, 60); }',
    	'.toggleable.closed .toggle-section.left {',
    		'left: -10px;',
    		'border-right: 10px solid rgb(60, 60, 60);',
    		'border-left: none;',
    	'}',

    	'#toggle-channel-members-wrap { background: rgb(40,40,40); }',
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

    for (var i = 0; i < containers.length; i++) {
        var container = containers[i];

        container.enabled
            ? settingsContainer.append('<input type="checkbox" onclick="ToggleSections.prototype.handleCheckbox.call(this, '+i+')" id="ts-'+container.className+'" checked /> <span>'+ container.label +'</span> <br/>')
            : settingsContainer.append('<input type="checkbox" onclick="ToggleSections.prototype.handleCheckbox.call(this, '+i+')" id="ts-'+container.className+'" /> <span>'+ container.label +'</span> <br/>')
    }


    return settingsContainer;
};

ToggleSections.prototype.handleCheckbox = function(i) {
    var elem = $(this),
        isChecked = elem.attr("checked");

    isChecked ? elem.removeAttr("checked") : elem.attr("checked", "checked");
    console.log(containers[i].enabled);
    containers[i].enabled = containers[i].enabled ? false : true;
    console.log(containers);

    ToggleSections.prototype.onSwitch();
}
