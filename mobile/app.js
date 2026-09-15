const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);

// ---- 两个独立缓存域 ----
// 业务数据与管理后台原型共用（同源部署时是同一份）；手机离线队列单独存，
// 因为「离线移动端」与「离线网关」本来就是两个互不相关的缓存域，不能混为一谈。
const STORE='ship-tag-prototype-v1', MSTORE='ship-tag-mobile-v1';
let db=null, mb={online:true,queue:[]}, storageOK=true;
function loadDB(){try{const v=JSON.parse(localStorage.getItem(STORE));if(v&&v.version===4)return v;}catch{}return null;}
function loadMB(){try{const v=JSON.parse(localStorage.getItem(MSTORE));if(v&&v.version===1)return v;}catch{}return {version:1,online:true,queue:[]};}
function persist(){try{localStorage.setItem(STORE,JSON.stringify(db));localStorage.setItem(MSTORE,JSON.stringify(mb));}catch{storageOK=false;}}

// 管理后台没跑过时用的最小示例数据，字段与 v4 结构一致。
const fallback=()=>({version:4,demoNow:'2026-09-15 10:00:00',ship:{name:'海澜 01',code:'H2601'},
 dirs:[{id:'d1',name:'分段 E101 · 机舱分段',parent:'root'},{id:'d2',name:'主机舱',parent:'d1'},{id:'d3',name:'燃油供给部位',parent:'d2'},{id:'d4',name:'滑油系统部位',parent:'d2'},{id:'d5',name:'辅机舱',parent:'d1'},{id:'d6',name:'发电机组部位',parent:'d5'},{id:'d7',name:'分段 H201 · 货舱双层底',parent:'root'},{id:'d8',name:'双层底舱室',parent:'d7'},{id:'d9',name:'压载系统部位',parent:'d8'},{id:'d10',name:'分段 L301 · 上层建筑',parent:'root'},{id:'d11',name:'驾驶室',parent:'d10'},{id:'d12',name:'导航设备部位',parent:'d11'},{id:'d13',name:'配电间',parent:'d10'},{id:'d14',name:'分段 F401 · 首部',parent:'root'},{id:'d15',name:'锚链舱',parent:'d14'}],
 assets:[{id:'a1',code:'FO-001',name:'燃油输送泵 A',model:'CB-B40',dir:'d3',team:'轮机一组',owner:'张工',cycle:7,lastCheck:'2026-09-13 09:00:00',fault:false},
 {id:'a2',code:'FO-002',name:'燃油输送泵 B',model:'CB-B40',dir:'d3',team:'轮机一组',owner:'张工',cycle:7,lastCheck:'2026-09-08 20:00:00',fault:false},
 {id:'a3',code:'LO-001',name:'滑油泵',model:'ISW80',dir:'d4',team:'轮机二组',owner:'李工',cycle:7,lastCheck:'2026-09-06 10:00:00',fault:false},
 {id:'a4',code:'LO-002',name:'滑油滤器',model:'BR0.5',dir:'d4',team:'轮机二组',owner:'李工',cycle:30,lastCheck:'2026-09-01 09:00:00',fault:false},
 {id:'a5',code:'DG-001',name:'主发电机',model:'CCFJ120',dir:'d6',team:'电气组',owner:'陈工',cycle:30,lastCheck:'2026-08-10 08:00:00',fault:true},
 {id:'a6',code:'BW-001',name:'压载泵',model:'CLH150',dir:'d9',team:'轮机二组',owner:'李工',cycle:7,lastCheck:'2026-09-14 16:00:00',fault:false},
 {id:'a7',code:'NV-001',name:'导航雷达',model:'JMA-5312',dir:'d12',team:'电气组',owner:'陈工',cycle:30,lastCheck:'2026-09-14 11:00:00',fault:false},
 {id:'a8',code:'EL-001',name:'主配电柜',model:'MNS',dir:'d13',team:'电气组',owner:'陈工',cycle:7,lastCheck:'2026-09-09 02:00:00',fault:false},
 {id:'a9',code:'AN-001',name:'锚机',model:'YM-32',dir:'d15',team:'甲板组',owner:'王工',cycle:7,lastCheck:null,fault:false}],
 labels:[{id:'l1',mac:'C8:29:01:00:00:01',asset:'a1',online:true,battery:86,rssi:-56,version:1,published:1,last:'2026-09-15 09:40:02',state:'active'},
 {id:'l2',mac:'C8:29:01:00:00:02',asset:'a2',online:true,battery:72,rssi:-64,version:2,published:1,last:'2026-09-15 09:40:05',state:'active'},
 {id:'l3',mac:'C8:29:01:00:00:03',asset:'a3',online:false,battery:55,rssi:-89,version:2,published:1,last:'2026-09-13 17:12:40',state:'active'},
 {id:'l4',mac:'C8:29:01:00:00:04',asset:'a4',online:true,battery:12,rssi:-67,version:1,published:1,last:'2026-09-15 09:39:51',state:'active'},
 {id:'l5',mac:'C8:29:01:00:00:05',asset:'a5',online:true,battery:92,rssi:-60,version:1,published:1,last:'2026-09-15 09:40:10',state:'active'},
 {id:'l6',mac:'C8:29:01:00:00:06',asset:'a6',online:true,battery:65,rssi:-85,version:1,published:1,last:'2026-09-15 09:38:16',state:'active'},
 {id:'l7',mac:'C8:29:01:00:00:07',asset:'a7',online:true,battery:78,rssi:-63,version:1,published:1,last:'2026-09-15 09:40:12',state:'active'}],
 inspections:[],logs:[],settings:{low:20,weak:-80,offline:30,refresh:5,dueSoon:24}});

