/**
 * Cliente para integração com as APIs de Geocoding e Forecast da Open-Meteo.
 */

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Realiza busca de cidades pelo nome.
 * @param {string} query 
 * @param {Function} fetchFn Injeção de dependência para testes
 * @returns {Promise<Array>} Lista de cidades encontradas
 */
export async function searchCities(query, fetchFn = globalThis.fetch) {
  const term = query?.trim();
  if (!term) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(term)}&count=5&language=en&format=json`;

  try {
    const response = await fetchFn(url);
    if (!response || !response.ok) {
      throw new Error(`Erro ao buscar cidades: status ${response?.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto'
    }));
  } catch (error) {
    if (error.message.includes('Erro ao buscar cidades')) {
      throw error;
    }
    throw new Error(`Erro ao buscar cidades: ${error.message}`);
  }
}

/**
 * Obtém dados meteorológicos completos (atual, 7 dias e horários).
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {Function} fetchFn Injeção de dependência para testes
 * @param {string} timezone 
 * @returns {Promise<Object>} Dados meteorológicos estruturados
 */
export async function getWeatherData(latitude, longitude, fetchFn = globalThis.fetch, timezone = 'auto') {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: timezone
  });

  const url = `${FORECAST_URL}?${params.toString()}`;

  try {
    const response = await fetchFn(url);
    if (!response || !response.ok) {
      throw new Error(`Erro ao obter dados meteorológicos: status ${response?.status}`);
    }

    const data = await response.json();

    const current = {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m
    };

    const daily = (data.daily?.time || []).map((time, idx) => ({
      date: time,
      weatherCode: data.daily.weather_code[idx],
      maxTemp: data.daily.temperature_2m_max[idx],
      minTemp: data.daily.temperature_2m_min[idx]
    }));

    const hourly = (data.hourly?.time || []).map((time, idx) => ({
      time: time,
      date: time.split('T')[0],
      temperature: data.hourly.temperature_2m[idx],
      weatherCode: data.hourly.weather_code[idx]
    }));

    return {
      timezone: data.timezone || timezone,
      current,
      daily,
      hourly
    };
  } catch (error) {
    if (error.message.includes('Erro ao obter dados meteorológicos')) {
      throw error;
    }
    throw new Error(`Erro ao obter dados meteorológicos: ${error.message}`);
  }
}
