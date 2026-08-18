import os
import re
import sys
import json
import urllib.request
import urllib.error
import subprocess
import tempfile

# Ensure stdout supports UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def render_mermaid_to_png(mermaid_code: str, output_png_path: str) -> bool:
    """Renders a mermaid diagram code block to a PNG image using Kroki API."""
    url = "https://kroki.io/mermaid/png"
    data = json.dumps({"diagram_source": mermaid_code.strip()}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status == 200:
                with open(output_png_path, "wb") as f:
                    f.write(response.read())
                return True
    except Exception as e:
        pass
    
    # Fallback to mermaid.ink if kroki fails
    try:
        import base64
        encoded = base64.b64encode(mermaid_code.strip().encode("utf-8")).decode("ascii")
        ink_url = f"https://mermaid.ink/img/{encoded}"
        ink_req = urllib.request.Request(
            ink_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(ink_req, timeout=30) as response:
            if response.status == 200:
                with open(output_png_path, "wb") as f:
                    f.write(response.read())
                return True
    except Exception as e:
        pass
    
    return False

def convert_md_file(src_md_path: str, dest_docx_path: str, temp_dir: str):
    """Processes an .md file, extracts mermaid diagrams, renders them, and converts to .docx via pandoc."""
    print(f"[*] Procesando: {src_md_path} -> {dest_docx_path}")
    
    with open(src_md_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    # Regex to find ```mermaid ... ``` blocks
    mermaid_pattern = re.compile(r"```mermaid\s*([\s\S]*?)```", re.MULTILINE)
    
    diagram_count = 0
    
    def replace_mermaid(match):
        nonlocal diagram_count
        diagram_count += 1
        code = match.group(1).strip()
        img_filename = f"diagram_{abs(hash(src_md_path))}_{diagram_count}.png"
        img_path = os.path.join(temp_dir, img_filename)
        
        success = render_mermaid_to_png(code, img_path)
        if success and os.path.exists(img_path):
            normalized_img_path = img_path.replace("\\", "/")
            return f"\n\n![]({normalized_img_path})\n\n"
        else:
            return f"\n\n```text\n[Diagrama Mermaid]\n{code}\n```\n\n"

    processed_content = mermaid_pattern.sub(replace_mermaid, content)

    # Save processed markdown to temporary file
    temp_md_path = os.path.join(temp_dir, f"temp_{abs(hash(src_md_path))}.md")
    with open(temp_md_path, "w", encoding="utf-8") as f:
        f.write(processed_content)

    # Ensure destination directory exists
    os.makedirs(os.path.dirname(dest_docx_path), exist_ok=True)

    # Run pandoc
    cmd = [
        "pandoc",
        temp_md_path,
        "-f", "gfm+pipe_tables",
        "-t", "docx",
        "-o", dest_docx_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"  [OK] Generado exitosamente ({diagram_count} diagramas renderizados): {dest_docx_path}")
    else:
        print(f"  [ERROR] en pandoc para {src_md_path}: {result.stderr}")

def main():
    root_doc_dir = "documentacion"
    out_docx_dir = "docx"
    
    temp_dir = os.path.join(tempfile.gettempdir(), "gedasc_docx_conversion")
    os.makedirs(temp_dir, exist_ok=True)
    
    md_files = []
    for root, dirs, files in os.walk(root_doc_dir):
        if "old-doc" in root:
            continue
        for file in files:
            if file.endswith(".md"):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_doc_dir)
                md_files.append((full_path, rel_path))
    
    print(f"Total de archivos a convertir: {len(md_files)}")
    
    for full_path, rel_path in md_files:
        dest_rel_path = os.path.splitext(rel_path)[0] + ".docx"
        dest_full_path = os.path.join(out_docx_dir, dest_rel_path)
        convert_md_file(full_path, dest_full_path, temp_dir)
        
    print("\n[OK] Conversion masiva a formato .docx completada con exito!")

if __name__ == "__main__":
    main()