db=loadDB()||fallback(); mb=loadMB();
if(!db.inspections)db.inspections=[];
let usedFallback=!loadDB();

// ---- 派生：与管理后台同一套口径 ----
const HOUR=3600000,DAY=86400000;
const tms=t=>t?new Date(String(t).replace(/-/g,'/')).getTime():0;
const nowMs=()=>tms(db.demoNow);
const asset=id=>db.assets.find(a=>a.id===id);
const dir=id=>db.dirs.find(d=>d.id===id);
const labelFor=a=>db.labels.find(l=>l.asset===a?.id);
const path=id=>{const d=dir(id);return d?(d.parent==='root'?d.name:path(d.parent)+' / '+d.name):'Hull No. '+db.ship.code;};
const dueMs=a=>a.lastCheck?tms(a.lastCheck)+(a.cycle||30)*DAY:0;
const dueText=a=>a.lastCheck?new Date(dueMs(a)).toLocaleString('zh-CN',{hour12:false}):'—';
const checkState=a=>{if(!a.lastCheck)return 'never';const gap=dueMs(a)-nowMs();return gap<0?'overdue':gap<=db.settings.dueSoon*HOUR?'due':'normal';};
const overdueH=a=>Math.max(0,Math.round((nowMs()-dueMs(a))/HOUR));
const dueInH=a=>Math.round((dueMs(a)-nowMs())/HOUR);
const CHECK={normal:['正常',''],due:['临期','warn'],overdue:['逾期','bad'],never:['未点检','neutral']};
const pill=(t,k='')=>`<span class="pill ${k}">${esc(t)}</span>`;
const stateNote=a=>{const s=checkState(a);return s==='overdue'?'已超期 '+overdueH(a)+' 小时':s==='due'?'剩余 '+dueInH(a)+' 小时':s==='never'?'尚未首次点检':'截止 '+dueText(a);};
const queued=id=>mb.queue.some(q=>q.asset===id&&q.uploaded!==true);

// 按设备类型加载检查项：防呆表单的核心，避免用一张万能表单糊弄所有设备。
const LISTS=[[/泵/,['外观与铭牌完好','无异常渗漏','轴承温度正常','运转无异响','地脚螺栓紧固']],
 [/发电机/,['外观与铭牌完好','绝缘罩完好','冷却水位正常','无异常振动','接地线可靠']],
 [/雷达|导航|GPS/,['天线座无锈蚀','电缆接头密封','显示屏显示正常','固定螺栓紧固']],
 [/配电|电柜/,['柜门关闭良好','无异味与放电痕迹','指示灯正常','接地可靠']],
 [/锚机|绞|舵/,['刹车带磨损在范围内','液压系统无渗漏','链轮无裂纹','润滑到位']],
 [/滤器|滤/,['壳体无渗漏','压差在允许范围','密封圈完好']]];
const checklist=a=>(LISTS.find(([re])=>re.test(a.name))||[null,['外观完好','标识清晰','无异常声响','固定可靠']])[1];

// ---- 状态 ----
let view='home', current=null, form=null, doneRec=null, sheetOpen=false;
const toastEl=$('#toast');let toastTimer;
function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2600);}
function go(v){view=v;render();$('#screen').scrollTop=0;}

