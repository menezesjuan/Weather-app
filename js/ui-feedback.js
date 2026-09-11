/**
 * Módulo de controle dos estados visuais de feedback (Carregamento, Erro de API e Sem Resultados).
 */

export function setupFeedbackViews(views, onRetry = () => {}) {
  const {
    loadingEl,
    errorEl,
    noResultsEl,
    contentEl,
    retryBtn
  } = views;

  function hideAll() {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    if (noResultsEl) noResultsEl.classList.add('hidden');
    if (contentEl) contentEl.classList.add('hidden');
  }

  function showLoading() {
    hideAll();
    if (loadingEl) loadingEl.classList.remove('hidden');
  }

  function showError() {
    hideAll();
    if (errorEl) errorEl.classList.remove('hidden');
  }

  function showNoResults() {
    hideAll();
    if (noResultsEl) noResultsEl.classList.remove('hidden');
  }

  function showContent() {
    hideAll();
    if (contentEl) contentEl.classList.remove('hidden');
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      onRetry();
    });
  }

  return {
    showLoading,
    showError,
    showNoResults,
    showContent
  };
}
