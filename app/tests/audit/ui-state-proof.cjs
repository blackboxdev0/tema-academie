// Read-only audit of the actual app.js closure in Node VM with a minimal fake DOM.
// This is NOT browser, native form-validation, layout, or browser-history evidence.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = require('node:path').resolve(__dirname, '../../..');
const { harness, TemaTrial } = require(root + '/app/tests/helpers.cjs');

function fixture() {
  const nodes = new Map();
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag; this.children = []; this.listeners = {}; this.attributes = {};
      this.dataset = {}; this.style = {}; this.value = ''; this.hidden = false;
      this.disabled = false; this.checked = false; this.ownText = '';
      this.classList = { contains: () => false, add() {} };
    }
    get textContent() { return this.ownText + this.children.map(n => n.textContent || '').join(''); }
    set textContent(v) { this.ownText = String(v); this.children = []; }
    append(...items) { this.children.push(...items); }
    replaceChildren(...items) { this.ownText = ''; this.children = [...items]; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    setAttribute(key, value) { this.attributes[key] = String(value); }
    removeAttribute(key) { delete this.attributes[key]; }
    getAttribute(key) { return this.attributes[key] ?? null; }
    focus() { document.activeElement = this; }
    scrollIntoView() {}
  }
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
  const document = { getElementById: get, createElement: tag => new Element(tag), querySelectorAll: () => [], addEventListener() {}, body: new Element('body') };
  const location = { hash: '#' };
  const window = { TEMA_CONFIG: { apiUrl: 'https://audit.invalid/api' }, addEventListener() {}, scrollTo() {}, scrollX: 0, scrollY: 0 };
  const h = harness({ now: Date.now() + 2000 });
  let catalogueOverride = null, beforePost = null, requests = 0;
  const fetch = async (_, options = {}) => {
    if (options.method === 'POST') {
      requests++;
      if (beforePost) beforePost();
      const command = TemaTrial.decodeForm(Object.fromEntries(options.body));
      return { ok: true, json: async () => h.service.submit(command) };
    }
    return { ok: true, json: async () => catalogueOverride || h.service.catalogue() };
  };
  const context = vm.createContext({ window, document, location, history: { replaceState(a,b,hash) { location.hash = hash; }, pushState(a,b,hash) { location.hash = hash; } }, fetch, URL, URLSearchParams, AbortController, setTimeout, clearTimeout, setInterval() {}, requestAnimationFrame: fn => fn(), Intl, Date, structuredClone, crypto });
  const source = fs.readFileSync(root + '/app/web/app.js', 'utf8');
  const ending = '  refresh();\n}());';
  assert.equal(source.split(ending).length, 2, 'Expected exact startup hook');
  // Only expose existing functions/state and suppress automatic startup.
  const instrumented = source.replace(ending, `  window.audit = { read: fetchCatalogue, choose, applyRoute, software, state: function () { return {view, sending, pending, selected, changeRequired}; } };\n}());`);
  vm.runInContext(instrumented, context, { filename: 'app/web/app.js (audit exports)' });
  async function openForm() {
    const cat = await window.audit.read(), s = cat.sessions[0], f = cat.formations[0];
    window.audit.choose(s, f);
    location.hash = '#formation=' + f.id + '&date=' + s.id_cohorte + '&vue=inscription';
    for (const [id, value] of Object.entries({ prenom: 'Anne', nom: 'Fictive', entreprise: 'Audit fictif', courriel: 'participant@example.invalid' })) get(id).value = value;
    get('consentement').checked = true;
    return location.hash;
  }
  async function submit() {
    get('form').listeners.submit({ preventDefault() {} });
    for (let i = 0; i < 20 && window.audit.state().sending; i++) await new Promise(resolve => setImmediate(resolve));
    assert.equal(window.audit.state().sending, false);
  }
  return { h, get, location, audit: window.audit, openForm, submit, requests: () => requests, setBeforePost: fn => { beforePost = fn; }, setCatalogue: value => { catalogueOverride = value; } };
}

(async () => {
  const navigation = fixture(), originalRoute = await navigation.openForm();
  await navigation.submit();
  assert.equal(navigation.audit.state().view, 'result');
  assert.equal(navigation.h.data.registrations.length, 1);
  assert.equal(navigation.location.hash, originalRoute);
  // Model hashchange calls when opening privacy, then returning to the previous hash.
  navigation.get('footer-policy').listeners.click({ preventDefault() {} });
  navigation.location.hash = '#politique'; navigation.audit.applyRoute();
  assert.equal(navigation.audit.state().view, 'privacy');
  navigation.location.hash = originalRoute; navigation.audit.applyRoute();
  assert.equal(navigation.audit.state().view, 'result');
  assert.equal(navigation.get('result-title').textContent, 'Votre place est réservée');
  assert.equal(navigation.audit.state().pending, null);
  assert.equal(navigation.requests(), 1);
  assert.equal(navigation.h.data.registrations.length, 1);
  console.log('PASS R6: known result restored after policy return, one POST/registration (Node VM only)');

  const renamed = fixture(); await renamed.openForm();
  const oldHeading = renamed.get('form-title').textContent;
  renamed.setBeforePost(() => { renamed.h.data.formations[0].titre = 'Titre actualisé après sélection'; });
  await renamed.submit();
  assert.equal(renamed.audit.state().changeRequired, true);
  assert.ok(renamed.get('summary').textContent.includes('Titre actualisé après sélection'));
  renamed.get('accept-change').listeners.click();
  assert.equal(renamed.audit.state().selected.formation.titre, 'Titre actualisé après sélection');
  assert.equal(renamed.audit.state().changeRequired, false);
  assert.notEqual(renamed.get('form-title').textContent, oldHeading);
  assert.equal(renamed.get('form-title').textContent, 'Inscription à Titre actualisé après sélection');
  console.log('PASS R8: accepted title and summary agree (Node VM only)');
})().catch(error => { console.error(error); process.exitCode = 1; });
