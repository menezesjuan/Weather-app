/**
 * Controlador da barra de pesquisa e do dropdown de autocomplete com feedback de status.
 * Em conformidade com o padrão WAI-ARIA 1.2 Combobox.
 */

import { searchCities } from './api.js';

export function setupSearchController({
  inputEl,
  formEl,
  suggestionsEl,
  searchFn = searchCities,
  onSelect = () => {},
  onNoResults = () => {},
  onClearNoResults = () => {}
}) {
  let debounceTimeout = null;
  let currentResults = [];
  let highlightedIndex = -1;
  let open = false;

  function setOpen(isOpen) {
    open = isOpen;
    if (isOpen) {
      suggestionsEl.classList.remove('hidden');
      inputEl.setAttribute('aria-expanded', 'true');
    } else {
      suggestionsEl.classList.add('hidden');
      inputEl.setAttribute('aria-expanded', 'false');
      highlightedIndex = -1;
      if (inputEl.removeAttribute) {
        inputEl.removeAttribute('aria-activedescendant');
      } else {
        inputEl.setAttribute('aria-activedescendant', '');
      }
    }
  }

  function renderProgress() {
    suggestionsEl.innerHTML = `
      <div class="search-in-progress-msg">
        <img src="./assets/images/icon-loading.svg" alt="" class="spin-icon" aria-hidden="true">
        <span>Search in progress</span>
      </div>
    `;
    setOpen(true);
  }

  function renderResults(results) {
    currentResults = results;
    if (!results || results.length === 0) {
      setOpen(false);
      return;
    }

    // Limpar conteúdo anterior com segurança
    if (typeof suggestionsEl.replaceChildren === 'function') {
      suggestionsEl.replaceChildren();
    } else {
      suggestionsEl.innerHTML = '';
    }

    results.forEach((city, idx) => {
      const locationText = city.country ? `${city.name}, ${city.country}` : city.name;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'suggestion-item';
      itemEl.classList.add('suggestion-item');
      itemEl.id = `suggestion-${idx}`;
      itemEl.setAttribute('role', 'option');
      itemEl.setAttribute('data-index', String(idx));
      itemEl.setAttribute('aria-selected', 'false');
      // Inserção segura via textContent para prevenir vulnerabilidades de XSS
      itemEl.textContent = locationText;

      itemEl.addEventListener('click', () => {
        selectItem(idx);
      });

      suggestionsEl.appendChild(itemEl);
    });

    setOpen(true);
  }

  function selectItem(index) {
    if (index >= 0 && index < currentResults.length) {
      const city = currentResults[index];
      const displayName = city.country ? `${city.name}, ${city.country}` : city.name;
      inputEl.value = displayName;
      setOpen(false);
      onClearNoResults();
      onSelect(city);
    }
  }

  function updateHighlight() {
    const items = suggestionsEl.querySelectorAll('.suggestion-item');
    let activeId = '';

    items.forEach((item, idx) => {
      if (idx === highlightedIndex) {
        item.classList.add('focused');
        item.setAttribute('aria-selected', 'true');
        activeId = item.id;
        if (typeof item.scrollIntoView === 'function') {
          item.scrollIntoView({ block: 'nearest' });
        }
      } else {
        item.classList.remove('focused');
        item.setAttribute('aria-selected', 'false');
      }
    });

    if (activeId) {
      inputEl.setAttribute('aria-activedescendant', activeId);
    } else {
      if (inputEl.removeAttribute) {
        inputEl.removeAttribute('aria-activedescendant');
      } else {
        inputEl.setAttribute('aria-activedescendant', '');
      }
    }
  }

  async function handleSearchInput(query) {
    const term = query?.trim();
    if (!term || term.length < 2) {
      setOpen(false);
      return;
    }

    renderProgress();

    try {
      const results = await searchFn(term);
      renderResults(results);
      return results;
    } catch (err) {
      console.error('Erro na busca de cidades:', err);
      setOpen(false);
    }
  }

  // Input listeners
  if (inputEl) {
    inputEl.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        handleSearchInput(val);
      }, 300);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (!open) {
        if (e.key === 'ArrowDown' && currentResults.length > 0) {
          setOpen(true);
          e.preventDefault();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % currentResults.length;
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + currentResults.length) % currentResults.length;
        updateHighlight();
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0) {
          e.preventDefault();
          selectItem(highlightedIndex);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    });
  }

  // Form submit listener
  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearTimeout(debounceTimeout);
      const query = inputEl.value?.trim();
      if (!query) return;

      if (open && highlightedIndex >= 0) {
        selectItem(highlightedIndex);
        return;
      }

      try {
        renderProgress();
        const results = await searchFn(query);
        setOpen(false);
        if (results && results.length > 0) {
          onClearNoResults();
          selectItemWithResult(results[0]);
        } else {
          onNoResults();
        }
      } catch (err) {
        console.error('Erro no submit de busca:', err);
        setOpen(false);
        onNoResults();
      }
    });
  }

  function selectItemWithResult(city) {
    const displayName = city.country ? `${city.name}, ${city.country}` : city.name;
    inputEl.value = displayName;
    setOpen(false);
    onClearNoResults();
    onSelect(city);
  }

  // Fechar ao clicar fora
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      if (!formEl.contains(e.target)) {
        setOpen(false);
      }
    });
  }

  return {
    handleSearchInput,
    selectItem,
    closeSuggestions: () => setOpen(false),
    isOpen: () => open
  };
}
