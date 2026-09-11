/**
 * Ponto de entrada da aplicação Weather App.
 */

import { store } from './state.js';
import { setupSearchController } from './ui-search.js';
import { renderCurrentWeather } from './ui-weather.js';
import { getWeatherData } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const searchSuggestions = document.getElementById('search-suggestions');
  const noResultsState = document.getElementById('no-results-state');
  const weatherContent = document.getElementById('weather-content');
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');

  // Elementos do Clima Atual
  const weatherElements = {
    locationName: document.getElementById('current-location-name'),
    dateText: document.getElementById('current-date-text'),
    icon: document.getElementById('current-weather-icon'),
    temp: document.getElementById('current-temp'),
    feelsLike: document.getElementById('metric-feels-like'),
    humidity: document.getElementById('metric-humidity'),
    wind: document.getElementById('metric-wind'),
    precipitation: document.getElementById('metric-precipitation')
  };

  // Reagir a mudanças na store
  store.subscribe((state) => {
    if (state.weatherData) {
      renderCurrentWeather(weatherElements, state);
    }
  });

  // Inicializar o controlador de busca
  setupSearchController({
    inputEl: searchInput,
    formEl: searchForm,
    suggestionsEl: searchSuggestions,
    onSelect: async (city) => {
      store.setLocation(city);
      await loadWeatherForLocation(city);
    },
    onNoResults: () => {
      weatherContent.classList.add('hidden');
      errorState.classList.add('hidden');
      loadingState.classList.add('hidden');
      noResultsState.classList.remove('hidden');
    },
    onClearNoResults: () => {
      noResultsState.classList.add('hidden');
    }
  });

  async function loadWeatherForLocation(location) {
    try {
      loadingState.classList.remove('hidden');
      weatherContent.classList.add('hidden');
      errorState.classList.add('hidden');
      noResultsState.classList.add('hidden');

      const data = await getWeatherData(location.latitude, location.longitude, window.fetch, location.timezone);
      store.setWeatherData(data);

      loadingState.classList.add('hidden');
      weatherContent.classList.remove('hidden');
    } catch (err) {
      console.error('Falha ao obter clima:', err);
      loadingState.classList.add('hidden');
      weatherContent.classList.add('hidden');
      errorState.classList.remove('hidden');
    }
  }

  // Carregar clima da localização padrão inicial (Berlin)
  const initialLoc = store.getState().location;
  if (initialLoc) {
    loadWeatherForLocation(initialLoc);
  }
});
