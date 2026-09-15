"""v0.4 产品文档解析：需求提取与 Markdown 渲染。

被 build.py（交互原型）和 build_structure.py（结构说明页）共用，
保证两个交付物永远从同一份文档、同一套 id 生成，不会各自漂移。
"""
from pathlib import Path
import re, html, sys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '船舶资产智能点检标签管理系统-产品结构与功能范围-v0.4.md'

# 章节号 → (slug, 面板/清单上显示的章节名)
SECTIONS = {
    '5.1': ('space', '5.1 舱室 / 部位管理'),
    '5.2': ('labels', '5.2 标签管理'),
    '5.3': ('inspect', '5.3 点检引擎'),
    '5.4.2': ('board-biz', '5.4.2 看板中心 · 业务看板'),
    '5.4.3': ('board-ops', '5.4.3 看板中心 · 系统监控看板'),
    '5.5': ('env', '5.5 环境监测'),
    '5.6': ('mobile', '5.6 移动端'),
    '5.7': ('edge', '5.7 管理后台与边缘系统'),
    '5.8': ('system', '5.8 系统管理'),
    '6.2': ('commission', '6.2 二期 · 调试功能模块'),
    '6.3': ('commission-board', '6.3 二期 · 调试看板'),
    '6.4': ('commission-rules', '6.4 二期 · 违章告警规则'),
    '6.6': ('commission-hw', '6.6 二期 · 硬件前提'),
}

def source():
    return SRC.read_text()

def plain(v):
    v = re.sub(r'\*\*([^*]+)\*\*', r'\1', v)
    v = re.sub(r'~~([^~]+)~~', r'\1', v)
    v = re.sub(r'`([^`]+)`', r'\1', v)
    return v.strip()

def extract(md):
    """→ {id: {title, text, section, slug, no}}，id = slug + '/' + 功能名。"""
    body = md[md.index('\n## 5. 模块功能范围'):md.index('\n## 7. 核心业务链路')]
    lines = body.splitlines()
    reqs, seen, sec, header = {}, {}, None, None
    for i, line in enumerate(lines):
        m = re.match(r'^#{3,4} (\d+(?:\.\d+)+) ', line)
        if m:
            sec, header = m[1], None
            continue
        if not line.startswith('|'):
            header = None
            continue
        if re.match(r'^\|[\s:|\-]+\|?$', line):
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        nxt = lines[i + 1] if i + 1 < len(lines) else ''
        if re.match(r'^\|[\s:|\-]+\|?$', nxt):
            header = cells
            continue
        if header is None or sec not in SECTIONS:
            continue
        slug, name = SECTIONS[sec]
        title = plain(cells[0])
        if not title:
            continue
        if len(header) == 2:
            text = plain(cells[1])
        else:
            text = ' · '.join(f'{plain(h)}：{plain(c)}' for h, c in zip(header[1:], cells[1:])
                              if plain(c) and plain(c) != '—')
        rid = f'{slug}/{title}'
        if rid in reqs:
            sys.exit(f'需求 id 重复：{rid}（{name}）。请改功能名或拆分章节。')
        seen[slug] = seen.get(slug, 0) + 1
        reqs[rid] = {'title': title, 'text': text, 'section': name, 'slug': slug, 'no': seen[slug]}
    return reqs

def markdown(s):
    lines = s.splitlines()
    out, table, code, ul, ol = [], False, False, False, False
    def inline(v):
        v = html.escape(v)
        v = re.sub(r'`([^`]+)`', r'<code>\1</code>', v)
        v = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', v)
        v = re.sub(r'~~([^~]+)~~', r'<del>\1</del>', v)
        v = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1', v)
        return v
    def closeLists():
        nonlocal ul, ol
        if ul: out.append('</ul>'); ul = False
        if ol: out.append('</ol>'); ol = False
    for line in lines:
        if line.startswith('```'):
            closeLists(); out.append('</pre>' if code else '<pre>'); code = not code; continue
        if code:
            out.append(html.escape(line) + '\n'); continue
        if table and not line.startswith('|'):
            out.append('</tbody></table></div>'); table = False
        if line.startswith('|'):
            closeLists()
            if re.match(r'^\|[\s:|\-]+\|?$', line): continue
            cells = line.strip('|').split('|')
            if not table:
                out.append('<div class="doc-table"><table><tbody>'); table = True
            out.append('<tr>' + ''.join('<td>' + inline(c.strip()) + '</td>' for c in cells) + '</tr>')
            continue
        if not line.strip():
            closeLists(); continue
        if line.startswith('> '):
            closeLists(); out.append('<p class="doc-quote">' + inline(line[2:]) + '</p>'); continue
        if re.match(r'^---+$', line):
            closeLists(); out.append('<hr>'); continue
        if line.startswith('- '):
            if ol: out.append('</ol>'); ol = False
            if not ul: out.append('<ul>'); ul = True
            out.append('<li>' + inline(line[2:]) + '</li>'); continue
        m = re.match(r'^\d+\. (.+)', line)
        if m:
            if ul: out.append('</ul>'); ul = False
            if not ol: out.append('<ol>'); ol = True
            out.append('<li>' + inline(m[1]) + '</li>'); continue
        closeLists()
        m = re.match(r'^(#{1,4}) (.+)', line)
        out.append(f'<h{len(m[1])}>{inline(m[2])}</h{len(m[1])}>' if m else '<p>' + inline(line) + '</p>')
    if table: out.append('</tbody></table></div>')
    closeLists()
    return ''.join(out)
