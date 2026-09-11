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
    assert.ok(html.includes('role="combobox"'), 'search-input deve ter role="combobox"');
    assert.ok(html.includes('aria-autocomplete="list"'), 'search-input deve ter aria-autocomplete="list"');
  });

  it('deve conter as seções da interface: clima atual, métricas, diária e horária', () => {
    assert.ok(html.includes('id="current-weather"'));
    assert.ok(html.includes('id="weather-metrics"'));
    assert.ok(html.includes('id="daily-forecast"'));
    assert.ok(html.includes('id="hourly-forecast"'));
    assert.ok(html.includes('id="weather-content" class="weather-content hidden"'), 'weather-content deve iniciar com a classe hidden');
    assert.ok(!html.includes('>Berlin, Germany<'), 'HTML não deve conter cidade de Berlim mockada no markup estático');
    assert.ok(!html.includes('>20°<'), 'HTML não deve conter temperatura de 20° mockada no markup estático');
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

  it('deve implementar anel de foco de alto contraste conforme WCAG nos menus e componentes', () => {
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.ok(
      css.includes('outline: 2px solid var(--neutral-0)') || css.includes('box-shadow: 0 0 0'),
      'Deve implementar técnica de anel de foco com contraste >= 3:1'
    );
    assert.ok(
      css.includes('.units-menu') && css.includes(':focus-visible'),
      'Deve ter regra de foco explícita para menus suspensos'
    );
  });

  it('deve utilizar fontes no formato otimizado woff2 nas diretivas @font-face', () => {
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.ok(css.includes("format('woff2')"), "Diretivas @font-face devem declarar format('woff2')");
    assert.ok(css.includes('.woff2'), "Diretivas @font-face devem apontar para arquivos .woff2");
    
    const bricolagePath = path.join(__dirname, '..', 'assets', 'fonts', 'Bricolage_Grotesque', 'BricolageGrotesque-VariableFont.woff2');
    const dmSansPath = path.join(__dirname, '..', 'assets', 'fonts', 'DM_Sans', 'DMSans-VariableFont.woff2');
    assert.ok(fs.existsSync(bricolagePath), 'Arquivo woff2 do Bricolage Grotesque deve existir');
    assert.ok(fs.existsSync(dmSansPath), 'Arquivo woff2 do DM Sans deve existir');
  });
});