// ================= 首页 =================
function home(){const mine=db.assets;
 const ov=mine.filter(a=>['overdue','never'].includes(checkState(a))),due=mine.filter(a=>checkState(a)==='due');
 const pend=mb.queue.filter(q=>!q.uploaded);
 const list=[...ov,...due].map(a=>{const st=checkState(a),q=queued(a.id);
  return `<button class="row" data-act="open" data-id="${a.id}" style="width:100%;border:0;background:none;text-align:left">
   <span class="mark ${st==='due'?'warn':'bad'}">${st==='due'?'!':'⚠'}</span>
   <span class="row-main"><strong>${esc(a.name)}</strong><small>${esc(path(a.dir))}</small><small>${esc(stateNote(a))}</small></span>
   ${q?pill('待补传','warn'):pill(CHECK[st][0],CHECK[st][1])}</button>`;}).join('');
 return `<div class="screen-head"><h2>今日点检</h2><p>${esc(db.ship.name)} · Hull No. ${esc(db.ship.code)} · 基准时间 ${esc(db.demoNow)}</p></div>
 ${usedFallback?`<div class="hint warn">未读到管理后台的演示数据，当前使用内置示例。若要两端联动，请从同一来源打开管理后台原型并保持同源。</div>`:''}
 ${!mb.online?`<div class="hint warn"><strong>当前处于离线模式</strong><br>深舱、双层底通常完全无网络覆盖。此时点检照常进行，记录先存在手机本地，走到有信号处再自动补传。</div>`:''}
 <button class="nfc" data-act="tap"><span class="wave"></span><span class="wave w2"></span>
  <strong>碰一碰标签开始点检</strong>
  <span>无需预先打开 App，手机背部轻碰标签即可直达该设备的点检表单。本原型用手动选标签模拟。</span></button>
 <div class="stat-row">
  <div class="stat-box bad"><strong>${ov.length}</strong><span>逾期</span></div>
  <div class="stat-box warn"><strong>${due.length}</strong><span>临期</span></div>
  <div class="stat-box"><strong>${pend.length}</strong><span>待补传</span></div></div>
 ${pend.length?`<button class="btn" data-act="queue" style="margin-bottom:12px">查看 ${pend.length} 条待补传记录 →</button>`:''}
 <div class="card"><h3>待办设备</h3>${list||'<p class="empty">当前没有逾期或临期设备</p>'}</div>
 <div class="card"><h3>防假检：这套机制成不成立</h3>
  <ul class="chain">
   <li><span class="st wait">?</span><div><strong>NFC 近场证明「人在设备旁」</strong><small>候选机 NFC 仅为可选项，未给芯片型号与防克隆方案 —— <b>未落实</b></small></div></li>
   <li><span class="st ok">✓</span><div><strong>登录身份 + 提交时间</strong><small>可由边缘服务记录，本原型模拟</small></div></li>
   <li><span class="st ok">✓</span><div><strong>异常项强制拍照存证</strong><small>表单已实现强制校验</small></div></li>
   <li><span class="st wait">?</span><div><strong>防重放 / 防克隆凭证</strong><small>普通 NDEF URL 不足以防复制，需动态凭证方案 —— 未证明</small></div></li></ul>
  <p style="margin-top:10px">只有第一条和第四条落实，「必须到现场」才真正成立。仅靠登录与时间，仍无法排除远程代打卡。</p></div>`;}

// ================= 碰一碰：选标签 =================
function tapSheet(){const rows=db.labels.filter(l=>l.asset).map(l=>{const a=asset(l.asset),st=checkState(a);
 return `<button class="row" data-act="open" data-id="${a.id}" style="width:100%;border:0;background:none;text-align:left">
  <span class="mark ${st==='overdue'||st==='never'?'bad':st==='due'?'warn':''}">◎</span>
  <span class="row-main"><strong>${esc(a.name)}</strong><small>${esc(l.mac)} · ${esc(path(a.dir))}</small></span>
  ${pill(CHECK[st][0],CHECK[st][1])}</button>`;}).join('');
 sheet('模拟碰一碰',`<div class="hint bad"><strong>这一步在真机上是碰标签，不是点列表。</strong><br>NFC 免密唤起要求标签内置 NFC Forum Type 2 芯片并预写设备身份，而候选机 STag29AQ 的 NFC 是可选项。此处列出标签仅为演示后续流程。</div>${rows}`);}

