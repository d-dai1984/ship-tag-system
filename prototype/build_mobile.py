"""把移动端原型打包成单文件 mobile.html。

与 build.py / build_structure.py 共用 docparse.py，需求原文同源同 id。
移动端只嵌入 5.6 移动端一节的需求，并为每条标注原型实现状态：
  ok   原型可演示
  dep  界面能走通，但真机能否成立取决于标签 NFC 是否落实
  plan 原型未实现
"""
from pathlib import Path
import json, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import docparse

root = docparse.ROOT
reqs = docparse.extract(docparse.source())
mobile = {k: v for k, v in reqs.items() if v['slug'] == 'mobile'}
if not mobile:
    sys.exit('文档 5.6 移动端一节没有提取到需求，检查 docparse.SECTIONS。')

STATUS = {
    'mobile/NFC 碰一碰唤起': 'dep',
    'mobile/防假检机制': 'dep',
    'mobile/离线作业': 'ok',
    'mobile/自动补传': 'ok',
    'mobile/标准化防呆表单': 'ok',
    'mobile/即时物理闭环反馈': 'ok',
    'mobile/一键故障报修': 'ok',
}
unknown = sorted(set(STATUS) - set(mobile))
if unknown:
    sys.exit('build_mobile.py 标注了文档中不存在的需求 id：\n  ' + '\n  '.join(unknown)
             + '\n提示：功能名改了就要同步改这里。')
missing = sorted(set(mobile) - set(STATUS))
if missing:
    sys.exit('文档新增了移动端需求但未标注实现状态：\n  ' + '\n  '.join(missing))

payload = json.dumps({
    'requirements': {k: {kk: vv for kk, vv in v.items() if kk != 'slug'} for k, v in mobile.items()},
    'status': STATUS, 'version': 'v0.4'}, ensure_ascii=False).replace('</', '<\\/')

shell = (root / 'mobile/shell.html').read_text()
result = (shell
          .replace('/* STYLES */', (root / 'mobile/styles.css').read_text())
          .replace('/* DOCUMENT */', 'const DOC=' + payload + ';')
          .replace('/* APP */', (root / 'mobile/app.js').read_text()))
dest = root / 'mobile.html'
dest.write_text(result)
counts = {}
for s in STATUS.values():
    counts[s] = counts.get(s, 0) + 1
print(f'{dest}\n移动端需求 {len(mobile)} 条：'
      + '，'.join(f'{k} {v}' for k, v in sorted(counts.items())))
