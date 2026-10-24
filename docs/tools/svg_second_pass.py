import re,sys,html
NS_OK=re.compile(r'''\s+xmlns(:xlink)?\s*=\s*(["'])(http://www\.w3\.org/2000/svg|http://www\.w3\.org/1999/xlink)\2''',re.I)
BAN=[r'<\s*script',r'<\s*style',r'@import',r'url\(\s*(?!["\']?#)',r'javascript\s*:',r'data\s*:',r'<\s*use\b',r'<\s*a\b',r'<\s*foreignObject',r'<\s*set\b',r'<\s*animate',r'\son[a-z]+\s*=',r'https?:',r'(?<![\w:])//',r'<\s*image\b',r'<\s*(iframe|object|embed)\b',r'<!ENTITY|<!DOCTYPE']
def check(t):
    # post-sanitizer only; decode entities first (&#x68;ttps etc.), repeated for double-encoding
    for _ in range(3): t=html.unescape(t)
    t=NS_OK.sub(' ',t)  # only exact SVG/xlink namespace declarations are exempt
    return [b for b in BAN if re.search(b,t,re.I)]

if __name__=="__main__":
    bad=0
    for f in sys.argv[1:]:
        r=check(open(f,encoding="utf-8").read()); print(("REJECT " if r else "PASS   ")+f, r if r else ""); bad+=bool(r)
    sys.exit(1 if bad else 0)
