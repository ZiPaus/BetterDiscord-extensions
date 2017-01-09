//META{"name":"ToggleSections"}*//

/*
    Installation
    ------------
    1. Save this file in %appdata%/BetterDiscord/plugins as ToggleSections.plugin.js
    2. Refresh Discord (ctrl+R) or simply restart it
    3. Go to Settings > BetterDiscord > Plugins and enable the plugin

    Changelog
    ---------
    v1.0    (April 3rd 2016):       Initial version
    v1.1    (April 5th 2016):       Added initial settings (choose which buttons to show, modify button color)
    v1.2    (April 6th 2016):       Improved settings, bug fixes
    v1.3    (April 7th 2016):       Refactoring
    v1.4    (January 10th 2017):    Fix misc. crashes, switch to new BD settings storage, refactor to ES6 class syntax
 */

class ToggleSections {

    constructor() {
        // Default settings for the first run, after that stored settings will be used
        this.settings = {
            enabled: [true, true],
            closed: [false, false],
            color: "#738BD7",
        };
        this.containers = [
            { label: 'Server list', className: 'guilds-wrapper', position: 'right' },
            { label: 'Channel list', className: 'channels-wrap', position: 'right' },
        ];

        this.attachHandler = this.attachHandler.bind(this);
        this.start = this.start.bind(this);
        this.onSwitch = this.onSwitch.bind(this);
        this.observer = this.observer.bind(this);
        this.stop = this.stop.bind(this);
        this.attachHandler = this.attachHandler.bind(this);
        this.addStyling = this.addStyling.bind(this);
        this.getSettingsPanel = this.getSettingsPanel.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
    }

    getName() {
        return "Toggle Sections";
    }

    getDescription() {
        return "Allows you to hide sections of the program (check settings to modify)";
    }

    getVersion() {
        return "1.4";
    }

    getAuthor() {
        return "kettui /Cin";
    }

    load() {}
    unload() {}
    onMessage() {}

    start() {
        const { settings, onSwitch, addStyling } = this;

        if(!bdPluginStorage.get("ToggleSections", "settings"))
            bdPluginStorage.set("ToggleSections", "settings", JSON.stringify(settings));

        this.settings = JSON.parse(bdPluginStorage.get("ToggleSections", "settings"));

        onSwitch();
        addStyling();
    }

    onSwitch() {
        const { containers, attachHandler } = this;
        containers.forEach(attachHandler);
    }

    observer(e) {
        if(e.target.classList.contains('toggleable'))
            this.onSwitch();
    }

    stop() {
        $("#toggle-sections").remove();
        this.containers.forEach(container => {
            $('#toggle-'+ container.className).off("click.ts");
            $('#toggle-'+ container.className).remove();
        });
    };

    attachHandler(container, i) {
        const { settings, updateSettings } = this;

        const section = $("."+container.className);
        const buttonExists = $("#toggle-"+ container.className).length > 0;

        if(buttonExists && !settings.enabled[i]) {
            $("#toggle-"+ container.className).off("click.ts");
            $("#toggle-"+ container.className).remove();
            return;
        }

        if(buttonExists || !settings.enabled[i]) return;

        section.append('<div class="toggle-section '+ container.position +'" id="toggle-'+ container.className +'"></div>');
        section.addClass("toggleable");

        const btn = $('#toggle-'+ container.className +'');

        const toggleSection = () => {
            settings.closed[i] ? section.addClass("closed") : section.removeClass("closed");
        }

        const handleClick = () => {
            const isClosed = this.settings.closed[i] ? false : true;
            settings.closed[i] = isClosed;
            updateSettings();
            toggleSection();
        };

        if(settings.closed[i])
            toggleSection();

        btn.on("click.ts", handleClick);
    }

    addStyling() {
        const { containers, settings } = this;
        if($("#toggle-sections").length) $("#toggle-sections").html("");

        let css = [
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
                'border-color: transparent '+settings.color,
            '}',

            '.toggle-section:hover { opacity: 1 !important; }',

            '.toggle-section.right { right: 0; border-right-width: 10px; z-index: 999; }',

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
        containers.forEach(container => {
            css.push('.'+container.className+'{ position: relative; transition: width 150ms; }');
        });

        css = css.join(' ');

        if ($("#toggle-sections").length > 0)
            $("#toggle-sections").remove();

        $("head").append(`<style id="toggle-sections">${css}</style>`);
    }

    getSettingsPanel() {
        const { containers, settings, addStyling, updateSettings, onSwitch } = this;

        const settingsContainer = $('<div/>', { id: "ts-settings" });
        const colorPicker = $("<input/>", {
            type: "color",
            class: "swatch default",
            id: "color-picker"
        });
        colorPicker.prop("value", settings.color);

        containers.forEach((container, i) => {
            const checkbox = $('<input />', {
                "type": 'checkbox',
                "data-ts-i": i,
                "id": 'ts-'+ container.className,
                "checked": settings.enabled[i],
                click() {
                    const elem = $(this);
                    const isChecked = elem.attr("checked");
                    const u = parseInt(elem.attr("data-ts-i"));

                    settings.enabled[u] = settings.enabled[u] ? false : true;

                    updateSettings();
                    onSwitch();
                }
            });

            const checkboxLabel = $('<span />', {
                text: container.label
            });

            settingsContainer.append(checkbox, checkboxLabel, '<br/>');
        });

        settingsContainer.append('<span>Button color:</span>', colorPicker);

        colorPicker.on("change", function() {
            const newColor = $(this).prop("value");
            settings.color = newColor;
            updateSettings();
            addStyling();
        });

        return settingsContainer;
    }

    updateSettings() {
        bdPluginStorage.set("ToggleSections", "settings", JSON.stringify(this.settings));
    }
}
