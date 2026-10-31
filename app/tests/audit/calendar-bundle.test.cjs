// Run after npm run build: node --test tests/audit/calendar-bundle.test.cjs
// Offline adapter/format evidence only; this does not open a calendar application.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { harness, TemaTrial: T } = require('../helpers.cjs');
const { googleContext } = require('../google-helpers.cjs');

function readIcs(ics) {
  assert.ok(ics.endsWith('\r\n'));
  assert.ok(!/(?<!\r)\n|\r(?!\n)/.test(ics), 'CRLF line endings');
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, 'UTF-8 fold limit');
  const lines = ics.replace(/\r\n[ \t]/g, '').split('\r\n').filter(Boolean);
  assert.equal(lines.filter(line => line === 'BEGIN:VEVENT').length, 1);
  assert.equal(lines.filter(line => line === 'END:VEVENT').length, 1);
  assert.ok(!lines.some(line => /^(ATTENDEE|ORGANIZER)[;:]/.test(line)));
  const fields = new Map();
  for (const line of lines) {
    const colon = line.indexOf(':');
    assert.ok(colon > 0);
    const name = line.slice(0, colon);
    if (!['BEGIN', 'END'].includes(name)) { assert.ok(!fields.has(name), 'unique property ' + name); fields.set(name, line.slice(colon + 1)); }
  }
  return fields;
}
function unescapeText(value) { return value.replace(/\\([nN,;\\])/g, (_, char) => /n/i.test(char) ? '\n' : char); }
function toronto(stamp) {
  assert.match(stamp, /^\d{8}T\d{6}Z$/);
  const iso = stamp.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, '$1-$2-$3T$4:$5:$6Z');
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso)).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
function admitted(mutator = () => {}) { const h = harness({ now: Date.parse('2026-12-01T12:00:00Z') }); mutator(h.data); assert.equal(h.service.register(h.command()).code, 'RECORDED'); return h.data.registrations[0]; }

test('generated Code.gs exposes doGet/doPost and preserves one booking/two simulated messages on replay', () => {
  const bundlePath = path.resolve(__dirname, '../../dist/apps-script/Code.gs');
  const g = googleContext(false, { bundlePath });
  assert.equal(typeof g.context.doGet, 'function'); assert.equal(typeof g.context.doPost, 'function');
  const cat = JSON.parse(g.context.doGet({}).text);
  assert.equal(cat.formations.length, 1); assert.equal(cat.sessions.length, 2);
  const command = harness().command(); command.anti_spam.form_started_at = new Date(Date.now() - 2000).toISOString();
  const parameter = Object.fromEntries(Object.entries(command).filter(([key]) => key !== 'anti_spam').map(([key, value]) => [key, value === null ? '' : String(value)]));
  Object.assign(parameter, command.anti_spam);
  const event = { parameter, parameters: Object.fromEntries(Object.entries(parameter).map(([key, value]) => [key, [value]])), postData: { type: 'application/x-www-form-urlencoded', contents: new URLSearchParams(parameter).toString() } };
  assert.equal(JSON.parse(g.context.doPost(event).text).code, 'RECORDED');
  assert.equal(JSON.parse(g.context.doPost(event).text).code, 'REPLAY');
  assert.equal(g.context.trialStore_().read().registrations.length, 1); assert.equal(g.sent.length, 2);
  const attachment = g.sent.find(message => message.attachments).attachments[0];
  assert.equal(attachment.type, 'text/calendar; charset=UTF-8');
  assert.equal(toronto(readIcs(attachment.content).get('DTSTART')), '2030-01-15 09:00');
  g.properties.set('ENVIRONMENT', 'PROD'); assert.equal(JSON.parse(g.context.doGet({}).text).code, 'UNAVAILABLE');
});

for (const [date, hour, utc] of [['2027-01-15', '09:00', '20270115T140000Z'], ['2027-07-15', '09:30', '20270715T133000Z'], ['2027-03-14', '03:30', '20270314T073000Z'], ['2027-11-07', '02:30', '20271107T073000Z']]) {
  test('calendar UTC round trip at winter/summer/DST boundary ' + date, () => {
    const row = admitted(data => { Object.assign(data.sessions[0], { date, heure_debut: hour }); });
    const fields = readIcs(T.makeIcs(row));
    assert.equal(fields.get('DTSTART'), utc); assert.equal(toronto(fields.get('DTSTART')), date + ' ' + hour);
  });
}

test('calendar long Unicode, CRLF and escaped punctuation remain a single inert event', () => {
  const title = 'Été 👩🏽‍💻 中文, ; \\ '.repeat(20) + '\r\nATTENDEE:mailto:injected@example.invalid';
  const address = 'Étage 2; Montréal, Québec \\ accueil';
  const row = admitted(data => { data.formations[0].titre = title; data.sessions[0].mode = 'presentiel'; data.sessions[0].lieu_ou_lien = address; });
  const first = T.makeIcs(row), second = T.makeIcs(row), fields = readIcs(first);
  assert.equal(unescapeText(fields.get('SUMMARY')), title.replace(/\r\n/g, '\n'));
  assert.equal(unescapeText(fields.get('LOCATION')), address);
  assert.equal(fields.get('UID'), readIcs(second).get('UID'));
  assert.equal(fields.has('URL'), false);
});

test('calendar online link and missing-link variants preserve the actual destination or explicit absence', () => {
  const row = admitted();
  const online = readIcs(T.makeIcs(row)); assert.equal(online.get('URL'), 'https://example.invalid/PRIVATE_VIDEO'); assert.equal(online.get('LOCATION'), online.get('URL'));
  row.lieu_snapshot = JSON.stringify({ mode: 'en_ligne', adresse_presentiel: null, lien_visio: null });
  const absent = readIcs(T.makeIcs(row)); assert.equal(absent.has('URL'), false); assert.equal(unescapeText(absent.get('LOCATION')), 'En ligne — lien à venir'); assert.match(unescapeText(absent.get('DESCRIPTION')), /jours précédant/);
});

for (const [name, start, end] of [['winter', '2027-01-15 09:00', '2027-01-15 12:00'], ['summer', '2027-07-15 09:30', '2027-07-15 12:00']]) {
  test('previously received private ICS independent format/time check: ' + name, { skip: !process.env.TEMA_AUDIT_RECEIVED_ICS_DIR }, () => {
    const fields = readIcs(fs.readFileSync(path.join(process.env.TEMA_AUDIT_RECEIVED_ICS_DIR, name + '-received.ics'), 'utf8'));
    assert.equal(toronto(fields.get('DTSTART')), start); assert.equal(toronto(fields.get('DTEND')), end); assert.equal(fields.has('URL'), false);
  });
}
