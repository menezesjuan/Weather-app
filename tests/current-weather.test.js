import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { renderCurrentWeather } from '../js/ui-weather.js';

describe('Renderização do Clima Atual e Métricas (Current Weather)', () => {
  let mockElements;

  beforeEach(() => {
    mockElements = {
      locationName: { textContent: '' },
      dateText: { textContent: '' },
      icon: { src: '', alt: '' },
      temp: { textContent: '' },
      feelsLike: { textContent: '' },
      humidity: { textContent: '' },
      wind: { textContent: '' },
      precipitation: { textContent: '' }
    };
  });

  it('deve renderizar os dados do clima atual em unidades métricas', () => {
    const state = {
      location: { name: 'Berlin', country: 'Germany' },
      units: {
        temperature: 'celsius',
        windSpeed: 'kmh',
        precipitation: 'mm'
      },
      weatherData: {
        current: {
          time: '2025-08-05T15:00',
          temperature: 20.2,
          apparentTemperature: 18.4,
          humidity: 46,
          windSpeed: 14.1,
          precipitation: 0.0,
          weatherCode: 0
        }
      }
    };

    renderCurrentWeather(mockElements, state);

    assert.strictEqual(mockElements.locationName.textContent, 'Berlin, Germany');
    assert.strictEqual(mockElements.dateText.textContent, 'Tuesday, Aug 5, 2025');
    assert.strictEqual(mockElements.temp.textContent, '20°');
    assert.strictEqual(mockElements.feelsLike.textContent, '18°');
    assert.strictEqual(mockElements.humidity.textContent, '46%');
    assert.strictEqual(mockElements.wind.textContent, '14 km/h');
    assert.strictEqual(mockElements.precipitation.textContent, '0 mm');
    assert.strictEqual(mockElements.icon.alt, 'Sunny');
  });

  it('deve converter e renderizar os dados em unidades imperiais', () => {
    const state = {
      location: { name: 'New York', country: 'United States' },
      units: {
        temperature: 'fahrenheit',
        windSpeed: 'mph',
        precipitation: 'in'
      },
      weatherData: {
        current: {
          time: '2025-08-05T15:00',
          temperature: 20.0, // 68°F
          apparentTemperature: 18.0, // ~64°F
          humidity: 50,
          windSpeed: 14.0, // 9 mph
          precipitation: 25.4, // 1 in
          weatherCode: 0
        }
      }
    };

    renderCurrentWeather(mockElements, state);

    assert.strictEqual(mockElements.temp.textContent, '68°');
    assert.strictEqual(mockElements.feelsLike.textContent, '64°');
    assert.strictEqual(mockElements.humidity.textContent, '50%');
    assert.strictEqual(mockElements.wind.textContent, '9 mph');
    assert.strictEqual(mockElements.precipitation.textContent, '1 in');
  });
});
