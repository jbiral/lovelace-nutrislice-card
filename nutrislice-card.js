import {
  LitElement,
  html,
  css,
  svg,
} from 'https://unpkg.com/lit-element@2.5.4/lit-element.js?module';

class NutrisliceCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _currentDate: { type: Object },
    };
  }

  constructor() {
    super();
    this._currentDate = new Date();
    if (this._currentDate.getHours() >= 13) {
      this._currentDate.setDate(this._currentDate.getDate() + 1);
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 5;
  }

  static getStubConfig() {
    return {
      entity: '',
      title: 'School Menu',
      categories: ['entree'],
    };
  }

  formatDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  _navigateDate(days) {
    const newDate = new Date(this._currentDate);
    newDate.setDate(newDate.getDate() + days);
    this._setSelectedDateStr(newDate);
  }

  _setSelectedDateStr(dateObj) {
    this._currentDate = new Date(dateObj);
  }

  _resetToToday() {
    this._currentDate = new Date();
    if (this._currentDate.getHours() >= 13) {
      this._currentDate.setDate(this._currentDate.getDate() + 1);
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const stateObj = this.hass.states[this.config.entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="state-msg">Entity ${this.config.entity} not found.</div>
        </ha-card>
      `;
    }

    const title = this.config.title || 'School Menu';
    const attributes = stateObj.attributes;

    return html`
      <ha-card>
        <div class="header">
          <div class="title">${title}</div>
          <ha-button class="today-btn" @click=${this._resetToToday}> Today </ha-button>
        </div>

        <div class="date-nav">
          <div class="nav-btn" @click=${() => this._navigateDate(-1)}>
            ${svg`<svg viewBox="0 0 24 24"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" /></svg>`}
          </div>
          <div class="date-display">${this.formatDate(this._currentDate)}</div>
          <div class="nav-btn" @click=${() => this._navigateDate(1)}>
            ${svg`<svg viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>`}
          </div>
        </div>

        <div class="menu-content">${this.renderMenuContent(attributes)}</div>
      </ha-card>
    `;
  }

  renderMenuContent(attributes) {
    const yyyy = this._currentDate.getFullYear();
    const mm = String(this._currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(this._currentDate.getDate()).padStart(2, '0');
    const targetDateStr = `${yyyy}-${mm}-${dd}`;

    if (!attributes || !attributes.days || !Array.isArray(attributes.days)) {
      return html`<div class="state-msg">Waiting for menu data... (Date: ${targetDateStr})</div>`;
    }

    const dayData = attributes.days.find((d) => d.date === targetDateStr);

    if (!dayData) {
      return html`<div class="state-msg">
        No data available for ${this.formatDate(this._currentDate)}.
      </div>`;
    }

    if (dayData.is_holiday) {
      return html`
        <div class="holiday-icon">
          ${svg`<svg viewBox="0 0 24 24" style="width: 48px; height: 48px; fill: var(--primary-color);">
             <path d="M9.46,15.11C9.65,15.35 10.03,15.35 10.21,15.1C10.74,14.36 11.53,13.88 12.43,13.78C13.25,13.68 14.15,13.96 14.85,14.61C15.06,14.8 15.37,14.77 15.54,14.54C15.7,14.32 15.66,14.02 15.45,13.85C14.71,13.15 13.84,12.7 12.92,12.63L11.75,9.25L9.67,11.34L9.46,15.11M8.03,16.5C7.96,16.5 7.89,16.47 7.83,16.41C7.65,16.21 7.66,15.9 7.86,15.71C8.75,14.77 9.85,14.24 10.95,14.28C11.23,14.29 11.45,14.53 11.44,14.81C11.43,15.08 11.2,15.3 10.92,15.28C10,15.25 9.17,15.67 8.53,16.34C8.38,16.46 8.2,16.5 8.03,16.5M10.7,12.5C10.45,12.5 10.22,12.42 10,12.28C9.55,11.96 9.44,11.69 9.38,11.42C9.3,11.12 9.29,10.74 9.47,10.23L9.58,9.92L11,8.5L10.7,12.5M16,6L13.21,8.79C13,8.4 12.63,8.12 12.18,8L15.3,4.9C15.53,4.67 15.91,4.67 16.14,4.9L19.5,8.27C19.74,8.5 19.74,8.88 19.5,9.11L18,10.61L16,6M4.5,16.14C4.26,16.37 3.88,16.37 3.65,16.14L3.14,15.63C2.9,15.4 2.9,15.03 3.14,14.8L4.64,13.3L6,14.64L4.5,16.14M6.79,12.77C6.56,13 6.18,13 5.95,12.77L5.45,12.26C5.22,12.03 5.22,11.65 5.45,11.41L6.95,9.91L8.29,11.27L6.79,12.77M3.56,12.44C3.33,12.67 2.95,12.67 2.72,12.44L2.21,11.93C1.97,11.7 1.97,11.32 2.21,11.08L3.71,9.58L5.06,10.94L3.56,12.44M6.5,8.22C6.27,8.45 5.89,8.45 5.66,8.22L5.15,7.71C4.92,7.47 4.92,7.1 5.15,6.86L6.65,5.36L8,6.72L6.5,8.22Z" />
          </svg>`}
        </div>
        <div class="holiday-msg">${dayData.holiday_name}</div>
        <div class="state-msg" style="padding-top:0;">No school meal service today.</div>
      `;
    }

    const localDate = new Date(yyyy, parseInt(mm) - 1, parseInt(dd), 12, 0, 0);
    const dayOfWeek = localDate.getDay();

    if (!dayData.has_menu && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return html`<div class="state-msg">Weekend - No menu available.</div>`;
    }

    if (!dayData.has_menu || !dayData.menu_items || dayData.menu_items.length === 0) {
      return html`<div class="state-msg">
        No menu listed for ${this.formatDate(this._currentDate)}.
      </div>`;
    }

    let itemsToShow = dayData.menu_items || [];
    const sensorCategories = attributes.categories || [];
    const allowedCategories =
      this.config.categories || (sensorCategories.length > 0 ? sensorCategories : ['entree']);

    if (allowedCategories.length > 0) {
      const lowerAllowed = allowedCategories.map((c) => c.toLowerCase());
      const sidesAlias = ['vegetable', 'fruit', 'grain', 'side'];
      const hasSides = lowerAllowed.some((a) => a === 'sides' || a === 'side');

      itemsToShow = itemsToShow.filter((item) => {
        const itemCat = (item.category || '').toLowerCase();
        const matchesDirectly = lowerAllowed.some(
          (allowed) => itemCat.includes(allowed) || allowed.includes(itemCat),
        );
        const matchesSidesAlias =
          hasSides &&
          sidesAlias.some((alias) => itemCat.includes(alias) || alias.includes(itemCat));

        return matchesDirectly || matchesSidesAlias;
      });
    }

    if (itemsToShow.length === 0) {
      return html`<div class="state-msg">
        No items found matching the selected categories for ${this.formatDate(this._currentDate)}.
      </div>`;
    }

    return html`
      ${itemsToShow.map(
      (item) => html`
          <div class="menu-item">
            <div class="item-text">
              <div class="category-label">${item.category}</div>
              <div class="item-name">${item.name}</div>
            </div>
          </div>
        `,
    )}
    `;
  }

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .title {
        font-size: 20px;
        font-weight: 500;
      }
      .date-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 4px;
        margin-bottom: 16px;
      }
      .nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .nav-btn:hover {
        background-color: var(--secondary-background-color);
      }
      .nav-btn svg {
        width: 24px;
        height: 24px;
        fill: var(--primary-text-color);
      }
      .date-display {
        font-weight: 500;
        font-size: 16px;
        color: var(--primary-text-color);
      }
      .menu-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
      }
      .menu-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      .item-text {
        flex: 1;
      }
      .item-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
      .item-desc {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .item-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        object-fit: cover;
        margin-left: 12px;
        background: var(--secondary-background-color);
      }
      .category-label {
        display: inline-block;
        font-size: 10px;
        text-transform: uppercase;
        background: var(--primary-color);
        color: var(--text-primary-color);
        padding: 2px 6px;
        border-radius: 4px;
        margin-bottom: 4px;
      }
      .state-msg {
        text-align: center;
        padding: 24px 0;
        color: var(--secondary-text-color);
        font-style: italic;
      }
      .holiday-msg {
        text-align: center;
        padding: 24px 0;
        color: var(--primary-color);
        font-weight: 500;
        font-size: 18px;
      }
      .holiday-icon {
        display: block;
        margin: 0 auto 12px auto;
        --mdc-icon-size: 48px;
      }
    `;
  }
}

if (!customElements.get('nutrislice-card')) {
  customElements.define('nutrislice-card', NutrisliceCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nutrislice-card',
  name: 'Nutrislice Menu Card',
  preview: true,
  description: 'A card to display school lunch menus from the Nutrislice integration.',
});
