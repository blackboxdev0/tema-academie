// Prototype de mesure en lecture seule, sans cache navigateur ni serveur.
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const api=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../config/project.json'),'utf8')).google.resources.environments.TEST.web_app_url;
const output=process.argv[2];
if(!output || path.resolve(output).startsWith(path.resolve(__dirname,'../..')+path.sep)) throw Error('Private output path required');
(async()=>{
  const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="fr"><title>Prototype lecture groupée TEST</title><main id="result">Lecture en cours</main></html>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch(), records=[];
  let expected;
  try{
    for(let round=0;round<5;round++){
      const variants=round%2 ? ['catalogue-batch','catalogue-native'] : ['catalogue-native','catalogue-batch'];
      for(const variant of variants){
        const context=await browser.newContext();
        try{
          const page=await context.newPage();
          for(let visit=0;visit<2;visit++){
            await page.goto('http://127.0.0.1:'+server.address().port);
            const result=await page.evaluate(async url=>{
              const start=performance.now(), response=await fetch(url,{credentials:'omit',signal:AbortSignal.timeout(30000)});
              const text=await response.text(), data=JSON.parse(text);
              if(!response.ok || data.code || !Array.isArray(data.sessions)) throw Error('Invalid prototype response');
              document.getElementById('result').textContent=data.sessions.map(s=>s.start_at+' / '+s.places_restantes).join('\n');
              return {elapsed_ms:Math.round(performance.now()-start),bytes:new TextEncoder().encode(text).length,data};
            },api+'?resource='+variant);
            const expectedReader=variant==='catalogue-batch'?'sheets-batchget-v1':'spreadsheetapp-v1';
            assert.equal(result.data.benchmark?.reader,expectedReader,'Wrong deployed reader');
            if(variant==='catalogue-batch') assert.equal(result.data.benchmark.api_calls,1);
            const comparable={...result.data};delete comparable.generated_at;delete comparable.benchmark;
            if(!expected) expected=comparable;
            assert.deepEqual(comparable,expected,'Different public data across readers');
            const record={round:round+1,variant,visit:visit===0?'first':'subsequent',elapsed_ms:result.elapsed_ms,bytes:result.bytes,...result.data.benchmark,formations:result.data.formations.length,sessions:result.data.sessions.length};
            records.push(record);fs.writeFileSync(output,JSON.stringify(records,null,2));console.log(JSON.stringify(record));
          }
        }finally{await context.close();}
      }
    }
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
