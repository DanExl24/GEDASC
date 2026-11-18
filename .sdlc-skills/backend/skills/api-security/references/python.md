# Seguridad de la API — notas Python

- **SQL:** parámetros (`cursor.execute("… %s", (v,))`, `text("… :v")`); en Django, cuidado con `.raw()`, `.extra()` y `RawSQL` con interpolación.
- **Procesos:** `subprocess.run([...], shell=False, timeout=…, check=True)`; nunca `os.system` ni `shell=True` con datos externos; `shlex.quote` no es excusa para usar shell.
- **Rutas:** `Path(base).resolve()` y `target.resolve().is_relative_to(base)` (Python 3.9+).
- **Plantillas:** nunca `render_template_string`/`Template(user_input)`; Jinja2 con `SandboxedEnvironment` solo si de verdad hay que permitir plantillas de usuario.
- **Deserialización:** sin `pickle`/`shelve`/`marshal` con datos externos; `yaml.safe_load`; `defusedxml` para XML.
- **Rate limiting:** `django-ratelimit`, `slowapi` (FastAPI/Starlette) con Redis; o en el gateway/proxy.
- **Django en producción:** `DEBUG = False`, `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_PROXY_SSL_HEADER` solo detrás de un proxy de confianza; `manage.py check --deploy` en CI.
- **Uploads:** `FILE_UPLOAD_MAX_MEMORY_SIZE`, `DATA_UPLOAD_MAX_MEMORY_SIZE`; `python-magic` o `filetype` para el tipo real; `Pillow` para re-codificar (con `Image.MAX_IMAGE_PIXELS` contra bombas de descompresión); `django-storages` hacia S3.
- **SSRF:** resolución con `socket.getaddrinfo` y comprobación con `ipaddress.ip_address(x).is_private/is_loopback/is_link_local/is_reserved`; `allow_redirects=False` en `requests`/`httpx` y validación manual de cada salto.
- **Análisis estático y dependencias:** `bandit`, `semgrep`, `pip-audit`, `safety`; dependencias fijadas (`uv.lock`, `poetry.lock`, `requirements.txt` con hashes).
- **Secretos:** `pydantic-settings` para cargar y validar configuración desde el entorno; SDK del gestor de secretos.
