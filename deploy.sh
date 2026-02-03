#!/bin/bash
set -e

echo "========================================="
echo "  EarthWith Frontend Deploy"
echo "  EC2: 54.245.198.152:8080"
echo "========================================="

# 1. Nginx 설치
echo "[1/4] Nginx 설치..."
sudo apt update -y
sudo apt install -y nginx

# 2. 프론트엔드 파일 복사
echo "[2/4] 프론트엔드 파일 배포..."
sudo rm -rf /var/www/html/*
sudo cp -r ~/frontend-dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

# 3. Nginx 설정 (정적 파일만 서빙, 포트 8080)
echo "[3/4] Nginx 설정 적용..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_CONF'
server {
    listen 8080;
    server_name _;

    root /var/www/html;
    index index.html;

    # React SPA - 모든 경로를 index.html로
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONF

# 4. Nginx 시작
echo "[4/4] Nginx 시작..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "========================================="
echo "  Frontend 배포 완료!"
echo "  http://54.245.198.152:8080"
echo "  API 요청 -> http://44.246.37.8:8080"
echo "========================================="
