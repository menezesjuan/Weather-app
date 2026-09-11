import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupFeedbackViews } from '../js/ui-feedback.js';

describe('Estados de Feedback Visual (Loading, Error, No Results)', () => {
  let mockViews;
  let retryCalls;

  beforeEach(() => {
    retryCalls = 0;
    const createView = () => {
      const classes = new Set(['hidden']);
      const listeners = {};
      return {
        classList: {
          add: (c) => classes.add(c),
          remove: (c) => classes.delete(c),
          contains: (c) => classes.has(c)
        },
        addEventListener(evt, fn) {
          if (!listeners[evt]) listeners[evt] = [];
          listeners[evt].push(fn);
        },
        trigger(evt) {
          const fns = listeners[evt] || [];
          for (const fn of fns) fn({ preventDefault() {} });
        }
      };
    };

    mockViews = {
      loadingEl: createView(),
      errorEl: createView(),
      noResultsEl: createView(),
      contentEl: createView(),
      retryBtn: createView()
    };
  });

  it('deve exibir apenas o estado de carregamento e ocultar os demais', () => {
    const manager = setupFeedbackViews(mockViews, () => { retryCalls++; });
    manager.showLoading();

    assert.strictEqual(mockViews.loadingEl.classList.contains('hidden'), false);
    assert.strictEqual(mockViews.contentEl.classList.contains('hidden'), true);
    assert.strictEqual(mockViews.errorEl.classList.contains('hidden'), true);
    assert.strictEqual(mockViews.noResultsEl.classList.contains('hidden'), true);
  });

  it('deve exibir o estado de erro e ocultar carregamento e conteúdo', () => {
    const manager = setupFeedbackViews(mockViews, () => { retryCalls++; });
    manager.showError();

    assert.strictEqual(mockViews.errorEl.classList.contains('hidden'), false);
    assert.strictEqual(mockViews.loadingEl.classList.contains('hidden'), true);
    assert.strictEqual(mockViews.contentEl.classList.contains('hidden'), true);
    assert.strictEqual(mockViews.noResultsEl.classList.contains('hidden'), true);
  });

  it('deve exibir o estado sem resultados', () => {
    const manager = setupFeedbackViews(mockViews, () => { retryCalls++; });
    manager.showNoResults();

    assert.strictEqual(mockViews.noResultsEl.classList.contains('hidden'), false);
    assert.strictEqual(mockViews.contentEl.classList.contains('hidden'), true);
    assert.strictEqual(mockViews.loadingEl.classList.contains('hidden'), true);
  });

  it('deve acionar o callback de reload ao clicar no botão Retry', () => {
    setupFeedbackViews(mockViews, () => { retryCalls++; });
    mockViews.retryBtn.trigger('click');

    assert.strictEqual(retryCalls, 1);
  });
});
