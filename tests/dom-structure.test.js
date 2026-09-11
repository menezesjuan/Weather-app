import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.join(__dirname, '..', 'index.html');
const cssPath = path.join(__dirname, '..', 'style.css');

describe('Estrutura HTML e Acessibilidade Semântica', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');

  it('deve conter doctype e metadados essenciais para responsividade e acessibilidade', () => {
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('<meta name="viewport"'));
    assert.ok(html.includes('<title>'));
  });

  it('deve vincular a folha de estilos style.css e o script modular js/app.js', () => {
    assert.ok(html.includes('href="./style.css"') || html.includes('href="style.css"'));
    assert.ok(html.includes('type="module"') && (html.includes('src="./js/app.js"') || html.includes('src="js/app.js"')));
  });

  it('deve possuir os marcos semânticos principais (header, main, footer)', () => {
    assert.ok(html.includes('<header'));
    assert.ok(html.includes('<main'));
    assert.ok(html.includes('<footer'));
  });

  it('deve conter o formulário de busca com input acessível e botão de pesquisa', () => {
    assert.ok(html.includes('id="search-form"') || html.includes('class="search-form"'));
    assert.ok(html.includes('id="search-input"') || html.includes('class="search-input"'));
    assert.ok(html.includes('id="search-button"') || html.includes('class="search-button"'));
  });

  it('deve conter as seções da interface: clima atual, métricas, diária e horária', () => {
    assert.ok(html.includes('id="current-weather"'));
    assert.ok(html.includes('id="weather-metrics"'));
    assert.ok(html.includes('id="daily-forecast"'));
    assert.ok(html.includes('id="hourly-forecast"'));
  });

  it('deve conter os containers para feedback visual (erro, carregamento e sem resultados)', () => {
    assert.ok(html.includes('id="error-state"'));
    assert.ok(html.includes('id="loading-state"'));
    assert.ok(html.includes('id="no-results-state"'));
  });
});

describe('Validação da Folha de Estilos (style.css)', () => {
  it('o arquivo style.css deve existir e definir as variáveis de cores do style guide', () => {
    assert.ok(fs.existsSync(cssPath), 'style.css deve existir');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.ok(css.includes('--neutral-900'));
    assert.ok(css.includes('--neutral-800'));
    assert.ok(css.includes('--blue-500'));
    assert.ok(css.includes('--orange-500'));
  });
});
