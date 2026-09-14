from pathlib import Path
import re,json,html
root=Path(__file__).resolve().parent.parent
source=(root/'船舶资产电子标签管理系统-产品需求大纲-v0.1.md').read_text()
sections=re.split(r'### 4\.\d ',source)[1:]
requirements=[]
for s in sections:
 s=s.split('\n## ')[0]
 requirements.append([{'title':a.strip(),'text':b.strip()} for a,b in re.findall(r'^\| ([^|]+) \| ([^|]+) \|$',s,re.M) if a.strip()!='功能'])
def markdown(s):
 lines=s.splitlines();out=[];table=False;code=False;items=False
 def inline(v):
  v=html.escape(v)
  return re.sub(r'`([^`]+)`',r'<code>\1</code>',v)
 for line in lines:
  if line.startswith('```'):
   out.append('</pre>' if code else '<pre>');code=not code;continue
  if code:out.append(html.escape(line)+'\n');continue
  if table and not line.startswith('|'):out.append('</tbody></table></div>');table=False
  if items and not line.startswith('- '):out.append('</ul>');items=False
  if line.startswith('|'):
   if re.match(r'^\|[\s:|\-]+$',line):continue
   cells=line.strip('|').split('|')
   if not table:out.append('<div class="doc-table"><table><tbody>');table=True
   out.append('<tr>'+''.join('<td>'+inline(c.strip())+'</td>' for c in cells)+'</tr>');continue
  if not line.strip():continue
  if line.startswith('- '):
   if not items:out.append('<ul>');items=True
   out.append('<li>'+inline(line[2:])+'</li>');continue
  m=re.match(r'^(#{1,4}) (.+)',line)
  if m:out.append(f'<h{len(m[1])}>{inline(m[2])}</h{len(m[1])}>')
  else:out.append('<p>'+inline(line)+'</p>')
 if table:out.append('</tbody></table></div>')
 if items:out.append('</ul>')
 return ''.join(out)
shell=(root/'prototype/shell.html').read_text()
payload=json.dumps({'requirements':requirements,'document':markdown(source)},ensure_ascii=False).replace('</','<\\/')
result=shell.replace('/* STYLES */',(root/'prototype/styles.css').read_text()).replace('/* DOCUMENT */','const DOC='+payload+';').replace('/* APP */',(root/'prototype/app.js').read_text())
dest=root/'船舶资产电子标签管理系统-交互原型-v0.1.html'
dest.write_text(result)
print(dest)
