import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupSearchController } from '../js/ui-search.js';

describe('Componente de Busca e Autocomplete (Search)', () => {
  let mockElements;
  let selectedCity;

  beforeEach(() => {
    selectedCity = null;

    const createMockElement = (tag) => {
      const classes = new Set();
      const listeners = {};
      const attrs = {};

      const el = {
        tagName: tag.toUpperCase(),
        innerHTML: '',
        value: '',
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          contains: (c) => classes.has(c)
        },
        addEventListener(event, fn) {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(fn);
        },
        trigger(event, payload = {}) {
          const fns = listeners[event] || [];
          for (const fn of fns) fn({ ...payload, target: el, preventDefault() {} });
        },
        setAttribute(k, v) { attrs[k] = String(v); },
        getAttribute(k) { return attrs[k] !== undefined ? attrs[k] : null; },
        querySelectorAll(selector) {
          if (selector === '.suggestion-item') {
            const matches = [...this.innerHTML.matchAll(/class="suggestion-item"[^>]*data-index="(\d+)"/g)];
            return matches.map(m => {
              const itemClasses = new Set(['suggestion-item']);
              return {
                getAttribute: (attr) => attr === 'data-index' ? m[1] : null,
                setAttribute: () => {},
                classList: {
                  add: (c) => itemClasses.add(c),
                  remove: (c) => itemClasses.delete(c)
                },
                scrollIntoView: () => {},
                addEventListener: () => {}
              };
            });
          }
          return [];
        },
        contains() { return true; }
      };
      return el;
    };

    mockElements = {
      input: createMockElement('input'),
      form: createMockElement('form'),
      suggestions: createMockElement('div')
    };
  });

  it('deve renderizar estado de progresso durante a busca', async () => {
    let resolveSearch;
    const mockSearchFn = () => new Promise((resolve) => { resolveSearch = resolve; });

    const controller = setupSearchController({
      inputEl: mockElements.input,
      formEl: mockElements.form,
      suggestionsEl: mockElements.suggestions,
      searchFn: mockSearchFn,
      onSelect: (city) => { selectedCity = city; }
    });

    const searchPromise = controller.handleSearchInput('London');
    assert.ok(mockElements.suggestions.innerHTML.includes('Search in progress'));

    resolveSearch([
      { id: 1, name: 'London', country: 'United Kingdom', latitude: 51.5, longitude: -0.12 }
    ]);
    await searchPromise;

    assert.ok(mockElements.suggestions.innerHTML.includes('London, United Kingdom'));
  });

  it('deve chamar callback onSelect ao escolher uma sugestão', async () => {
    const mockSearchFn = async () => [
      { id: 1, name: 'Tokyo', country: 'Japan', latitude: 35.68, longitude: 139.76 }
    ];

    const controller = setupSearchController({
      inputEl: mockElements.input,
      formEl: mockElements.form,
      suggestionsEl: mockElements.suggestions,
      searchFn: mockSearchFn,
      onSelect: (city) => { selectedCity = city; }
    });

    await controller.handleSearchInput('Tokyo');
    controller.selectItem(0);

    assert.ok(selectedCity);
    assert.strictEqual(selectedCity.name, 'Tokyo');
    assert.strictEqual(mockElements.input.value, 'Tokyo, Japan');
  });

  it('deve fechar as sugestões ao pressionar Escape', async () => {
    const mockSearchFn = async () => [
      { id: 1, name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 }
    ];

    const controller = setupSearchController({
      inputEl: mockElements.input,
      formEl: mockElements.form,
      suggestionsEl: mockElements.suggestions,
      searchFn: mockSearchFn,
      onSelect: () => {}
    });

    await controller.handleSearchInput('Paris');
    assert.strictEqual(controller.isOpen(), true);

    controller.closeSuggestions();
    assert.strictEqual(controller.isOpen(), false);
  });
});
