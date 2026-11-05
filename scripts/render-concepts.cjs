'use strict';
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const logo='data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'assets/logo.svg')).toString('base64');
const font=fs.readFileSync(path.join(root,'assets/onest.ttf')).toString('base64');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const text=(x,y,s,size=18,color='#F4F7FF',weight=400,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
const rect=(x,y,w,h,fill='#121A2A',r=18,stroke='#25324A')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const line=(x,y,w)=>`<path d="M${x} ${y}h${w}" stroke="#263149"/>`;
const label=(x,y,s)=>text(x,y,s,12,'#9EACC4',600,'letter-spacing="1.3"');
const icon=(name,x,y,color='#76A5FF')=>{
const shapes={home:'M4 11 12 4l8 7v10h-6v-7h-4v7H4Z',bar:'M3 9v6m4-10v14m10-14v14m4-10v6M7 12h10',food:'M6 3v7m-3-7v5a3 3 0 0 0 6 0V3M6 11v10M19 3v18m0-18c-6 3-6 10 0 10',chart:'M3 19 9 12l5 4 7-11m-6 0h6v6',plus:'M12 4v16M4 12h16',arrow:'M4 12h16m-6-6 6 6-6 6',check:'m5 12 4 4 10-10'};
return `<svg x="${x}" y="${y}" width="24" height="24" viewBox="0 0 24 24"><path d="${shapes[name]}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;};
function nav(active){return rect(0,768,540,82,'#0C111D',0,'#263149')+['Today','Training','Nutrition','Progress'].map((s,i)=>{const x=68+i*135;return (i===active?rect(x-37,777,74,55,'#192C50',12,'#192C50'):'')+icon(['home','bar','food','chart'][i],x-12,782,i===active?'#78A8FF':'#8D9BB3')+text(x,824,s,11,i===active?'#B9D3FF':'#99A7C0',500,'text-anchor="middle"');}).join('');}
function shell(title,sub,body,active){return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="850" viewBox="0 0 540 850" role="img" aria-label="Liftspire ${title} interface concept; illustrative sample data"><defs><style>@font-face{font-family:Onest;src:url(data:font/ttf;base64,${font})}text{font-family:Onest,Arial,sans-serif}</style><linearGradient id="card" x2="1" y2="1"><stop stop-color="#182A4B"/><stop offset="1" stop-color="#101B30"/></linearGradient></defs><rect width="540" height="850" fill="#0B101C"/><image href="${logo}" x="27" y="18" width="170" height="46"/>${rect(455,26,57,27,'#14233D',13,'#2B4266')}${text(483,44,'CONCEPT',8,'#9CC0FF',600,'text-anchor="middle" letter-spacing=".5"')}${line(28,79,484)}${text(28,125,title,32,'#F4F7FF',650)}${text(28,153,sub,14,'#9EACC4')}${body}${nav(active)}</svg>`;}
function macro(x,y,name,value,target,color){const w=132;return label(x,y,name)+text(x,y+29,value+' g',22,'#F4F7FF',600)+text(x,y+50,'of '+target+' g',11,'#95A5C1')+rect(x,y+64,w,5,'#25324A',2,'none')+rect(x,y+64,w*value/target,5,color,2,'none');}
function nutritionCard(y){const progress=1872/2400;return rect(28,y,484,218)+`<circle cx="105" cy="${y+76}" r="42" fill="none" stroke="#23324B" stroke-width="9"/><circle cx="105" cy="${y+76}" r="42" fill="none" stroke="#4D8DFF" stroke-width="9" stroke-linecap="round" stroke-dasharray="${263.89*progress} 263.89" transform="rotate(-90 105 ${y+76})"/>`+text(105,y+79,'78%',23,'#F4F7FF',650,'text-anchor="middle"')+text(105,y+98,'of goal',10,'#9EACC4',400,'text-anchor="middle"')+text(180,y+65,'1,872',34,'#F4F7FF',650)+text(291,y+65,'/ 2,400 kcal',14,'#A5B4CD')+text(180,y+93,'528 kcal remaining',14,'#9EACC4')+line(48,y+130,444)+[['PROTEIN',132,160,'#6A9DFF'],['CARBS',210,260,'#86B9E7'],['FAT',56,80,'#FFAD76']].map((m,i)=>{const x=48+i*151;return label(x,y+154,m[0])+text(x,y+182,m[1]+' / '+m[2]+' g',15,'#E6EEFF',550)+rect(x,y+195,132,4,'#26344E',2,'none')+rect(x,y+195,132*m[1]/m[2],4,m[3],2,'none');}).join('');}
let today='';
today+=rect(28,178,484,117,'#101827');
['MON','TUE','WED','THU','FRI','SAT','SUN'].forEach((d,i)=>{const x=40+i*67;today+=i===2?rect(x,190,58,93,'#246BFF',12,'#246BFF'):'';today+=text(x+29,216,d,10,i===2?'#E6EEFF':'#90A0BC',600,'text-anchor="middle"')+text(x+29,248,i+2,24,'#F4F7FF',650,'text-anchor="middle"');if(i===0||i===2)today+=`<circle cx="${x+29}" cy="267" r="3" fill="${i===2?'#D5E4FF':'#4D8DFF'}"/>`;});
today+=label(28,330,'YOUR TRAINING')+text(508,330,'View all',12,'#80ADFF',500,'text-anchor="end"')+rect(28,346,484,143,'url(#card)',18,'#34517E')+rect(48,365,43,43,'#244576',12,'#244576')+icon('bar',58,375)+text(108,384,'Lower body A',23,'#F4F7FF',600)+text(108,409,'4 exercises · 13 working sets',13,'#B0C0DA')+rect(48,433,444,37,'#246BFF',8,'#246BFF')+text(270,457,'Open workout',14,'#FFFFFF',600,'text-anchor="middle"')+icon('arrow',459,440,'#FFFFFF');
today+=label(28,525,'NUTRITION TODAY')+nutritionCard(541);
let workout=rect(28,179,484,81,'url(#card)',18,'#34517E')+label(48,204,'LOWER BODY A')+text(48,237,'4 exercises',23,'#F4F7FF',600)+text(491,234,'13 working sets',13,'#AFC2DF',450,'text-anchor="end"');
workout+=rect(28,278,484,285)+label(48,304,'EXERCISE 1 OF 4')+text(48,337,'Barbell back squat',25,'#F4F7FF',600)+text(48,363,'Working sets · kg',13,'#96A7C3')+line(48,381,444);
workout+=['SET','WEIGHT','REPS','LOGGED'].map((s,i)=>label([54,169,291,421][i],405,s)).join('');
[1,2,3,4].forEach((n,i)=>{const y=433+i*30;workout+=(i<2?rect(42,y-19,456,28,'#162842',6,'none'):'')+text(58,y,n,14,'#AFC0DC',500)+text(181,y,'80',15,'#E8F0FF',550)+text(301,y,'6',15,'#E8F0FF',550)+(i<2?icon('check',445,y-17,'#8DB9FF'):text(456,y,'—',15,'#6C7D9B'));});
workout+=label(28,599,'UP NEXT');
[['Romanian deadlift','3 sets × 8 reps · 70 kg'],['Leg press','3 sets × 10 reps · 140 kg']].forEach((a,i)=>{const y=615+i*66;workout+=rect(28,y,484,57,'#101827',12)+text(47,y+23,a[0],16,'#E6EEFF',550)+text(47,y+44,a[1],12,'#99AAC6')+text(488,y+34,'›',25,'#7598C9',400,'text-anchor="end"');});
let nutrition=nutritionCard(178)+label(28,431,'FOOD DIARY')+text(510,431,'3 meals logged',12,'#9EACC4',400,'text-anchor="end"');
const meals=[['BREAKFAST','Oats, yogurt & berries',496,32,56,16],['LUNCH','Chicken, rice & avocado',768,56,100,16],['SNACK','Cottage cheese, toast & nuts',608,44,54,24]];
meals.forEach((m,i)=>{const y=449+i*87;nutrition+=rect(28,y,484,77,'#111928',13)+label(45,y+22,m[0])+text(45,y+46,m[1],15,'#F0F5FF',550)+text(45,y+66,'P '+m[3]+' g   ·   C '+m[4]+' g   ·   F '+m[5]+' g',11,'#9FB0CC')+text(492,y+32,m[2],21,'#F4F7FF',600,'text-anchor="end"')+text(492,y+52,'kcal',10,'#9EACC4',400,'text-anchor="end"');});
nutrition+=rect(28,722,484,31,'#183365',8,'#294F8C')+icon('plus',173,725,'#9DC2FF')+text(282,743,'Add food',13,'#BBD4FF',550,'text-anchor="middle"');
const designs={today:shell('Your day, in focus.','Wednesday, November 4',today,0),workout:shell('Your next session.','Wednesday, November 4 · Training',workout,1),nutrition:shell('Nutrition, made clear.','Wednesday, November 4 · Daily intake',nutrition,2)};
(async()=>{
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'/usr/lib/node_modules/openclaw/node_modules/playwright-core');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-background-networking']});
try{const page=await browser.newPage({viewport:{width:540,height:850},deviceScaleFactor:2});await page.route('**/*',r=>r.abort());
for(const [name,svg]of Object.entries(designs)){fs.writeFileSync(path.join(root,'assets','concept-'+name+'.svg'),svg);await page.setContent('<style>body{margin:0}</style>'+svg);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(root,'assets','concept-'+name+'.png')});console.log('Rendered '+name+' at 1080 × 1700');}
}finally{await browser.close();}
require('node:child_process').execFileSync('python3',['-c', 'from pathlib import Path; from PIL import Image; [Image.open(Path("assets") / ("concept-"+v+".png")).convert("RGB").save(Path("assets") / ("app-"+v+".webp"),quality=94,method=6) for v in ("today","workout","nutrition")]'],{cwd:root,stdio:'inherit'});
})().catch(e=>{console.error(e);process.exitCode=1;});
