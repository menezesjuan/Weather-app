/**
 * Módulo de renderização do cartão principal de clima atual e métricas secundárias.
 */

import {
  celsiusToFahrenheit,
  kmhToMph,
  mmToInches,
  formatTemperature,
  formatWindSpeed,
  formatPrecipitation
} from './conversions.js';
import { formatDate } from './formatters.js';
import { getWeatherInfo } from './weather-codes.js';

export function renderCurrentWeather(elements, state) {
  if (!elements || !state || !state.weatherData || !state.weatherData.current) {
    return;
  }

  const current = state.weatherData.current;
  const location = state.location || {};
  const units = state.units || { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm' };

  // Localização e data
  if (elements.locationName) {
    const locText = location.country ? `${location.name}, ${location.country}` : (location.name || '');
    elements.locationName.textContent = locText;
  }

  if (elements.dateText) {
    elements.dateText.textContent = formatDate(current.time);
  }

  // Ícone e descrição do clima
  const weatherInfo = getWeatherInfo(current.weatherCode);
  if (elements.icon) {
    elements.icon.src = `./${weatherInfo.icon}`;
    elements.icon.alt = weatherInfo.description;
  }

  // Temperatura atual
  if (elements.temp) {
    let tempValue = current.temperature;
    if (units.temperature === 'fahrenheit') {
      tempValue = celsiusToFahrenheit(tempValue);
    }
    elements.temp.textContent = formatTemperature(tempValue);
  }

  // Sensação térmica (Feels Like)
  if (elements.feelsLike) {
    let feelsLikeVal = current.apparentTemperature;
    if (units.temperature === 'fahrenheit') {
      feelsLikeVal = celsiusToFahrenheit(feelsLikeVal);
    }
    elements.feelsLike.textContent = formatTemperature(feelsLikeVal);
  }

  // Umidade
  if (elements.humidity) {
    elements.humidity.textContent = `${Math.round(current.humidity)}%`;
  }

  // Velocidade do vento
  if (elements.wind) {
    let windVal = current.windSpeed;
    if (units.windSpeed === 'mph') {
      windVal = kmhToMph(windVal);
    }
    elements.wind.textContent = formatWindSpeed(windVal, units.windSpeed);
  }

  // Precipitação
  if (elements.precipitation) {
    let precipVal = current.precipitation;
    if (units.precipitation === 'in') {
      precipVal = mmToInches(precipVal);
    }
    elements.precipitation.textContent = formatPrecipitation(precipVal, units.precipitation);
  }
}
