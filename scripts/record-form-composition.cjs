const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const fast=process.env.LOOM_RECORD_FAST==='1';
const output=path.resolve('artifacts/form-composition');
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const warm=await browser.newPage();
 for(const route of ['/form-components','/form-builder','/form-preview'])await warm.goto('http://127.0.0.1:3000'+route);
 await warm.close();
 const context=await browser.newContext({viewport:{width:1920,height:1080},...(fast?{}:{recordVideo:{dir:output,size:{width:1920,height:1080}}})});
 await context.addInitScript(()=>window.addEventListener('DOMContentLoaded',()=>{
  const cursor=document.createElement('div');cursor.id='recording-cursor';cursor.style.cssText='position:fixed;left:960px;top:540px;z-index:2147483647;pointer-events:none;width:22px;height:22px;border:2px solid #5a49f4;border-radius:50%;background:rgba(90,73,244,.15);transform:translate(-50%,-50%);box-shadow:0 0 0 3px rgba(255,255,255,.85)';document.body.appendChild(cursor);
  document.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';},true);
  document.addEventListener('pointerdown',()=>cursor.style.background='rgba(90,73,244,.6)',true);
  document.addEventListener('pointerup',()=>cursor.style.background='rgba(90,73,244,.15)',true);
 }));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const pause=ms=>page.waitForTimeout(fast?Math.min(ms,15):ms);
 let mouse={x:960,y:540};
 const move=async(x,y,duration=400)=>{const start={...mouse};const count=fast?1:Math.round(duration/25);for(let i=1;i<=count;i++){const t=i/count,e=t*t*(3-2*t);await page.mouse.move(start.x+(x-start.x)*e,start.y+(y-start.y)*e);if(!fast)await pause(25);}mouse={x,y};};
 const click=async locator=>{
  if(fast){await locator.click();return;}
  await locator.evaluate(el=>el.scrollIntoView({behavior:'smooth',block:'nearest'}));await pause(500);
  const b=await locator.boundingBox();if(!b)throw Error('Missing click target');
  await move(b.x+b.width/2,b.y+b.height/2);await pause(180);await locator.click({delay:100});await pause(350);
 };
 const type=async(locator,value)=>{
  if(fast){await locator.fill(value);return;}
  await click(locator);await locator.press('Meta+A');for(const char of value){await page.keyboard.insertText(char);await pause(60);}await pause(250);
 };
 const inspector=page.locator('.loom-studio-panel--inspector');
 const write=async(label,value)=>type(inspector.getByLabel(label,{exact:true}),value);
 const choose=async(label,value)=>{const locator=inspector.getByLabel(label,{exact:true});if(!fast)await click(locator);await locator.selectOption(value);await locator.press('Escape');await pause(450);};
 const save=async()=>{await click(page.getByRole('button',{name:'設定を保存',exact:true}));await pause(600);};
 const add=async name=>{await click(page.getByRole('button',{name:'追加: '+name,exact:true}));await pause(650);};
 const select=async label=>{await click(page.getByRole('button',{name:'選択: '+label,exact:true}));await pause(700);};
 const scroll=async(amount,x=1000,y=650)=>{await move(x,y);for(let i=0;i<(fast?1:24);i++){await page.mouse.wheel(0,amount/(fast?1:24));await pause(30);}await pause(700);};
 await page.goto('http://127.0.0.1:3000/form-components');await pause(3000);await scroll(540);await pause(2200);await scroll(490);await pause(2200);await scroll(-1400);await pause(1200);
 console.log('Layout and component library inspected');
 await click(page.getByRole('link',{name:'部品を組み合わせてフォームをつくる →'}));await page.waitForURL('**/form-builder');await pause(1300);
 await click(page.getByRole('button',{name:'新しいフォーム',exact:true}));await pause(1000);
 await add('Header');await write('タイトル','デザインワークショップ参加申込');await write('説明','必要事項を入力して、お好きなコースを選んでください。約1分で入力できます。');await save();
 await select('フォーム');await add('Panel');await save();
 await add('Grid');await write('表示名','氏名の2列');await choose('間隔','compact');await save();
 await add('Input');await write('表示名','姓');await write('プレースホルダー','井上');await save();
 await add('Input');await write('表示名','名');await write('プレースホルダー','花子');await save();
 console.log('Header, Panel and a two-column Grid composed');
 await select('参加者情報');await add('Stack');await write('表示名','連絡先グループ');await save();
 await add('Heading');await save();
 await add('Input');await write('表示名','メールアドレス');await write('プレースホルダー','hanako@example.com');await choose('入力形式','email');await save();
 await select('参加者情報');await add('Divider');
 await add('Row');await write('表示名','コースと所属');await save();
 await add('Select');await write('選択肢（1行に1件）','UIデザイン\nフロントエンド\nプロダクト設計');await save();
 await add('Input');await write('表示名','所属');await write('プレースホルダー','会社・チーム名');await click(inspector.getByRole('checkbox',{name:'必須入力',exact:true}));await save();
 await select('参加者情報');await add('Textarea');await write('表示名','参加の目的');await write('プレースホルダー','学びたいことを教えてください');await save();
 console.log('Stack and Row composed with email, select and textarea fields');
 await select('フォーム');await add('Notice');
 await select('フォーム');await add('Checkbox');
 await select('フォーム');await add('Row');await write('表示名','送信エリア');await choose('間隔','compact');await save();
 await add('Copy');await write('本文','約1分で入力できます。');await save();
 await add('Button');await save();
 await select('氏名の2列');await choose('列数','1');await save();await pause(1600);await choose('列数','2');await save();await pause(1600);
 const built=await page.evaluate(()=>JSON.parse(localStorage.getItem('loom-studio:form:v1')));
 const flatten=node=>[node,...(node.children||[]).flatMap(flatten)];
 const nodes=flatten(built.root);for(const kind of ['Grid','Stack','Row','Panel','FormHeader','TextInput','SelectField','TextArea','CheckboxField','SubmitButton','Notice','Heading','Divider','FormCopy'])assert(nodes.some(node=>node.type===kind),'Missing '+kind);
 assert.equal(nodes.filter(node=>node.type==='TextInput').length,4);
 assert.equal(nodes.find(node=>node.type==='Grid').props.columns,2);
 fs.writeFileSync(output+'/workshop-form.json',JSON.stringify(built,null,2));
 console.log('Complete form saved: '+nodes.length+' components');
 await page.reload();await page.getByRole('button',{name:'選択: デザインワークショップ参加申込',exact:true}).waitFor();await pause(1700);
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('loom-studio:form:v1')));assert.deepEqual(restored,built);
 await click(page.getByRole('link',{name:'フォームをプレビュー',exact:true}));await page.waitForURL('**/form-preview');await pause(2300);
 const submit=page.getByRole('button',{name:'申込内容を確認',exact:true});await click(submit);await pause(1300);assert.equal(await page.locator('.loom-form-error').count(),1);
 await page.locator('.loom-form-error').evaluate(el=>el.scrollIntoView({behavior:'smooth',block:'center'}));await pause(1500);
 await type(page.getByRole('textbox',{name:/^姓/}),'井上');await type(page.getByRole('textbox',{name:/^名/}),'花子');
 await type(page.getByRole('textbox',{name:/^メールアドレス/}),'hanako@example.com');
 const course=page.getByRole('combobox',{name:/^参加コース/});if(!fast)await click(course);await course.selectOption('プロダクト設計');await course.press('Escape');await pause(600);
 await type(page.getByRole('textbox',{name:/^所属/}),'Loom Studio');await type(page.getByRole('textbox',{name:/^参加の目的/}),'チームで使うフォームの設計を学びたいです。');
 await click(page.getByRole('checkbox',{name:/参加規約に同意します/}));await pause(1200);
 await click(submit);await page.getByRole('heading',{name:'入力内容を確認しました',exact:true}).waitFor();
 const confirmation=page.locator('.loom-form-confirmation');assert((await confirmation.innerText()).includes('プロダクト設計'));assert((await confirmation.innerText()).includes('hanako@example.com'));assert((await confirmation.innerText()).includes('同意済み'));
 await confirmation.evaluate(el=>el.scrollIntoView({behavior:'smooth',block:'center'}));await pause(3500);
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));await pause(1700);
 await page.screenshot({path:output+'/workshop-form-preview.png',fullPage:true,style:'#recording-cursor { display:none!important; }'});
 await confirmation.evaluate(el=>el.scrollIntoView({behavior:'smooth',block:'center'}));await pause(2500);
 assert.deepEqual(errors,[]);
 fs.writeFileSync(output+'/verification.json',JSON.stringify({components:nodes.length,layouts:['Grid','Stack','Row','Panel'],checks:['nested composition','one/two column change','draft restore','required validation','real form input','local confirmation'],browserErrors:errors},null,2));
 console.log('Draft restoration, required validation and real form interaction verified');
 const video=fast?null:page.video();await context.close();
 if(video){const videoPath=await video.path();console.log('VIDEO_PATH='+videoPath);const mp4=path.resolve('artifacts/loom-form-composition.mp4');const conversion=require('child_process').spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',videoPath,'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',mp4],{stdio:'inherit'});if(conversion.error||conversion.status!==0)throw Error('MP4 conversion requires ffmpeg');console.log('MP4_PATH='+mp4);}
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
