import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupUnitsDropdown } from '../js/ui-units.js';
import { createStore } from '../js/state.js';

describe('Menu de Unidades e Alternância Métrico/Imperial (Units Dropdown)', () => {
  let mockButton;
  let mockMenu;
  let mockSystemBtn;
  let mockUnitOptions;
  let store;

  beforeEach(() => {
    store = createStore({ storage: null });

    const classes = (initial = []) => {
      const set = new Set(initial);
      return {
        add: (c) => set.add(c),
        remove: (c) => set.delete(c),
        contains: (c) => set.has(c)
      };
    };

    const listeners = {};
    const createEl = (initClasses = []) => {
      const attrs = {};
      return {
        classList: classes(initClasses),
        textContent: '',
        setAttribute: (k, v) => { attrs[k] = String(v); },
        getAttribute: (k) => attrs[k] !== undefined ? attrs[k] : null,
        addEventListener: (evt, fn) => {
          if (!listeners[evt]) listeners[evt] = [];
          listeners[evt].push(fn);
        },
        trigger: (evt, payload = {}) => {
          const fns = listeners[evt] || [];
          for (const fn of fns) fn({ ...payload, preventDefault() {}, stopPropagation() {} });
        },
        contains: () => true
      };
    };

    mockButton = createEl();
    mockMenu = createEl(['hidden']);
    mockSystemBtn = createEl();

    mockUnitOptions = [
      { ...createEl(), getAttribute: (k) => ({ 'data-category': 'temperature', 'data-value': 'celsius' })[k] },
      { ...createEl(), getAttribute: (k) => ({ 'data-category': 'temperature', 'data-value': 'fahrenheit' })[k] },
      { ...createEl(), getAttribute: (k) => ({ 'data-category': 'windSpeed', 'data-value': 'kmh' })[k] },
      { ...createEl(), getAttribute: (k) => ({ 'data-category': 'windSpeed', 'data-value': 'mph' })[k] },
      { ...createEl(), getAttribute: (k) => ({ 'data-category': 'precipitation', 'data-value': 'mm' })[k] },
      { ...createEl(), getAttribute: (k) => ({ 'data-category': 'precipitation', 'data-value': 'in' })[k] }
    ];
  });

  it('deve alternar a visibilidade do menu ao clicar no botão de unidades', () => {
    const controller = setupUnitsDropdown({
      buttonEl: mockButton,
      menuEl: mockMenu,
      systemToggleBtn: mockSystemBtn,
      unitOptions: mockUnitOptions,
      store
    });

    assert.strictEqual(controller.isOpen(), false);
    controller.toggleMenu();
    assert.strictEqual(controller.isOpen(), true);
    controller.toggleMenu();
    assert.strictEqual(controller.isOpen(), false);
  });

  it('deve alternar o sistema completo para Imperial ao disparar o toggle global', () => {
    const controller = setupUnitsDropdown({
      buttonEl: mockButton,
      menuEl: mockMenu,
      systemToggleBtn: mockSystemBtn,
      unitOptions: mockUnitOptions,
      store
    });

    controller.handleSystemToggle();

    const state = store.getState();
    assert.strictEqual(state.units.temperature, 'fahrenheit');
    assert.strictEqual(state.units.windSpeed, 'mph');
    assert.strictEqual(state.units.precipitation, 'in');
    assert.strictEqual(mockSystemBtn.textContent, 'Switch to Metric');
  });

  it('deve atualizar a unidade individualmente quando selecionada', () => {
    const controller = setupUnitsDropdown({
      buttonEl: mockButton,
      menuEl: mockMenu,
      systemToggleBtn: mockSystemBtn,
      unitOptions: mockUnitOptions,
      store
    });

    controller.selectUnit('temperature', 'fahrenheit');
    assert.strictEqual(store.getState().units.temperature, 'fahrenheit');
    // As outras devem permanecer métricas
    assert.strictEqual(store.getState().units.windSpeed, 'kmh');
  });
});
