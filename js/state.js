/**
 * Gerenciador de estado central da aplicação (Pattern Store reativa Pub/Sub).
 */

const STORAGE_KEY_UNITS = 'weather_app_units';

const DEFAULT_STATE = {
  location: {
    name: 'Berlin',
    country: 'Germany',
    latitude: 52.52437,
    longitude: 13.41053,
    timezone: 'Europe/Berlin'
  },
  units: {
    temperature: 'celsius',
    windSpeed: 'kmh',
    precipitation: 'mm'
  },
  weatherData: null,
  selectedDay: null,
  status: 'idle',
  errorMessage: null
};

export function createStore(options = {}) {
  const storage = options.storage !== undefined ? options.storage : (typeof localStorage !== 'undefined' ? localStorage : null);

  let state = {
    ...DEFAULT_STATE,
    units: { ...DEFAULT_STATE.units },
    location: { ...DEFAULT_STATE.location }
  };

  // Carregar preferências salvas de unidades
  if (storage) {
    try {
      const savedUnits = storage.getItem(STORAGE_KEY_UNITS);
      if (savedUnits) {
        const parsed = JSON.parse(savedUnits);
        state.units = { ...state.units, ...parsed };
      }
    } catch {
      // Ignorar erros de parse ou bloqueio de storage
    }
  }

  const listeners = new Set();

  function notify() {
    for (const listener of listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Erro em ouvinte da store:', err);
      }
    }
  }

  function persistUnits() {
    if (storage) {
      try {
        storage.setItem(STORAGE_KEY_UNITS, JSON.stringify(state.units));
      } catch {
        // Ignorar falhas de quota ou acesso
      }
    }
  }

  return {
    getState() {
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    setState(partial) {
      state = { ...state, ...partial };
      notify();
    },

    setStatus(status, errorMessage = null) {
      state = { ...state, status, errorMessage };
      notify();
    },

    setLocation(location) {
      state = { ...state, location };
      notify();
    },

    setWeatherData(weatherData) {
      const firstDay = weatherData?.daily?.[0]?.date || null;
      state = {
        ...state,
        weatherData,
        selectedDay: firstDay,
        status: 'success',
        errorMessage: null
      };
      notify();
    },

    setSelectedDay(selectedDay) {
      state = { ...state, selectedDay };
      notify();
    },

    setUnit(category, value) {
      state = {
        ...state,
        units: {
          ...state.units,
          [category]: value
        }
      };
      persistUnits();
      notify();
    },

    setSystem(system) {
      if (system === 'imperial') {
        state = {
          ...state,
          units: {
            temperature: 'fahrenheit',
            windSpeed: 'mph',
            precipitation: 'in'
          }
        };
      } else {
        state = {
          ...state,
          units: {
            temperature: 'celsius',
            windSpeed: 'kmh',
            precipitation: 'mm'
          }
        };
      }
      persistUnits();
      notify();
    },

    isImperial() {
      return (
        state.units.temperature === 'fahrenheit' &&
        state.units.windSpeed === 'mph' &&
        state.units.precipitation === 'in'
      );
    }
  };
}

// Instância padrão global para uso nos componentes
export const store = createStore();
