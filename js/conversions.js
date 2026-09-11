/**
 * Utilitários de conversão matemática de grandezas meteorológicas.
 */

export function celsiusToFahrenheit(celsius) {
  const result = (celsius * 9) / 5 + 32;
  return Math.round(result);
}

export function fahrenheitToCelsius(fahrenheit) {
  const result = ((fahrenheit - 32) * 5) / 9;
  return Math.round(result);
}

export function kmhToMph(kmh) {
  return Math.round(kmh * 0.621371);
}

export function mphToKmh(mph) {
  return Math.round(mph / 0.621371);
}

export function mmToInches(mm) {
  if (mm === 0) return 0;
  return Math.round((mm / 25.4) * 10) / 10;
}

export function inchesToMm(inches) {
  if (inches === 0) return 0;
  return Math.round((inches * 25.4) * 10) / 10;
}

export function formatTemperature(value) {
  const rounded = Math.round(value);
  // Evitar -0°
  const sanitized = Object.is(rounded, -0) ? 0 : rounded;
  return `${sanitized}°`;
}

export function formatWindSpeed(value, unit = 'kmh') {
  const rounded = Math.round(value);
  const label = unit === 'mph' ? 'mph' : 'km/h';
  return `${rounded} ${label}`;
}

export function formatPrecipitation(value, unit = 'mm') {
  if (unit === 'in') {
    const formatted = Math.round(value * 10) / 10;
    return `${formatted} in`;
  }
  const rounded = Math.round(value);
  return `${rounded} mm`;
}
