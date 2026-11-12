// Offline private export. No Google calls, formulas, hyperlinks or external relationships.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const escapeXml = value => String(value).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
function column(index) { let name = ''; for (index++; index; index = Math.floor((index - 1) / 26)) name = String.fromCharCode(65 + (index - 1) % 26) + name; return name; }
function cell(value, address) {
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${address}" t="n"><v>${value}</v></c>`;
  if (typeof value === 'boolean') return `<c r="${address}" t="b"><v>${value ? 1 : 0}</v></c>`;
  const text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  // inlineStr is an explicit Excel text type, including strings beginning = + - @.
  return `<c r="${address}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`;
}
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(entries) {
  const local = [], central = []; let offset = 0;
  for (const [filename, content] of entries) {
    const name = Buffer.from(filename), data = Buffer.from(content), crc = crc32(data);
    const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);
    const record = Buffer.alloc(46); record.writeUInt32LE(0x02014b50); record.writeUInt16LE(20, 4); record.writeUInt16LE(20, 6); record.writeUInt32LE(crc, 16); record.writeUInt32LE(data.length, 20); record.writeUInt32LE(data.length, 24); record.writeUInt16LE(name.length, 28); record.writeUInt32LE(offset, 42);
    central.push(record, name); offset += header.length + name.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
function workbook(input) {
  if (!input || !input.tables || typeof input.tables !== 'object' || Array.isArray(input.tables)) throw new Error('Expected private {tables:{name:[[headers],[values],...]}} JSON');
  const tables = Object.entries(input.tables);
  if (!tables.length || tables.length > 20) throw new Error('Invalid table count');
  const names = new Set();
  for (const [name, rows] of tables) {
    if (!name || name.length > 31 || /[\\/*?:\[\]]/.test(name) || names.has(name.toLowerCase())) throw new Error('Invalid or duplicate sheet name');
    names.add(name.toLowerCase());
    if (!Array.isArray(rows) || rows.length > 1048576 || rows.some(row => !Array.isArray(row) || row.length > 16384)) throw new Error('Invalid table dimensions');
  }
  const entries = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' + tables.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + tables.map(([name], i) => `<sheet name="${escapeXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + tables.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') + '</Relationships>']
  ];
  for (let i = 0; i < tables.length; i++) entries.push([`xl/worksheets/sheet${i + 1}.xml`, '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + tables[i][1].map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, col) => cell(value, `${column(col)}${rowIndex + 1}`)).join('')}</row>`).join('') + '</sheetData></worksheet>']);
  return zip(entries);
}
if (require.main === module) {
  const [source, output] = process.argv.slice(2);
  if (!source || !output || !output.endsWith('.xlsx')) throw new Error('Usage: node scripts/export-xlsx.cjs PRIVATE_INPUT.json PRIVATE_OUTPUT.xlsx');
  for (const filename of [source, output]) { const resolved = path.resolve(filename); if (resolved === root || resolved.startsWith(root + path.sep)) throw new Error('Private exports must stay outside the public repository'); }
  const physicalRoot = fs.realpathSync(root);
  // Resolve links before reading private input or writing through an output
  // directory link. The output parent must already exist.
  for (const physical of [fs.realpathSync(source), fs.realpathSync(path.dirname(path.resolve(output)))]) {
    if (physical === physicalRoot || physical.startsWith(physicalRoot + path.sep)) throw new Error('Private exports must stay outside the public repository');
  }
  const data = workbook(JSON.parse(fs.readFileSync(source, 'utf8')));
  fs.writeFileSync(output, data, { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ outcome: 'written', bytes: data.length, formula_cells: 0, reception_in_excel: 'NOT VERIFIED' }));
}
module.exports = { workbook, column, escapeXml };
