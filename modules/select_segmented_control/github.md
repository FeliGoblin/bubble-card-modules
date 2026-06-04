### Module post template

# Select Segmented Control

**Version:** 1.0  
**Creator:** -> [FeliGoblin](https://github.com/FeliGoblin)

> [!IMPORTANT] 
> **Supported cards:**
>  - Select

<h2>Select Segmented Control</h2>
<p>
  Transforms Select buttons into an animated full-width segmented (or "pill") control.<br>
  It has many customisation options such as changing colours, text, shape, speed, and even adding additional actions to trigger.
</p>
<p>
  For bottom sub-buttons I recommend a row height of 1.85, and Limit Button Height enabled.
</p>
Configure this module via the editor or in YAML, for example: 

```yaml
select_segmented_control:
  global:
    text_transform: uppercase
    selected_color: #000000
    color: #000000
    color_on: #000000
    icon: mdi:dog
    icon_on: mdi:dog-side
    icon_color: #000000
    icon_on_color: #000000
  local:
    customs:
      - index: 2
        name: Name
        selected_color: #000000
        color: #000000
        color_on: #000000
        icon: mdi:dog
        icon_on: mdi:dog-side
        icon_color: #000000
        icon_on_color: #000000
        tap_action:
          - action: fan.decrease_speed
            target:
              entity_id: fan.bedroom_fan
        action_every_click: false
  other:
    card_radius: 10
    button_radius: 10
    animation_speed: 0.2
    card_color: #000000
    limit_button_height: false
```

---

<details>

<summary><b>🧩 Get this Module</b></summary>

<br>

> To use this module, simply install it from the Module Store (from the editor of any card > Modules), or copy and paste the following configuration into a `/www/bubble/modules/select_segmented_control.yaml` file.

```yaml
select_segmented_control:
    name: "Select Segmented Control"
    version: "1.0"
    creator: "FeliGoblin"
    link: "https://github.com/Clooos/Bubble-Card/discussions/2474"

    supported:
        - select

    description: |
        <h2>Select Segmented Control</h2>
        <p>
          Transforms Select buttons into an animated full-width segmented (or "pill") control.<br>
          It has many customisation options such as changing colours, text, shape, speed, and even adding additional actions to trigger.<br>
        </p>
        <br>
        <p>
          For bottom sub-buttons I recommend a row height of 1.85, and Limit Button Height enabled.<br>
        </p>

    code: |
        .bubble-container {
          overflow: hidden;
          border-radius: ${this.config.select_segmented_control?.other?.card_radius || ''}px !important;
          --ssc-background: ${this.config.select_segmented_control?.other?.card_color || '' };
          --ssc-text-transform: ${this.config.select_segmented_control?.global?.text_transform || 'none'};
          --ssc-native-height: calc(var(--row-height, 56px) * var(--row-size, 1) + var(--row-gap, 8px) * (var(--row-size, 1) - 1));
          --ssc-height: 
              ${this.config.select_segmented_control?.other?.limit_button_height ? 
                'min(var(--row-height, 56px), ' : 
                'calc('
              }
            var(--ssc-native-height));
          --ssc-radius: 
              ${this.config.select_segmented_control?.other?.button_radius == null
                ? 'var(--bubble-select-border-radius, var(--bubble-border-radius, calc(var(--ssc-height) / 2)))'
                : `${this.config.select_segmented_control.other.button_radius}px`}
        }
        
        .bubble-background,
        .bubble-content-container,
        .bubble-buttons-container,
        .bubble-dropdown-inner-border {display: none;}
        .bubble-sub-button-container {width: 100%;}
        .bubble-sub-button-group {z-index: 2;}
        
        .ssc-button-container {
          display: flex;
          justify-content: space-evenly;
          position: relative;
          height: var(--ssc-height);
          border-radius: var(--ssc-radius);
          background: var(--ssc-background);
        }
        
        .ssc-button {
          flex-grow: 1;
          opacity: 0.6;
          line-height: var(--ssc-height);
          font-size: var(--ha-font-size-m);
          font-weight: bold;
          text-align: center;
          cursor: pointer;
          z-index: 1;
          position: relative;
          text-transform: var(--ssc-text-transform);
          transition: color var(--ssc-anim-speed), opacity var(--ssc-anim-speed);
          color: var(--primary-text-color, inherit);
        }
        
        .ssc-button[selected] ha-icon,
        .ssc-button[selected] {opacity: 1;}
        
        .ssc-button:hover {
          background: 
            color-mix(
              in oklab, 
              var(--md-ripple-hover-color, 
                var(--ha-ripple-hover-color, 
                  var(--ha-ripple-color,
                    var(--secondary-text-color)
                  )
                )
              ) 3%, 
              transparent
            );
        }
        
        .bubble-icon {
          width: var(--mdc-icon-size, 24px);
          margin-right: 5px;
          color: var(--primary-text-color, inherit);
          transition: color var(--ssc-anim-speed);
        }
        
        .ssc-pill {
          background: 
            var(--bubble-button-accent-color, 
            var(--bubble-accent-color, 
            var(--bubble-default-color)));
          height: var(--ssc-height);
          position: absolute;
          top: 0px;
          z-index: 0; 
          transition: 
            left var(--ssc-anim-speed), 
            width var(--ssc-anim-speed), 
            background var(--ssc-anim-speed);
        }
        
        .ssc-button, .ssc-pill {border-radius: var(--ssc-radius);}
        
        
        ${(() => { 
          const moduleID = 'select_segmented_control';
          const config = this.config[moduleID] || {};
          const options = hass.states[entity].attributes?.options ?? [];
          const cardContainer = card.querySelector('.bubble-select-container');
        
          if (!entity || !cardContainer) return;
          if (!options.length) {
            console.warn("Empty options list.");
            return;
          }
        
          cardContainer.querySelector('.bubble-background')?.remove()
          cardContainer.querySelector('.bubble-content-container')?.remove()
          cardContainer.querySelector('.bubble-buttons-container')?.remove()
          cardContainer.querySelector('.bubble-dropdown-inner-border')?.remove()
        
          const selectedIndex = options.indexOf(state);
          const customs = config.local?.customs;
          const animSpeed = config.other?.animation_speed ?? 0.2;
        
          let buttonContainer = card.querySelector('.ssc-button-container');
          if (!buttonContainer) buttonContainer = createElement('div', cardContainer, ['ssc-button-container']);
          if (buttonContainer.children?.length != options.length) createButtons();  
          const selectedButton = buttonContainer.children[selectedIndex];
        
          let pill = card.querySelector('.ssc-pill');
          if (!pill) { 
            pill = createElement('div', cardContainer, ['ssc-pill']); 
            adjustPill(); 
          }
        
          const resizeObserver = new ResizeObserver(() => {adjustPill()});
        
          function adjustPill() {
            pill.style.left = selectedButton.offsetLeft + 'px';
            pill.style.width = selectedButton.offsetWidth + 'px';
            pill.style.background = getSelectedPillColor();
          }
        
          resizeObserver.observe(selectedButton);
          if (!selectedButton.hasAttribute('selected')) stateChanged();
        
        
          function createButtons() {
            buttonContainer.innerHTML = "";
            options.forEach((option, index) => {
              let selected = index === selectedIndex;
              let button = createElement('div', buttonContainer, ['ssc-button']);
              button.toggleAttribute('selected', selected);
              button.addEventListener("click", function() {
                hass.callService('input_select', 'select_option', {entity_id: entity, option: option});
                if (hass.vibrate) navigator.vibrate(20);
              });
        
              let customValues = customs?.find(customValues => customValues.index === index + 1);
              if (customValues?.tap_action) {
                if (customValues?.action_every_click) {
                  button.addEventListener("click", function() {triggerCustomActions(index)});
                } else {
                  button.setAttribute('action', '');
                }
              }
        
              let icon = customValues?.icon || config.global?.icon;
              if (icon) {
                let iconOn = customValues?.icon_on || config.global?.icon_on;
                let iconColor = customValues?.icon_color || config.global?.icon_color;
                if (iconColor) button.setAttribute('icon_color', iconColor);
                let iconOnColor = customValues?.icon_on_color || config.global?.icon_on_color;
                if (iconOnColor) button.setAttribute('icon_on_color', iconOnColor);
        
                let haIcon = createElement('ha-icon', button, ['bubble-icon', 'icon']);
                haIcon.setAttribute('icon', selected ? iconOn || icon : icon);
                haIcon.style.display = 'inline-block'
                haIcon.style.color = selected ? iconOnColor || iconColor : iconColor;
                button.setAttribute('icon', icon);
                if (iconOn) button.setAttribute('icon_on',  iconOn);
              }
        
              let background = customValues?.selected_color || config.global?.selected_color;
              let color = customValues?.color || config.global?.color;
              let colorOn = customValues?.color_on || config.global?.color_on;
              if (background) button.setAttribute('selected_color', background);
              if (color) button.setAttribute('color', color);
              if (colorOn) button.setAttribute('color_on', colorOn);
              button.style.color = selected ? colorOn || color : color || '';
        
              let text = createElement('span', button);
              text.innerText = customValues?.name ?? option;
            });
          }
        
          function createElement(tagName, appendTo=null, classList=[], style="") {
            let elem = document.createElement(tagName); 
            classList.forEach(cls => {elem.classList.add(cls)});
            if (style) elem.style.cssText = style;
            if (appendTo) appendTo.appendChild(elem);
            return elem;
          }
        
          function getSelectedPillColor() {
            return selectedButton.attributes.selected_color?.value || 
              'var(--bubble-button-accent-color, var(--bubble-accent-color, var(--bubble-default-color)))';
          }
        
          function stateChanged() {
            cardContainer.style.setProperty("--ssc-anim-speed", animSpeed + 's');
        
            let from = buttonContainer.querySelector('[selected]');
            if (from) {
                from.removeAttribute('selected');
                if (from.hasAttribute('icon_on')) from.firstChild.setAttribute('icon', from.attributes.icon?.value);
                if (from.hasAttribute('color_on')) from.style.color = from.attributes.color?.value || 'unset';
                if (from.hasAttribute('icon_on_color')) from.firstChild.style.color = from.attributes.icon_color?.value || 'unset';
            }
        
            selectedButton.setAttribute('selected', '');
            let iconOn = selectedButton.attributes?.icon_on?.value;
            let iconOnColor = selectedButton.attributes?.icon_on_color?.value;
            let colorOn = selectedButton.attributes?.color_on?.value;
            if (iconOn) selectedButton.firstChild.setAttribute('icon', iconOn);
            if (iconOnColor) selectedButton.firstChild.style.color = iconOnColor;
            if (colorOn) selectedButton.style.color = colorOn;
            if (selectedButton.hasAttribute('action')) triggerCustomActions(selectedIndex);
          }
        
          function triggerCustomActions(index) {
            let customValues = customs.find(customValues => customValues.index === index + 1);
        
            customValues.tap_action?.forEach(tapAction => {
              let action = tapAction.action?.split(".", 2);    
              hass.callService(action[0], action[1], {...tapAction.target, ...tapAction.data});
            });
          }
        
        })()} 
        

    editor:
      - type: grid
        name: other
        schema:
          - name: card_radius
            label: Card Border Radius
            selector:
              number:
                step: 1
                unit_of_measurement: px
                mode: box
          - name: button_radius
            label: Button Border Radius
            selector:
              number:
                step: 1
                unit_of_measurement: px
                mode: box
          - name: card_color
            label: Background Color
            default: 'eg. #ff00ff'
            selector:
              text: {}
          - name: animation_speed
            label: Animation Speed
            selector:
              number:
                min: 0
                max: 2
                step: 0.1
                unit_of_measurement: s
                mode: box
            default: 0.2
          - name: limit_button_height
            label: Limit Button Height
            selector:
              boolean: {}
      - type: expandable
        name: global
        title: Global Button Options
        expanded: false
        schema:
          - name: text_transform
            label: Text Transform
            selector:
              select:
                options:
                  - label: Capitalize
                    value: capitalize
                  - label: Uppercase
                    value: uppercase
                  - label: Lowercase
                    value: lowercase
                multiple: false
                custom_value: false
                mode: dropdown
          - name: selected_color
            label: Selected Color
            default: 'eg. #ff00ff'
            selector:
              text: {}
          - name: color
            label: Text Color
            default: 'eg. #ff00ff'
            selector:
              text: {}
          - name: color_on
            label: Selected Text Color
            default: 'eg. #ff00ff'
            selector:
              text: {}
          - name: icon
            label: Icon
            selector:
              icon: {}
          - name: icon_on
            label: Selected Icon
            description: Show a different icon when selected.
            selector:
              icon: {}
          - name: icon_color
            label: Icon Color
            default: 'eg. #ff00ff'
            selector:
              text: {}
          - name: icon_on_color
            label: Selected Icon Color
            default: 'eg. #ff00ff'
            selector:
              text: {}
      - type: expandable
        name: local
        title: Individual Button Options
        expanded: false
        schema:
          - name: customs
            label: Buttons
            selector:
              object:
                fields:
                  index:
                    label: Button Number
                    required: true
                    description: 1 = first button, 2 = second button, 3 = third, etc.
                    selector:
                      number:
                        min: 1
                        max: 50
                        step: 1
                        mode: box
                  name:
                    label: Name
                    description: Enter a single space to hide the name.
                    selector:
                      text: {}
                  selected_color:
                    label: Selected Color
                    description: 'eg. #ff00ff'
                    selector:
                      text: {}
                  color:
                    label: Text Color
                    selector:
                      text: {}
                  color_on:
                    label: Selected Text Color
                    selector:
                      text: {}
                  icon:
                    label: Icon
                    selector:
                      icon: {}
                  icon_on:
                    label: Selected Icon
                    description: Show a different icon when selected.
                    selector:
                      icon: {}
                  icon_color:
                    label: Icon Color
                    selector:
                      text: {}
                  icon_on_color:
                    label: Selected Icon Color
                    selector:
                      text: {}
                  tap_action:
                    label: Custom Actions
                    selector:
                      action: {}
                  action_every_click:
                    label: Trigger Actions on Every Click
                    description: >-
                      Trigger custom actions even when this button option is already
                      selected.
                    selector:
                      boolean: {}
                label_field: index
                description_field: name
                multiple: true
      
```

</details>

---

### Screenshot:

<img width="720" height="140" alt="ss1" src="https://github.com/user-attachments/assets/73902eac-0217-4115-ac47-bc2b76bf8420" />
<img width="521" height="80" alt="ss2" src="https://github.com/user-attachments/assets/46950dbb-9a85-4738-a3eb-739530ebfa86" />
<img width="515" height="60" alt="ss3" src="https://github.com/user-attachments/assets/c8b04501-6b3e-4a79-a2db-cd74ca9fdc99" />
<img width="514" height="125" alt="ss4" src="https://github.com/user-attachments/assets/9f5a1f50-74a5-4579-9c0f-c9be5c92710c" />
<img width="515" height="103" alt="ss5" src="https://github.com/user-attachments/assets/b26cb681-c651-4dc5-ae1d-9e93d6fbbcc6" />



### Before posting your module

- [X] I've replaced all lines starting with ->
- [X] I've updated the unsupported cards above the description and under the `unsupported` property
- [X] I've added a screenshot
- [X] I've chosen a unique `your_module_key`
- [X] I really enjoyed working on this module ❤️