import os
import json

docs_dir = 'Docs'
output_file = os.path.join(docs_dir, 'Documentación.html')

md_files = [f for f in os.listdir(docs_dir) if f.endswith('.md')]
docs_data = {}

for md in md_files:
    file_path = os.path.join(docs_dir, md)
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            docs_data[md] = f.read()
    except:
        with open(file_path, 'r', encoding='latin-1') as f:
            docs_data[md] = f.read()

json_data = json.dumps(docs_data)

html_template = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wikipedia - Documentación Técnica</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {{
            background-color: #f6f6f6;
            font-family: 'Noto Sans', sans-serif;
            color: #202122;
            margin: 0;
            padding: 0;
        }}
        .mw-body {{
            background-color: #ffffff;
            border: 1px solid #a7d7f9;
            border-right-width: 0;
            margin-left: 11rem;
            padding: 1.25rem 1.5rem 1.5rem 1.5rem;
            min-height: 100vh;
        }}
        .mw-header {{
            font-family: 'Libre Baskerville', serif;
            border-bottom: 1px solid #a2a9b1;
            margin-bottom: 0.25em;
            padding-top: 0.5em;
            font-size: 1.8em;
            font-weight: normal;
        }}
        .mw-sidebar {{
            width: 11rem;
            position: absolute;
            left: 0;
            top: 0;
            padding: 1rem 0.5rem;
        }}
        .sidebar-logo {{
            text-align: center;
            margin-bottom: 1.5rem;
        }}
        .sidebar-logo span {{
            font-family: 'Libre Baskerville', serif;
            font-size: 1.2rem;
            display: block;
        }}
        .sidebar-logo small {{
            font-size: 0.7rem;
            color: #54595d;
            text-transform: uppercase;
        }}
        .nav-link {{
            color: #0645ad;
            font-size: 0.85rem;
            display: block;
            padding: 0.2rem 0.5rem;
            text-decoration: none;
        }}
        .nav-link:hover {{
            text-decoration: underline;
        }}
        .nav-link.active {{
            color: #202122;
            font-weight: bold;
            border-left: 2px solid #3366cc;
            background: #f8f9fa;
        }}
        
        /* Markdown Content Styling */
        #markdownBody h1 {{ font-family: 'Libre Baskerville', serif; font-size: 1.8em; border-bottom: 1px solid #a2a9b1; margin: 1em 0 0.25em; font-weight: normal; }}
        #markdownBody h2 {{ font-family: 'Libre Baskerville', serif; font-size: 1.5em; border-bottom: 1px solid #a2a9b1; margin: 1.5em 0 0.25em; font-weight: normal; }}
        #markdownBody h3 {{ font-size: 1.2em; font-weight: bold; margin: 1.2em 0 0.25em; }}
        #markdownBody p {{ margin: 0.5em 0 1em; line-height: 1.6; font-size: 0.95rem; }}
        #markdownBody ul {{ list-style-type: disc; margin-left: 2rem; margin-bottom: 1rem; }}
        #markdownBody li {{ margin-bottom: 0.3em; font-size: 0.95rem; }}
        #markdownBody a {{ color: #0645ad; text-decoration: none; }}
        #markdownBody a:hover {{ text-decoration: underline; }}
        #markdownBody code {{ background-color: #f8f9fa; border: 1px solid #eaecf0; padding: 0.1em 0.3em; border-radius: 2px; font-family: monospace; font-size: 0.9em; }}
        #markdownBody pre {{ background-color: #f8f9fa; border: 1px solid #eaecf0; padding: 1em; margin: 1em 0; overflow-x: auto; border-radius: 2px; }}
        #markdownBody blockquote {{ border-left: 4px solid #eaecf0; padding-left: 1em; color: #54595d; font-style: italic; margin: 1em 0; }}
        
        .toc {{
            background-color: #f8f9fa;
            border: 1px solid #a2a9b1;
            padding: 0.5rem;
            display: inline-block;
            min-width: 200px;
            margin-bottom: 1.5rem;
            font-size: 0.85rem;
        }}
        .toc-title {{
            text-align: center;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }}
    </style>
</head>
<body>

    <aside class="mw-sidebar">
        <div class="sidebar-logo">
            <span>Enciclopedia</span>
            <small>Libre de Desarrollo</small>
        </div>
        
        <div class="mb-4">
            <h4 class="text-[0.75rem] font-bold text-[#54595d] px-2 mb-1 border-b border-[#eaecf0] uppercase tracking-tighter">Navegación</h4>
            <nav id="sidebarNav">
                <!-- Nav items here -->
            </nav>
        </div>
        
        <div class="mt-8 px-2">
            <input id="searchInput" type="text" placeholder="Buscar en Docs..." class="w-full text-xs border border-[#a2a9b1] p-1 outline-none focus:border-[#3366cc]">
        </div>
    </aside>

    <main class="mw-body">
        <div class="flex justify-between items-start mb-4">
            <h1 id="mainTitle" class="mw-header">Cargando...</h1>
            <div class="text-[0.8rem] space-x-2">
                <button onclick="window.print()" class="text-[#0645ad] hover:underline">Imprimir</button>
            </div>
        </div>

        <div id="contentArea">
            <div id="markdownBody">
                <!-- Body content here -->
            </div>
        </div>
        
        <footer class="mt-12 pt-4 border-t border-[#a2a9b1] text-[0.75rem] text-[#54595d]">
            <p>Esta página fue editada por última vez por Antigravity (IA) el {os.popen('date /t').read().strip()}.</p>
            <p>El texto está disponible bajo la Licencia Creative Commons Atribución Compartir Igual 3.0.</p>
        </footer>
    </main>

    <script>
        const docs = {json_data};
        const sidebarNav = document.getElementById('sidebarNav');
        const markdownBody = document.getElementById('markdownBody');
        const mainTitle = document.getElementById('mainTitle');
        const searchInput = document.getElementById('searchInput');

        function renderFile(name) {{
            const content = docs[name];
            mainTitle.innerText = name.replace('.md', '').replaceAll('_', ' ');
            
            markdownBody.innerHTML = marked.parse(content);

            document.querySelectorAll('.nav-link').forEach(btn => {{
                btn.classList.toggle('active', btn.dataset.name === name);
            }});
            
            window.scrollTo(0, 0);
        }}

        function init() {{
            const files = Object.keys(docs).sort();
            
            files.forEach(name => {{
                const a = document.createElement('a');
                a.className = 'nav-link';
                a.href = '#';
                a.dataset.name = name;
                a.innerText = name.replace('.md', '').replaceAll('_', ' ');
                a.onclick = (e) => {{
                    e.preventDefault();
                    renderFile(name);
                }};
                sidebarNav.appendChild(a);
            }});

            if (files.length > 0) {{
                const priority = files.find(f => f.includes('manifiesto')) || files.find(f => f.includes('log_prompts')) || files[0];
                renderFile(priority);
            }}
            
            searchInput.oninput = (e) => {{
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('.nav-link').forEach(link => {{
                    const text = link.innerText.toLowerCase();
                    link.style.display = text.includes(term) ? 'block' : 'none';
                }});
            }};
        }}

        init();
    </script>
</body>
</html>
"""

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html_template)

print(f"Documentación generada en: {{output_file}}")
