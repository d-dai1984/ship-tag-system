const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
const stamp=()=>new Date().toLocaleString('zh-CN',{hour12:false});
const STORE='ship-tag-prototype-v1';
const seed=()=>({
  version:4,ship:{name:'海澜 01',code:'H2601'},
 // 演示基准时间：点检状态全部相对它计算，保证原型在任何日期打开都呈现同一套示例状态。
 demoNow:'2026-09-15 10:00:00',
 // 四级目录：Hull No.（root）→ 分段 → 舱室 → 部位。d13 配电间、d15 锚链舱下直接挂资产，演示跳级。
 dirs:[{id:'d1',name:'分段 E101 · 机舱分段',parent:'root'},{id:'d2',name:'主机舱',parent:'d1'},{id:'d3',name:'燃油供给部位',parent:'d2'},{id:'d4',name:'滑油系统部位',parent:'d2'},{id:'d5',name:'辅机舱',parent:'d1'},{id:'d6',name:'发电机组部位',parent:'d5'},{id:'d7',name:'分段 H201 · 货舱双层底',parent:'root'},{id:'d8',name:'双层底舱室',parent:'d7'},{id:'d9',name:'压载系统部位',parent:'d8'},{id:'d10',name:'分段 L301 · 上层建筑',parent:'root'},{id:'d11',name:'驾驶室',parent:'d10'},{id:'d12',name:'导航设备部位',parent:'d11'},{id:'d13',name:'配电间',parent:'d10'},{id:'d14',name:'分段 F401 · 首部',parent:'root'},{id:'d15',name:'锚链舱',parent:'d14'}],
 // cycle=保养周期(天)，lastCheck=上次点检时间，fault=故障报修中。点检状态由 cycle+lastCheck 相对 demoNow 推算，不落库。
 assets:[
 {id:'a1',code:'FO-001',name:'燃油输送泵 A',model:'CB-B40',dir:'d3',team:'轮机一组',owner:'张工',cycle:7,lastCheck:'2026-09-13 09:00:00',fault:false},
 {id:'a2',code:'FO-002',name:'燃油输送泵 B',model:'CB-B40',dir:'d3',team:'轮机一组',owner:'张工',cycle:7,lastCheck:'2026-09-08 20:00:00',fault:false},
 {id:'a3',code:'LO-001',name:'滑油泵',model:'ISW80',dir:'d4',team:'轮机二组',owner:'李工',cycle:7,lastCheck:'2026-09-06 10:00:00',fault:false},
 {id:'a4',code:'LO-002',name:'滑油滤器',model:'BR0.5',dir:'d4',team:'轮机二组',owner:'李工',cycle:30,lastCheck:'2026-09-01 09:00:00',fault:false},
 {id:'a5',code:'DG-001',name:'主发电机',model:'CCFJ120',dir:'d6',team:'电气组',owner:'陈工',cycle:30,lastCheck:'2026-08-10 08:00:00',fault:true},
 {id:'a6',code:'BW-001',name:'压载泵',model:'CLH150',dir:'d9',team:'轮机二组',owner:'李工',cycle:7,lastCheck:'2026-09-14 16:00:00',fault:false},
 {id:'a7',code:'NV-001',name:'导航雷达',model:'JMA-5312',dir:'d12',team:'电气组',owner:'陈工',cycle:30,lastCheck:'2026-09-14 11:00:00',fault:false},
 {id:'a8',code:'EL-001',name:'主配电柜',model:'MNS',dir:'d13',team:'电气组',owner:'陈工',cycle:7,lastCheck:'2026-09-09 02:00:00',fault:false},
 {id:'a9',code:'AN-001',name:'锚机',model:'YM-32',dir:'d15',team:'甲板组',owner:'王工',cycle:7,lastCheck:null,fault:false}],
 // 点检流水：每次点检的执行人、时间、结果与备注，可审计追溯。
 inspections:[
 {id:'ins1',asset:'a7',user:'陈工',time:'2026-09-14 11:00:00',result:'abnormal',note:'天线座有锈迹，已拍照存证',photo:true},
 {id:'ins2',asset:'a6',user:'李工',time:'2026-09-14 16:00:00',result:'normal',note:'',photo:false},
 {id:'ins3',asset:'a1',user:'张工',time:'2026-09-13 09:00:00',result:'normal',note:'',photo:false},
 {id:'ins4',asset:'a2',user:'张工',time:'2026-09-08 20:00:00',result:'normal',note:'',photo:false},
 {id:'ins5',asset:'a3',user:'李工',time:'2026-09-06 10:00:00',result:'normal',note:'',photo:false},
 {id:'ins6',asset:'a5',user:'陈工',time:'2026-08-10 08:00:00',result:'abnormal',note:'轴承异响，已转报修工单',photo:true}],
 // 舱室级温湿度采集点。主机舱、双层底当前超限——注意这两处的实测值已超出候选标签自身 0-40°C / 45-70%RH 的工作范围。
 envPoints:[
 {id:'e1',dir:'d2',temp:38.2,humidity:72,tempMax:40,humidityMax:70,last:'2026-09-15 09:30:00'},
 {id:'e2',dir:'d8',temp:26.5,humidity:85,tempMax:40,humidityMax:70,last:'2026-09-15 09:30:00'},
 {id:'e3',dir:'d5',temp:33.0,humidity:64,tempMax:40,humidityMax:70,last:'2026-09-15 09:30:00'},
 {id:'e4',dir:'d11',temp:24.1,humidity:55,tempMax:40,humidityMax:70,last:'2026-09-15 09:30:00'},
 {id:'e5',dir:'d15',temp:22.0,humidity:68,tempMax:40,humidityMax:70,last:'2026-09-15 09:30:00'}],
 labels:[
 {id:'l1',mac:'C8:29:01:00:00:01',asset:'a1',online:true,battery:86,rssi:-56,template:'t1',version:1,published:1,gateway:'g1',last:'2026-09-14 09:40:02',state:'active'},
 {id:'l2',mac:'C8:29:01:00:00:02',asset:'a2',online:true,battery:72,rssi:-64,template:'t1',version:2,published:1,gateway:'g1',last:'2026-09-14 09:40:05',state:'active'},
 {id:'l3',mac:'C8:29:01:00:00:03',asset:'a3',online:false,battery:55,rssi:-89,template:'t1',version:2,published:1,gateway:'g1',last:'2026-09-13 17:12:40',state:'active'},
 {id:'l4',mac:'C8:29:01:00:00:04',asset:'a4',online:true,battery:12,rssi:-67,template:'t1',version:1,published:1,gateway:'g1',last:'2026-09-14 09:39:51',state:'active'},
 {id:'l5',mac:'C8:29:01:00:00:05',asset:'a5',online:true,battery:92,rssi:-60,template:'t2',version:1,published:1,gateway:'g2',last:'2026-09-14 09:40:10',state:'active'},
 {id:'l6',mac:'C8:29:01:00:00:06',asset:'a6',online:true,battery:65,rssi:-85,template:'t1',version:1,published:1,gateway:'g4',last:'2026-09-14 09:38:16',state:'active'},
 {id:'l7',mac:'C8:29:01:00:00:07',asset:'a7',online:true,battery:78,rssi:-63,template:'t1',version:1,published:1,gateway:'g3',last:'2026-09-14 09:40:12',state:'active'},
 {id:'l8',mac:'C8:29:01:00:00:08',asset:null,online:true,battery:100,rssi:-50,template:'t1',version:1,published:0,gateway:'g2',last:'2026-09-14 09:39:20',state:'active'},
 {id:'l9',mac:'C8:29:01:00:00:09',asset:null,online:false,battery:98,rssi:-74,template:'t1',version:1,published:0,gateway:'g2',last:'2026-09-12 10:21:08',state:'paused'}],
 groups:[{id:'gr1',name:'燃油系统标签',description:'跨部位集中维护燃油相关标签',members:['l1','l2']},{id:'gr2',name:'电气组设备',description:'跨分段管理电气类标签（辅机舱 + 上层建筑）',members:['l5','l7']}],
 fields:[{id:'code',name:'设备编码',type:'文本',required:true},{id:'name',name:'设备名称',type:'文本',required:true},{id:'model',name:'设备型号',type:'文本',required:false},{id:'dir',name:'所属目录',type:'目录',required:true},{id:'team',name:'责任班组',type:'文本',required:false},{id:'owner',name:'责任人',type:'文本',required:false}],
 templates:[{id:'t1',name:'通用设备标签',heading:'设备资产',color:'#202020',showModel:true,showOwner:true,revision:1},{id:'t2',name:'电气设备标签',heading:'电气设备',color:'#ae2424',showModel:true,showOwner:true,revision:1}],
 tasks:[{id:'job-demo',name:'滑油系统部位标签更新',time:'2026-09-14 09:20:00',items:[{label:'l3',version:2,status:'failed'}]}],
 strategies:[{id:'r1',name:'电气组专用模板',field:'team',value:'电气组',template:'t2',priority:1,enabled:true,scope:'all',schedule:'即时'},{id:'r2',name:'通用默认模板',field:'all',value:'',template:'t1',priority:99,enabled:true,scope:'all',schedule:'即时'}],
 gateways:[
 {id:'g1',name:'主机舱网关',dir:'d2',online:true,ip:'192.168.10.21',up:1284,down:412,backlog:0,last:'2026-09-15 09:58:12'},
 {id:'g2',name:'辅机舱网关',dir:'d5',online:true,ip:'192.168.10.22',up:903,down:288,backlog:0,last:'2026-09-15 09:57:40'},
 {id:'g3',name:'上层建筑网关',dir:'d10',online:true,ip:'192.168.10.23',up:671,down:190,backlog:0,last:'2026-09-15 09:59:03'},
 {id:'g4',name:'货舱网关',dir:'d7',online:false,ip:'192.168.10.24',up:0,down:0,backlog:1462,last:'2026-09-14 22:11:05'}],
 // 边缘服务器健康度示例，仅用于系统监控看板展示，不连接真实服务。
 health:{cpu:38,mem:61,disk:47,dbConn:12,dbSlow:2,dbSpace:34,reportRate:99.2,publishRate:96.5,api:'已连接',mqtt:'已连接',mqttBacklog:0},
 // 告警处理状态：id → 未处理 / 处理中 / 已解决。告警本身由数据推算，不落库。
 alertStates:{},
 // view = 看板视角（exec 中高层 / supervisor 专业主管 / worker 专业工人 / admin 系统），与 role 权限角色是两个维度。
 users:[{id:'u1',name:'演示管理员',role:'系统管理员',view:'admin',scope:'全船',enabled:true},{id:'u2',name:'王总',role:'船厂中高层',view:'exec',scope:'全船',enabled:true},{id:'u3',name:'轮机主管',role:'专业主管',view:'supervisor',scope:'分段 E101',enabled:true},{id:'u4',name:'张工',role:'专业工人',view:'worker',scope:'轮机一组',enabled:true},{id:'u5',name:'管理查看者',role:'只读查看',view:'exec',scope:'全船',enabled:true}],
 settings:{low:20,weak:-80,offline:30,refresh:5,dueSoon:24},logs:[{time:'2026-09-14 09:20:00',action:'示例初始化',detail:'已载入 Hull No. H2601 四级目录、资产、标签及演示任务'}]
});
let db;try{db=JSON.parse(localStorage.getItem(STORE));if(db?.version!==4)db=seed();}catch{db=seed();}
let storageAvailable=true;const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(db));}catch{storageAvailable=false;$('.demo-strip span').textContent='当前环境无法保存，修改仅本次有效';}};
let route={page:'overview',tab:''},folder='root',query='',filter='all',groupFilter='',selected=new Set(),importRows=[],docOpen=innerWidth>1080,toastTimer,pendingNav=null,boardView='exec',boardDir=null,boardTeam=null,boardAsset=null;
const asset=id=>db.assets.find(a=>a.id===id),label=id=>db.labels.find(l=>l.id===id),tpl=id=>db.templates.find(t=>t.id===id),dir=id=>db.dirs.find(d=>d.id===id);
const labelFor=a=>db.labels.find(l=>l.asset===a.id);
const path=id=>{let d=dir(id);return d?(d.parent==='root'?d.name:path(d.parent)+' / '+d.name):'Hull No. '+db.ship.code;};
const depth=id=>id==='root'?0:1+depth(dir(id)?.parent||'root');
// 四级目录：depth 0 = Hull No.（根节点）/ 1 = 分段 / 2 = 舱室 / 3 = 部位。设备资产不占层级，可挂在舱室或部位下（跳级）。
const LEVELS=['Hull No.','分段','舱室','部位'];
const MAX_DIR_DEPTH=LEVELS.length-1;
const levelName=id=>LEVELS[depth(id)]||'';
const levelChip=id=>`<span class="level">${esc(levelName(id))}</span>`;
const within=(id,parent)=>parent==='root'||id===parent||(dir(id)&&within(dir(id).parent,parent));
const assetsIn=id=>db.assets.filter(a=>within(a.dir,id));
const labelName=l=>asset(l.asset)?.name||'未绑定资产';
// ---- 点检状态：全部由 cycle + lastCheck 相对 demoNow 推算，不存状态字段，避免数据不一致 ----
const HOUR=3600000,DAY=86400000;
const tms=t=>t?new Date(String(t).replace(/-/g,'/')).getTime():0;
const nowMs=()=>tms(db.demoNow);
const dueMs=a=>a.lastCheck?tms(a.lastCheck)+(a.cycle||30)*DAY:0;
const dueText=a=>a.lastCheck?new Date(dueMs(a)).toLocaleString('zh-CN',{hour12:false}):'—';
const checkState=a=>{if(!a.lastCheck)return 'never';const gap=dueMs(a)-nowMs();return gap<0?'overdue':gap<=db.settings.dueSoon*HOUR?'due':'normal';};
const overdueH=a=>Math.max(0,Math.round((nowMs()-dueMs(a))/HOUR));
const dueInH=a=>Math.round((dueMs(a)-nowMs())/HOUR);
const CHECK={normal:['正常',''],due:['临期',' warn'],overdue:['逾期','bad'],never:['未点检','neutral']};
const checkBadge=a=>badge(CHECK[checkState(a)][0].trim(),CHECK[checkState(a)][1].trim());
const checkNote=a=>{const st=checkState(a);return st==='overdue'?'已超期 '+overdueH(a)+' 小时':st==='due'?'剩余 '+dueInH(a)+' 小时':st==='never'?'尚未首次点检':'截止 '+dueText(a);};
// 点检完成率：未逾期且已点检 / 总数。设备完好率：非故障报修中 / 总数。
const doneRate=list=>list.length?Math.round(list.filter(a=>checkState(a)==='normal'||checkState(a)==='due').length/list.length*100):0;
const healthRate=list=>list.length?Math.round(list.filter(a=>!a.fault).length/list.length*100):0;
const overdueOf=list=>list.filter(a=>checkState(a)==='overdue'||checkState(a)==='never');
const dueSoonOf=list=>list.filter(a=>checkState(a)==='due');
const teams=()=>[...new Set(db.assets.map(a=>a.team))];
const assetsOfTeam=t=>db.assets.filter(a=>a.team===t);
const blocks=()=>db.dirs.filter(d=>d.parent==='root');
const inspectionsOf=id=>db.inspections.filter(i=>i.asset===id).sort((x,y)=>tms(y.time)-tms(x.time));
// ---- 环境监测 ----
const envState=p=>p.temp>p.tempMax||p.humidity>p.humidityMax?'alert':'normal';
const envAlerts=()=>db.envPoints.filter(p=>envState(p)==='alert');
// ---- 统一告警中心：业务告警 + 系统告警合并推算，只有「处理状态」落库 ----
const ALEVEL={critical:['紧急','bad'],major:['重要','warn'],minor:['次要','neutral'],info:['提示','']};
const AORDER={critical:0,major:1,minor:2,info:3};
function alerts(){const out=[];
 db.assets.forEach(a=>{const st=checkState(a);
  if(st==='overdue')out.push({id:'ov-'+a.id,level:overdueH(a)>72?'critical':'major',kind:'业务',type:'点检逾期',target:a.name,detail:'已超期 '+overdueH(a)+' 小时 · '+path(a.dir),go:{action:'board-asset',id:a.id}});
  if(st==='never')out.push({id:'nv-'+a.id,level:'major',kind:'业务',type:'未首次点检',target:a.name,detail:path(a.dir),go:{action:'board-asset',id:a.id}});
  if(a.fault)out.push({id:'ft-'+a.id,level:'major',kind:'业务',type:'故障报修中',target:a.name,detail:path(a.dir),go:{action:'board-asset',id:a.id}});});
 envAlerts().forEach(p=>out.push({id:'env-'+p.id,level:p.humidity>80||p.temp>p.tempMax?'critical':'major',kind:'业务',type:'环境超限',target:dir(p.dir)?.name,detail:envReason(p)+' · 采集于 '+p.last,go:{action:'nav',id:'env'}}));
 db.labels.forEach(l=>{const n=labelName(l);
  if(!l.online)out.push({id:'off-'+l.id,level:'minor',kind:'系统',type:'标签离线',target:n,detail:l.mac+' · 最后广播 '+l.last,go:{action:'nav',id:'labels/status'}});
  if(l.battery<db.settings.low)out.push({id:'bat-'+l.id,level:'major',kind:'系统',type:'标签低电量',target:n,detail:'电量 '+l.battery+'% · 低于阈值 '+db.settings.low+'%',go:{action:'nav',id:'labels/status'}});
  if(l.rssi<db.settings.weak)out.push({id:'sig-'+l.id,level:'minor',kind:'系统',type:'标签弱信号',target:n,detail:'RSSI '+l.rssi+' dBm · 低于阈值 '+db.settings.weak,go:{action:'nav',id:'labels/status'}});});
 db.gateways.filter(g=>!g.online).forEach(g=>out.push({id:'gw-'+g.id,level:'critical',kind:'系统',type:'网关离线',target:g.name,detail:'缓存积压 '+g.backlog+' 条 · 最后通信 '+g.last,go:{action:'nav',id:'system/gateways'}}));
 db.tasks.forEach(t=>t.items.filter(i=>i.status==='failed').forEach(i=>out.push({id:'fail-'+t.id+'-'+i.label,level:'major',kind:'系统',type:'刷新失败',target:labelName(label(i.label)||{}),detail:'任务「'+t.name+'」下发失败',go:{action:'nav',id:'labels/tasks'}})));
 return out.map(a=>({...a,state:db.alertStates[a.id]||'未处理'})).sort((x,y)=>AORDER[x.level]-AORDER[y.level]);}
