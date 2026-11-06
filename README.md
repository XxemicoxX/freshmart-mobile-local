# Freshmart Mobile (React Native + Expo, Android)

App nativa Android para el backend `freshmart-backend` (Spring Boot, puerto 8080).

## Modo demo (sin servidor)
Por defecto la app NO necesita backend: usa datos locales (src/demo) guardados en el celular.
Incluye registro, login, catálogo, carrito, pago simulado, pedidos, notificaciones, boleta PDF y reporte PDF.
Cuentas: cliente@freshmart.pe / Cliente123 · personal@freshmart.pe / Personal123 · código de recuperación: 123456.
Para usar el backend real: `EXPO_PUBLIC_MODO_DEMO=false` en `.env`.

## Ejecutar
1. Levanta el backend (`./mvnw spring-boot:run`).
2. `cp .env.example .env` y ajusta `EXPO_PUBLIC_API_URL`
   (emulador: `http://10.0.2.2:8080/api/v1`; celular físico: `http://IP-DE-TU-PC:8080/api/v1`).
3. `npm install` y `npx expo start --android`.
4. APK de prueba: `npx eas build -p android --profile preview`.

## Estructura
- `src/api` – llamadas HTTP al backend (un archivo por módulo)
- `src/context` – sesión (JWT en SecureStore) y carrito
- `src/navigation` – stack raíz, pestañas del cliente y tipos de rutas
- `src/screens` – auth, catalogo, carrito, pedidos, perfil, notificaciones, ayuda, personal
- `src/components`, `src/theme`, `src/types`, `src/utils`

## Pruebas de pago simulado
Tarjeta terminada en 0002 = rechazada; 9995 = fondos insuficientes; otra = aprobada. Yape: código 000000 = rechazado.
Las cuentas PERSONAL no se registran desde la app (las crea Freshmart en la BD).
