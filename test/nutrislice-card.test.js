import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// We import the source un-compiled, the vitest config aliases the unpkg URL.
import '../src/nutrislice-card.js';

describe('NutrisliceCard', () => {
    let element;

    beforeEach(() => {
        element = document.createElement('nutrislice-card');
        document.body.appendChild(element);

        // Mock Hass and Config
        element.setConfig({
            entity: 'sensor.nutrislice_school_lunch',
            title: 'School Menu',
            categories: ['entree']
        });

        element.hass = {
            states: {
                'sensor.nutrislice_school_lunch': {
                    attributes: {
                        days: []
                    }
                }
            },
            callService: vi.fn()
        };
    });

    afterEach(() => {
        document.body.removeChild(element);
        vi.restoreAllMocks();
    });

    it('initializes to today if before 1 PM', () => {
        // Mock Date strictly to 10:00 AM
        const dateMock = new Date(2023, 10, 15, 10, 0, 0); // Nov 15th 2023
        vi.setSystemTime(dateMock);

        const card = document.createElement('nutrislice-card');
        expect(card._currentDate.toDateString()).toBe(dateMock.toDateString());

        vi.useRealTimers();
    });

    it('initializes to tomorrow if after 1 PM', () => {
        // Mock Date strictly to 1:30 PM (13:30)
        const dateMock = new Date(2023, 10, 15, 13, 30, 0); // Nov 15th 2023
        const tomorrow = new Date(2023, 10, 16, 13, 30, 0);
        vi.setSystemTime(dateMock);

        const card = document.createElement('nutrislice-card');
        expect(card._currentDate.toDateString()).toBe(tomorrow.toDateString());

        vi.useRealTimers();
    });

    it('navigates to previous and next days internally without calling HA services', async () => {
        const originalDate = new Date(element._currentDate);

        // Navigate previous
        element._navigateDate(-1);

        const expectedPrev = new Date(originalDate);
        expectedPrev.setDate(expectedPrev.getDate() - 1);

        expect(element._currentDate.toDateString()).toBe(expectedPrev.toDateString());
        expect(element.hass.callService).not.toHaveBeenCalled();

        // Navigate next twice
        element._navigateDate(1);
        element._navigateDate(1);

        const expectedNext = new Date(originalDate);
        expectedNext.setDate(expectedNext.getDate() + 1);

        expect(element._currentDate.toDateString()).toBe(expectedNext.toDateString());
    });

    it('_resetToToday correctly handles 1 PM rule', () => {
        // Navigate away first
        element._navigateDate(5);

        const dateMock = new Date(2023, 10, 15, 10, 0, 0); // 10 AM -> Today
        vi.setSystemTime(dateMock);
        element._resetToToday();
        expect(element._currentDate.toDateString()).toBe(dateMock.toDateString());

        const lateMock = new Date(2023, 10, 15, 14, 0, 0); // 2 PM -> Tomorrow
        const tomorrow = new Date(2023, 10, 16, 14, 0, 0);
        vi.setSystemTime(lateMock);
        element._resetToToday();
        expect(element._currentDate.toDateString()).toBe(tomorrow.toDateString());

        vi.useRealTimers();
    });

    it('renders menu content correctly based on the internal date and filters categories', async () => {
        // Mock time to 10 AM to ensure it targets today
        const dateMock = new Date(2023, 10, 15, 10, 0, 0); // Nov 15th 2023
        vi.setSystemTime(dateMock);

        // Remount element so the constructor uses the mocked time
        document.body.removeChild(element);
        element = document.createElement('nutrislice-card');
        document.body.appendChild(element);
        element.setConfig({
            entity: 'sensor.nutrislice_school_lunch',
            title: 'School Menu',
            categories: ['entree']
        });
        element.hass = {
            states: {
                'sensor.nutrislice_school_lunch': {
                    attributes: { days: [] }
                }
            },
            callService: vi.fn()
        };

        const yyyy = dateMock.getFullYear();
        const mm = String(dateMock.getMonth() + 1).padStart(2, '0');
        const dd = String(dateMock.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        // Assign mock data with specific items
        element.hass.states['sensor.nutrislice_school_lunch'].attributes.days = [
            {
                date: todayStr,
                has_menu: true,
                is_holiday: false,
                menu_items: [
                    { name: 'Pizza', category: 'Entree' },
                    { name: 'Apple', category: 'Side' },
                    { name: 'Milk', category: 'Drink' }
                ]
            }
        ];

        // Force a render cycle
        await element.updateComplete;

        // Default categories are ['entree']. The card also has hardcoded alias handling for 'side', etc.
        // It should render 'Pizza' but not 'Milk'.
        const renderedText = element.shadowRoot.innerHTML;
        // We expect Pizza to be present
        expect(renderedText).toContain('Pizza');
        // We expect Milk NOT to be present based on the alias logic which is for "sides / fruit / grain"
        // Wait, the default is `allowedCategories = this.config.categories`. `categories: ['entree']`
        // Milk won't match 'entree'.
        expect(renderedText).not.toContain('Milk');

        vi.useRealTimers();
    });
});
