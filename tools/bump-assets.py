"""Stamp css/js links with a content hash so a deploy is never served stale.

GitHub Pages sends Cache-Control: max-age=600 on assets. Without a version in
the URL, a returning visitor gets new HTML with ten-minute-old CSS, which
collapses the layout. Changing the query string changes the URL, so the browser
fetches the new file immediately.

Run before committing:  python tools/bump-assets.py
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ['css/site.css', 'js/catalog.js', 'js/site.js', 'js/gallery.js', 'js/home.js']


def short_hash(rel):
    p = ROOT / rel
    return hashlib.sha1(p.read_bytes()).hexdigest()[:8]


versions = {rel: short_hash(rel) for rel in ASSETS}

changed = []
for page in sorted(ROOT.glob('*.html')):
    text = page.read_text(encoding='utf-8')
    before = text
    for rel, ver in versions.items():
        # match the asset with or without an existing ?v=
        text = re.sub(
            rf'(["\'])({re.escape(rel)})(\?v=[0-9a-f]+)?\1',
            rf'\g<1>\g<2>?v={ver}\g<1>',
            text,
        )
    if text != before:
        page.write_text(text, encoding='utf-8')
        changed.append(page.name)

for rel, ver in versions.items():
    print(f'  {rel:20} v={ver}')
print()
print('pages updated:', ', '.join(changed) if changed else 'none (already current)')
