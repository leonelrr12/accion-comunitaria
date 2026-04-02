# HTTPS

```bash
Solo un último consejo de "buen compañero":
Si en el futuro decides ponerle un dominio y activar el SSL (HTTPS) con Certbot, recuerda volver a cambiar secure: true y useSecureCookies: true. Esto protegerá la sesión de tus usuarios para que no pueda ser interceptada.


ln: 113 auth.ts
          secure: false, //process.env.NODE_ENV === "production",

```

# NGINX

````bash
curl -X GET http://localhost:8080/api/route

docker exec -it tu_contenedor pg_dump -U postgres -Fc db_comuna > db_comuna_backup_$(date +%Y%m%d).dump


CREATE DATABASE db_comuna
WITH ENCODING 'UTF8'
     LC_COLLATE = 'C'
     LC_CTYPE = 'C'
     TEMPLATE template0;


docker exec -i tu_contenedor pg_restore -U postgres -d db_comuna db_comuna_backup_xxxx.dump

Si usas PM2: pm2 logs
Si usas Docker: docker logs [nombre_contenedor]
Si lo corres directo: El terminal donde ejecutaste npm start.




```bash
sudo systemctl stop nginx
sudo systemctl start nginx
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo systemctl status nginx

nano /etc/nginx/sites-enabled/default

````

# Comandos Docker

````bash
docker container run -dp 3000:3000 comuna-app

## --rm borre el container una vez sea terminado
docker run --rm -d -name comuna-app -p 3000:3000 comuna-app

## Crear imagen segun especificaciones del Dokerfile
docker build -t comuna-app:v1.0 -f Dockerfile-uno .


```bash
docker compose down
docker compose up --build --force-recreate
docker compose up -d api

docker compose down
docker compose build --no-cache
docker compose up -d

docker compose -f docker-compose.db.yml up -d
docker compose -f docker-compose.yml up -d


docker exec -it {container name} sh
docker logs -f {container name}

npx prisma generate
npx prisma migrate dev --name nombre-de-la-migracion
npx prisma db seed
````

# ✅ RESET TOTAL (BORRA TODO)

```bash
npx prisma migrate reset --force
npx prisma db seed
```

# 🔥 Flujo correcto para “DB definitiva”

```bash
npx prisma migrate deploy  # Aplicar estructura final
npx prisma generate     # Generar cliente ///////////////////
npx prisma db seed      # (Opcional) cargar datos iniciales
```

# Nginx

```bash
systemctl restart nginx
systemctl status nginx.service
```