// ================= 点检表单 =================
function formView(){const a=current,l=labelFor(a),items=checklist(a);
 if(!form)form={results:items.map(()=>'ok'),note:'',photo:false,user:'张工',fault:false};
 const bad=form.results.some(r=>r==='bad');
 return `<div class="screen-head"><h2>${esc(a.name)}</h2><p>${esc(a.code)} · ${esc(a.model)} · ${esc(path(a.dir))}</p></div>
 <div class="card"><div class="row" style="padding-top:0">
   <span class="row-main"><strong>当前状态</strong><small>${esc(stateNote(a))}</small></span>${pill(CHECK[checkState(a)][0],CHECK[checkState(a)][1])}</div>
  <div class="row"><span class="row-main"><strong>责任班组 / 周期</strong><small>${esc(a.team)} · 每 ${a.cycle} 天</small></span></div>
  <div class="row"><span class="row-main"><strong>关联标签</strong><small>${l?esc(l.mac):'未绑定'}</small></span>${l?pill(l.online?'在线':'离线',l.online?'':'neutral'):pill('未绑定','neutral')}</div></div>
 <div class="card"><h3>检查项 · 按设备类型加载</h3>
  ${items.map((t,i)=>`<label class="check"><input type="checkbox" data-ck="${i}" ${form.results[i]==='ok'?'checked':''}>
   <span class="ck-main">${esc(t)}</span>
   <button type="button" class="ck-bad ${form.results[i]==='bad'?'on':''}" data-act="mark-bad" data-id="${i}">异常</button></label>`).join('')}</div>
 ${bad?`<div class="card"><h3>异常存证 <span class="pill bad">必填</span></h3>
  <label class="field"><span>异常描述</span><textarea data-fld="note" placeholder="简要描述异常现象、位置与初步判断">${esc(form.note)}</textarea></label>
  <div class="photo ${form.photo?'on':''}" data-act="photo" role="button" tabindex="0">${form.photo?'✓ 已拍照存证（模拟）':'＋ 点击模拟拍照存证'}</div>
  <label class="check" style="margin-top:12px"><input type="checkbox" data-fld="fault" ${form.fault?'checked':''}><span class="ck-main">转报修工单，并推送维保班组长</span></label></div>`:''}
 <label class="field"><span>执行人</span><input data-fld="user" value="${esc(form.user)}"></label>
 <div class="hint">${mb.online?'当前在线：提交后直接上报边缘服务，并尝试调度标签刷屏。':'当前离线：提交后先存在手机本地，回到有信号处再补传。'}</div>
 <button class="btn primary" data-act="submit">提交点检</button>
 <button class="btn" data-act="home">返回</button>`;}

// ================= 提交 =================
function submitForm(){const a=current,items=checklist(a);
 const bad=form.results.some(r=>r==='bad');
 if(bad&&!form.note.trim())return toast('异常项必须填写描述');
 if(bad&&!form.photo)return toast('异常项必须拍照存证');
 if(!form.user.trim())return toast('请填写执行人');
 const rec={id:uid('q'),asset:a.id,user:form.user.trim(),time:db.demoNow,
  result:bad?'abnormal':'normal',note:form.note.trim(),photo:form.photo,fault:form.fault,
  items:items.map((t,i)=>({t,ok:form.results[i]==='ok'})),
  savedLocal:true,uploaded:false,screen:null};
 mb.queue.unshift(rec);
 if(mb.online)upload(rec);
 persist();doneRec=rec;form=null;go('done');}

// 补传：把手机本地记录写入业务数据。三个状态必须分开，
// 「手机已保存」不等于「边缘服务已接收」，更不等于「标签已刷新」。
function upload(rec){const a=asset(rec.asset);if(!a)return;
 db.inspections.unshift({id:uid('ins'),asset:rec.asset,user:rec.user,time:rec.time,result:rec.result,note:rec.note,photo:rec.photo});
 a.lastCheck=rec.time;
 if(rec.fault)a.fault=true;
 const l=labelFor(a);
 if(l){l.version++;                       // 倒计时变了 → 标签内容待更新
  if(l.online){l.published=l.version;rec.screen='refreshed';} // 在线才谈得上刷屏成功
  else rec.screen='pending';}
 else rec.screen='nolabel';
 rec.uploaded=true;rec.uploadTime=db.demoNow;
 (db.logs=db.logs||[]).unshift({time:db.demoNow,action:'移动端点检补传',detail:a.name+' · '+(rec.result==='abnormal'?'异常':'正常')});
 persist();}