const openAlerts=()=>alerts().filter(a=>a.state!=='已解决');
const envReason=p=>[p.temp>p.tempMax?'温度 '+p.temp+'°C 超限':'',p.humidity>p.humidityMax?'湿度 '+p.humidity+'% 超限':''].filter(Boolean).join(' · ');
const updateStatus=l=>!l.asset?'unbound':l.published===l.version?'synced':db.tasks.some(t=>t.items.some(i=>i.label===l.id&&i.version===l.version&&i.status==='waiting'))?'waiting':'outdated';
const stateText=l=>l.state==='paused'?'停用':l.asset?'在用':'待绑定';
const badge=(text,kind='')=>`<span class="pill ${kind}">${esc(text)}</span>`;
const onlineBadge=l=>badge(l.online?'在线':'离线',l.online?'':'neutral');
const updateBadge=l=>{const s=updateStatus(l);return badge({unbound:'未绑定',synced:'已确认更新',waiting:'结果待确认',outdated:'待更新'}[s],{unbound:'neutral',synced:'',waiting:'blue',outdated:'warn'}[s]);};
const action=(name,text,id='',cls='btn small')=>`<button type="button" class="${cls}" data-action="${name}" data-id="${esc(id)}">${text}</button>`;
const log=(a,d)=>{db.logs.unshift({time:stamp(),action:a,detail:d});persist();};
function toast(s){clearTimeout(toastTimer);$('#toast').textContent=s;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3600);}
function modal(title,body,wide=false){const d=$('#dialog');d.classList.toggle('wide',wide);$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;if(!d.open)d.showModal();}
const closeModal=()=>$('#dialog').close();
const footerForm=(text='保存')=>`<div class="form-error" role="alert" id="form-error"></div><div class="form-actions">${action('close-dialog','取消')}<button class="btn primary" type="submit">${text}</button></div>`;
const inputField=(name,title,value='',type='text',required=false)=>`<label class="form-field">${title}${required?' *':''}<input name="${name}" value="${esc(value)}" type="${type}" ${required?'required':''} maxlength="100"></label>`;
const dirOptions=(value,allowRoot=false)=>`${allowRoot?`<option value="root" ${value==='root'?'selected':''}>Hull No. ${esc(db.ship.code)}（根目录）</option>`:''}`+db.dirs.map(d=>`<option value="${d.id}" ${value===d.id?'selected':''}>${esc(path(d.id))}　[${esc(levelName(d.id))}]</option>`).join('');
const templateOptions=v=>db.templates.map(t=>`<option value="${t.id}" ${v===t.id?'selected':''}>${esc(t.name)}</option>`).join('');
const groupOptions=v=>db.groups.map(g=>`<option value="${g.id}" ${g.id===v?'selected':''}>${esc(g.name)}</option>`).join('');
const head=(title,subtitle,buttons='')=>`<div class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="actions">${buttons}</div></div>`;
const panel=(title,body,extra='')=>`<section class="panel"><div class="panel-head"><h3>${title}</h3>${extra}</div>${body}</section>`;
const table=(headers,rows)=>`<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows||`<tr><td colspan="${headers.length}"><div class="empty"><strong>没有符合条件的数据</strong>试试其他目录、分组或搜索条件。</div></td></tr>`}</tbody></table></div>`;
const foot=count=>`<div class="table-footer"><span>共 ${count} 条 · 演示数据</span><span>全部显示</span></div>`;
const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${path}</svg>`;
const icons={overview:svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),storage:svg('<path d="M3 6h7l2 3h9v11H3zM3 6V4h7l2 2h9v3"/>'),labels:svg('<path d="M3 4h11l7 8-8 8L3 10z"/><circle cx="8" cy="8" r="1.5"/>'),inspect:svg('<path d="M9 11l2 2 4-4M12 3a9 9 0 1 0 9 9M16 3h5v5"/>'),env:svg('<path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10z"/><path d="M12 13v5"/>'),system:svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>')};
const pages={overview:'看板中心',storage:'舱室 / 部位管理',labels:'标签管理',inspect:'点检引擎',env:'环境监测',system:'系统管理'};
const tabs={overview:[['biz','业务看板'],['ops','系统监控看板']],labels:[['devices','标签台账'],['status','标签状态'],['groups','标签分组'],['data','字段与数据'],['templates','模板设计'],['tasks','更新任务'],['strategies','标签策略']],inspect:[['rules','周期与预警规则'],['records','点检流水']],system:[['gateways','网关管理'],['users','账号权限'],['settings','基础设置'],['logs','操作日志']]};
const tabBar=()=>tabs[route.page]?`<nav class="tabs" aria-label="${pages[route.page]}子功能">${tabs[route.page].map(([id,name])=>`<a href="#${route.page}/${id}" class="${route.tab===id?'active':''}" ${route.tab===id?'aria-current="page"':''}>${name}</a>`).join('')}</nav>`:'';
// 需求对照按 id 引用（模块 slug / 功能名），不再用零起始索引。
// 文档表格增删行不会错位；改功能名会在 build.py 构建时直接报错，不会静默产出错页面。
const coverage={
 biz:['board-biz/全船设备完好率','board-biz/点检完成率','board-biz/逾期报警总数','board-biz/标签在线率','board-biz/环境异常数','board-biz/分段点检完成率排名','board-biz/班组点检完成率排名','board-biz/逾期设备清单','board-biz/临期待检清单','board-biz/设备故障报修清单','board-biz/环境监测概览','board-biz/逾期任务','board-biz/临期任务','board-biz/已完成','board-biz/设备导航与定位','board-biz/今日待检','board-biz/快速操作','board-biz/设备类型维度统计'],
 ops:['board-ops/标签在线率','board-ops/离线标签清单','board-ops/低电量标签','board-ops/弱信号标签','board-ops/刷新失败标签','board-ops/最后心跳时间分布','edge/多基站去重与分段定位','edge/弱网容灾与断网续传','edge/本地边缘私有化部署','edge/北向对接 MES/EAM'],
 storage:['space/四级目录管理','space/目录概览','space/下属数据管理','space/归属调整','space/结构维护保护','space/电子台账录入','space/保养规程与检查项标准'],
 devices:['labels/标签台账','labels/资产绑定','labels/一键扫码绑定','labels/LED 控制策略','inspect/物理按键交互'],
 status:['board-ops/标签在线率','board-ops/离线标签清单','board-ops/低电量标签','board-ops/弱信号标签','board-ops/最后心跳时间分布','inspect/电源自检','inspect/低电告警'],
 groups:['labels/标签分组'],
 data:['labels/字段配置','labels/信息录入','labels/批量导入','labels/数据导出','space/电子台账录入'],
 templates:['labels/模板设计','labels/模板管理','labels/点检状态模板组','inspect/距截止 < 24 小时','inspect/超过截止时间','inspect/点检完成'],
 tasks:['labels/信息下发','labels/更新任务','inspect/屏幕与 LED 联动','board-ops/刷新失败标签'],
 strategies:['labels/刷新计划','inspect/分级预警'],
 rules:['inspect/周期与截止推算','inspect/分级预警','inspect/屏幕与 LED 联动','inspect/距截止 < 24 小时','inspect/超过截止时间','inspect/点检完成','space/保养规程与检查项标准'],
 records:['inspect/点检流水','mobile/标准化防呆表单','mobile/即时物理闭环反馈'],
 env:['env/实时采集','env/超限告警','env/与保养策略联动','env/环境监测看板','env/历史趋势','env/环境报表','env/集成式','env/外挂式','env/网关集成'],
 gateways:['system/网关管理','edge/多基站去重与分段定位'],
 users:['system/账号与权限','system/角色视图配置'],
 settings:['system/船舶信息','system/基础参数','inspect/分级预警'],
 logs:['system/操作日志']};

const reqSection={biz:'5.4.2 业务看板',ops:'5.4.3 系统监控看板 + 5.7 边缘系统',storage:'5.1 舱室 / 部位管理',devices:'5.2 标签管理',status:'5.4.3 系统监控看板',groups:'5.2 标签管理',data:'5.2 标签管理',templates:'5.2 标签管理 + 5.3 点检引擎',tasks:'5.2 标签管理',strategies:'5.2 标签管理 + 5.3 点检引擎',rules:'5.3 点检引擎',records:'5.3 点检引擎',env:'5.5 环境监测',gateways:'5.8 系统管理',users:'5.8 系统管理',settings:'5.8 系统管理',logs:'5.8 系统管理'};
// 页脚说明：本页原型与正式需求的差距
const reqNote={rules:'规则表为 v0.4 文档口径，原型按此判定状态但不真正刷屏或点灯。阈值/周期变更对存量任务的处理规则待定义。',records:'流水由看板执行视图或点检引擎页写入；异常项的强制拍照只记标记，不做真实上传。',env:'温湿度为静态示例值，可手动修改以模拟超限；采集方案（集成/外挂/网关）尚未选型。',ops:'标签与网关指标由示例数据推算；边缘服务器健康度为静态值，私有化部署、断网续传与北向接口均未实现。',data:'导入原型支持 CSV；Excel、多类型完整校验在正式开发时补齐。',templates:'当前支持文本字段版式预览与三套点检状态模板示意；图片、二维码、条形码与完整拖拽编辑器待细化。',strategies:'可配置计划并手动模拟执行，不会后台定时运行。点检引擎的独立配置页属步骤④。',users:'账号和权限为配置演示，不做真实登录或权限拦截；看板视角在页面上手动切换。',biz:'三层角色与钻取已实现；设备类型维度统计、今日待检与 NFC 快速操作尚未实现。',status:'标签状态已并入标签管理，作为系统监控看板的明细下钻页。'};
// 需要填写的功能打开演示窗口；其余跳转并高亮。未列入的需求 = 原型尚未实现。
const requirementDemos={
 'space/四级目录管理':{route:'storage',target:'.tree-panel',name:'舱室/部位管理 · 四级目录'},
 'space/目录概览':{route:'storage',target:'.compact-stats',name:'舱室/部位管理 · 目录概览'},
 'space/下属数据管理':{route:'storage',target:'.storage-layout .panel',name:'舱室/部位管理 · 下属资产与标签'},
 'space/归属调整':{route:'storage',open:'move',target:'[name="dir"]',name:'舱室/部位管理 · 调整资产归属'},
 'space/电子台账录入':{route:'labels/data',open:'asset',target:'[data-form="asset"]',name:'字段与数据 · 电子台账录入'},
 'labels/标签台账':{route:'labels/devices',target:'.table-wrap',name:'标签管理 · 标签台账'},
 'labels/资产绑定':{route:'labels/devices',open:'bind',target:'[data-form="bind"]',name:'标签管理 · 资产绑定'},
 'labels/标签分组':{route:'labels/groups',target:'.panel',name:'标签管理 · 标签分组'},
 'labels/字段配置':{route:'labels/data',open:'field',target:'[data-form="field"]',name:'字段与数据 · 字段配置'},
 'labels/信息录入':{route:'labels/data',open:'asset',target:'[data-form="asset"]',name:'字段与数据 · 信息录入'},
 'labels/批量导入':{route:'labels/data',open:'import',target:'#csv-input',name:'字段与数据 · 批量导入'},
 'labels/数据导出':{route:'labels/data',target:'[data-action="export-assets"]',name:'字段与数据 · 数据导出'},
 'labels/模板设计':{route:'labels/templates',open:'template',target:'#live-preview',name:'模板设计 · 编辑与实时预览'},
 'labels/模板管理':{route:'labels/templates',target:'.template-grid',name:'模板设计 · 模板管理'},
 'labels/信息下发':{route:'labels/tasks',open:'publish',target:'[data-form="publish"]',name:'更新任务 · 创建下发任务'},
 'labels/更新任务':{route:'labels/tasks',target:'.panel',name:'标签管理 · 更新任务'},
 'labels/刷新计划':{route:'labels/strategies',open:'strategy',target:'[name="schedule"]',name:'标签策略 · 刷新计划'},
 'labels/LED 控制策略':{route:'labels/devices',open:'label',target:'[data-action="led"]',name:'标签详情 · LED 控制'},
 'inspect/分级预警':{route:'inspect/rules',open:'strategy',target:'[data-form="strategy"]',name:'标签策略 · 条件与优先级'},
 'inspect/屏幕与 LED 联动':{route:'labels/tasks',open:'failed-task',target:'[data-action="task-retry"]',name:'更新任务 · 查看异常与重试'},
 'inspect/点检流水':{route:'inspect/records',target:'.panel .table-wrap',name:'点检引擎 · 点检流水'},
 'inspect/周期与截止推算':{route:'inspect/rules',target:'.panel + .panel .table-wrap',name:'点检引擎 · 保养周期与截止时间'},
 'inspect/电源自检':{route:'labels/status',target:'.table-wrap',name:'标签状态 · 电量与信号上报'},
 'inspect/低电告警':{route:'labels/status',filter:'low',target:'.panel',name:'标签状态 · 低电量筛选'},
 'board-biz/全船设备完好率':{route:'overview/biz',board:'exec',target:'.stats .stat:nth-child(1)',name:'看板中心 · 设备完好率'},
 'board-biz/点检完成率':{route:'overview/biz',board:'exec',target:'.stats .stat:nth-child(2)',name:'看板中心 · 点检完成率'},
 'board-biz/逾期报警总数':{route:'overview/biz',board:'exec',target:'.stats .stat:nth-child(3)',name:'看板中心 · 逾期报警'},
 'board-biz/标签在线率':{route:'overview/biz',board:'exec',target:'.stats .stat:nth-child(4)',name:'看板中心 · 标签在线率'},
 'board-biz/环境异常数':{route:'overview/biz',board:'exec',target:'.stats .stat:nth-child(5)',name:'看板中心 · 环境异常'},
 'board-biz/分段点检完成率排名':{route:'overview/biz',board:'exec',target:'.dashboard-grid .panel:first-child',name:'看板中心 · 各分段完成率'},
 'board-biz/设备故障报修清单':{route:'overview/biz',board:'exec',target:'.dashboard-grid .panel:last-child',name:'看板中心 · 风险聚焦与故障报修'},
 'board-biz/班组点检完成率排名':{route:'overview/biz',board:'supervisor',target:'.dashboard-grid .panel:last-child',name:'看板中心 · 主管视图班组排名'},
 'board-biz/逾期设备清单':{route:'overview/biz',board:'supervisor',target:'.dashboard-grid + .panel',name:'看板中心 · 逾期设备清单'},
 'board-biz/临期待检清单':{route:'overview/biz',board:'supervisor',target:'.dashboard-grid + .panel + .panel',name:'看板中心 · 临期待检清单'},
 'board-biz/环境监测概览':{route:'overview/biz',board:'supervisor',target:'.panel:last-of-type',name:'看板中心 · 环境监测概览'},
 'board-biz/逾期任务':{route:'overview/biz',board:'worker',target:'.stats .stat:nth-child(1)',name:'看板中心 · 工人视图逾期任务'},
 'board-biz/临期任务':{route:'overview/biz',board:'worker',target:'.stats .stat:nth-child(2)',name:'看板中心 · 工人视图临期任务'},
 'board-biz/已完成':{route:'overview/biz',board:'worker',target:'.stats .stat:nth-child(3)',name:'看板中心 · 本周期已完成'},
 'board-biz/设备导航与定位':{route:'overview/biz',board:'worker',asset:'a5',target:'.focus-card .detail-item',name:'看板中心 · 设备四级定位'},
 'board-ops/标签在线率':{route:'overview/ops',target:'.stats .stat:nth-child(1)',name:'系统监控看板 · 标签在线率'},
 'board-ops/最后心跳时间分布':{route:'overview/ops',target:'.panel:last-of-type',name:'系统监控看板 · 告警中心'},
 'board-ops/离线标签清单':{route:'labels/status',filter:'offline',target:'.panel',name:'标签状态 · 离线清单'},
 'board-ops/低电量标签':{route:'labels/status',filter:'low',target:'.panel',name:'标签状态 · 低电量清单'},
 'board-ops/弱信号标签':{route:'labels/status',filter:'weak',target:'.panel',name:'标签状态 · 弱信号清单'},
 'board-ops/刷新失败标签':{route:'labels/tasks',open:'failed-task',target:'[data-action="task-retry"]',name:'更新任务 · 刷新失败与重试'},
 'inspect/距截止 < 24 小时':{route:'inspect/rules',target:'.panel .table-wrap tr:nth-child(1)',name:'点检引擎 · 临期预警规则'},
 'inspect/超过截止时间':{route:'inspect/rules',target:'.panel .table-wrap tr:nth-child(2)',name:'点检引擎 · 逾期预警规则'},
 'inspect/点检完成':{route:'inspect/rules',target:'.panel .table-wrap tr:nth-child(3)',name:'点检引擎 · 点检完成后的状态恢复'},
 'space/保养规程与检查项标准':{route:'inspect/rules',open:'cycle',target:'[name="cycle"]',name:'点检引擎 · 保养周期配置'},
 'env/实时采集':{route:'env',target:'.panel .table-wrap',name:'环境监测 · 采集点实时值'},
 'env/超限告警':{route:'env',open:'env',target:'[name="humidity"]',name:'环境监测 · 修改实测值触发超限'},
 'env/与保养策略联动':{route:'env',open:'env-link',target:'[data-action="env-link-apply"]',name:'环境监测 · 高湿联动影响预览'},
 'env/环境监测看板':{route:'env',target:'.stats',name:'环境监测 · 概览指标'},
 'board-ops/刷新失败标签':{route:'overview/ops',target:'.stats .stat:nth-child(5)',name:'系统监控看板 · 刷新失败'},
 'edge/弱网容灾与断网续传':{route:'overview/ops',target:'.dashboard-grid .panel:first-child',name:'系统监控看板 · 网关缓存积压'},
 'edge/本地边缘私有化部署':{route:'overview/ops',target:'.dashboard-grid .panel:last-child',name:'系统监控看板 · 系统健康度'},
 'system/船舶信息':{route:'system/settings',target:'[name="shipName"]',name:'基础设置 · 船舶信息'},
 'system/网关管理':{route:'system/gateways',target:'.panel',name:'系统管理 · 网关管理'},
 'system/账号与权限':{route:'system/users',open:'user',target:'[data-form="user"]',name:'系统管理 · 账号与权限'},
 'system/角色视图配置':{route:'system/users',open:'user',target:'[name="view"]',name:'系统管理 · 看板视角配置'},
 'system/基础参数':{route:'system/settings',target:'.settings-list',name:'系统管理 · 基础参数'},
 'system/操作日志':{route:'system/logs',target:'.panel',name:'系统管理 · 操作日志'}
};
// 已实现但做了简化的需求，面板上标「查看简化演示」
const sketchReqs=new Set(['labels/模板设计','labels/批量导入','labels/刷新计划','inspect/分级预警','system/账号与权限','system/角色视图配置','board-biz/环境监测概览','env/环境监测看板','edge/弱网容灾与断网续传','edge/本地边缘私有化部署']);
let pendingRequirement=null,requirementHighlightTimer;
function openRequirementDemo(id){const demo=requirementDemos[id];if(!demo)return;if(demo.route==='overview'){boardView=demo.board||'exec';boardDir=null;boardTeam=null;boardAsset=demo.asset||null;}pendingRequirement=demo;if(innerWidth<=1080)docOpen=false;go(...demo.route.split('/'));}
function revealRequirement(demo){
 const a=assetsIn(folder)[0]||db.assets[0],l=db.labels.find(l=>l.asset===a?.id)||db.labels[0];
 if(demo.board){boardView=demo.board;boardAsset=demo.asset||null;render();}
 if(demo.filter){filter=demo.filter;render();}
 switch(demo.open){
  case 'move':if(a){assetDetail(a.id);document.querySelector('#dialog [data-action="asset-move"]').click();}break;
  case 'bind':bindForm(a?.id);break;
  case 'field':document.querySelector('#main [data-action="field-edit"]').click();break;
  case 'asset':assetForm(a?.id);break;
  case 'import':importForm();break;
  case 'template':templateForm(db.templates[0]?.id);break;
  case 'publish':publishForm();break;
  case 'strategy':strategyForm(db.strategies[0]?.id);break;
  case 'label':if(l)labelDetail(l.id);break;
  case 'failed-task':{const t=db.tasks.find(t=>t.items.some(i=>i.status==='failed'))||db.tasks[0];if(t)taskDetail(t.id);break;}
  case 'user':simpleForm('user',db.users[0]?.id);break;
  case 'cycle':document.querySelector('#main [data-action="cycle-edit"]').click();break;
  case 'env':document.querySelector('#main [data-action="env-edit"]').click();break;
  case 'env-link':envLinkForm();break;
 }
 const scope=$('#dialog').open?$('#dialog'):$('#main');
 const target=scope.querySelector(demo.target)||scope.querySelector('.panel')||scope;
 clearTimeout(requirementHighlightTimer);$$('.requirement-highlight').forEach(el=>el.classList.remove('requirement-highlight'));
 target.classList.add('requirement-highlight');if(!target.matches('input,select,textarea,button,a[href]'))target.setAttribute('tabindex','-1');
 target.focus({preventScroll:true});target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 requirementHighlightTimer=setTimeout(()=>target.classList.remove('requirement-highlight'),3200);
 toast('已定位：'+demo.name);
}
function reqPanel(){const key=route.tab||route.page,ids=coverage[key]||[],section=reqSection[key]||'';
 const items=ids.map(id=>{const r=DOC.requirements[id];if(!r)return '';const demo=requirementDemos[id],sketch=sketchReqs.has(id);
  const btn=demo?`<button type="button" class="coverage req-demo ${sketch?'sketch':''}" data-action="requirement-demo" data-id="${esc(id)}" title="前往：${esc(demo.name)}" aria-label="${esc(r.title)}：前往对应功能演示">${sketch?'查看简化演示':'可点击演示'} <span aria-hidden="true">↗</span></button>${sketch?'<small class="req-scope">部分需求待细化</small>':''}`
   :`<span class="coverage planned">原型未实现</span>`;
  return `<article class="req-item"><span class="req-number">${esc(r.section)} · ${String(r.no).padStart(2,'0')}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p>${btn}</article>`;}).join('');
 const done=ids.filter(id=>requirementDemos[id]).length;
 $('#requirements').innerHTML=`<div class="req-top"><h3>产品需求对照</h3>${action('toggle-doc','×','','icon-btn')}</div><div class="req-version">产品文档 ${esc(DOC.version)} / ${esc(section)}　·　本页覆盖 ${done}/${ids.length}</div><p class="req-foot" style="border:0;padding:0 0 15px">点击演示入口跳转并高亮对应功能；需要填写的功能会打开演示窗口。标「原型未实现」的是 v0.4 已写入需求、原型尚未做到的部分。</p>`
 +items+`<div class="req-foot">${esc(reqNote[key]||'所有状态、下发与回执均在本地模拟。')}</div><div style="margin-top:18px">${action('document','浏览完整产品文档 ↗')}</div>`;
 document.body.classList.toggle('doc-hidden',!docOpen);$('.doc-toggle').setAttribute('aria-expanded',String(docOpen));}
function readRoute(){const [page,tab]=(location.hash.slice(1)||'overview').split('/');route.page=pages[page]?page:'overview';route.tab=tabs[route.page]?.some(t=>t[0]===tab)?tab:tabs[route.page]?.[0][0]||'';query='';filter='all';selected.clear();groupFilter=pendingNav?.groupFilter||'';pendingNav=null;render();document.body.classList.remove('nav-open');window.scrollTo(0,0);if(pendingRequirement){const demo=pendingRequirement;pendingRequirement=null;requestAnimationFrame(()=>revealRequirement(demo));}}
function go(page,tab=''){const hash='#'+page+(tab?'/'+tab:'');if(location.hash===hash){readRoute();}else location.hash=hash;}
function render(){
 $('#nav').innerHTML='<div class="nav-caption">工作空间</div>'+Object.entries(pages).map(([id,name])=>`<a href="#${id}" class="nav-link ${route.page===id?'active':''}" ${route.page===id?'aria-current="page"':''}>${icons[id]}${name}</a>`).join('');
 $('#breadcrumb').textContent=db.ship.name+' / '+pages[route.page]+(route.tab?' / '+tabs[route.page].find(t=>t[0]===route.tab)[1]:'');$('.ship strong').textContent=db.ship.name;$('.ship>span:last-child').textContent='Hull No. '+db.ship.code+' · 单船管理';
 const fn=route.page==='overview'?overview:route.page==='storage'?storage:route.page==='env'?envPage:route.page==='inspect'?({rules:inspectRules,records:inspectRecords}[route.tab]):route.page==='labels'?({devices:devices,status:statusPage,groups:groups,data:dataPage,templates:templates,tasks:tasks,strategies:strategies}[route.tab]):({gateways:gateways,users:users,settings:settings,logs:logs}[route.tab]);
 $('#main').innerHTML=fn();reqPanel();}
// ================= 看板中心：三层角色 × 三级钻取 =================
// 同一份数据的三种聚合口径。角色只决定默认落地视图与数据范围，上层视图始终可向下钻取到明细。
const VIEWNAME={exec:'中高层 · 宏观',supervisor:'专业主管 · 管理',worker:'专业工人 · 执行',admin:'系统管理 · 不落地看板'};
const ROLES=[['exec','船厂中高层','宏观决策'],['supervisor','专业主管','管理控制'],['worker','专业工人','执行操作']];
function boardSwitch(){return `<div class="role-switch" role="group" aria-label="看板角色视角">${ROLES.map(([v,n,l])=>`<button class="role-btn ${boardView===v?'active':''}" data-action="board-view" data-id="${v}" ${boardView===v?'aria-current="true"':''}><strong>${n}</strong><small>${l}</small></button>`).join('')}</div>`;}
function boardTrail(){const steps=[];if(boardDir)steps.push(esc(dir(boardDir)?.name)+'（'+esc(levelName(boardDir))+'）');if(boardTeam)steps.push(esc(boardTeam));if(boardAsset)steps.push(esc(asset(boardAsset)?.name));
 if(!steps.length)return `<p class="board-trail muted">钻取路径：全船　·　点击分段、班组或设备可逐层下钻</p>`;
 return `<p class="board-trail">钻取路径：<button class="link-btn" data-action="board-reset">全船</button>${steps.map(t=>` <i>›</i> <span>${t}</span>`).join('')}　${action('board-reset','回到全船','','link-btn')}</p>`;}
function overview(){if(route.tab==='ops')return head('看板中心','第二页 · 系统监控看板（面向系统管理员与 IT 运维）')+tabBar()+boardOps();
 return head('看板中心','第一页 · 业务看板：三层角色 × 三级钻取 · 演示基准时间 '+db.demoNow,boardSwitch())+tabBar()+boardTrail()+(boardView==='supervisor'?boardSup():boardView==='worker'?boardWorker():boardExec());}

// ---- 视图一：船厂中高层 · 宏观决策 ----
function boardExec(){const all=db.assets,ov=overdueOf(all),never=all.filter(a=>checkState(a)==='never'),online=db.labels.filter(l=>l.online),ea=envAlerts(),faults=all.filter(a=>a.fault);
 const cards=[['设备完好率',healthRate(all)+'%',`故障报修中 ${faults.length} 台`,'sup'],['点检完成率',doneRate(all)+'%',`应检 ${all.length} 台 · 未完成 ${ov.length} 台`,'sup'],['逾期报警',ov.length,`其中未首检 ${never.length} 台`,'sup'],['标签在线率',Math.round(online.length/db.labels.length*100)+'%',`在线 ${online.length} / ${db.labels.length} 枚`,'status'],['环境异常',ea.length,ea.length?'温湿度超限舱室':'全部舱室正常','sup']];
 const bars=blocks().map(d=>{const list=assetsIn(d.id),r=doneRate(list);return `<div class="bar-row"><div class="bar-label">${action('board-dir',esc(d.name),d.id,'link-btn')}<span>${r}% · ${list.length} 台</span></div><div class="bar"><span class="${r<70?'low':''}" style="width:${Math.max(3,r)}%"></span></div></div>`;}).join('');
 const topDir=blocks().map(d=>({d,n:overdueOf(assetsIn(d.id)).length})).filter(x=>x.n).sort((x,y)=>y.n-x.n).slice(0,5);
 const topTeam=teams().map(t=>({t,n:overdueOf(assetsOfTeam(t)).length})).filter(x=>x.n).sort((x,y)=>y.n-x.n).slice(0,5);
 const risk=`<div class="panel-body"><h3 class="risk-head">逾期最严重的分段</h3>${topDir.length?topDir.map(x=>`<div class="todo"><span class="todo-mark">${x.n}</span><div class="todo-text"><strong>${esc(x.d.name)}</strong><small>${assetsIn(x.d.id).length} 台资产 · 完成率 ${doneRate(assetsIn(x.d.id))}%</small></div>${action('board-dir','下钻',x.d.id,'link-btn')}</div>`).join(''):'<p class="empty">暂无逾期分段</p>'}
 <h3 class="risk-head">逾期最严重的责任班组</h3>${topTeam.length?topTeam.map(x=>`<div class="todo"><span class="todo-mark">${x.n}</span><div class="todo-text"><strong>${esc(x.t)}</strong><small>负责 ${assetsOfTeam(x.t).length} 台 · 完成率 ${doneRate(assetsOfTeam(x.t))}%</small></div>${action('board-team','下钻',x.t,'link-btn')}</div>`).join(''):'<p class="empty">暂无逾期班组</p>'}
 <h3 class="risk-head">故障报修中</h3>${faults.length?faults.map(a=>`<div class="todo"><span class="todo-mark bad">!</span><div class="todo-text"><strong>${esc(a.name)}</strong><small>${esc(path(a.dir))}</small></div>${action('board-asset','查看',a.id,'link-btn')}</div>`).join(''):'<p class="empty">当前无故障报修</p>'}</div>`;
 const items=all.filter(a=>!query||[a.name,a.code,a.team,path(a.dir)].join(' ').includes(query));
 return `<div class="stats five">${cards.map(([c,n,s,t])=>`<div class="stat interactive" role="button" tabindex="0" data-action="board-card" data-id="${t}"><span class="caption">${c}</span><strong>${n}</strong><small>${s}</small></div>`).join('')}</div>
 <div class="dashboard-grid">${panel('各分段点检完成率',`<div class="panel-body">${bars}<div class="legend"><span><i class="dot"></i>按分段聚合，含下属舱室与部位</span><span>点击分段进入主管视图</span></div></div>`)}${panel('风险聚焦',risk)}</div>`
 +panel('全船设备点检状态',`<div class="toolbar"><input aria-label="搜索全船资产" data-search placeholder="搜索设备名称、编码、班组或目录" value="${esc(query)}"></div>${table(['设备资产','所属目录','责任班组','点检状态','标签','操作'],items.map(a=>{const l=labelFor(a);return `<tr><td>${action('board-asset',esc(a.name),a.id,'link-btn')}<small>${esc(a.code)}</small></td><td>${esc(dir(a.dir)?.name)}<small>${esc(path(a.dir))}</small></td><td>${esc(a.team)}</td><td>${checkBadge(a)}<small>${esc(checkNote(a))}</small></td><td>${l?onlineBadge(l):badge('未绑定','neutral')}</td><td>${action('board-asset','执行视图',a.id,'link-btn')}</td></tr>`;}).join(''))}${foot(items.length)}`)
 +`<p class="status-note">完好率 = 非故障报修中 / 总数；点检完成率 = 未逾期且已点检 / 总数。全部状态由保养周期与上次点检时间相对演示基准时间推算，非真实现场数据。</p>`;}

// ---- 视图二：专业主管 · 管理控制 ----
function boardSup(){const scope=boardTeam?assetsOfTeam(boardTeam):boardDir?assetsIn(boardDir):db.assets;
 const scopeName=boardTeam?boardTeam:boardDir?dir(boardDir).name:'全船';
 const children=boardDir?db.dirs.filter(d=>d.parent===boardDir):blocks();
 const rank=(boardTeam?[]:children).map(d=>{const list=assetsIn(d.id),r=doneRate(list);return {name:d.name,id:d.id,r,n:list.length};}).sort((x,y)=>x.r-y.r);
 const teamRank=teams().map(t=>{const list=(boardDir?assetsIn(boardDir):db.assets).filter(a=>a.team===t);return {t,r:doneRate(list),n:list.length};}).filter(x=>x.n).sort((x,y)=>x.r-y.r);
 const ov=overdueOf(scope).sort((x,y)=>overdueH(y)-overdueH(x)),soon=dueSoonOf(scope).sort((x,y)=>dueInH(x)-dueInH(y));
 const row=a=>`<tr><td>${action('board-asset',esc(a.name),a.id,'link-btn')}<small>${esc(a.code)}</small></td><td>${esc(dir(a.dir)?.name)}<small>${esc(levelName(a.dir))}</small></td><td>${esc(a.team)}</td><td>${checkBadge(a)}<small>${esc(checkNote(a))}</small></td><td>${action('board-asset','执行视图',a.id,'link-btn')}</td></tr>`;
 const rankPanel=boardTeam?panel('责任班组：'+esc(boardTeam),`<div class="panel-body"><div class="compact-stats"><div>负责设备<strong>${scope.length}</strong></div><div>完成率<strong>${doneRate(scope)}%</strong></div><div>逾期<strong>${ov.length}</strong></div></div><p class="status-note">已按班组筛选。点击上方「回到全船」可清除。</p></div>`)
  :panel((boardDir?'下属'+LEVELS[depth(boardDir)+1]:'各分段')+'点检完成率（低→高）',`<div class="panel-body">${rank.length?rank.map(x=>`<div class="bar-row"><div class="bar-label">${action('board-dir',esc(x.name),x.id,'link-btn')}<span>${x.r}% · ${x.n} 台</span></div><div class="bar"><span class="${x.r<70?'low':''}" style="width:${Math.max(3,x.r)}%"></span></div></div>`).join(''):'<p class="empty">该目录下没有更下级目录</p>'}</div>`);
 const envList=db.envPoints.filter(p=>!boardDir||within(p.dir,boardDir));
 return `<div class="compact-stats"><div>统计范围<strong style="font-size:15px">${esc(scopeName)}</strong></div><div>设备<strong>${scope.length}</strong></div><div>完成率<strong>${doneRate(scope)}%</strong></div><div>逾期<strong>${ov.length}</strong></div><div>临期<strong>${soon.length}</strong></div></div>
 <div class="dashboard-grid">${rankPanel}${panel('责任班组完成率（低→高）',`<div class="panel-body">${teamRank.map(x=>`<div class="bar-row"><div class="bar-label">${action('board-team',esc(x.t),x.t,'link-btn')}<span>${x.r}% · ${x.n} 台</span></div><div class="bar"><span class="${x.r<70?'low':''}" style="width:${Math.max(3,x.r)}%"></span></div></div>`).join('')}<div class="legend"><span>点击班组筛选其全部设备</span></div></div>`)}</div>`
 +panel('逾期设备清单（按逾期时长排序）',ov.length?table(['设备资产','所属目录','责任班组','点检状态','操作'],ov.map(row).join('')):'<p class="empty">该范围内没有逾期设备</p>')
 +panel('临期待检清单（距截止 < '+db.settings.dueSoon+' 小时）',soon.length?table(['设备资产','所属目录','责任班组','点检状态','操作'],soon.map(row).join('')):'<p class="empty">该范围内没有临期设备</p>')
 +panel('环境监测概览',table(['舱室 / 部位','温度','湿度','状态','最后采集'],envList.map(p=>`<tr><td>${esc(dir(p.dir)?.name)}<small>${esc(path(p.dir))}</small></td><td>${p.temp} °C</td><td>${p.humidity} %</td><td>${envState(p)==='alert'?badge('超限','bad'):badge('正常')}<small>${esc(envReason(p)||'在阈值内')}</small></td><td>${esc(p.last)}</td></tr>`).join(''))
  +`<p class="card-foot">阈值示例：温度 ≤ 40°C、湿度 ≤ 70%。注意主机舱与双层底当前实测值已超出候选标签自身 0-40°C / 45-70%RH 的工作范围——被监测环境超出监测终端工作范围，属选型待决项。</p>`);}

// ---- 视图三：专业工人 · 执行操作 ----
function boardWorker(){const a=boardAsset?asset(boardAsset):null;
 const scope=a?assetsOfTeam(a.team):boardTeam?assetsOfTeam(boardTeam):boardDir?assetsIn(boardDir):db.assets;
 const scopeName=a?a.team:boardTeam||(boardDir?dir(boardDir).name:'全船');
 const ov=overdueOf(scope).sort((x,y)=>overdueH(y)-overdueH(x)),soon=dueSoonOf(scope).sort((x,y)=>dueInH(x)-dueInH(y)),done=scope.filter(x=>checkState(x)==='normal');
 const row=x=>`<tr><td>${action('board-asset',esc(x.name),x.id,'link-btn')}<small>${esc(x.code)}</small></td><td>${esc(dir(x.dir)?.name)}<small>${esc(path(x.dir))}</small></td><td>${esc(dueText(x))}</td><td>${checkBadge(x)}<small>${esc(checkNote(x))}</small></td><td><div class="actions">${action('check-do','完成点检',x.id,'btn small primary')}${action('check-repair',x.fault?'解除报修':'一键报修',x.id,'link-btn')}</div></td></tr>`;
 const focus=a?`<section class="panel focus-card"><div class="panel-head"><div><span class="small-label">当前设备 · 执行视图</span><h2>${esc(a.name)} ${checkBadge(a)}</h2><p>${esc(a.code)} · ${esc(a.model)}</p></div><div class="actions">${action('check-do','完成点检',a.id,'btn primary')}${action('check-repair',a.fault?'解除报修':'一键报修',a.id,'btn')}</div></div><div class="panel-body"><div class="detail-grid"><div class="detail-item"><span>设备定位（四级目录）</span>${esc(path(a.dir))}</div><div class="detail-item"><span>责任班组 / 责任人</span>${esc(a.team)} · ${esc(a.owner)}</div><div class="detail-item"><span>保养周期</span>${a.cycle} 天</div><div class="detail-item"><span>上次点检</span>${esc(a.lastCheck||'尚未首次点检')}</div><div class="detail-item"><span>下次截止</span>${esc(dueText(a))}</div><div class="detail-item"><span>当前状态</span>${esc(checkNote(a))}${a.fault?' · '+badge('故障报修中','bad'):''}</div></div><hr class="detail-divider"><h3>最近点检记录</h3>${inspectionsOf(a.id).length?`<ul class="timeline">${inspectionsOf(a.id).slice(0,5).map(i=>`<li><strong>${i.result==='abnormal'?'异常':'正常'}</strong> · ${esc(i.user)}<small>${esc(i.time)}${i.note?' · '+esc(i.note):''}${i.photo?' · 已拍照存证':''}</small></li>`).join('')}</ul>`:'<p class="empty">尚无点检记录</p>'}</div></section>`:'';
 return `<div class="stats"><div class="stat"><span class="caption">逾期任务</span><strong>${ov.length}</strong><small>含未首次点检</small></div><div class="stat"><span class="caption">临期待检</span><strong>${soon.length}</strong><small>距截止 < ${db.settings.dueSoon} 小时</small></div><div class="stat"><span class="caption">本周期已完成</span><strong>${done.length}</strong><small>无需再次点检</small></div><div class="stat"><span class="caption">任务范围</span><strong style="font-size:17px">${esc(scopeName)}</strong><small>共 ${scope.length} 台设备</small></div></div>`
 +focus
 +panel('逾期任务',ov.length?table(['设备资产','设备定位','截止时间','状态','操作'],ov.map(row).join('')):'<p class="empty">没有逾期任务</p>')
 +panel('临期待检',soon.length?table(['设备资产','设备定位','截止时间','状态','操作'],soon.map(row).join('')):'<p class="empty">没有临期任务</p>')
 +panel('本周期已完成',done.length?table(['设备资产','设备定位','截止时间','状态','操作'],done.map(row).join('')):'<p class="empty">本周期暂无已完成任务</p>')
 +`<p class="status-note">「完成点检」会写入点检流水、把截止日期后移，并把关联标签标记为待更新——因为屏幕上的倒计时变了，需要重新下发才能刷屏。这正是「标签在线 ≠ 屏幕已更新」的体现。</p>`;}

// ================= 看板中心 · 第二页：系统监控看板（IT 运维） =================
function boardOps(){const L=db.labels,on=L.filter(l=>l.online),rate=Math.round(on.length/L.length*100);
 const offline=L.filter(l=>!l.online),low=L.filter(l=>l.battery<db.settings.low),weak=L.filter(l=>l.rssi<db.settings.weak);
 const failed=db.tasks.flatMap(t=>t.items.filter(i=>i.status==='failed').map(i=>({t,i})));
 const h=db.health,al=alerts(),open=al.filter(a=>a.state!=='已解决');
 const mon=[['标签在线率',rate+'%',`在线 ${on.length} / ${L.length} 枚`,rate<90?'bad':rate<95?'warn':''],
  ['离线标签',offline.length,`超过 ${db.settings.offline} 分钟未心跳`,offline.length?'warn':''],
  ['低电量标签',low.length,`低于 ${db.settings.low}%`,low.length?'warn':''],
  ['弱信号标签',weak.length,`RSSI 低于 ${db.settings.weak} dBm`,weak.length?'warn':''],
  ['刷新失败',failed.length,'最近一次下发失败或超时',failed.length?'bad':'']];
 const heat=L.slice().sort((a,b)=>tms(b.last)-tms(a.last)).map(l=>{const hrs=Math.round((nowMs()-tms(l.last))/HOUR);return `<tr><td>${esc(labelName(l))}<small>${esc(l.mac)}</small></td><td>${esc(l.last)}</td><td>${hrs<=1?badge('1 小时内'):hrs<=24?badge(hrs+' 小时前','neutral'):badge(hrs+' 小时前','warn')}</td><td>${onlineBadge(l)}</td></tr>`;}).join('');
 return `<div class="stats five">${mon.map(([c,n,d,k])=>`<div class="stat"><span class="caption">${c}</span><strong class="${k==='bad'?'bad':k==='warn'?'warn':''}">${n}</strong><small>${d}</small></div>`).join('')}</div>`
 +`<div class="dashboard-grid">${panel('网关运行监控',table(['网关','连接标签','上行 / 下行','缓存积压','状态'],db.gateways.map(g=>`<tr><td>${esc(g.name)}<small>${esc(path(g.dir))}</small></td><td>${L.filter(l=>l.gateway===g.id).length} 枚</td><td>${g.up} / ${g.down}<small>最近 24h 报文</small></td><td>${g.backlog?badge(g.backlog+' 条','warn'):'0'}</td><td>${g.online?badge('在线'):badge('离线','bad')}<small>${esc(g.last)}</small></td></tr>`).join('')))}
 ${panel('系统健康度',`<div class="panel-body"><div class="health-grid">${[['CPU',h.cpu+'%'],['内存',h.mem+'%'],['存储',h.disk+'%'],['数据库连接',h.dbConn],['慢查询',h.dbSlow],['数据库空间',h.dbSpace+'%'],['上报成功率',h.reportRate+'%'],['下发成功率',h.publishRate+'%'],['API / MQTT',h.api+' / '+h.mqtt]].map(([k,v])=>`<div class="health-cell"><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><p class="status-note">边缘服务器指标为静态示例，不连接真实服务；正式版需定义采集方式与告警阈值。</p></div>`)}</div>`
 +panel(`告警中心 · 未处理 ${open.filter(a=>a.state==='未处理').length} / 共 ${al.length}`,
   table(['级别','来源','类型','对象','详情','处理状态','操作'],al.map(a=>`<tr><td>${badge(ALEVEL[a.level][0],ALEVEL[a.level][1])}</td><td>${badge(a.kind,a.kind==='业务'?'blue':'neutral')}</td><td>${esc(a.type)}</td><td>${esc(a.target)}</td><td><small style="margin:0">${esc(a.detail)}</small></td><td>${a.state==='已解决'?badge('已解决'):a.state==='处理中'?badge('处理中','warn'):badge('未处理','bad')}</td><td><div class="actions">${action('alert-cycle','推进状态',a.id,'link-btn')}${action('alert-go','定位',a.id,'link-btn')}</div></td></tr>`).join(''))
   +`<p class="card-foot">告警中心统一承载业务告警（点检逾期、未首检、故障报修、环境超限）与系统告警（标签离线/低电/弱信号、网关离线、刷新失败），不只是 IT 运维告警。级别与处理流程为演示口径，正式版需与班组职责对齐。</p>`);}

// ================= 点检引擎 =================
function inspectRules(){const rows=db.assets.slice().sort((a,b)=>dueMs(a)-dueMs(b));
 return head('点检引擎','按保养周期自动推算截止时间，分级预警驱动标签状态变更',action('nav','调整临期阈值 →','system/settings','btn'))+tabBar()
 +panel('分级预警规则',table(['触发条件','屏幕显示','LED 指示灯','后台动作'],
   [['距截止 < '+db.settings.dueSoon+' 小时','下发「临期待检」黄色提醒模板','黄色慢闪','记录预警流水'],
    ['超过截止时间','推送红底白字逾期模板，顶部反色显示逾期警示','红色高频间歇闪烁','生成报警流水，同步后台告警'],
    ['点检完成','恢复正常模板，截止日期自动后移','绿灯常亮 3 秒','记录点检流水']]
   .map(r=>`<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join(''))
   +`<p class="card-foot">规则为 v0.4 文档口径，本原型按此判定状态但不真正刷屏或点灯。屏幕与 LED 联动、下发失败时的一致性策略仍待定义。</p>`)
 +panel('保养周期与截止时间',`<div class="toolbar"><span class="muted">演示基准时间 ${esc(db.demoNow)}　·　临期阈值 ${db.settings.dueSoon} 小时</span></div>`
   +table(['设备资产','所属目录','保养周期','上次点检','下次截止','当前状态','操作'],rows.map(a=>`<tr><td>${esc(a.name)}<small>${esc(a.code)}</small></td><td>${esc(dir(a.dir)?.name)}<small>${esc(levelName(a.dir))}</small></td><td>${a.cycle} 天</td><td>${esc(a.lastCheck||'—')}</td><td>${esc(dueText(a))}</td><td>${checkBadge(a)}<small>${esc(checkNote(a))}</small></td><td><div class="actions">${action('cycle-edit','改周期',a.id,'link-btn')}${action('check-do','完成点检',a.id,'link-btn')}</div></td></tr>`).join(''))
   +foot(rows.length))
 +`<p class="status-note">点检状态不落库，由保养周期 + 上次点检时间相对演示基准时间推算。改周期会立刻改变截止时间与状态——正式版需定义阈值/周期变更对存量任务的处理规则。</p>`;}

function inspectRecords(){const items=db.inspections.filter(i=>{const a=asset(i.asset);return !query||[a?.name,a?.code,i.user,i.note].join(' ').includes(query);});
 return head('点检引擎','点检流水用于审计追溯，记录执行人、时间、结果与存证')+tabBar()
 +panel('点检流水',`<div class="toolbar"><input data-search aria-label="搜索点检流水" placeholder="搜索设备、执行人或备注" value="${esc(query)}">${action('export-inspections','导出 CSV')}</div>`
   +(items.length?table(['时间','设备资产','所属目录','执行人','结果','备注 / 存证'],items.map(i=>{const a=asset(i.asset);return `<tr><td>${esc(i.time)}</td><td>${a?esc(a.name):'已删除设备'}<small>${esc(a?.code||'')}</small></td><td>${esc(a?dir(a.dir)?.name:'—')}</td><td>${esc(i.user)}</td><td>${i.result==='abnormal'?badge('异常','warn'):badge('正常')}</td><td>${esc(i.note||'—')}${i.photo?'<small>已拍照存证</small>':''}</td></tr>`;}).join(''))+foot(items.length):'<p class="empty">暂无点检流水</p>'))
 +`<p class="status-note">流水由看板中心执行视图或本页「完成点检」写入。正式版异常项应强制拍照，本原型只记录标记，不做真实图片上传。</p>`;}

// ================= 环境监测 =================
function envPage(){const pts=db.envPoints,al=envAlerts();
 const affected=al.flatMap(p=>assetsIn(p.dir)).filter((a,i,arr)=>arr.indexOf(a)===i);
 return head('环境监测','舱室温湿度采集、超限告警，并与保养策略联动',action('env-link','模拟高湿联动 →','','btn primary'))
 +`<div class="stats"><div class="stat"><span class="caption">采集点</span><strong>${pts.length}</strong><small>舱室 / 部位级</small></div><div class="stat"><span class="caption">超限舱室</span><strong class="${al.length?'bad':''}">${al.length}</strong><small>温度或湿度越界</small></div><div class="stat"><span class="caption">受影响设备</span><strong>${affected.length}</strong><small>位于超限舱室内</small></div><div class="stat"><span class="caption">采集周期</span><strong style="font-size:17px">30 分钟</strong><small>示例值，不实际轮询</small></div></div>`
 +panel('采集点实时值',table(['舱室 / 部位','所在分段','温度','湿度','阈值','状态','操作'],pts.map(p=>`<tr><td>${esc(dir(p.dir)?.name)}<small>${esc(levelName(p.dir))}</small></td><td>${esc(path(p.dir).split(' / ')[0])}</td><td>${p.temp} °C</td><td>${p.humidity} %</td><td><small style="margin:0">≤ ${p.tempMax}°C / ≤ ${p.humidityMax}%</small></td><td>${envState(p)==='alert'?badge('超限','bad'):badge('正常')}<small>${esc(envReason(p)||'在阈值内')}</small></td><td>${action('env-edit','改实测值',p.id,'link-btn')}</td></tr>`).join('')))
 +panel('与保养策略联动',`<div class="panel-body"><p class="status-note" style="margin-top:0">v0.4 口径：高湿环境自动缩短保养周期（如 30 天 → 14 天），并自动更新点检引擎的截止时间。</p>
  ${al.length?`<div class="hint warn">当前 ${al.length} 个舱室超限，涉及 ${affected.length} 台设备。点击右上角「模拟高湿联动」可查看逐台影响并应用。</div>`:'<p class="empty">当前没有超限舱室，无需联动</p>'}
  <h3 class="risk-head">两处待业务确认</h3>
  <ul class="plain-list"><li>周期自动缩短会立刻改变已下发到标签的倒计时，可能出现「昨天还正常、今天就临期」。是否需要人工确认环节、调整历史是否可追溯，必须先定。</li>
  <li>候选标签工作环境仅 <strong>0–40°C、45%–70% RH</strong>。需要监测高湿告警的舱室，标签自身未必能在该湿度下工作——<strong>被监测环境超出了监测终端的工作范围</strong>，属选型级待决项。</li></ul></div>`)
 +`<p class="status-note">温湿度为静态示例值，可手动修改以模拟超限。采集方案（集成式 / 外挂式 / 网关集成）尚未选型，见文档 5.5。</p>`;}

// 高湿联动：预览逐台影响后再应用
function envLinkForm(){const al=envAlerts().filter(p=>p.humidity>p.humidityMax);
 if(!al.length){toast('当前没有湿度超限的舱室');return;}
 const rows=al.flatMap(p=>assetsIn(p.dir).map(a=>({a,p,next:Math.max(7,Math.round(a.cycle/2))}))).filter(x=>x.next<x.a.cycle);
 if(!rows.length){toast('受影响设备的保养周期已无法再缩短（下限 7 天）');return;}
 modal('模拟高湿联动',`<div class="hint warn">仅演示：把湿度超限舱室内设备的保养周期减半（下限 7 天），并立即重算截止时间。这会改变演示数据。</div>
 ${table(['设备资产','所在舱室','当前湿度','周期变化','状态变化'],rows.map(({a,p,next})=>{const cur=checkState(a),tmp={...a,cycle:next},after=checkState(tmp);
  return `<tr><td>${esc(a.name)}<small>${esc(a.code)}</small></td><td>${esc(dir(p.dir)?.name)}</td><td>${badge(p.humidity+'%','bad')}</td><td>${a.cycle} 天 → <strong>${next} 天</strong></td><td>${checkBadge(a)} → ${badge(CHECK[after][0].trim(),CHECK[after][1].trim())}${cur!==after?'<small>状态将变化</small>':''}</td></tr>`;}).join(''))}
 <div class="form-actions">${action('close-dialog','取消')}<button class="btn primary" data-action="env-link-apply">应用到 ${rows.length} 台设备</button></div>`,true);}
// 完成点检：写流水 → 截止日后移 → 关联标签标记待更新
function checkForm(id){const a=asset(id);if(!a)return;modal('完成点检 · '+a.name,`<form data-form="check" data-id="${esc(id)}"><div class="hint">演示操作：提交后记录点检流水，截止日期按保养周期 ${a.cycle} 天后移，关联标签标记为待更新。</div><div class="form-grid"><label class="form-field">点检结果<select name="result"><option value="normal">正常</option><option value="abnormal">异常</option></select></label><label class="form-field">执行人<input name="user" value="演示用户" required></label><label class="form-field full">备注<textarea name="note" rows="3" placeholder="异常项请填写描述；正式流程中异常需强制拍照存证"></textarea></label></div><div class="form-error" id="form-error"></div>${footerForm('提交点检')}</form>`);}
function tree(parent='root'){return db.dirs.filter(d=>d.parent===parent).map(d=>`<button class="tree-node ${folder===d.id?'active':''}" data-action="folder" data-id="${d.id}" title="${esc(levelName(d.id))} · ${esc(path(d.id))}"><span class="node-icon">${depth(d.id)===1?'▤':depth(d.id)===2?'▱':'▸'}</span><span class="node-name">${esc(d.name)}</span>${levelChip(d.id)}<span class="count">${assetsIn(d.id).length}</span></button>${db.dirs.some(x=>x.parent===d.id)?`<div class="tree-indent">${tree(d.id)}</div>`:''}`).join('');}
function assetRows(items){return items.map(a=>{const l=labelFor(a);return `<tr><td>${action('asset-detail',esc(a.name),a.id,'link-btn')}<small>${esc(a.code)}</small></td><td>${esc(dir(a.dir)?.name)}<small>${esc(levelName(a.dir))}</small></td><td>${esc(a.team)}</td><td>${l?`<small>${esc(l.mac.slice(-8))}</small>${onlineBadge(l)}`:badge('待绑定','warn')}</td><td><div class="actions">${action('asset-edit','编辑',a.id,'link-btn')}${action('asset-detail','详情',a.id,'link-btn')}</div></td></tr>`;}).join('');}
function storage(){const all=assetsIn(folder),items=all.filter(a=>[a.name,a.code,a.team].join(' ').includes(query)),bound=all.filter(a=>labelFor(a));return head('舱室 / 部位管理','四级目录：Hull No. → 分段 → 舱室 → 部位 · 部位层可跳过',action('directory-add','＋ 新建目录'))+`<div class="storage-layout"><aside class="tree-panel"><div class="tree-head"><h3>空间目录</h3><span class="small-label">四级 · 部位可跳过</span></div><button class="tree-node ${folder==='root'?'active':''}" data-action="folder" data-id="root" title="Hull No. · 全船"><span class="node-icon">◇</span><span class="node-name">Hull No. ${esc(db.ship.code)}</span><span class="level">Hull No.</span><span class="count">${db.assets.length}</span></button><div class="tree-indent">${tree()}</div></aside><div><div class="directory-path">${esc(path(folder))}　·　当前层级：${esc(levelName(folder))}</div><div class="row-between" style="margin-bottom:16px"><h2>${folder==='root'?'全船资产':esc(dir(folder)?.name)}</h2><div class="actions">${folder!=='root'?action('directory-edit','编辑目录',folder):''}${action('asset-add','＋ 新增资产','','btn primary')}</div></div><div class="compact-stats"><div>设备资产<strong>${all.length}</strong></div><div>已绑定<strong>${bound.length}</strong></div><div>待绑定<strong>${all.length-bound.length}</strong></div></div><div class="panel"><div class="toolbar"><input data-search aria-label="搜索当前目录资产" placeholder="搜索名称、编码或班组" value="${esc(query)}">${action('export-assets','导出 CSV')}</div>${table(['设备资产','所属目录','班组','标签','操作'],assetRows(items))}${foot(items.length)}</div><p class="status-note">当前包含下级目录的资产。设备可挂在舱室下，也可挂在部位下——不是每个舱室都需要细分部位。资产详情中可迁移归属、绑定或更换标签。</p></div></div>`;}
function filteredLabels(){return db.labels.filter(l=>{const a=asset(l.asset),q=[l.mac,a?.name,a?.code,a?.team,path(a?.dir)].join(' ').includes(query);let ok=filter==='all'||(filter==='online'&&l.online)||(filter==='offline'&&!l.online)||(filter==='low'&&l.battery<db.settings.low)||(filter==='weak'&&l.rssi<db.settings.weak)||(filter==='outdated'&&l.asset&&updateStatus(l)!=='synced')||(filter==='unbound'&&!l.asset);return q&&ok&&(!groupFilter||db.groups.find(g=>g.id===groupFilter)?.members.includes(l.id));});}
function labelToolbar(){return `<div class="toolbar"><input data-search aria-label="搜索标签或设备" placeholder="搜索 MAC、设备名称或编码" value="${esc(query)}"><select data-filter aria-label="筛选标签状态">${[['all','全部标签'],['online','在线'],['offline','离线'],['low','低电量'],['weak','弱信号'],['outdated','待更新'],['unbound','未绑定']].map(([v,t])=>`<option value="${v}" ${filter===v?'selected':''}>${t}</option>`).join('')}</select><select data-group-filter aria-label="筛选标签分组"><option value="">全部分组</option>${groupOptions(groupFilter)}</select>${action('export-labels','导出 CSV')}</div>`;}
function labelTable(status=false){const items=filteredLabels();return (selected.size?`<div class="selection-bar"><span>已选择 ${selected.size} 枚标签</span>${action('publish-selected','下发更新','','btn small primary')}${action('group-selected','加入分组')}${action('clear-selection','清除选择','','link-btn')}</div>`:'')+table([`<input type="checkbox" aria-label="全选当前标签" data-select-all ${items.length&&items.every(l=>selected.has(l.id))?'checked':''}>`,'标签 / 设备',status?'电量 / 信号':'所属目录','在线状态','内容状态','操作'],items.map(l=>{const a=asset(l.asset);return `<tr><td><input type="checkbox" aria-label="选择 ${esc(l.mac)}" data-select="${l.id}" ${selected.has(l.id)?'checked':''}></td><td>${action('label-detail',esc(a?.name||'未绑定资产'),l.id,'link-btn')}<small>${esc(l.mac)}</small></td><td>${status?`${badge(l.battery+'%',l.battery<db.settings.low?'warn':'neutral')}<small>${l.rssi} dBm</small>`:a?`${esc(dir(a.dir)?.name)}<small>${esc(levelName(a.dir))}</small>`:'—'}</td><td>${onlineBadge(l)}${l.state==='paused'?'<small>已停用</small>':''}</td><td>${updateBadge(l)}</td><td>${action('label-detail','详情',l.id,'link-btn')}</td></tr>`;}).join(''))+foot(items.length);}
function devices(){return head('标签管理','管理显示硬件、资产绑定及批量更新',action('label-add','＋ 登记标签','','btn primary'))+tabBar()+`<div class="panel">${labelToolbar()}${labelTable()}</div>`;}
function groups(){return head('标签分组','分组可跨目录，用于按设备类型或班组批量操作',action('group-edit','＋ 新增分组','','btn primary'))+tabBar()+`<div class="panel">${db.groups.map(g=>`<div class="group-row"><div class="group-main"><h3>${esc(g.name)}</h3><p>${esc(g.description||'暂无描述')}</p></div><div class="member-count"><strong>${g.members.length}</strong>枚标签</div><div class="actions">${action('group-open','查看标签',g.id)}${action('group-edit','编辑成员',g.id)}${action('group-publish','批量下发',g.id,'btn primary')}</div></div>`).join('')||'<div class="empty">还没有分组，可新建并选择成员。</div>'}</div><div class="hint">分组与位置目录相互独立。同一标签可参与不同用途的分组，位置归属保持唯一。</div>`;}
function dataPage(){const items=db.assets.filter(a=>[a.name,a.code,a.team].join(' ').includes(query));return head('字段与资产数据','先定义字段，再录入或批量导入设备信息',action('import','批量导入','','btn primary'))+tabBar()+panel('字段配置',`<div class="panel-body"><div class="actions">${db.fields.map(f=>action('field-edit',esc(f.name)+(f.required?' *':''),f.id)).join('')}</div><p class="status-note">点击字段查看配置。内置设备编码、名称和位置用于关联资产，不可移除。</p></div>`,action('field-add','＋ 自定义字段','','link-btn'))+`<div class="panel"><div class="toolbar"><input data-search aria-label="搜索资产数据" placeholder="搜索设备名称、编码或班组" value="${esc(query)}">${action('asset-add','新增资产')}${action('export-assets','导出 CSV')}${action('download-import','下载导入模板')}</div>${table(['设备资产','所属目录','班组','标签','操作'],assetRows(items))}${foot(items.length)}</div>`;}
function preview(t,a=db.assets[0]){return `<div class="eink" style="--tag-color:${esc(t.color)}"><div class="eink-top"><strong>${esc(t.heading)}</strong><span>${esc(a.code||'设备编码')}</span></div><div class="eink-name">${esc(a.name||'设备名称')}</div><div class="eink-code">${t.showModel?'型号 '+esc(a.model||'—'):'&nbsp;'}</div><div class="eink-bottom"><span>${esc(dir(a.dir)?.name||'所属目录')}</span><span>${t.showOwner?esc(a.team||'责任班组')+' · '+esc(a.owner||'责任人'):''}</span></div></div>`;}
function templates(){return head('模板设计','2.9 英寸 · 296 × 128 像素 · 黑白红黄屏幕示例',action('template-edit','＋ 新建模板','','btn primary'))+tabBar()+`<div class="hint">可编辑标题、显示颜色和字段显隐，实时查看简化版标签效果。预览为版式示意，尚非硬件像素验收效果。</div><div class="template-grid">${db.templates.map(t=>`<article class="template-card"><div class="preview-zone">${preview(t)}</div><div class="template-info"><div class="row-between"><h3>${esc(t.name)}</h3>${badge('v'+t.revision,'neutral')}</div><p>已关联 ${db.labels.filter(l=>l.template===t.id).length} 枚标签 · 2.9 英寸</p><div class="actions">${action('template-edit','编辑模板',t.id)}${action('template-copy','复制',t.id)}${action('template-apply','应用到标签',t.id,'btn primary')}</div></div></article>`).join('')}</div>`;}
function tasks(){return head('更新任务','追踪从提交到屏幕回执的执行结果',action('publish-all','创建下发任务','','btn primary'))+tabBar()+`<div class="hint">模拟下发后，点击“模拟回执”查看执行结果。离线标签保留待确认；恢复在线后可再次模拟回执。</div><div class="panel">${table(['任务名称','范围 / 进度','状态','创建时间','操作'],db.tasks.map(t=>{const n=t.items.length,s=t.items.filter(i=>i.status==='success').length,f=t.items.filter(i=>i.status==='failed').length;return `<tr><td>${action('task-detail',esc(t.name),t.id,'link-btn')}<small>${esc(t.id)}</small></td><td>${s} / ${n} 已确认</td><td>${s===n?badge('已确认更新'):f?badge('有失败项','bad'):badge('结果待确认','blue')}</td><td><small>${esc(t.time)}</small></td><td>${action('task-detail','查看任务',t.id,'link-btn')}</td></tr>`;}).join(''))}${foot(db.tasks.length)}</div>`;}
function strategies(){return head('标签策略','按条件匹配模板，再按计划触发内容更新',action('strategy-edit','＋ 新增策略','','btn primary'))+tabBar()+`<div class="hint">数字越小优先级越高；同优先级按列表顺序匹配。可手动模拟执行，定时和周期计划仅保存配置。</div><div class="panel">${[...db.strategies].sort((a,b)=>a.priority-b.priority).map(r=>`<div class="group-row"><span class="priority">${r.priority}</span><div class="group-main"><h3>${esc(r.name)}</h3><p class="rules-condition">${r.field==='all'?'所有标签 / 默认规则':esc(db.fields.find(f=>f.id===r.field)?.name||r.field)+' 等于「'+esc(r.value)+'」'} → ${esc(tpl(r.template)?.name)}</p><p>范围：${r.scope==='all'?'全船已绑定标签':esc(db.groups.find(g=>g.id===r.scope)?.name||'分组已删除')} · ${esc(r.schedule)}</p></div><button class="switch ${r.enabled?'on':''}" role="switch" aria-checked="${r.enabled}" aria-label="启停 ${esc(r.name)}" data-action="strategy-toggle" data-id="${r.id}"></button>${action('strategy-edit','编辑',r.id)}</div>`).join('')}<div class="panel-body">${action('strategy-run','模拟匹配并创建下发任务','','btn primary')}</div></div>`;}
function statusPage(){const offline=db.labels.filter(l=>!l.online).length,low=db.labels.filter(l=>l.battery<db.settings.low).length,weak=db.labels.filter(l=>l.rssi<db.settings.weak).length;return head('标签状态','分别查看通信健康、使用状态与内容更新结果',action('refresh-status','刷新示例状态'))+`<div class="actions" style="margin-bottom:20px">${[['all','全部 '+db.labels.length],['offline','离线 '+offline],['low','低电量 '+low],['weak','弱信号 '+weak]].map(([id,t])=>action('status-filter',t,id,'btn status-filter '+(filter===id?'active':''))).join('')}</div><div class="panel">${labelToolbar()}${labelTable(true)}</div><p class="status-note">离线、低电量和弱信号可重叠。最后上报时间和回执均为演示数据；后台刷新不代表标签屏幕刷新。</p>`;}
function gateways(){return head('系统管理','管理网关、权限与运行参数',action('gateway-edit','＋ 新增网关','','btn primary'))+tabBar()+`<div class="panel">${table(['网关','安装位置','关联标签','连接状态','操作'],db.gateways.map(g=>`<tr><td><strong>${esc(g.name)}</strong><small>${esc(g.ip)}</small></td><td>${esc(path(g.dir))}</td><td>${db.labels.filter(l=>l.gateway===g.id).length} 枚</td><td>${onlineBadge(g)}</td><td>${action('gateway-edit','查看 / 编辑',g.id,'link-btn')}</td></tr>`).join(''))}</div>`;}
function users(){return head('账号与权限','配置演示账号的角色和数据范围',action('user-edit','＋ 新增账号','','btn primary'))+tabBar()+`<div class="hint warn">权限为产品配置示意。本原型始终使用演示管理员，不进行真实登录或权限拦截。</div><div class="panel">${table(['账号','角色','看板视角','数据范围','状态','操作'],db.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.role)}</td><td>${esc(VIEWNAME[u.view]||'—')}</td><td>${esc(u.scope)}</td><td>${badge(u.enabled?'启用':'停用',u.enabled?'':'neutral')}</td><td>${action('user-edit','配置权限',u.id,'link-btn')}</td></tr>`).join(''))}</div><p class="status-note">「角色」是功能权限，「看板视角」决定登录后默认落到看板中心的哪一层——两者是不同维度，可自由组合。本原型不做真实登录，看板视角在页面上手动切换。</p>`;}
function settings(){return head('基础设置','本地配置示例，保存后阈值用于本原型的异常筛选')+tabBar()+`<section class="panel"><div class="panel-body"><form data-form="settings" class="settings-list"><div class="form-grid">${inputField('shipName','船舶名称',db.ship.name,'text',true)}${inputField('shipCode','船号 Hull No.',db.ship.code,'text',true)}</div><div style="margin-top:22px">${[['low','低电量阈值','电量低于此值时标记低电量，单位 %',0,100],['weak','弱信号阈值','RSSI 低于此值时标记弱信号，单位 dBm',-120,-1],['offline','离线判定间隔','单位分钟；原型通过手动模拟在线状态',1,1440],['refresh','看板刷新间隔','单位分钟；仅保存配置，不自动轮询',1,1440],['dueSoon','临期提醒阈值','距点检截止小于此值时判为临期，单位小时',1,720]].map(([k,t,d,min,max])=>`<label class="setting"><div><h3>${t}</h3><p>${d}</p></div><input type="number" name="${k}" value="${db.settings[k]}" min="${min}" max="${max}" required></label>`).join('')}</div><div class="form-error" id="form-error"></div><div class="form-actions"><button class="btn primary">保存设置</button></div></form></div></section>`;}
function logs(){return head('操作日志','记录当前浏览器中的资产变更与模拟操作')+tabBar()+`<div class="panel">${table(['时间','操作人','操作','内容'],db.logs.slice(0,100).map(l=>`<tr><td><small>${esc(l.time)}</small></td><td>演示管理员</td><td>${esc(l.action)}</td><td style="white-space:normal;min-width:200px">${esc(l.detail)}</td></tr>`).join(''))}${foot(Math.min(100,db.logs.length))}</div>`;}

function assetDetail(id){const a=asset(id);if(!a)return;const l=labelFor(a);modal(a.name,`<div class="detail-grid">${[['设备编码',a.code],['设备型号',a.model],['所属目录',path(a.dir)],['责任班组',a.team],['责任人',a.owner],['关联标签',l?.mac||'暂无']].map(([k,v])=>`<div class="detail-item"><span>${k}</span>${esc(v||'—')}</div>`).join('')}</div><hr class="detail-divider"><h3>标签关联</h3><p class="status-note">资产与在用标签按一对一关系演示，更换后旧标签保留为待绑定。</p><div class="actions">${action('asset-edit','编辑信息',a.id)}${action('asset-move','调整归属',a.id)}${action('bind','绑定 / 更换标签',a.id,'btn primary')}${l?action('label-detail','查看标签',l.id):''}</div>`);}
function assetForm(id){const a=asset(id)||{id:'',dir:folder==='root'?'d3':folder};modal(id?'编辑资产信息':'新增设备资产',`<form data-form="asset" data-id="${esc(a.id)}"><div class="form-grid">${db.fields.filter(f=>f.id!=='dir').map(f=>inputField(f.id,esc(f.name),a[f.id]||'',f.type==='数字'?'number':'text',f.required)).join('')}<label class="form-field full">所属目录 *<select name="dir" required>${dirOptions(a.dir)}</select></label></div><p class="status-note">变更显示字段后，关联标签将标记为待更新。</p>${footerForm()}</form>`);}
function labelDetail(id){const l=label(id);if(!l)return;const a=asset(l.asset),t=tpl(l.template);modal('标签详情 · '+l.mac.slice(-5),`<div class="detail-grid"><div class="detail-item"><span>标签 MAC</span>${esc(l.mac)}</div><div class="detail-item"><span>型号 / 屏幕</span>STag29AQ · 2.9 英寸</div><div class="detail-item"><span>关联资产</span>${a?action('asset-detail',esc(a.name),a.id,'link-btn'):'未绑定'}</div><div class="detail-item"><span>所属目录</span>${a?esc(path(a.dir)):'—'}</div></div><div class="status-grid"><div class="status-cell"><small>使用状态</small><strong>${stateText(l)}</strong><small>绑定关系独立于通信</small></div><div class="status-cell"><small>通信状态</small><strong>${onlineBadge(l)}</strong><small>电量 ${l.battery}% · ${l.rssi} dBm</small></div><div class="status-cell"><small>内容状态</small><strong>${updateBadge(l)}</strong><small>已确认 v${l.published} / 目标 v${l.version}</small></div></div><div class="detail-grid"><div class="detail-item"><span>最后上报</span>${esc(l.last)}</div><div class="detail-item"><span>关联网关</span>${esc(db.gateways.find(g=>g.id===l.gateway)?.name||'未指定')}</div></div><hr class="detail-divider"><div class="row-between"><h3>目标内容预览</h3>${badge(t?.name||'未配置','neutral')}</div><div class="preview-zone" style="margin:15px 0">${preview(t||db.templates[0],a||{name:'待绑定标签',code:l.mac.slice(-8)})}</div><p class="status-note">此处为目标内容；是否已经显示在现场屏幕上，需要单独查看任务回执。</p><div class="actions">${a?action('publish-one','下发此标签',l.id,'btn primary'):action('bind-label','绑定资产',l.id,'btn primary')}${action('simulate-online',l.online?'模拟离线':'模拟恢复在线',l.id)}${action('led','模拟点灯',l.id)}${a?action('unbind','解除绑定',l.id):''}${action('toggle-paused',l.state==='paused'?'启用标签':'停用标签',l.id)}</div><hr class="detail-divider"><h3>最近更新任务</h3><ul class="timeline">${db.tasks.filter(t=>t.items.some(i=>i.label===l.id)).slice(0,4).map(t=>`<li>${action('task-detail',esc(t.name),t.id,'link-btn')}<small>${esc(t.time)}</small></li>`).join('')||'<li>暂无任务记录</li>'}</ul>`);}
function bindForm(assetId,labelId){modal('绑定资产与标签',`<form data-form="bind"><div class="form-grid"><label class="form-field full">设备资产<select name="asset">${db.assets.map(a=>`<option value="${a.id}" ${a.id===assetId?'selected':''}>${esc(a.code+' · '+a.name)}${labelFor(a)?'（已绑定，将更换）':''}</option>`).join('')}</select></label><label class="form-field full">电子标签<select name="label">${db.labels.filter(l=>!l.asset||l.asset===assetId).map(l=>`<option value="${l.id}" ${l.id===labelId?'selected':''}>${esc(l.mac)}${l.state==='paused'?'（停用，需先启用）':''}</option>`).join('')}</select></label></div><p class="status-note">绑定后标记为待更新，可从标签详情创建首次下发任务。</p>${footerForm('确认绑定')}</form>`);}
function publishForm(ids){const candidates=db.labels.filter(l=>ids?.length?ids.includes(l.id):true);modal('创建标签下发任务',`<form data-form="publish"><label class="form-field">任务名称 *<input name="name" value="标签内容更新" required maxlength="60"></label><p class="status-note">仅可下发已绑定且启用的标签。离线标签可加入任务，等待恢复后确认结果。</p><div class="check-list">${candidates.map(l=>`<label class="check-row"><input type="checkbox" name="labels" value="${l.id}" ${l.asset&&l.state!=='paused'?'checked':'disabled'}><span>${esc(labelName(l))}<small style="display:block;margin:0">${esc(l.mac)}</small></span><small>${!l.asset?'未绑定':l.state==='paused'?'已停用':l.online?'在线':'离线'}</small></label>`).join('')}</div>${footerForm('模拟下发')}</form>`);}
function newTask(ids,name){const items=ids.map(id=>label(id)).filter(l=>l&&l.asset&&l.state!=='paused').map(l=>({label:l.id,version:l.version,status:'waiting'}));if(!items.length)return null;const t={id:uid('JOB'),name,time:stamp(),items};db.tasks.unshift(t);log('模拟下发',name+' · '+items.length+' 枚标签');return t;}
function taskDetail(id){const t=db.tasks.find(t=>t.id===id);if(!t)return;modal(t.name,`<p class="status-note">创建于 ${esc(t.time)} · ${t.items.length} 枚标签</p>${table(['标签 / 设备','目标版本','执行结果'],t.items.map(i=>{const l=label(i.label);return `<tr><td>${esc(labelName(l))}<small>${esc(l.mac)}</small></td><td>v${i.version}</td><td>${badge({success:'已确认更新',failed:'下发失败',waiting:'结果待确认'}[i.status],{success:'',failed:'bad',waiting:'blue'}[i.status])}${!l.online?'<small>标签当前离线</small>':''}</td></tr>`;}).join(''))}<p class="status-note">模拟回执只确认在线且未停用标签；离线项保留待确认。若任务版本落后于最新目标版本，标签仍会显示待更新。</p><div class="form-actions">${action('task-retry','重试失败项',t.id)}${action('task-receipt','模拟回执',t.id,'btn primary')}</div>`);}
function groupForm(id){const g=db.groups.find(g=>g.id===id)||{name:'',description:'',members:[]};modal(id?'编辑标签分组':'新建标签分组',`<form data-form="group" data-id="${esc(id||'')}"><div class="form-grid">${inputField('name','分组名称',g.name,'text',true)}${inputField('description','分组描述',g.description)}</div><p class="status-note">选择成员 · 可跨舱室，同一标签可以属于多个分组。</p><div class="check-list">${db.labels.map(l=>`<label class="check-row"><input type="checkbox" name="members" value="${l.id}" ${g.members.includes(l.id)?'checked':''}><span>${esc(labelName(l))}</span><small>${esc(l.mac.slice(-8))}</small></label>`).join('')}</div>${footerForm()}</form>${id?`<div style="margin-top:15px">${action('group-delete','删除分组',id,'link-btn')}</div>`:''}`);}
function templateForm(id){const t=tpl(id)||{name:'新模板',heading:'设备资产',color:'#202020',showModel:true,showOwner:true};modal(id?'编辑显示模板':'新建显示模板',`<form data-form="template" data-id="${esc(id||'')}"><div class="editor-layout"><div class="form-grid">${inputField('name','模板名称',t.name,'text',true)}${inputField('heading','屏幕标题',t.heading,'text',true)}<label class="form-field">标题颜色<select name="color" data-preview><option value="#202020" ${t.color==='#202020'?'selected':''}>黑色</option><option value="#ae2424" ${t.color==='#ae2424'?'selected':''}>红色</option><option value="#9b7600" ${t.color==='#9b7600'?'selected':''}>黄色（预览色）</option></select></label><label class="form-field">屏幕规格<input value="2.9 英寸 / 296 × 128" readonly></label><label class="check-row"><input name="showModel" type="checkbox" data-preview ${t.showModel?'checked':''}>显示设备型号</label><label class="check-row"><input name="showOwner" type="checkbox" data-preview ${t.showOwner?'checked':''}>显示责任信息</label><label class="form-field full">预览资产<select name="previewAsset" data-preview>${db.assets.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label></div><div><div id="live-preview" class="preview-zone">${preview(t)}</div><p class="status-note">实时显示示例资产字段。保存后关联标签将标记为待更新。</p></div></div>${footerForm('保存模板')}</form>`,true);$('#dialog [name="heading"]').setAttribute('data-preview','');}
function strategyForm(id){const r=db.strategies.find(r=>r.id===id)||{name:'',field:'team',value:'',template:'t1',priority:10,scope:'all',schedule:'即时'};modal(id?'编辑标签策略':'新增标签策略',`<form data-form="strategy" data-id="${esc(id||'')}"><div class="form-grid">${inputField('name','策略名称',r.name,'text',true)}<label class="form-field">优先级（数字越小越优先）<input name="priority" type="number" min="1" max="999" value="${r.priority}" required></label><label class="form-field">匹配字段<select name="field">${[['team','责任班组'],['model','设备型号'],['all','所有标签（默认规则）']].map(([v,t])=>`<option value="${v}" ${r.field===v?'selected':''}>${t}</option>`).join('')}</select></label>${inputField('value','等于',r.value)}<label class="form-field">使用模板<select name="template">${templateOptions(r.template)}</select></label><label class="form-field">应用范围<select name="scope"><option value="all">全船已绑定标签</option>${groupOptions(r.scope)}</select></label><label class="form-field full">刷新计划<select name="schedule">${['即时','每天 09:00','每 24 小时'].map(s=>`<option ${r.schedule===s?'selected':''}>${s}</option>`).join('')}</select><small>计划仅保存配置，请用“模拟匹配并创建下发任务”演示执行。</small></label></div>${footerForm()}</form>${id?`<div style="margin-top:15px">${action('strategy-delete','删除策略',id,'link-btn')}</div>`:''}`);}
function directoryForm(id){const d=dir(id)||{name:'',parent:folder};const willBe=lv=>LEVELS[Math.min(lv+1,MAX_DIR_DEPTH)];modal(id?'编辑目录':'新建目录',`<form data-form="directory" data-id="${esc(id||'')}"><div class="form-grid">${inputField('name','目录名称',d.name,'text',true)}<label class="form-field">上级目录<select name="parent"><option value="root" ${d.parent==='root'?'selected':''}>Hull No. ${esc(db.ship.code)}（根目录）　→ 新建为「分段」</option>${db.dirs.filter(x=>depth(x.id)<MAX_DIR_DEPTH&&(!id||!within(x.id,id))).map(x=>`<option value="${x.id}" ${d.parent===x.id?'selected':''}>${esc(path(x.id))}　→ 新建为「${esc(willBe(depth(x.id)))}」</option>`).join('')}</select></label></div><p class="status-note">四级目录：Hull No. → 分段 → 舱室 → 部位。层级由上级目录决定，部位为最末级。移动目录时会校验其全部子目录的层级；非空目录不能直接删除。</p>${footerForm()}</form>${id?`<div style="margin-top:15px">${action('directory-delete','删除目录',id,'link-btn')}</div>`:''}`);}
const csvExample='设备编码,设备名称,设备型号,所属目录,责任班组,责任人\nFO-003,备用燃油泵,CB-B40,燃油供给部位,轮机一组,张工\nEL-002,照明配电箱,XL-21,配电间,电气组,陈工';
function importForm(){importRows=[];modal('批量导入资产信息',`<div class="hint">此原型支持 CSV 文件或粘贴 CSV 文本。按设备编码匹配：不存在则新增，已存在则更新。Excel 文件导入后续细化。</div><div class="actions" style="margin-bottom:15px"><label class="btn">选择 CSV 文件<input type="file" accept=".csv,text/csv" id="csv-file" style="display:none"></label>${action('download-import','下载 CSV 模板')}</div><label class="form-field">CSV 内容<textarea id="csv-input" rows="7">${esc(csvExample)}</textarea></label><div class="actions" style="margin-top:15px">${action('import-check','校验并预览','','btn primary')}</div><div id="import-results" aria-live="polite"></div>`,true);}
function parseCSV(s){const rows=[];let row=[],v='',quoted=false;for(let i=0;i<s.length;i++){let c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(v);v='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(v);if(row.some(x=>x.trim()))rows.push(row);row=[];v='';}else v+=c;}if(quoted)throw Error('CSV 引号未闭合');row.push(v);if(row.some(x=>x.trim()))rows.push(row);return rows;}
function checkImport(){try{const rows=parseCSV($('#csv-input').value.replace(/^\uFEFF/,''));const heads=rows.shift()||[],required=['设备编码','设备名称','所属目录'];if(!required.every(h=>heads.includes(h)))throw Error('缺少必需表头：设备编码、设备名称、所属目录');const keys={设备编码:'code',设备名称:'name',设备型号:'model',所属目录:'dir',责任班组:'team',责任人:'owner'};const seen=new Set();importRows=rows.map((r,i)=>{const obj={};heads.forEach((h,j)=>{if(keys[h])obj[keys[h]]=(r[j]||'').trim();});const matches=db.dirs.filter(d=>d.name===obj.dir||path(d.id)===obj.dir);let error=!obj.code||!obj.name?'编码和名称不能为空':seen.has(obj.code)?'导入文件内设备编码重复':matches.length!==1?'所属目录不存在或名称不唯一（可填舱室或部位）':'';seen.add(obj.code);return {...obj,dir:matches[0]?.id,row:i+2,error,existing:db.assets.find(a=>a.code===obj.code)?.id};});if(!importRows.length)throw Error('没有可导入的数据');$('#import-results').innerHTML=`<div class="import-summary">共 ${importRows.length} 条，${importRows.filter(r=>!r.error).length} 条通过，${importRows.filter(r=>r.error).length} 条需要修正。</div><div class="import-preview">${table(['行号','设备编码','设备名称','结果'],importRows.map(r=>`<tr><td>${r.row}</td><td>${esc(r.code)}</td><td>${esc(r.name)}</td><td>${r.error?badge(r.error,'bad'):badge(r.existing?'更新':'新增')}</td></tr>`).join(''))}</div><div class="form-actions"><button class="btn primary" data-action="import-commit" ${importRows.some(r=>r.error)?'disabled':''}>确认导入 ${importRows.length} 条</button></div>`;}catch(e){importRows=[];$('#import-results').innerHTML=`<p class="form-error">${esc(e.message)}</p>`;}}
function download(name,rows){const safe=v=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(safe).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('已生成 CSV 下载文件');}
function simpleForm(kind,id){let o,title,body;
 if(kind==='gateway'){o=db.gateways.find(g=>g.id===id)||{name:'',dir:'d2',ip:''};title='网关信息';body=inputField('name','网关名称',o.name,'text',true)+inputField('ip','IP 地址',o.ip,'text',true)+`<label class="form-field full">安装目录<select name="dir">${dirOptions(o.dir)}</select></label><p class="status-note">关联 ${db.labels.filter(l=>l.gateway===id).length} 枚标签；网络状态为示例，只读展示。</p>`;}
 if(kind==='user'){o=db.users.find(u=>u.id===id)||{name:'',role:'只读查看',view:'exec',scope:'全船',enabled:true};title='账号与数据权限';body=inputField('name','账号名称',o.name,'text',true)+`<label class="form-field">角色（功能权限）<select name="role">${['系统管理员','资产管理员','标签运维','只读查看','船厂中高层','专业主管','专业工人'].map(v=>`<option ${o.role===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="form-field">看板视角（默认落地层）<select name="view">${Object.entries(VIEWNAME).map(([k,n])=>`<option value="${k}" ${o.view===k?'selected':''}>${esc(n)}</option>`).join('')}</select></label><label class="form-field">数据范围<select name="scope">${['全船',...db.dirs.filter(d=>d.parent==='root').map(d=>d.name)].map(v=>`<option ${o.scope===v?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label class="check-row"><input type="checkbox" name="enabled" ${o.enabled?'checked':''}>启用账号</label>`;}
 modal(title,`<form data-form="${kind}" data-id="${esc(id||'')}"><div class="form-grid">${body}</div>${footerForm()}</form>`);}
function guide(){modal('按这条路线体验原型',`<div class="hint">所有操作仅改变本地示例数据。右侧“需求对照”显示产品文档原文，可随时重置演示。</div>${[['01','从中高层看全船','看板中心业务看板：完好率、点检完成率、逾期与环境异常。','overview/biz'],['02','逐层钻取到设备','点分段进主管视图，再点设备进工人视图，完成一次点检。','overview/biz'],['03','沿四级目录下钻','分段 E101 → 主机舱 → 燃油供给部位，查看或编辑一台设备。','storage'],['04','看点检引擎怎么算','分级预警规则与保养周期；改一次周期，状态立刻重算。','inspect/rules'],['05','配置标签内容','编辑模板、调整分组，或导入新的资产数据。','labels/templates'],['06','模拟下发并确认','创建更新任务，点击模拟回执；离线项保留待确认。','labels/tasks'],['07','环境超限与联动','改一个舱室的湿度，看高湿联动如何影响保养周期。','env'],['08','运维视角','系统监控看板：网关、健康度与统一告警中心。','overview/ops']].map(([n,t,p,url])=>`<div class="guide-step"><span class="num">${n}</span><div><h3>${t}</h3><p>${p}</p></div>${action('guide-go','前往 →',url)}</div>`).join('')}`);}

document.addEventListener('click',e=>{if(e.target.closest('.nav-link'))document.body.classList.remove('nav-open');const el=e.target.closest('[data-action]');if(!el)return;const {action:a,id}=el.dataset;
 switch(a){
 case 'requirement-demo':openRequirementDemo(id);break;
 case 'mobile-nav':document.body.classList.toggle('nav-open');break;
 case 'toggle-doc':docOpen=!docOpen;reqPanel();break;
 case 'document':modal('产品结构与功能范围 · '+DOC.version,`<article class="document-content">${DOC.document}</article>`,true);break;
 case 'guide':guide();break;
 case 'guide-go':closeModal();if(id==='storage')folder='d3';if(id==='overview/biz'){boardView='exec';boardDir=boardTeam=boardAsset=null;}go(...id.split('/'));break;
 case 'close-dialog':closeModal();break;
 case 'reset':modal('重置本地演示数据',`<p>将恢复最初的示例资产、标签、模板和任务，清除你在此原型中的修改。</p><div class="form-actions">${action('close-dialog','取消')}${action('reset-confirm','确认重置','','btn danger')}</div>`);break;
 case 'reset-confirm':db=seed();persist();closeModal();folder='root';selected.clear();query='';filter='all';groupFilter='';boardView='exec';boardDir=null;boardTeam=null;boardAsset=null;render();toast('已恢复初始演示数据');break;
 case 'stat-nav':if(id==='tasks')go('labels','tasks');else if(id==='status')go('labels','status');else go(id);break;
 case 'nav':go(...id.split('/'));break;
 case 'alert-cycle':{const next={'未处理':'处理中','处理中':'已解决','已解决':'未处理'};db.alertStates[id]=next[db.alertStates[id]||'未处理'];persist();log('推进告警状态',id+' → '+db.alertStates[id]);render();toast('告警状态：'+db.alertStates[id]);break;}
 case 'alert-go':{const a=alerts().find(a=>a.id===id);if(!a)break;if(a.go.action==='nav')go(...a.go.id.split('/'));else{boardView='worker';boardAsset=a.go.id;boardDir=null;boardTeam=null;go('overview','biz');}break;}
 case 'cycle-edit':{const a=asset(id);if(!a)break;modal('调整保养周期 · '+a.name,`<form data-form="cycle" data-id="${esc(id)}"><div class="hint">当前 ${a.cycle} 天，下次截止 ${esc(dueText(a))}。改周期会立刻重算截止时间与点检状态。</div><label class="form-field">保养周期（天）<input type="number" name="cycle" value="${a.cycle}" min="1" max="365" required></label><div class="form-error" id="form-error"></div>${footerForm()}</form>`);break;}
 case 'env-edit':{const p=db.envPoints.find(x=>x.id===id);if(!p)break;modal('修改实测值 · '+(dir(p.dir)?.name||''),`<form data-form="env" data-id="${esc(id)}"><div class="hint">演示用：改成超出阈值可触发环境告警与高湿联动。</div><div class="form-grid"><label class="form-field">温度 °C<input type="number" step="0.1" name="temp" value="${p.temp}" required></label><label class="form-field">湿度 %<input type="number" step="1" name="humidity" value="${p.humidity}" min="0" max="100" required></label><label class="form-field">温度上限<input type="number" step="0.1" name="tempMax" value="${p.tempMax}" required></label><label class="form-field">湿度上限<input type="number" step="1" name="humidityMax" value="${p.humidityMax}" min="0" max="100" required></label></div><div class="form-error" id="form-error"></div>${footerForm()}</form>`);break;}
 case 'env-link':envLinkForm();break;
 case 'env-link-apply':{const al=envAlerts().filter(p=>p.humidity>p.humidityMax);let n=0;
  al.forEach(p=>assetsIn(p.dir).forEach(a=>{const next=Math.max(7,Math.round(a.cycle/2));if(next<a.cycle){a.cycle=next;const l=labelFor(a);if(l)l.version++;n++;}}));
  persist();closeModal();log('应用高湿联动','缩短 '+n+' 台设备保养周期');render();toast(n?`已缩短 ${n} 台设备的保养周期，截止时间与标签状态同步更新`:'没有可缩短的设备');break;}
 case 'export-inspections':download('点检流水.csv',[['时间','设备编码','设备名称','所属目录','执行人','结果','备注','存证'],...db.inspections.map(i=>{const a=asset(i.asset);return [i.time,a?.code||'',a?.name||'',a?path(a.dir):'',i.user,i.result==='abnormal'?'异常':'正常',i.note||'',i.photo?'已拍照':''];})]);break;
 case 'board-view':boardView=id;if(id==='exec'){boardDir=null;boardTeam=null;boardAsset=null;}render();break;
 case 'board-dir':boardDir=id;boardTeam=null;boardAsset=null;boardView='supervisor';render();break;
 case 'board-team':boardTeam=id;boardAsset=null;boardView='supervisor';render();break;
 case 'board-asset':boardAsset=id;boardView='worker';render();break;
 case 'board-reset':boardDir=null;boardTeam=null;boardAsset=null;render();break;
 case 'board-card':if(id==='status')go('labels','status');else{boardView='supervisor';boardDir=null;boardTeam=null;boardAsset=null;render();}break;
 case 'check-do':checkForm(id);break;
 case 'check-repair':{const a=asset(id);if(!a)break;a.fault=!a.fault;persist();log(a.fault?'转报修工单':'解除报修',a.name);render();toast(a.fault?'已标记为故障报修中，并推送责任班组长（演示）':'已解除报修标记');break;}
 case 'folder':folder=id;query='';render();break;
 case 'directory-add':if(depth(folder)>=MAX_DIR_DEPTH){toast('「部位」已是最末级目录，请选择上级目录后新增');break;}directoryForm();break;
 case 'directory-edit':directoryForm(id);break;
 case 'directory-delete':if(db.dirs.some(d=>d.parent===id)||assetsIn(id).length){toast('目录仍有下级目录或资产，请先迁移后再删除');break;}db.dirs=db.dirs.filter(d=>d.id!==id);folder='root';log('删除目录',id);closeModal();render();toast('目录已删除');break;
 case 'asset-detail':assetDetail(id);break;
 case 'asset-add':assetForm();break;
 case 'asset-edit':assetForm(id);break;
 case 'asset-move':modal('调整资产归属',`<form data-form="move" data-id="${id}"><p class="status-note">${esc(asset(id).name)} · 关联标签随资产同步调整归属。</p><label class="form-field">目标目录<select name="dir">${dirOptions(asset(id).dir)}</select></label>${footerForm('确认迁移')}</form>`);break;
 case 'bind':bindForm(id);break;
 case 'bind-label':bindForm('',id);break;
 case 'label-detail':labelDetail(id);break;
 case 'label-add':modal('登记电子标签',`<form data-form="label"><div class="form-grid">${inputField('mac','MAC 地址','C8:29:01:00:00:10','text',true)}<label class="form-field">型号<input value="STag29AQ · 2.9 英寸" readonly></label><label class="form-field full">关联网关<select name="gateway">${db.gateways.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select></label></div>${footerForm('登记标签')}</form>`);break;
 case 'simulate-online':{const l=label(id);l.online=!l.online;l.last=stamp();log('模拟通信状态',l.mac+' '+(l.online?'恢复在线':'离线'));render();labelDetail(id);toast('已模拟'+(l.online?'恢复在线，可到任务中确认回执':'离线'));break;}
 case 'toggle-paused':{const l=label(id);l.state=l.state==='paused'?'active':'paused';log('标签启停',l.mac+' '+stateText(l));render();labelDetail(id);break;}
 case 'led':log('模拟点灯',label(id).mac+' · 绿色闪烁示例');toast('已模拟点灯指令；未连接现场 LED');break;
 case 'unbind':modal('解除资产绑定',`<p>解除 ${esc(label(id).mac)} 与 ${esc(labelName(label(id)))} 的绑定。资产与标签记录均保留。</p><div class="form-actions">${action('close-dialog','取消')}${action('unbind-confirm','确认解绑',id,'btn danger')}</div>`);break;
 case 'unbind-confirm':{const l=label(id);l.asset=null;l.published=0;l.version++;log('解除绑定',l.mac);render();labelDetail(id);toast('已解除绑定，现场清屏不在此模拟操作内');break;}
 case 'publish-one':publishForm([id]);break;
 case 'publish-selected':publishForm([...selected]);break;
 case 'publish-all':publishForm();break;
 case 'clear-selection':selected.clear();render();break;
 case 'group-selected':modal('将选中标签加入分组',`<form data-form="group-selected"><label class="form-field">目标分组<select name="group" required>${groupOptions('')}</select></label><p class="status-note">共 ${selected.size} 枚标签，将追加到选定分组。</p>${footerForm()}</form>`);break;
 case 'group-edit':groupForm(id);break;
 case 'group-open':pendingNav={groupFilter:id};go('labels','devices');break;
 case 'group-publish':publishForm(db.groups.find(g=>g.id===id).members.length?db.groups.find(g=>g.id===id).members:['no-label']);break;
 case 'group-delete':db.groups=db.groups.filter(g=>g.id!==id);log('删除分组',id);closeModal();render();break;
 case 'template-edit':templateForm(id);break;
 case 'template-copy':{const t=tpl(id),n={...t,id:uid('t'),name:t.name+' 副本',revision:1};db.templates.push(n);log('复制模板',n.name);render();toast('模板已复制');break;}
 case 'template-apply':modal('应用模板到标签',`<form data-form="template-apply" data-id="${id}"><p class="status-note">${esc(tpl(id).name)} · 应用后标记为待更新，尚未下发。</p><div class="check-list">${db.labels.filter(l=>l.asset).map(l=>`<label class="check-row"><input type="checkbox" name="labels" value="${l.id}"><span>${esc(labelName(l))}</span><small>${esc(l.mac.slice(-8))}</small></label>`).join('')}</div>${footerForm('应用模板')}</form>`);break;
 case 'task-detail':taskDetail(id);break;
 case 'task-receipt':{const t=db.tasks.find(t=>t.id===id);let n=0;t.items.forEach(i=>{const l=label(i.label);if(i.status==='waiting'&&l.online&&l.state!=='paused'&&l.asset){i.status='success';l.published=Math.max(l.published,i.version);n++;}});log('模拟回执',t.name+' · '+n+' 枚确认更新');render();taskDetail(id);toast(n?`已模拟 ${n} 枚标签的成功回执`:'没有可确认的标签；请检查在线状态或先重试失败项');break;}
 case 'task-retry':{const t=db.tasks.find(t=>t.id===id);let n=0;t.items.forEach(i=>{if(i.status==='failed'){i.status='waiting';i.version=label(i.label).version;n++;}});log('重试失败项',t.name+' · '+n+' 枚');render();taskDetail(id);toast(n?'失败项已重新提交，可模拟回执':'当前任务没有失败项');break;}
 case 'strategy-edit':strategyForm(id);break;
 case 'strategy-toggle':{const r=db.strategies.find(r=>r.id===id);r.enabled=!r.enabled;log('策略启停',r.name);render();break;}
 case 'strategy-delete':db.strategies=db.strategies.filter(r=>r.id!==id);log('删除策略',id);closeModal();render();break;
 case 'strategy-run':{const rules=[...db.strategies].filter(r=>r.enabled).sort((a,b)=>a.priority-b.priority),ids=[];db.labels.filter(l=>l.asset&&l.state!=='paused').forEach(l=>{const a=asset(l.asset);const r=rules.find(r=>(r.scope==='all'||db.groups.find(g=>g.id===r.scope)?.members.includes(l.id))&&(r.field==='all'||a[r.field]===r.value));if(r){if(l.template!==r.template){l.template=r.template;l.version++;}ids.push(l.id);}});const t=newTask(ids,'策略匹配更新（手动模拟）');if(t){render();taskDetail(t.id);toast(`匹配 ${ids.length} 枚标签，已创建模拟任务`);}else toast('没有匹配到可下发标签');break;}
 case 'status-filter':filter=id;selected.clear();render();break;
 case 'refresh-status':toast('已重新读取本地示例状态，未请求现场硬件');render();break;
 case 'field-add':case 'field-edit':{const f=db.fields.find(f=>f.id===id)||{name:'',type:'文本',required:false};const locked=['code','name','dir'].includes(id);modal(id?'字段配置':'添加自定义字段',`<form data-form="field" data-id="${esc(id||'')}"><div class="form-grid">${inputField('name','字段名称',f.name,'text',true)}<label class="form-field">字段类型<select name="type" ${id?'disabled':''}>${[...new Set([f.type,'文本','数字'])].map(t=>`<option ${f.type===t?'selected':''}>${t}</option>`).join('')}</select><small>${id?'现有字段类型固定，避免改变已保存数据语义。':''}</small></label><label class="check-row"><input name="required" type="checkbox" ${f.required?'checked':''} ${locked?'disabled':''}>必填字段</label></div>${footerForm()}</form>`);break;}
 case 'import':importForm();break;
 case 'import-check':checkImport();break;
 case 'import-commit':{if(!importRows.length||importRows.some(r=>r.error))return;const input=$('#csv-input').value;const n=importRows.length;importRows.forEach(r=>{const a=r.existing?asset(r.existing):{id:uid('a')};['code','name','model','dir','team','owner'].forEach(k=>a[k]=r[k]||'');if(!r.existing)db.assets.push(a);const l=labelFor(a);if(l)l.version++;});log('批量导入',n+' 条资产数据');importRows=[];closeModal();render();toast(`已导入 ${n} 条资产数据`);break;}
 case 'download-import':download('船舶资产导入模板.csv',parseCSV(csvExample));break;
 case 'export-assets':{const items=(route.page==='storage'?assetsIn(folder):db.assets).filter(a=>[a.name,a.code,a.team].join(' ').includes(query));download('船舶资产数据.csv',[['设备编码','设备名称','设备型号','所属目录','责任班组','责任人'],...items.map(a=>[a.code,a.name,a.model,path(a.dir),a.team,a.owner])]);break;}
 case 'export-labels':download('电子标签状态.csv',[['MAC','关联设备','在线状态','电量','RSSI','最后上报'],...filteredLabels().map(l=>[l.mac,labelName(l),l.online?'在线':'离线',l.battery,l.rssi,l.last])]);break;
 case 'gateway-edit':simpleForm('gateway',id);break;
 case 'user-edit':simpleForm('user',id);break;
 }
});
document.addEventListener('submit',e=>{const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();const data=new FormData(f),v=Object.fromEntries(data),id=f.dataset.id,kind=f.dataset.form;let err='';const fail=s=>{const el=f.querySelector('#form-error');if(el)el.textContent=s;else toast(s);};
 if(kind==='asset'){if(db.assets.some(a=>a.code===v.code.trim()&&a.id!==id))return fail('设备编码已存在，请使用唯一编码');const a=asset(id)||{id:uid('a')};db.fields.filter(f=>f.id!=='dir').forEach(field=>a[field.id]=(v[field.id]||'').trim());a.dir=v.dir;if(!id)db.assets.push(a);const l=labelFor(a);if(l)l.version++;log(id?'编辑资产':'新增资产',a.name);}
 if(kind==='move'){const a=asset(id);a.dir=v.dir;const l=labelFor(a);if(l)l.version++;log('资产迁移',a.name+' → '+path(v.dir));}
if(kind==='cycle'){const a=asset(id);const n=Number(v.cycle);if(!a)return fail('设备不存在');if(!(n>=1&&n<=365))return fail('保养周期需在 1–365 天之间');
  a.cycle=n;const l=labelFor(a);if(l)l.version++;log('调整保养周期',a.name+' → '+n+' 天');persist();closeModal();render();toast('已改为 '+n+' 天；截止时间与点检状态已重算，关联标签标记为待更新');return;}
 if(kind==='env'){const p=db.envPoints.find(x=>x.id===id);if(!p)return fail('采集点不存在');
  Object.assign(p,{temp:Number(v.temp),humidity:Number(v.humidity),tempMax:Number(v.tempMax),humidityMax:Number(v.humidityMax),last:db.demoNow});
  log('修改环境实测值',(dir(p.dir)?.name||'')+' '+p.temp+'°C / '+p.humidity+'%');persist();closeModal();render();toast(envState(p)==='alert'?'已保存；该舱室现为超限状态':'已保存；该舱室在阈值内');return;}
 if(kind==='check'){const a=asset(id);if(!a)return fail('设备不存在');if(!v.user.trim())return fail('请填写执行人');
  db.inspections.unshift({id:uid('ins'),asset:id,user:v.user.trim(),time:db.demoNow,result:v.result,note:(v.note||'').trim(),photo:v.result==='abnormal'});
  a.lastCheck=db.demoNow;const l=labelFor(a);if(l)l.version++;
  log('完成点检',a.name+' · '+(v.result==='abnormal'?'异常':'正常'));
  persist();closeModal();render();toast(l?'已记录点检；截止日期后移，关联标签已标记为待更新':'已记录点检；该设备尚未绑定标签');return;}
 if(kind==='directory'){const d=dir(id),subDepth=id?Math.max(0,...db.dirs.filter(x=>within(x.id,id)).map(x=>depth(x.id)-depth(id))):0;if(depth(v.parent)+1+subDepth>MAX_DIR_DEPTH)return fail(`移动后会超过四级目录限制（Hull No. → ${LEVELS.slice(1).join(' → ')}）`);if(db.dirs.some(x=>x.parent===v.parent&&x.name===v.name.trim()&&x.id!==id))return fail('同级目录名称不可重复');if(d){d.name=v.name.trim();d.parent=v.parent;}else db.dirs.push({id:uid('d'),name:v.name.trim(),parent:v.parent});log('维护目录',v.name);}
 if(kind==='label'){if(!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(v.mac))return fail('请输入正确的 MAC 地址，如 C8:29:01:00:00:10');if(db.labels.some(l=>l.mac===v.mac.toUpperCase()))return fail('此 MAC 已登记');db.labels.push({id:uid('l'),mac:v.mac.toUpperCase(),asset:null,online:true,battery:100,rssi:-55,template:'t1',version:1,published:0,gateway:v.gateway,last:stamp(),state:'active'});log('登记标签',v.mac);}
 if(kind==='bind'){const l=label(v.label);if(!l)return fail('请选择可用标签');if(l.state==='paused')return fail('标签已停用，请先在详情中启用');const old=labelFor(asset(v.asset));if(old&&old.id!==l.id){old.asset=null;old.version++;old.published=0;}l.asset=v.asset;l.version++;l.published=0;log('绑定资产',labelName(l)+' ↔ '+l.mac);closeModal();render();labelDetail(l.id);toast('已绑定，等待首次下发');return;}
 if(kind==='publish'){const ids=data.getAll('labels');if(!ids.length)return fail('至少选择一枚已绑定且启用的标签');const t=newTask(ids,v.name.trim());closeModal();selected.clear();go('labels','tasks');setTimeout(()=>taskDetail(t.id),0);toast('已创建模拟任务，等待回执');return;}
 if(kind==='group'){const name=v.name.trim();if(db.groups.some(g=>g.name===name&&g.id!==id))return fail('分组名称已存在');const g=db.groups.find(g=>g.id===id)||{id:uid('gr')};Object.assign(g,{name,description:v.description.trim(),members:data.getAll('members')});if(!id)db.groups.push(g);log('维护分组',name);}
 if(kind==='group-selected'){const g=db.groups.find(g=>g.id===v.group);if(!g)return fail('请先创建一个分组');g.members=[...new Set([...g.members,...selected])];log('加入分组',g.name+' · '+selected.size+' 枚标签');selected.clear();}
 if(kind==='template'){const t=tpl(id)||{id:uid('t'),revision:0};Object.assign(t,{name:v.name.trim(),heading:v.heading.trim(),color:v.color,showModel:data.has('showModel'),showOwner:data.has('showOwner'),revision:t.revision+1});if(!id)db.templates.push(t);db.labels.filter(l=>l.template===t.id).forEach(l=>l.version++);log('保存模板',t.name+' v'+t.revision);}
 if(kind==='template-apply'){const ids=data.getAll('labels');if(!ids.length)return fail('至少选择一枚标签');ids.forEach(id2=>{const l=label(id2);l.template=id;l.version++;});log('应用模板',tpl(id).name+' · '+ids.length+' 枚标签');}
 if(kind==='strategy'){if(v.field!=='all'&&!v.value.trim())return fail('请填写匹配值');const r=db.strategies.find(r=>r.id===id)||{id:uid('r'),enabled:true};Object.assign(r,{name:v.name.trim(),field:v.field,value:v.value.trim(),template:v.template,priority:Number(v.priority),scope:v.scope,schedule:v.schedule});if(!id)db.strategies.push(r);log('维护标签策略',r.name);}
 if(kind==='field'){if(db.fields.some(x=>x.name===v.name.trim()&&x.id!==id))return fail('字段名称已存在');const field=db.fields.find(x=>x.id===id);if(field){field.name=v.name.trim();if(!['code','name','dir'].includes(id))field.required=data.has('required');}else db.fields.push({id:uid('field'),name:v.name.trim(),type:v.type,required:data.has('required')});log('字段配置',v.name);}
 if(kind==='gateway'){if(!/^(\d{1,3}\.){3}\d{1,3}$/.test(v.ip)||v.ip.split('.').some(x=>+x>255))return fail('请输入有效的 IPv4 地址');const g=db.gateways.find(g=>g.id===id)||{id:uid('g'),online:true};Object.assign(g,{name:v.name.trim(),ip:v.ip,dir:v.dir});if(!id)db.gateways.push(g);log('维护网关',g.name);}
 if(kind==='user'){const u=db.users.find(u=>u.id===id)||{id:uid('u')};Object.assign(u,{name:v.name.trim(),role:v.role,view:v.view,scope:v.scope,enabled:data.has('enabled')});if(!id)db.users.push(u);log('维护账号权限',u.name+' · '+u.role);}
 if(kind==='settings'){db.ship={name:v.shipName.trim(),code:v.shipCode.trim()};for(const k of ['low','weak','offline','refresh','dueSoon'])db.settings[k]=Number(v[k]);log('修改基础设置','船舶信息与异常阈值');render();toast('设置已保存');return;}
 closeModal();render();toast('已保存到本地演示数据');
});
document.addEventListener('change',async e=>{const t=e.target;if(t.matches('[data-filter]')){filter=t.value;selected.clear();render();}if(t.matches('[data-group-filter]')){groupFilter=t.value;selected.clear();render();}if(t.matches('[data-select]')){t.checked?selected.add(t.dataset.select):selected.delete(t.dataset.select);render();}if(t.matches('[data-select-all]')){filteredLabels().forEach(l=>t.checked?selected.add(l.id):selected.delete(l.id));render();}if(t.id==='csv-file'&&t.files[0]){if(t.files[0].size>1024*1024){toast('演示文件请控制在 1 MB 内');return;}$('#csv-input').value=await t.files[0].text();checkImport();}});
document.addEventListener('input',e=>{if(e.isComposing)return;const t=e.target;if(t.matches('[data-search]')){query=t.value;const pos=t.selectionStart;selected.clear();render();const input=$('[data-search]');input.focus();input.setSelectionRange(pos,pos);}if(t.closest('[data-form="template"]')&&t.matches('[data-preview]')){const f=t.closest('form'),d=new FormData(f);$('#live-preview').innerHTML=preview({heading:d.get('heading'),color:d.get('color'),showModel:d.has('showModel'),showOwner:d.has('showOwner')},asset(d.get('previewAsset')));}if(t.id==='csv-input'){importRows=[];$('#import-results').innerHTML='';}});
document.addEventListener('keydown',e=>{const t=e.target.closest('.stat[role=button]');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();t.click();}});
window.addEventListener('hashchange',readRoute);
$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
readRoute();persist();
