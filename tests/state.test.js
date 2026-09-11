import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/state.js';

describe('Gerenciamento de Estado da Aplicação (Store)', () => {
  let mockStorage;

  beforeEach(() => {
    const storeMap = new Map();
    mockStorage = {
      getItem: (key) => storeMap.get(key) || null,
      setItem: (key, val) => storeMap.set(key, String(val)),
      removeItem: (key) => storeMap.delete(key),
      clear: () => storeMap.clear()
    };
  });

  it('deve inicializar com estado padrão (sistema métrico e local inicial)', () => {
    const store = createStore({ storage: mockStorage });
    const state = store.getState();

    assert.strictEqual(state.units.temperature, 'celsius');
    assert.strictEqual(state.units.windSpeed, 'kmh');
    assert.strictEqual(state.units.precipitation, 'mm');
    assert.strictEqual(state.location.name, 'Berlin');
    assert.strictEqual(state.status, 'idle');
  });

  it('deve notificar ouvintes quando o estado for atualizado', () => {
    const store = createStore({ storage: mockStorage });
    let notified = false;
    let receivedState = null;

    const unsubscribe = store.subscribe((newState) => {
      notified = true;
      receivedState = newState;
    });

    store.setStatus('loading');

    assert.strictEqual(notified, true);
    assert.strictEqual(receivedState.status, 'loading');

    // Testar unsubscribe
    notified = false;
    unsubscribe();
    store.setStatus('success');
    assert.strictEqual(notified, false);
  });

  it('deve alternar todo o sistema de unidades para imperial e métrico', () => {
    const store = createStore({ storage: mockStorage });

    store.setSystem('imperial');
    let state = store.getState();
    assert.strictEqual(state.units.temperature, 'fahrenheit');
    assert.strictEqual(state.units.windSpeed, 'mph');
    assert.strictEqual(state.units.precipitation, 'in');

    store.setSystem('metric');
    state = store.getState();
    assert.strictEqual(state.units.temperature, 'celsius');
    assert.strictEqual(state.units.windSpeed, 'kmh');
    assert.strictEqual(state.units.precipitation, 'mm');
  });

  it('deve permitir alterar unidades individualmente', () => {
    const store = createStore({ storage: mockStorage });

    store.setUnit('temperature', 'fahrenheit');
    assert.strictEqual(store.getState().units.temperature, 'fahrenheit');
    assert.strictEqual(store.getState().units.windSpeed, 'kmh'); // não alterado

    store.setUnit('windSpeed', 'mph');
    assert.strictEqual(store.getState().units.windSpeed, 'mph');

    store.setUnit('precipitation', 'in');
    assert.strictEqual(store.getState().units.precipitation, 'in');
  });

  it('deve atualizar o dia selecionado para a previsão horária', () => {
    const store = createStore({ storage: mockStorage });

    store.setSelectedDay('2025-08-06');
    assert.strictEqual(store.getState().selectedDay, '2025-08-06');
  });

  it('deve persistir e carregar preferências de unidades do storage', () => {
    mockStorage.setItem('weather_app_units', JSON.stringify({
      temperature: 'fahrenheit',
      windSpeed: 'mph',
      precipitation: 'in'
    }));

    const store = createStore({ storage: mockStorage });
    const state = store.getState();

    assert.strictEqual(state.units.temperature, 'fahrenheit');
    assert.strictEqual(state.units.windSpeed, 'mph');
    assert.strictEqual(state.units.precipitation, 'in');
  });
});