function doneView(){const r=doneRec,a=asset(r.asset),l=labelFor(a);
 const refreshed=r.screen==='refreshed';
 return `<div class="done-wrap"><div class="done-ring">${r.uploaded?'✓':'⏱'}</div>
  <h2 style="font-size:19px;font-weight:640">${r.uploaded?'点检已完成':'已存到手机本地'}</h2>
  <p style="font-size:11.5px;color:var(--muted);margin-top:5px">${esc(a.name)} · ${esc(r.time)}</p></div>
 <div class="card"><h3>标签现场反馈</h3>
  <div class="eink ${refreshed?'':'overdue'}">${refreshed?'':'<div class="bar">⚠ 逾期未检！已超期 '+overdueH(a)+' 小时</div>'}
   <div class="top"><span>设备资产</span><span>${esc(a.code)}</span></div>
   <div class="nm">${esc(a.name)}</div>
   <div class="sub">${refreshed?'下次点检 '+esc(dueText(a)):'内容待更新'}</div>
   <div class="btm"><span>${esc(dir(a.dir)?.name||'')}</span><span>${esc(a.team)}</span></div></div>
  <div class="led"><i class="${refreshed?'green':r.uploaded?'amber':''}"></i>
   ${refreshed?'绿灯常亮 3 秒 · 现场物理核销反馈':r.uploaded?'标签离线，点灯与刷屏指令待下发':'尚未上报，标签无任何变化'}</div></div>
 <div class="card"><h3>闭环状态 · 三段必须分开看</h3>
  <ul class="chain">
   <li><span class="st ok">✓</span><div><strong>手机本地已保存</strong><small>${esc(r.time)} · 断网也不会丢</small></div></li>
   <li><span class="st ${r.uploaded?'ok':'wait'}">${r.uploaded?'✓':'…'}</span><div><strong>边缘服务已接收</strong><small>${r.uploaded?esc(r.uploadTime)+' · 已写入点检流水':'等待恢复网络后自动补传'}</small></div></li>
   <li><span class="st ${refreshed?'ok':'wait'}">${refreshed?'✓':'…'}</span><div><strong>标签已刷新 / 已点灯</strong><small>${refreshed?'标签在线，刷屏回执已确认':l?'标签当前离线，已标记为待更新；恢复在线后需重新下发':'该设备未绑定标签'}</small></div></li></ul>
  <p style="margin-top:10px">${refreshed?'三段都完成，才叫一次真正闭环的点检。':'前面完成不代表后面完成 —— 「已提交」不等于现场那块屏已经变了。'}</p></div>
 ${r.fault?`<div class="hint bad"><strong>已转报修工单</strong><br>该设备标记为「故障报修中」，派工消息与现场照片已推送给维保班组长（模拟）。</div>`:''}
 <button class="btn primary" data-act="home">返回今日点检</button>`;}

// ================= 补传队列 =================
function queueView(){const q=mb.queue;
 const rows=q.map(r=>{const a=asset(r.asset);
  return `<div class="row"><span class="mark ${r.uploaded?'':'warn'}">${r.uploaded?'✓':'↑'}</span>
   <span class="row-main"><strong>${esc(a?.name||'已删除设备')}</strong>
    <small>${esc(r.time)} · ${esc(r.user)} · ${r.result==='abnormal'?'异常':'正常'}${r.photo?' · 已拍照':''}</small>
    <small>${r.uploaded?(r.screen==='refreshed'?'已上报 · 标签已刷新':r.screen==='pending'?'已上报 · 标签离线，待刷新':'已上报 · 未绑定标签'):'仅存于手机本地'}</small></span>
   ${r.uploaded?pill('已上报'):pill('待补传','warn')}</div>`;}).join('');
 const pend=q.filter(r=>!r.uploaded).length;
 return `<div class="screen-head"><h2>离线队列</h2><p>手机本地缓存 · 共 ${q.length} 条，其中 ${pend} 条待补传</p></div>
 <div class="hint">手机离线队列与网关离线缓存是<b>两个互不相关的缓存域</b>，各自有记录 ID、版本与补传状态，正式方案必须分别设计幂等键与冲突规则。</div>
 <div class="card"><div class="row" style="padding-top:0">
   <span class="row-main"><strong>网络状态</strong><small>${mb.online?'在线 · 提交后立即上报':'离线 · 提交先存本地'}</small></span>
   <button class="btn" style="width:auto;padding:8px 13px" data-act="net">${mb.online?'切到离线':'恢复网络'}</button></div></div>
 ${pend&&mb.online?`<button class="btn primary" data-act="flush" style="margin-bottom:12px">立即补传 ${pend} 条</button>`:''}
 <div class="card"><h3>记录</h3>${rows||'<p class="empty">暂无记录</p>'}</div>
 ${q.length?`<button class="btn" data-act="clearq">清空队列（仅清手机本地）</button>`:''}`;}

