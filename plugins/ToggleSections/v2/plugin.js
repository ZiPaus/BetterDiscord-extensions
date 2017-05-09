module.exports = (Plugin, BD, Vendor) => {

    const { Api, Events, Storage } = BD;
    const { $, React } = Vendor;

    class TSContainer {
        constructor(plugin, { label, className, position, isEnabled, isClosed, hotkey }) {
            this.plugin = plugin;

            this.label = label;
            this.className = className;
            this.position = position;
            this.isEnabled = isEnabled;
            this.isClosed = isClosed;
            this.hotkey = hotkey;

            this.attachHandler = this.attachHandler.bind(this);
            this.removeHandlers = this.removeHandlers.bind(this);
            this.close = this.close.bind(this);
            this.toggle = this.toggle.bind(this);
        }

        get defaultSettings() {
            return {
                enabled: true,
                closed: false,
                hotkey: null,
            };
        }

        get settings() {
            return {
                label: this.label,
                className: this.className,
                position: this.position,
                isEnabled: this.isEnabled,
                isClosed: this.isClosed,
                hotkey: this.hotkey
            };
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

            this.isClosed = !isClosed;
            plugin.saveSettings();
        }
    }

    class ToggleSections extends Plugin {
        constructor(props) {
            super(props);

            this.color = Storage.getSetting("color");

            this.containers = [
                new TSContainer(this, Storage.getSetting("guilds")),
                new TSContainer(this, Storage.getSetting("channels")),
            ];

            this.attachHandlers = this.attachHandlers.bind(this);
            this.setupHotkeys = this.setupHotkeys.bind(this);
            this.addStyling = this.addStyling.bind(this);
        }

        onStart() {
            const { attachHandlers, addStyling, setupHotkeys } = this;

            attachHandlers();
            addStyling();
            setupHotkeys();

            Api.log('Initialized Toggle Sections plugin');

            //Return true if plugin started correctly
            return true;
        }

        onStop() {
            $("#toggle-sections").remove();
            $(document).off("keypress.ts");
            this.containers.forEach(container => container.removeHandlers());

            Api.log('Disabled Toggle Sections plugin');

            return true;
        }

        onSave() {
            //Called when plugin settings are saved
        }

        //get settingsPanel() {}

        attachHandlers() {
            this.containers.forEach(container => container.attachHandler());
        }

        setupHotkeys() {
            $(document).on("keypress.ts", ({ ctrlKey, shiftKey, keyCode }) => {
                if(!ctrlKey || !shiftKey) return;

                this.containers.forEach(container => {
                    if(container.hotkey === keyCode)
                        container.toggle();
                });
            });
        }

        addStyling() {
            const { containers, color } = this;
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
                    'border-color: transparent '+color,
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

        saveSettings() {
            const containerSettings = this.containers.map(container => container.settings);
            console.log(containerSettings);
            Storage.setSetting("containers", containerSettings);
        }
    }

    return ToggleSections;
};
