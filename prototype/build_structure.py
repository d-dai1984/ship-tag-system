"""按 v0.4 文档重建结构说明页的「模块地图」与「模块功能清单」两段。

与 prototype/build.py 共用 docparse.py，保证结构页和交互原型来自同一份文档、同一套 id。
其余段落（架构图说明、目录示例、业务流程、边界）仍为手工维护，本脚本不改。
用法：python3 prototype/build_structure.py
"""
from pathlib import Path
import sys, html as H
sys.path.insert(0, str(Path(__file__).resolve().parent))
import docparse

root = docparse.ROOT
reqs = docparse.extract(docparse.source())
by_slug = {}
for rid, r in reqs.items():
    by_slug.setdefault(r['slug'], []).append(r)

def e(v): return H.escape(str(v))

# (details id, 编号, 标题, 副标题, [slug], 章节标注, 表下注, 模块卡里挑哪几条做快捷链接)
GROUPS = [
 ('board','01','看板中心','三层角色 × 三级钻取',['board-biz','board-ops'],'文档 5.4',
  '第一页业务看板按中高层／专业主管／专业工人三层角色聚合同一份数据，可逐层钻取；第二页系统监控看板面向 IT 运维，并统一承载业务与系统告警。',
  ['全船设备完好率','点检完成率','逾期设备清单','今日待检','离线标签清单']),
 ('space','02','舱室 / 部位管理','按位置组织资产',['space'],'文档 5.1',
  '目录共四级：Hull No.（船号）→ 分段 Block → 舱室 Compartment → 部位 Position。资产与标签不计入目录层级；不要求建满四级，设备可直接挂在舱室下。',
  ['四级目录管理','目录概览','下属数据管理','归属调整','保养规程与检查项标准']),
 ('labels','03','标签管理','维护内容并更新到现场',['labels'],'文档 5.2',
  '标签在线不等于屏幕已更新：任务发送成功只代表边缘服务已接收，刷屏回执需按厂商接口能力另行确认。',
  ['标签台账','一键扫码绑定','点检状态模板组','信息下发','刷新计划','LED 控制策略']),
 ('inspect','04','点检引擎','自动推算截止与分级预警',['inspect'],'文档 5.3',
  '后台按设备保养周期推算下次截止时间，临期与逾期两级阈值可配置，状态变化驱动模板下发与 LED 指令。',
  ['周期与截止推算','分级预警','屏幕与 LED 联动','点检流水']),
 ('env','05','环境监测','舱室温湿度与保养联动',['env'],'文档 5.5',
  '采集方案（集成式／外挂式／网关集成）尚未选型。需要监测高湿告警的舱室，标签自身未必能在该湿度下工作——被监测环境超出监测终端工作范围，属选型级待决项。',
  ['实时采集','超限告警','与保养策略联动','环境监测看板']),
 ('mobile','06','移动端','点检员现场作业工具',['mobile'],'文档 5.6',
  '整套流程强依赖标签 NFC，而候选机规格中 NFC 仅标为「可选」。这一条不落实，防假检与离线闭环都不成立。',
  ['NFC 碰一碰唤起','离线作业','标准化防呆表单','即时物理闭环反馈']),
 ('system','07','系统管理','运行支撑',['system'],'文档 5.8',
  '「角色」是功能权限，「看板视角」决定登录后默认落到看板中心的哪一层，两者是不同维度，可自由组合。',
  ['船舶信息','网关管理','账号与权限','角色视图配置','操作日志']),
 ('edge','08','管理后台与边缘系统','部署、容灾与北向对接',['edge'],'文档 5.7',
  '本段四项能力目前全部缺少厂商书面承诺，属未证明项，不能按已具备来做方案。',
  ['本地边缘私有化部署','弱网容灾与断网续传','北向对接 MES/EAM']),
 ('commission','09','二期 · 设备调试管理','状态、动作与违章告警',
  ['commission','commission-board','commission-rules','commission-hw'],'文档 6',
  '二期不含调试计划编制与审批。运行时长、上电／断电检测依赖外接电流传感器或接入设备 PLC，属全新硬件与集成工作，尚未立项选型。',
  ['调试状态监控','上电/断电动作监控','违章作业告警','设备运行时长']),
]