// ================= 需求对照 =================
function reqView(){const ids=Object.keys(DOC.requirements);
 return `<div class="screen-head"><h2>需求对照</h2><p>产品文档 ${esc(DOC.version)} / 5.6 移动端 · 共 ${ids.length} 条</p></div>
 <div class="hint warn">标「依赖未落实」的需求，原型可以走通界面流程，但真机上能否成立取决于标签 NFC 是否落实。</div>
 <div class="card">${ids.map(id=>{const r=DOC.requirements[id],s=DOC.status[id]||'plan';
  const tag=s==='ok'?'<span class="tag">原型可演示</span>':s==='dep'?'<span class="tag dep">依赖未落实</span>':'<span class="tag plan">原型未实现</span>';
  return `<div class="req-item"><span class="no">${esc(r.section)} · ${String(r.no).padStart(2,'0')}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${tag}</div>`;}).join('')}</div>
 <div class="card"><h3>本原型没做到的</h3><p>真实 NFC 唤起、真实拍照与图片上传、后台定时补传、工单状态机、与 MES/EAM 的对接。屏幕与 LED 的「变屏变灯」是界面模拟，不连接现场设备。</p></div>`;}

// ================= 渲染 =================
const TABS=[['home','今日','◎'],['queue','队列','↑'],['req','需求','☰']];
function render(){
 $('#netbar').className='phone-net'+(mb.online?'':' off');
 $('#netbar').innerHTML=`<i></i>${mb.online?'在线':'离线'} · ${esc(db.ship.code)}`;
 const pend=mb.queue.filter(r=>!r.uploaded).length;
 $('#tabbar').innerHTML=TABS.map(([v,n,ic])=>`<button data-act="tab" data-id="${v}" class="${view===v||(v==='home'&&['form','done'].includes(view))?'active':''}" ${view===v?'aria-current="page"':''}><strong>${ic}</strong>${n}${v==='queue'&&pend?'<span class="dot"></span>':''}</button>`).join('');
 $('#screen').innerHTML=view==='form'?formView():view==='done'?doneView():view==='queue'?queueView():view==='req'?reqView():home();
}

// ================= 事件 =================
function sheet(title,body){$('#sheet-title').textContent=title;$('#sheet-body').innerHTML=body;$('#sheet').hidden=false;sheetOpen=true;}
function closeSheet(){$('#sheet').hidden=true;sheetOpen=false;}
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el)return;
 const {act,id}=el.dataset;
 switch(act){
  case 'tab':closeSheet();go(id);break;
  case 'tap':tapSheet();break;
  case 'open':closeSheet();current=asset(id);form=null;go('form');break;
  case 'home':go('home');break;
  case 'queue':go('queue');break;
  case 'mark-bad':{const i=+id;form.results[i]=form.results[i]==='bad'?'ok':'bad';render();break;}
  case 'photo':form.photo=!form.photo;render();break;
  case 'submit':submitForm();break;
  case 'net':mb.online=!mb.online;if(mb.online){const n=mb.queue.filter(r=>!r.uploaded);n.forEach(upload);if(n.length)toast(`网络恢复，已自动补传 ${n.length} 条`);else toast('网络已恢复');}else toast('已切到离线模式');persist();render();break;
  case 'flush':{const n=mb.queue.filter(r=>!r.uploaded);n.forEach(upload);persist();render();toast(`已补传 ${n.length} 条`);break;}
  case 'clearq':mb.queue=[];persist();render();toast('已清空手机本地队列（不影响已上报的数据）');break;
  case 'sheet-close':closeSheet();break;
 }
});
document.addEventListener('change',e=>{
 const ck=e.target.dataset.ck, fld=e.target.dataset.fld;
 if(ck!==undefined&&form){form.results[+ck]=e.target.checked?'ok':'bad';render();}
 if(fld&&form){form[fld]=e.target.type==='checkbox'?e.target.checked:e.target.value;if(fld==='fault')render();}
});
document.addEventListener('input',e=>{const fld=e.target.dataset.fld;if(fld&&form&&e.target.type!=='checkbox')form[fld]=e.target.value;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheetOpen)closeSheet();
 if(e.key==='Enter'&&e.target.classList?.contains('photo')){form.photo=!form.photo;render();}});
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeSheet();});
$('#clock').textContent=db.demoNow.slice(11,16);
render();
