# Género y Número (PWA)

Juego educativo para aprender el género y número en español. Esta versión incluye soporte PWA (instalable y offline) inspirado en el proyecto `silabas-magicas`.

## 🚀 Características

- Juego con preguntas de género y número (femenino/masculino, singular/plural)
- Selección de número de preguntas: 5, 10, 20
- Feedback inmediato (correcto/parcial/incorrecto)
- Puntuación con estrellas y mensaje final
- Repaso didáctico con ejemplos
- Animación de estrellas y confetti
- Modo offline con Service Worker
- Soporte de instalación PWA (`beforeinstallprompt`)

## 🗂 Estructura del proyecto

- `index.html` - Estructura de UI y botones del juego
- `styles.css` - Estilos y animaciones visuales
- `app.js` - Lógica del juego, navegación, SW PWA, instalación
- `palabras.json` - Base de datos de sustantivos con género y número
- `manifest.json` - Manifiesto PWA
- `service-worker.js` - Cache y estrategia offline
- `icon.svg` - Icono principal de la aplicación

## 📦 Cómo ejecutar localmente

1. Clonar el repositorio
2. Iniciar servidor local (ejemplo con `http-server`):
   - `npm install -g http-server`
   - `http-server .`
3. Abrir `http://localhost:8080`

> Importante: para que PWA funcione, debes servirlo por HTTPS o `localhost`.

## 🧩 PWA y offline

- `service-worker.js` cachea los recursos esenciales: `index.html`, `styles.css`, `app.js`, `palabras.json`, `manifest.json`, `icon.svg`
- En navegación offline se ofrece fallback a `index.html`
- `beforeinstallprompt` gestiona el botón de instalación
- `appinstalled` rastrea instalación completada

## 🔧 Personalización futura

- Agregar `icon-192.png` y `icon-512.png` para compatibilidad máxima
- Agregar niveles de dificultad y temporizador
- Guardar puntajes en `localStorage` para rankings

## 🧾 Créditos

Proyecto de ejemplo adaptado por [rgarcial1983](https://github.com/rgarcial1983).
