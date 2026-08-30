#!/usr/bin/env python3
"""
Servidor local para ver o site no navegador antes de publicar.

    python3 ferramentas/servidor.py          (abre em http://127.0.0.1:4173)
    python3 ferramentas/servidor.py 8080     (escolhendo a porta)

Depois é só abrir o endereço que ele mostrar. Para parar, Ctrl+C.

Obs.: não use "python3 -m http.server" aqui. Ele lê o diretório atual logo na
partida e falha quando o processo nasce numa pasta sem permissão de leitura.
Este script resolve isso entrando na pasta do site antes de qualquer coisa.
"""

import functools
import http.server
import os
import socketserver
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

porta = int(os.environ.get("PORT") or (sys.argv[1] if len(sys.argv) > 1 else 4173))

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=RAIZ)
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("127.0.0.1", porta), Handler) as servidor:
    print(f"Site em http://127.0.0.1:{porta}/index.html", flush=True)
    print("Ctrl+C para parar.", flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
