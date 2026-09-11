import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Ambiente de Testes Nativo (Vanilla JS)', () => {
  it('deve executar asserções com sucesso sem dependências externas', () => {
    const status = 'ready';
    assert.strictEqual(status, 'ready');
  });

  it('deve suportar operações assíncronas nativas', async () => {
    const valor = await Promise.resolve(42);
    assert.strictEqual(valor, 42);
  });
});
