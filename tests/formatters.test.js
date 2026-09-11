import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDate,
  formatDayOfWeek,
  formatHour,
  formatIsoDate
} from '../js/formatters.js';

describe('Formatadores de Data e Hora', () => {
  it('deve formatar data completa no padrão do design: Tuesday, Aug 5, 2025', () => {
    // 2025-08-05 é uma terça-feira
    const formatted = formatDate('2025-08-05T12:00:00Z');
    assert.strictEqual(formatted, 'Tuesday, Aug 5, 2025');
  });

  it('deve formatar o dia da semana por extenso', () => {
    assert.strictEqual(formatDayOfWeek('2025-08-05T12:00:00Z'), 'Tuesday');
    assert.strictEqual(formatDayOfWeek('2025-08-06T12:00:00Z'), 'Wednesday');
  });

  it('deve formatar o dia da semana abreviado para 3 letras', () => {
    assert.strictEqual(formatDayOfWeek('2025-08-05T12:00:00Z', true), 'Tue');
    assert.strictEqual(formatDayOfWeek('2025-08-06T12:00:00Z', true), 'Wed');
    assert.strictEqual(formatDayOfWeek('2025-08-07T12:00:00Z', true), 'Thu');
    assert.strictEqual(formatDayOfWeek('2025-08-08T12:00:00Z', true), 'Fri');
    assert.strictEqual(formatDayOfWeek('2025-08-09T12:00:00Z', true), 'Sat');
    assert.strictEqual(formatDayOfWeek('2025-08-10T12:00:00Z', true), 'Sun');
    assert.strictEqual(formatDayOfWeek('2025-08-11T12:00:00Z', true), 'Mon');
  });

  it('deve formatar a hora no formato de 12 horas: 3 PM, 12 AM, 12 PM', () => {
    assert.strictEqual(formatHour('2025-08-05T15:00'), '3 PM');
    assert.strictEqual(formatHour('2025-08-05T00:00'), '12 AM');
    assert.strictEqual(formatHour('2025-08-05T12:00'), '12 PM');
    assert.strictEqual(formatHour('2025-08-05T09:00'), '9 AM');
  });

  it('deve extrair a data ISO YYYY-MM-DD', () => {
    assert.strictEqual(formatIsoDate('2025-08-05T15:00:00Z'), '2025-08-05');
  });
});
