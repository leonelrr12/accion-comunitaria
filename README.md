# Description del Proyecto

## Correr en dev

First, run the development server:

1. Clonar el repositorio
2. Crear una copia del `.env.template` y renombrar a `.env` y cambar los valores de las variables de entorno
3. Instalar dependencias `npm run dev`
4. Levantar la bade de datos `docker compose up -d`
5. Correr las mmigraciones de Prisma `npx prisma migrate dev`
6. Ejecutar seed `npx prisma db seed`
7. Correr el proyecto `npm run dev`

## Correr en PROD
