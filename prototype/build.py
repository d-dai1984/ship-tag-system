"""把 v0.4 产品文档、样式和脚本打包成单文件交互原型。

需求提取按 **id 键**（模块 slug / 功能名），不再用零起始索引：
调整表格顺序、插入或删除行都不会让映射错位；改功能名会在构建时直接报错。
解析逻辑在 docparse.py，与结构说明页共用。
"""
from pathlib import Path
import json, re, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import docparse

root = docparse.ROOT
source = docparse.source()
requirements = docparse.extract(source)
app = (root / 'prototype/app.js').read_text()

# 构建期校验：只扫这三个块，避免把 route 字符串（'labels/data' 这类）误当成需求 id。
def block(text, start, end):
    i = text.index(start)
    return text[i:text.index(end, i)]

referenced = set(re.findall(r"'([^']+)'", block(app, 'const coverage={', '\nconst reqSection=')))
referenced |= set(re.findall(r"'([^']+)':\{", block(app, 'const requirementDemos={', '\nconst sketchReqs=')))
referenced |= set(re.findall(r"'([^']+)'", block(app, 'const sketchReqs=', ');')))

missing = sorted(r for r in referenced if r not in requirements)
if missing:
    sys.exit('app.js 引用了文档中不存在的需求 id：\n  ' + '\n  '.join(missing)
             + '\n提示：功能名改了就要同步改 app.js，或反过来。')

payload = json.dumps({'requirements': {k: {kk: vv for kk, vv in v.items() if kk != 'slug'}
                                       for k, v in requirements.items()},
                      'document': docparse.markdown(source), 'version': 'v0.4'},
                     ensure_ascii=False).replace('</', '<\\/')
shell = (root / 'prototype/shell.html').read_text()
result = (shell
          .replace('/* STYLES */', (root / 'prototype/styles.css').read_text())
          .replace('/* DOCUMENT */', 'const DOC=' + payload + ';')
          .replace('/* APP */', app))
dest = root / 'prototype.html'
dest.write_text(result)
print(f'{dest}\n需求 {len(requirements)} 条；原型引用 {len(referenced)} 条；'
      f'未引用 {len(set(requirements) - referenced)} 条（移动端、二期等尚未实现）')