def anchor(r): return f"{r['slug']}-{r['no']}"

# ---- 模块地图（01 / ARCHITECTURE 的 .map + .support） ----
cards = []
for gid, num, title, sub, slugs, _ref, _note, picks in GROUPS[:5]:
    items = [r for s in slugs for r in by_slug.get(s, [])]
    links = ''
    for p in picks:
        hit = next((r for r in items if r['title'] == p), None)
        if hit:
            links += (f'<a href="#{anchor(hit)}" data-reveal="{gid}">{e(hit["title"])}'
                      f'<span aria-hidden="true">↗</span></a>')
    cards.append(f'<article class="module"><div class="module-top"><span class="number">{num}</span>'
                 f'<span class="small">{e(sub)}</span></div><h3>{e(title)}</h3>'
                 f'<p>共 {len(items)} 项需求</p><div class="module-links">{links}</div></article>')
support = []
for gid, num, title, sub, slugs, _ref, _note, picks in GROUPS[5:]:
    items = [r for s in slugs for r in by_slug.get(s, [])]
    links = ''
    for p in picks:
        hit = next((r for r in items if r['title'] == p), None)
        if hit:
            links += (f'<a href="#{anchor(hit)}" data-reveal="{gid}">{e(hit["title"])}'
                      f'<span aria-hidden="true">↗</span></a>')
    support.append(f'<div class="support-row"><strong><span class="number">{num}</span>　{e(title)}'
                   f'<small>{e(sub)} · {len(items)} 项</small></strong>'
                   f'<div class="support-links">{links}</div></div>')
MAP = ('<div class="map">' + ''.join(cards) + '</div>'
       + '<div class="support">' + ''.join(support) + '</div>')

# ---- 模块功能清单（04 / REQUIREMENTS 的 details 列表） ----
specs = []
for i, (gid, num, title, sub, slugs, ref, note, _picks) in enumerate(GROUPS):
    rows = ''
    for s in slugs:
        for r in by_slug.get(s, []):
            rows += (f'<tr id="{anchor(r)}"><th scope="row">{e(r["title"])}</th>'
                     f'<td>{e(r["text"])}<small class="sec">{e(r["section"])}</small></td></tr>')
    n = sum(len(by_slug.get(s, [])) for s in slugs)
    specs.append(f'<details class="spec" id="{gid}"{" open" if i == 0 else ""}>'
                 f'<summary><span class="number">{num}</span>'
                 f'<span class="spec-title">{e(title)}<small>{e(sub)}</small></span>'
                 f'<span class="ref">{e(ref)} · {n} 项</span><span class="plus" aria-hidden="true"></span></summary>'
                 f'<div class="spec-body"><table><caption class="sr-only">{e(title)}功能需求</caption>'
                 f'<thead><tr><th scope="col">功能</th><th scope="col">需求</th></tr></thead>'
                 f'<tbody>{rows}</tbody></table><p class="note">{e(note)}</p></div></details>')
SPECS = ''.join(specs)

dest = root / 'product-structure.html'
s = dest.read_text()

def splice(text, start, end, body, label):
    if start not in text:
        sys.exit(f'找不到标记 {start}（{label}）。首次使用请先手动插入标记注释。')
    a = text.index(start) + len(start)
    b = text.index(end, a)
    return text[:a] + body + text[b:]

s = splice(s, '<!--MAP-->', '<!--/MAP-->', MAP, '模块地图')
s = splice(s, '<!--SPECS-->', '<!--/SPECS-->', SPECS, '功能清单')
dest.write_text(s)
print(f'{dest}\n已重建模块地图（{len(cards)} 张卡 + {len(support)} 条支撑）与功能清单（{len(specs)} 个模块 / {len(reqs)} 条需求）')
