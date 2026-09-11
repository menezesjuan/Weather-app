/**
 * Módulo de renderização da previsão para 7 dias e previsão horária com seletor de dias.
 */

import { celsiusToFahrenheit, formatTemperature } from './conversions.js';
import { formatDayOfWeek, formatHour } from './formatters.js';
import { getWeatherInfo } from './weather-codes.js';

/**
 * Renderiza a grade de previsão diária (7 dias).
 */
export function renderDailyForecast(containerEl, state) {
  if (!containerEl || !state?.weatherData?.daily) return;

  const daily = state.weatherData.daily;
  const isFahrenheit = state.units?.temperature === 'fahrenheit';

  const cardsHtml = daily.map((day) => {
    const dayName = formatDayOfWeek(day.date, true);
    const weatherInfo = getWeatherInfo(day.weatherCode);

    let max = day.maxTemp;
    let min = day.minTemp;
    if (isFahrenheit) {
      max = celsiusToFahrenheit(max);
      min = celsiusToFahrenheit(min);
    }

    return `
      <div class="daily-card">
        <span class="daily-card-day">${dayName}</span>
        <img src="./${weatherInfo.icon}" alt="${weatherInfo.description}" class="daily-card-icon">
        <div class="daily-card-temps">
          <span class="max">${formatTemperature(max)}</span>
          <span class="min">${formatTemperature(min)}</span>
        </div>
      </div>
    `;
  }).join('');

  containerEl.innerHTML = cardsHtml;
}

/**
 * Renderiza o painel de previsão horária com o seletor interativo de dia da semana.
 */
export function renderHourlyForecast(elements, state, onSelectDay = () => {}) {
  if (!elements || !state?.weatherData) return;

  const daily = state.weatherData.daily || [];
  const hourly = state.weatherData.hourly || [];
  const activeDate = state.selectedDay || daily[0]?.date;
  const isFahrenheit = state.units?.temperature === 'fahrenheit';

  // Atualizar rótulo do dia selecionado
  if (elements.dayLabel && activeDate) {
    elements.dayLabel.textContent = formatDayOfWeek(activeDate, false);
  }

  // Renderizar opções do dropdown de dias
  if (elements.dayMenu) {
    const optionsHtml = daily.map((day) => {
      const dayFullName = formatDayOfWeek(day.date, false);
      const isActive = day.date === activeDate;
      return `
        <button 
          type="button" 
          class="hourly-day-option ${isActive ? 'active' : ''}" 
          data-date="${day.date}"
          role="menuitem"
        >
          ${dayFullName}
        </button>
      `;
    }).join('');

    elements.dayMenu.innerHTML = optionsHtml;

    // Vincular cliques às opções do dia
    if (typeof elements.dayMenu.querySelectorAll === 'function') {
      const dayButtons = elements.dayMenu.querySelectorAll('.hourly-day-option');
      dayButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const date = btn.getAttribute('data-date');
          elements.dayMenu.classList.add('hidden');
          if (elements.dayButton) {
            elements.dayButton.setAttribute('aria-expanded', 'false');
          }
          onSelectDay(date);
        });
      });
    }
  }

  // Filtrar e renderizar horas do dia ativo
  if (elements.listContainer) {
    const hoursForDay = hourly.filter((h) => h.date === activeDate || h.time.startsWith(activeDate));

    const listHtml = hoursForDay.map((h) => {
      const timeLabel = formatHour(h.time);
      const weatherInfo = getWeatherInfo(h.weatherCode);
      let temp = h.temperature;
      if (isFahrenheit) {
        temp = celsiusToFahrenheit(temp);
      }

      return `
        <div class="hourly-item" role="listitem">
          <div class="hourly-time-group">
            <img src="./${weatherInfo.icon}" alt="${weatherInfo.description}" class="hourly-item-icon">
            <span class="hourly-item-time">${timeLabel}</span>
          </div>
          <span class="hourly-item-temp">${formatTemperature(temp)}</span>
        </div>
      `;
    }).join('');

    elements.listContainer.innerHTML = listHtml;
  }
}

/**
 * Configura o comportamento de abertura/fechamento do dropdown de dias da previsão horária.
 */
export function setupHourlyDaySelector(dayButton, dayMenu) {
  if (!dayButton || !dayMenu) return;

  dayButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = dayMenu.classList.contains('hidden');
    if (isHidden) {
      dayMenu.classList.remove('hidden');
      dayButton.setAttribute('aria-expanded', 'true');
    } else {
      dayMenu.classList.add('hidden');
      dayButton.setAttribute('aria-expanded', 'false');
    }
  });

  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      if (!dayButton.contains(e.target) && !dayMenu.contains(e.target)) {
        dayMenu.classList.add('hidden');
        dayButton.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
