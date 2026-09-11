import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  kmhToMph,
  mphToKmh,
  mmToInches,
  inchesToMm,
  formatTemperature,
  formatWindSpeed,
  formatPrecipitation
} from '../js/conversions.js';

describe('Conversões de Unidades de Temperatura', () => {
  it('deve converter Celsius para Fahrenheit corretamente', () => {
    assert.strictEqual(celsiusToFahrenheit(0), 32);
    assert.strictEqual(celsiusToFahrenheit(20), 68);
    assert.strictEqual(celsiusToFahrenheit(-10), 14);
    assert.strictEqual(celsiusToFahrenheit(100), 212);
  });

  it('deve converter Fahrenheit para Celsius corretamente', () => {
    assert.strictEqual(fahrenheitToCelsius(32), 0);
    assert.strictEqual(fahrenheitToCelsius(68), 20);
    assert.strictEqual(fahrenheitToCelsius(14), -10);
  });

  it('deve formatar temperatura com o símbolo de grau', () => {
    assert.strictEqual(formatTemperature(20.4), '20°');
    assert.strictEqual(formatTemperature(20.6), '21°');
    assert.strictEqual(formatTemperature(-0.2), '0°');
  });
});

describe('Conversões de Unidades de Vento', () => {
  it('deve converter km/h para mph com arredondamento preciso', () => {
    assert.strictEqual(kmhToMph(14), 9);
    assert.strictEqual(kmhToMph(0), 0);
    assert.strictEqual(kmhToMph(100), 62);
  });

  it('deve converter mph para km/h', () => {
    assert.strictEqual(mphToKmh(9), 14);
    assert.strictEqual(mphToKmh(0), 0);
  });

  it('deve formatar velocidade do vento com a unidade correspondente', () => {
    assert.strictEqual(formatWindSpeed(14, 'kmh'), '14 km/h');
    assert.strictEqual(formatWindSpeed(9, 'mph'), '9 mph');
  });
});

describe('Conversões de Unidades de Precipitação', () => {
  it('deve converter mm para polegadas', () => {
    assert.strictEqual(mmToInches(0), 0);
    assert.strictEqual(mmToInches(25.4), 1);
    assert.strictEqual(mmToInches(5.08), 0.2);
  });

  it('deve converter polegadas para mm', () => {
    assert.strictEqual(inchesToMm(0), 0);
    assert.strictEqual(inchesToMm(1), 25.4);
  });

  it('deve formatar precipitação com a unidade correta', () => {
    assert.strictEqual(formatPrecipitation(0, 'mm'), '0 mm');
    assert.strictEqual(formatPrecipitation(12, 'mm'), '12 mm');
    assert.strictEqual(formatPrecipitation(0.5, 'in'), '0.5 in');
  });
});
