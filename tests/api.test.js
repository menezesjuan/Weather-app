import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { searchCities, getWeatherData } from '../js/api.js';

describe('Cliente de API Open-Meteo', () => {
  it('deve buscar cidades e retornar resultados mapeados', async () => {
    const mockFetch = async (url) => {
      assert.ok(url.includes('geocoding-api.open-meteo.com'));
      assert.ok(url.includes('Berlin'));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              id: 2950159,
              name: 'Berlin',
              latitude: 52.52437,
              longitude: 13.41053,
              country: 'Germany',
              admin1: 'Land Berlin'
            }
          ]
        })
      };
    };

    const results = await searchCities('Berlin', mockFetch);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].name, 'Berlin');
    assert.strictEqual(results[0].country, 'Germany');
    assert.strictEqual(results[0].latitude, 52.52437);
  });

  it('deve retornar array vazio se nenhuma cidade for encontrada', async () => {
    const mockFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({})
    });

    const results = await searchCities('CidadeInexistenteXYZ', mockFetch);
    assert.deepStrictEqual(results, []);
  });

  it('deve lançar erro quando a requisição de busca falhar', async () => {
    const mockFetch = async () => ({
      ok: false,
      status: 500
    });

    await assert.rejects(async () => {
      await searchCities('Berlin', mockFetch);
    }, /Erro ao buscar cidades/);
  });

  it('deve buscar previsão do tempo e estruturar dados atuais, diários e horários', async () => {
    const mockFetch = async (url) => {
      assert.ok(url.includes('api.open-meteo.com/v1/forecast'));
      assert.ok(url.includes('latitude=52.52'));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          timezone: 'Europe/Berlin',
          current: {
            time: '2025-08-05T15:00',
            temperature_2m: 20.2,
            relative_humidity_2m: 46,
            apparent_temperature: 18.4,
            precipitation: 0.0,
            weather_code: 0,
            wind_speed_10m: 14.1
          },
          daily: {
            time: ['2025-08-05', '2025-08-06'],
            weather_code: [0, 61],
            temperature_2m_max: [20.0, 21.0],
            temperature_2m_min: [14.0, 15.0]
          },
          hourly: {
            time: ['2025-08-05T15:00', '2025-08-05T16:00'],
            temperature_2m: [20.0, 19.5],
            weather_code: [0, 2]
          }
        })
      };
    };

    const data = await getWeatherData(52.52, 13.41, mockFetch);
    assert.strictEqual(data.current.temperature, 20.2);
    assert.strictEqual(data.current.humidity, 46);
    assert.strictEqual(data.current.apparentTemperature, 18.4);
    assert.strictEqual(data.current.precipitation, 0.0);
    assert.strictEqual(data.current.windSpeed, 14.1);
    assert.strictEqual(data.daily.length, 2);
    assert.strictEqual(data.daily[0].maxTemp, 20.0);
    assert.strictEqual(data.hourly.length, 2);
  });

  it('deve lançar erro quando a requisição de previsão falhar', async () => {
    const mockFetch = async () => ({
      ok: false,
      status: 503
    });

    await assert.rejects(async () => {
      await getWeatherData(52.52, 13.41, mockFetch);
    }, /Erro ao obter dados meteorológicos/);
  });
});
