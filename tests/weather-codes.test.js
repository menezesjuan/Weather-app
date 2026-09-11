import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getWeatherInfo } from '../js/weather-codes.js';

describe('Mapeamento de Códigos WMO de Clima', () => {
  it('deve mapear código 0 para Sunny', () => {
    const info = getWeatherInfo(0);
    assert.strictEqual(info.description, 'Sunny');
    assert.strictEqual(info.icon, 'assets/images/icon-sunny.webp');
  });

  it('deve mapear código 2 para Partly Cloudy', () => {
    const info = getWeatherInfo(2);
    assert.strictEqual(info.description, 'Partly cloudy');
    assert.strictEqual(info.icon, 'assets/images/icon-partly-cloudy.webp');
  });

  it('deve mapear código 3 para Overcast', () => {
    const info = getWeatherInfo(3);
    assert.strictEqual(info.description, 'Overcast');
    assert.strictEqual(info.icon, 'assets/images/icon-overcast.webp');
  });

  it('deve mapear códigos 45 e 48 para Fog', () => {
    assert.strictEqual(getWeatherInfo(45).icon, 'assets/images/icon-fog.webp');
    assert.strictEqual(getWeatherInfo(48).icon, 'assets/images/icon-fog.webp');
  });

  it('deve mapear códigos de garoa (51, 53, 55) para Drizzle', () => {
    const info = getWeatherInfo(51);
    assert.strictEqual(info.description, 'Light drizzle');
    assert.strictEqual(info.icon, 'assets/images/icon-drizzle.webp');
  });

  it('deve mapear chuva (61, 63, 65, 80, 81) para Rain', () => {
    assert.strictEqual(getWeatherInfo(61).icon, 'assets/images/icon-rain.webp');
    assert.strictEqual(getWeatherInfo(80).icon, 'assets/images/icon-rain.webp');
  });

  it('deve mapear neve (71, 73, 75, 85) para Snow', () => {
    assert.strictEqual(getWeatherInfo(71).icon, 'assets/images/icon-snow.webp');
    assert.strictEqual(getWeatherInfo(75).icon, 'assets/images/icon-snow.webp');
  });

  it('deve mapear tempestades (95, 96, 99) para Thunderstorm', () => {
    const info = getWeatherInfo(95);
    assert.strictEqual(info.description, 'Thunderstorm');
    assert.strictEqual(info.icon, 'assets/images/icon-storm.webp');
  });

  it('deve ter fallback seguro para códigos desconhecidos', () => {
    const info = getWeatherInfo(999);
    assert.ok(info.description);
    assert.ok(info.icon);
  });
});
