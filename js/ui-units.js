/**
 * Módulo do menu de seleção de unidades (Units Dropdown) e alternância métrico/imperial.
 */

export function setupUnitsDropdown({
  buttonEl,
  menuEl,
  systemToggleBtn,
  unitOptions = [],
  store
}) {
  let open = false;

  function setOpen(isOpen) {
    open = isOpen;
    if (isOpen) {
      menuEl.classList.remove('hidden');
      if (buttonEl) buttonEl.setAttribute('aria-expanded', 'true');
    } else {
      menuEl.classList.add('hidden');
      if (buttonEl) buttonEl.setAttribute('aria-expanded', 'false');
    }
  }

  function updateMenuDisplay() {
    const state = store.getState();
    const currentUnits = state.units;
    const isImperial = store.isImperial();

    // Atualizar texto do botão do sistema global
    if (systemToggleBtn) {
      systemToggleBtn.textContent = isImperial ? 'Switch to Metric' : 'Switch to Imperial';
    }

    // Atualizar checkmarks e classes ativas em cada opção individual
    unitOptions.forEach((btn) => {
      const category = btn.getAttribute('data-category');
      const val = btn.getAttribute('data-value');
      const isActive = currentUnits[category] === val;

      if (isActive) {
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
      }
    });
  }

  function handleSystemToggle() {
    const isImperial = store.isImperial();
    store.setSystem(isImperial ? 'metric' : 'imperial');
    updateMenuDisplay();
  }

  function selectUnit(category, value) {
    store.setUnit(category, value);
    updateMenuDisplay();
  }

  // Event listener para abrir/fechar o menu
  if (buttonEl) {
    buttonEl.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!open);
    });
  }

  // Event listener para alternar sistema global
  if (systemToggleBtn) {
    systemToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSystemToggle();
    });
  }

  // Event listeners para cada unidade individual
  unitOptions.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const category = btn.getAttribute('data-category');
      const value = btn.getAttribute('data-value');
      selectUnit(category, value);
    });
  });

  // Fechar ao clicar fora ou ao pressionar Escape
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      if (open && buttonEl && menuEl && !buttonEl.contains(e.target) && !menuEl.contains(e.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    });
  }

  // Inicializar estado visual das opções
  updateMenuDisplay();

  // Inscrever-se para atualizações externas da store (ex: restauração de localStorage)
  store.subscribe(() => {
    updateMenuDisplay();
  });

  return {
    isOpen: () => open,
    toggleMenu: () => setOpen(!open),
    handleSystemToggle,
    selectUnit
  };
}
