# Comandos Docker

```bash
docker compose down
docker compose up --build --force-recreate
docker compose up -d api

docker exec -it {container name} sh
docker logs -f {container name}

npx prisma generate
npx prisma migrate dev --name nombre-de-la-migracion
npx prisma db seed
```

# ✅ RESET TOTAL (BORRA TODO)

```bash
npx prisma migrate reset --force
npx prisma db seed
```

# 🔥 Flujo correcto para “DB definitiva”

```bash
npx prisma migrate deploy  # Aplicar estructura final
npx prisma generate     # Generar cliente
npx prisma db seed      # (Opcional) cargar datos iniciales
```

# Nginx

```bash
systemctl restart nginx
systemctl status nginx.service
```
