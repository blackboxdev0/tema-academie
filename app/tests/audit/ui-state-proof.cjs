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
  assert.equal(navigation.audit.state().view, 'registration');
  assert.equal(navigation.get('personal-fields').disabled, true);
  assert.equal(navigation.get('submit').disabled, true);
  assert.equal(navigation.get('change-date').disabled, true);
  assert.equal(navigation.get('retry').hidden, true);
  assert.equal(navigation.audit.state().pending, null);
  console.log(JSON.stringify({ proof: 'Node VM, fake DOM; not browser history proof', case: 'recorded-result -> policy hash -> original registration hash', resulting_view: navigation.audit.state().view, personal_fields_disabled: true, submit_disabled: true, change_date_disabled: true, retry_hidden: true, pending: null, recorded_rows: navigation.h.data.registrations.length, post_requests: navigation.requests() }));

  const renamed = fixture(); await renamed.openForm();
  const oldHeading = renamed.get('form-title').textContent;
  renamed.setBeforePost(() => { renamed.h.data.formations[0].titre = 'Titre actualisé après sélection'; });
  await renamed.submit();
  assert.equal(renamed.audit.state().changeRequired, true);
  assert.ok(renamed.get('summary').textContent.includes('Titre actualisé après sélection'));
  renamed.get('accept-change').listeners.click();
  assert.equal(renamed.audit.state().selected.formation.titre, 'Titre actualisé après sélection');
  assert.equal(renamed.audit.state().changeRequired, false);
  assert.equal(renamed.get('form-title').textContent, oldHeading);
  console.log(JSON.stringify({ proof: 'Node VM, fake DOM', case: 'SESSION_CHANGED title and acceptance', selected_title: renamed.audit.state().selected.formation.titre, summary_has_new_title: true, form_heading: renamed.get('form-title').textContent, old_heading_retained: true, submit_disabled: renamed.get('submit').disabled, consent_checked: renamed.get('consentement').checked }));

  const malformed = fixture(); const good = await malformed.audit.read();
  const bad = structuredClone(good); delete bad.softwares; malformed.setCatalogue(bad);
  await malformed.audit.read();
  assert.throws(() => malformed.audit.software(bad.formations[0]), /Cannot read properties of undefined/);
  console.log(JSON.stringify({ proof: 'Node VM, fake DOM', case: 'catalogue missing softwares', accepted_by_fetchCatalogue: true, software_renderer_throws: "Cannot read properties of undefined (reading 'find')" }));
})().catch(error => { console.error(error); process.exitCode = 1; });
