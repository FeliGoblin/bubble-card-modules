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
