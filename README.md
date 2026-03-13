# GameVault — Flask Edition

A hidden multiplayer browser game site disguised as an iOS calculator.

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000 — you'll see the calculator.

Secret codes (type on calculator, press =):
- `1337` → games portal
- `7331` → camera viewer

## Running on a server (recommended)

Install gunicorn and gevent:
```bash
pip install gunicorn gevent gevent-websocket
```

Run with:
```bash
gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
         -w 1 --bind 127.0.0.1:5000 app:app
```

## Change the port

```bash
PORT=8080 python app.py
```

## Nginx config (for SSL / Cloudflare Tunnel)

```nginx
server {
    listen 80;
    server_name _;

    location /ws {
        proxy_pass http://127.0.0.1:5000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Systemd service

```ini
[Unit]
Description=GameVault Flask Server
After=network.target

[Service]
User=piserver
WorkingDirectory=/home/piserver/gamevault
ExecStart=/usr/bin/python3 /home/piserver/gamevault/app.py
Restart=always
RestartSec=5
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

## Games included

Solo: Calculator disguise, 2048, Snake, Tetris, Chess, Minesweeper, Flapty, Neon Run
Multiplayer: Drawing Party, Word Bomb, Pong, Battleship, Trivia, Bomberman

## Structure

```
gamevault/
├── app.py           ← Flask app + all multiplayer game logic
├── requirements.txt
├── README.md
└── www/             ← All HTML game files
    ├── index.html   ← Calculator (root)
    ├── games/
    ├── x/           ← URL token redirect
    ├── 2048/
    ├── snake/
    ├── tetris/
    ├── chess/
    ├── drawing/
    ├── wordgame/
    ├── cam/
    ├── pong/
    ├── battleship/
    ├── trivia/
    ├── bomberman/
    ├── minesweeper/
    ├── flapty/
    └── neonrun/
```
