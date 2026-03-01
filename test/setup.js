// Disable custom element warnings in happy-dom if needed
import { LitElement, html, css, svg } from 'lit-element';

// Mock window.customCards
window.customCards = window.customCards || [];

// Mock ha-panel-lovelace so the card can extract LitElement from it
if (!customElements.get('ha-panel-lovelace')) {
    class MockLitElement extends LitElement {
        static get html() { return html; }
        static get css() { return css; }
        static get svg() { return svg; }
    }
    class MockHaPanelLovelace extends MockLitElement { }
    customElements.define('ha-panel-lovelace', MockHaPanelLovelace);
}

// Happy-dom supports custom elements, so the define should work.
