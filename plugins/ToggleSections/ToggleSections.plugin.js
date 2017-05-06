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
    v1.5    (May 6th 2017):         Added a Container class for simplified state management. Added hotkeys for toggling guild/channel sections
                                    Ctrl+Shift+X toggles guilds, Ctrl+Shift+C toggles channels
 */

class TSContainer {
    constructor(plugin, index, {label, className, position}) {
        this.plugin = plugin;
        this.index = index
        this.label = label;
        this.className = className;
        this.position = position;

        this.attachHandler = this.attachHandler.bind(this);
        this.removeHandlers = this.removeHandlers.bind(this);
        this.close = this.close.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    get isClosed() {
        return this.plugin.settings.closed[this.index];
    }

    get isEnabled() {
        return this.plugin.settings.enabled[this.index];
    }

    get containerElem() {
        return $(`.${this.className}`);
    }

    get buttonElem() {
        return $(`#toggle-${this.className}`);
    }

    get buttonElemExists() {
        return $(`#toggle-${this.className}`).length > 0;
    }

    attachHandler() {
        const {
            buttonElem,
            buttonElemExists,
            containerElem,
            handleClick,
            isClosed,
            isEnabled,
            index,
            position,
            className,
            plugin,
            close,
            toggle,
        } = this;

        if (buttonElemExists && !isEnabled)
            return this.removeHandlers();

        if (buttonElemExists || !isEnabled)
            return;

        containerElem.append(`<div class="toggle-section ${position}" id="toggle-${className}"></div>`);
        containerElem.addClass("toggleable");

        if(isClosed) close();

        $(`#toggle-${className}`).on("click.ts", toggle);
    }

    removeHandlers() {
        const { buttonElem } = this;
        buttonElem.off("click.ts");
        buttonElem.remove();
    }

    close() {
        const { containerElem } = this;
        containerElem.addClass("closed");
    }

    toggle() {
        const { plugin, index, containerElem, isClosed } = this;
        isClosed
            ? containerElem.removeClass("closed")
            : containerElem.addClass("closed");
        plugin.settings.closed[index] = !isClosed;
        plugin.updateSettings();
    }
}

// Default settings for the first run, after that stored settings will be used
const defaultSettings = {
    enabled: [true, true],
    closed: [false, false],
    color: "#738BD7",
};

class ToggleSections {
    constructor() {
        this.containers = [
            new TSContainer(this, 0, { label: 'Guild list', className: 'guilds-wrapper', position: 'right' }),
            new TSContainer(this, 1, { label: 'Channel list', className: 'channels-wrap', position: 'right' }),
        ];

        this.start = this.start.bind(this);
        this.onSwitch = this.onSwitch.bind(this);
        this.observer = this.observer.bind(this);
        this.stop = this.stop.bind(this);
        this.addStyling = this.addStyling.bind(this);
        this.setupHotkeys = this.setupHotkeys.bind(this);
        this.getSettingsPanel = this.getSettingsPanel.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
    }

    get guildContainer() {
        return this.containers[0];
    }

    get channelContainer() {
        return this.containers[1];
    }

    getName() {
        return "Toggle Sections";
    }

    getDescription() {
        return "Allows you to hide sections of the program (check settings to modify)";
    }

    getVersion() {
        return "1.5";
    }

    getAuthor() {
        return "kettui /Cin";
    }

    load() {}
    unload() {}
    onMessage() {}

    start() {
        const { onSwitch, addStyling, setupHotkeys } = this;

        if(!bdPluginStorage.get("ToggleSections", "settings"))
            bdPluginStorage.set("ToggleSections", "settings", JSON.stringify(defaultSettings));

        this.settings = JSON.parse(bdPluginStorage.get("ToggleSections", "settings"));

        onSwitch();
        addStyling();
        setupHotkeys();
    }

    onSwitch() {
        const { containers } = this;
        containers.forEach(container => container.attachHandler());
    }

    observer(e) {
        if(e.target.classList.contains('toggleable'))
            this.onSwitch();
    }

    stop() {
        $("#toggle-sections").remove();
        $(document).off("keypress.ts");
        this.containers.forEach(container => container.removeHandlers());
    };

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

    // TODO: Make hotkeys configurable
    setupHotkeys() {
        $(document).on("keypress.ts", ({ ctrlKey, shiftKey, keyCode }) => {
            if(!ctrlKey || !shiftKey) return;

            // C
            if(keyCode === 3) this.channelContainer.toggle();
            // X
            else if(keyCode === 24) this.guildContainer.toggle();
        });
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
                "checked": container.isEnabled,
                click() {
                    const elem = $(this);
                    const isChecked = elem.attr("checked");
                    const u = parseInt(elem.attr("data-ts-i"));

                    settings.enabled[u] = !settings.enabled[u];

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

ToggleSections.Container = TSContainer;
