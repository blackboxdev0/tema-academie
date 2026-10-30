const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { workbook, column } = require('../scripts/export-xlsx.cjs');

test('AC-19: saved XLSX has explicit inert text cells and exploitable numeric/boolean values', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-export-'));
  try {
    const file = path.join(directory, 'fictitious.xlsx');
    const strings = ['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(A1:A2)', '<script>alert(1)</script>', 'Été, Montréal\nDeuxième ligne'];
    fs.writeFileSync(file, workbook({ tables: { Inscriptions: [['id', 'libre', 'places', 'accord'], ...strings.map((s, i) => [`I-${i}`, s, i, true])] } }));
    const check = spawnSync('python3', ['-c', `import zipfile,xml.etree.ElementTree as E,json,sys
n={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 root=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
 assert not root.findall('.//s:f',n)
 cells=root.findall('s:sheetData/s:row',n)
 expected=json.loads(sys.argv[2])
 for i,text in enumerate(expected):
  row=cells[i+1]
  assert row[1].attrib['t']=='inlineStr'
  assert row[1].find('s:is/s:t',n).text==text
  assert row[2].attrib['t']=='n' and int(row[2].find('s:v',n).text)==i
  assert row[3].attrib['t']=='b' and row[3].find('s:v',n).text=='1'
 assert not any('externalLink' in name for name in z.namelist())
print('PASS')`, file, JSON.stringify(strings)], { encoding: 'utf8' });
    assert.equal(check.status, 0, check.stderr); assert.equal(check.stdout.trim(), 'PASS');
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
test('AC-19: export rejects ambiguous tables and handles Excel column boundaries', () => {
  assert.equal(column(25), 'Z'); assert.equal(column(26), 'AA'); assert.equal(column(16383), 'XFD');
  assert.throws(() => workbook({ tables: { 'invalid/name': [] } }));
  assert.throws(() => workbook({ tables: { Data: [], data: [] } }));
  assert.throws(() => workbook({ tables: { Data: [null] } }));
});
test('AC-19: CLI refuses to put private exports in public repository', () => {
  const result = spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/export-xlsx.cjs'), '/tmp/input.json', path.resolve(__dirname, '../private.xlsx')], { encoding: 'utf8' });
  assert.notEqual(result.status, 0); assert.match(result.stderr, /outside the public repository/);
});

test('AC-19: private export rejects source and output-parent symlinks into the repository', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-export-links-'));
  const app = path.resolve(__dirname, '..'), escapedName = path.basename(directory) + '.xlsx';
  try {
    const cli = path.join(app, 'scripts/export-xlsx.cjs'), source = path.join(directory, 'input.json');
    fs.writeFileSync(source, JSON.stringify({ tables: { Fictitious: [['id'], ['I-TEST']] } }));
    fs.symlinkSync(path.join(app, 'package.json'), path.join(directory, 'source-link.json'));
    fs.symlinkSync(app, path.join(directory, 'repository-link'), 'dir');
    for (const [input, output] of [[path.join(directory, 'source-link.json'), path.join(directory, 'safe.xlsx')], [source, path.join(directory, 'repository-link', escapedName)]]) {
      const result = spawnSync(process.execPath, [cli, input, output], { encoding: 'utf8' });
      assert.notEqual(result.status, 0); assert.match(result.stderr, /outside the public repository/);
    }
    assert.equal(fs.existsSync(path.join(app, escapedName)), false);
    assert.equal(fs.existsSync(path.join(directory, 'safe.xlsx')), false);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('AC-01: extractor preserves nine distinct source fields across 24 rows, stable keys/types and 18-4-2, rejects wrong digest', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tema-extractor-'));
  try {
    const filename = path.join(directory, 'synthetic.xlsx'), script = path.resolve(__dirname, '../scripts/catalogue-source.py');
    const made = spawnSync('python3', ['-c', `import zipfile,xml.etree.ElementTree as E,sys,json,hashlib
ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
shared=E.Element('sst',xmlns=ns); sheet=E.Element('worksheet',xmlns=ns); data=E.SubElement(sheet,'sheetData')
for number in list(range(6,24))+list(range(28,34))+list(range(40,49)):
 row=E.SubElement(data,'row',r=str(number))
 values=['Titre '+str(number),'Prérequis '+str(number),'Contenu '+str(number),'Durée '+str(number),'À partir de '+str(450+number)+' $','Résultat '+str(number),'CODE-TEST-'+str(number),str(number+1),'à venir — source '+str(number)]
 for index,value in enumerate(values):
  text_index=len(shared); E.SubElement(E.SubElement(shared,'si'),'t').text=value
  cell=E.SubElement(row,'c',r=chr(65+index)+str(number),t='s'); E.SubElement(cell,'v').text=str(text_index)
with zipfile.ZipFile(sys.argv[1],'w') as z:
 z.writestr('xl/sharedStrings.xml',E.tostring(shared)); z.writestr('xl/worksheets/sheet1.xml',E.tostring(sheet))
 z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>')
 z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
 z.writestr('xl/workbook.xml','<workbook xmlns="'+ns+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>')
 z.writestr('xl/_rels/workbook.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>')
print(hashlib.sha256(open(sys.argv[1],'rb').read()).hexdigest())`, filename], { encoding: 'utf8' });
    assert.equal(made.status, 0, made.stderr); const digest = made.stdout.trim();
    const run = hash => spawnSync('python3', ['-c', `import importlib.util,json,sys
from pathlib import Path
spec=importlib.util.spec_from_file_location('tema_catalogue',sys.argv[1]); module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
print(json.dumps(module.extract(Path(sys.argv[2]),sys.argv[3]),ensure_ascii=False))`, script, filename, hash], { encoding: 'utf8' });
    const extracted = run(digest); assert.equal(extracted.status, 0, extracted.stderr); const manifest = JSON.parse(extracted.stdout);
    assert.equal(manifest.source_id, 'tema-catalogue-pre-lancement-v1'); assert.equal(manifest.source_sha256, digest); assert.equal(manifest.records.length, 24);
    const rows = [...Array.from({ length: 18 }, (_, i) => i + 6), ...Array.from({ length: 6 }, (_, i) => i + 28)];
    const counts = { DIV: 0, DIMO: 0, MOOV: 0 };
    manifest.records.forEach((record, index) => {
      const number = rows[index]; counts[record.logiciel]++;
      assert.deepEqual(Object.keys(record).sort(), ['titre', 'prerequis', 'contenu', 'duree', 'resultat', 'formateurs', 'source_key', 'logiciel', 'description', 'prix', 'prix_qualificatif', 'places_par_defaut', 'source_date'].sort());
      assert.equal(record.logiciel, number < 24 ? 'DIV' : number < 32 ? 'DIMO' : 'MOOV'); assert.equal(record.description, '');
      assert.equal(record.source_key, `Sheet1!A${number}:I${number}`);
      for (const [key, expected] of Object.entries({ titre: 'Titre ' + number, prerequis: 'Prérequis ' + number, contenu: 'Contenu ' + number, duree: 'Durée ' + number, resultat: 'Résultat ' + number, formateurs: 'CODE-TEST-' + number, source_date: 'à venir — source ' + number, prix: 450 + number, places_par_defaut: number + 1, prix_qualificatif: 'À partir de' })) assert.equal(record[key], expected, key);
      assert.equal(typeof record.prix, 'number'); assert.equal(typeof record.places_par_defaut, 'number');
    });
    assert.deepEqual(counts, { DIV: 18, DIMO: 4, MOOV: 2 }); assert.equal(new Set(manifest.records.map(r => r.source_key)).size, 24);
    const rejected = run('0'.repeat(64)); assert.notEqual(rejected.status, 0); assert.match(rejected.stderr, /differs from approved snapshot/);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
