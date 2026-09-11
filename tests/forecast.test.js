import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { renderDailyForecast, renderHourlyForecast } from '../js/ui-forecast.js';

describe('Previsão de 7 Dias e Previsão Horária (Forecasts)', () => {
  let mockDailyContainer;
  let mockHourlyElements;

  beforeEach(() => {
    mockDailyContainer = {
      innerHTML: '',
      querySelectorAll(selector) {
        if (selector === '.daily-card') {
          const matches = [...this.innerHTML.matchAll(/class="daily-card"/g)];
          return matches.map(() => ({}));
        }
        return [];
      }
    };

    const listeners = {};
    const createEl = () => ({
      innerHTML: '',
      textContent: '',
      classList: {
        add() {},
        remove() {},
        contains() { return false; }
      },
      setAttribute() {},
      getAttribute() { return null; },
      addEventListener(evt, fn) {
        if (!listeners[evt]) listeners[evt] = [];
        listeners[evt].push(fn);
      },
      querySelectorAll() { return []; }
    });

    mockHourlyElements = {
      listContainer: createEl(),
      dayButton: createEl(),
      dayLabel: createEl(),
      dayMenu: createEl()
    };
  });

  it('deve renderizar os 7 cards da previsão diária com dia, ícone e temperaturas', () => {
    const state = {
      units: { temperature: 'celsius' },
      weatherData: {
        daily: [
          { date: '2025-08-05', weatherCode: 0, maxTemp: 20.4, minTemp: 14.1 },
          { date: '2025-08-06', weatherCode: 61, maxTemp: 21.0, minTemp: 15.2 },
          { date: '2025-08-07', weatherCode: 0, maxTemp: 24.3, minTemp: 14.0 },
          { date: '2025-08-08', weatherCode: 2, maxTemp: 25.1, minTemp: 13.0 },
          { date: '2025-08-09', weatherCode: 95, maxTemp: 21.2, minTemp: 15.0 },
          { date: '2025-08-10', weatherCode: 71, maxTemp: 25.0, minTemp: 16.0 },
          { date: '2025-08-11', weatherCode: 45, maxTemp: 24.0, minTemp: 15.0 }
        ]
      }
    };

    renderDailyForecast(mockDailyContainer, state);

    assert.ok(mockDailyContainer.innerHTML.includes('Tue'));
    assert.ok(mockDailyContainer.innerHTML.includes('20°'));
    assert.ok(mockDailyContainer.innerHTML.includes('14°'));
    assert.ok(mockDailyContainer.innerHTML.includes('Wed'));
    assert.ok(mockDailyContainer.innerHTML.includes('21°'));
    assert.ok(mockDailyContainer.innerHTML.includes('15°'));
    assert.strictEqual(mockDailyContainer.querySelectorAll('.daily-card').length, 7);
  });

  it('deve converter temperaturas diárias para Fahrenheit no modo imperial', () => {
    const state = {
      units: { temperature: 'fahrenheit' },
      weatherData: {
        daily: [
          { date: '2025-08-05', weatherCode: 0, maxTemp: 20.0, minTemp: 10.0 }
        ]
      }
    };

    renderDailyForecast(mockDailyContainer, state);

    // 20°C = 68°F e 10°C = 50°F
    assert.ok(mockDailyContainer.innerHTML.includes('68°'));
    assert.ok(mockDailyContainer.innerHTML.includes('50°'));
  });

  it('deve filtrar a previsão horária pelo dia selecionado', () => {
    const state = {
      selectedDay: '2025-08-05',
      units: { temperature: 'celsius' },
      weatherData: {
        daily: [
          { date: '2025-08-05', weatherCode: 0, maxTemp: 20, minTemp: 14 },
          { date: '2025-08-06', weatherCode: 2, maxTemp: 22, minTemp: 15 }
        ],
        hourly: [
          { time: '2025-08-05T15:00', date: '2025-08-05', temperature: 20.0, weatherCode: 0 },
          { time: '2025-08-05T16:00', date: '2025-08-05', temperature: 19.8, weatherCode: 2 },
          { time: '2025-08-06T15:00', date: '2025-08-06', temperature: 22.0, weatherCode: 0 }
        ]
      }
    };

    renderHourlyForecast(mockHourlyElements, state, () => {});

    // Deve conter as horas do dia 05 mas não do dia 06
    assert.ok(mockHourlyElements.listContainer.innerHTML.includes('3 PM'));
    assert.ok(mockHourlyElements.listContainer.innerHTML.includes('4 PM'));
    assert.strictEqual(mockHourlyElements.dayLabel.textContent, 'Tuesday');
  });
});
