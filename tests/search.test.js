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
      const children = [];

      const el = {
        tagName: tag.toUpperCase(),
        innerHTML: '',
        textContent: '',
        value: '',
        id: '',
        children,
        get className() {
          return [...classes].join(' ');
        },
        set className(val) {
          classes.clear();
          if (val) val.split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
        },
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
        removeAttribute(k) { delete attrs[k]; },
        appendChild(child) {
          children.push(child);
          return child;
        },
        replaceChildren(...newChildren) {
          children.length = 0;
          for (const c of newChildren) {
            children.push(c);
          }
        },
        querySelectorAll(selector) {
          if (selector === '.suggestion-item') {
            if (children.length > 0) {
              return children.filter(c => c.classList.contains('suggestion-item'));
            }
            const matches = [...this.innerHTML.matchAll(/class="suggestion-item"[^>]*data-index="(\d+)"/g)];
            return matches.map(m => {
              const itemClasses = new Set(['suggestion-item']);
              return {
                id: `suggestion-${m[1]}`,
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

    if (typeof globalThis.document === 'undefined') {
      globalThis.document = {
        createElement: (tag) => createMockElement(tag),
        addEventListener: () => {}
      };
    } else if (!globalThis.document.createElement) {
      globalThis.document.createElement = (tag) => createMockElement(tag);
    }

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

    const items = mockElements.suggestions.querySelectorAll('.suggestion-item');
    assert.ok(items.length > 0);
    assert.strictEqual(items[0].textContent, 'London, United Kingdom');
  });

  it('deve renderizar sugestões como div role="option" com id único e sem botões nativos', async () => {
    const mockSearchFn = async () => [
      { id: 1, name: 'London', country: 'United Kingdom', latitude: 51.5, longitude: -0.12 },
      { id: 2, name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.41 }
    ];

    const controller = setupSearchController({
      inputEl: mockElements.input,
      formEl: mockElements.form,
      suggestionsEl: mockElements.suggestions,
      searchFn: mockSearchFn,
      onSelect: () => {}
    });

    await controller.handleSearchInput('Ber');
    const items = mockElements.suggestions.querySelectorAll('.suggestion-item');
    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].tagName, 'DIV');
    assert.strictEqual(items[0].getAttribute('role'), 'option');
    assert.strictEqual(items[0].id, 'suggestion-0');
    assert.strictEqual(items[1].id, 'suggestion-1');
  });

  it('deve escapar dados de API utilizando textContent contra injeção XSS', async () => {
    const maliciousName = '<img src=x onerror=alert(1)>';
    const mockSearchFn = async () => [
      { id: 1, name: maliciousName, country: 'Test', latitude: 0, longitude: 0 }
    ];

    const controller = setupSearchController({
      inputEl: mockElements.input,
      formEl: mockElements.form,
      suggestionsEl: mockElements.suggestions,
      searchFn: mockSearchFn,
      onSelect: () => {}
    });

    await controller.handleSearchInput('malicious');
    const items = mockElements.suggestions.querySelectorAll('.suggestion-item');
    assert.strictEqual(items[0].textContent, `${maliciousName}, Test`);
    // Não deve conter a tag img interpretada no innerHTML das sugestões
    assert.strictEqual(mockElements.suggestions.innerHTML.includes('<img src=x'), false);
  });

  it('deve atualizar aria-activedescendant no input durante a navegação por teclado', async () => {
    const mockSearchFn = async () => [
      { id: 1, name: 'City A', country: 'Country A', latitude: 1, longitude: 1 },
      { id: 2, name: 'City B', country: 'Country B', latitude: 2, longitude: 2 }
    ];

    const controller = setupSearchController({
      inputEl: mockElements.input,
      formEl: mockElements.form,
      suggestionsEl: mockElements.suggestions,
      searchFn: mockSearchFn,
      onSelect: () => {}
    });

    await controller.handleSearchInput('City');

    // Navega para o primeiro item
    mockElements.input.trigger('keydown', { key: 'ArrowDown' });
    assert.strictEqual(mockElements.input.getAttribute('aria-activedescendant'), 'suggestion-0');

    // Navega para o segundo item
    mockElements.input.trigger('keydown', { key: 'ArrowDown' });
    assert.strictEqual(mockElements.input.getAttribute('aria-activedescendant'), 'suggestion-1');

    // Fecha o menu com Escape
    mockElements.input.trigger('keydown', { key: 'Escape' });
    const activeDesc = mockElements.input.getAttribute('aria-activedescendant');
    assert.ok(!activeDesc || activeDesc === '');
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
