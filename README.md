# MUNDO CRECE

**Aprende, crea, juega y descubre.**

Aplicación web educativa infantil interactiva para niños desde los 4 años.
100 % HTML5 + CSS3 + JavaScript vanilla. Sin frameworks pesados, sin dependencias obligatorias,
funciona en el navegador y guarda todo localmente.

---

## 1. Estructura de carpetas

```
edubaby/
├── index.html              Pantalla única con todos los módulos
├── manifest.json           Instalación como app (PWA básica)
├── server.js               Servidor estático para probar en local
├── test/
│   └── smoke.js            Prueba de humo: recorre toda la app en jsdom
├── css/
│   └── styles.css          Sistema de componentes + responsive + accesibilidad
├── js/
│   ├── icons.js            Iconos e ilustraciones SVG (sin imágenes externas)
│   ├── storage.js          localStorage + IndexedDB con respaldo
│   ├── state.js            Estado global, progreso, dificultad adaptativa, insignias
│   ├── audio.js            Sonidos con Web Audio API (sintetizados)
│   ├── speech.js           Web Speech API: texto a voz y reconocimiento de voz
│   ├── feedback.js         Motor de retroalimentación, modales, confeti, mascota
│   ├── canvas.js           Funciones reutilizables de Canvas + evaluación de trazado
│   ├── data.js             Banco de 75+ actividades con esquema estable
│   ├── activities.js       Motor genérico de actividades + diagnóstico
│   ├── creative.js         Dibujo, cuaderno, colorear, trazado, construcción, puzzles
│   ├── language.js         Letras, sílabas, palabras, cuentos, creador de historias
│   ├── math.js             Laboratorio matemático visual, torres, dinero
│   ├── labs.js             Ciencia, música, emociones, programación/robot
│   ├── missions.js         Misiones, máquina de retos, mapa de aprendizaje, logros
│   ├── panels.js           Panel de padres (PIN), docente, proyectos, ajustes
│   └── app.js              Navegación, inicio, dashboard, descanso, arranque
└── assets/
    └── icons/icon.svg      Icono de la aplicación
```

---

## 2. Cómo ejecutarlo

### Opción A: doble clic (la más rápida)

Doble clic en `index.html`. Se abre en el navegador y **todo funciona**.

> Limitación: los navegadores bloquean `fetch`/IndexedDB en `file://` en algunos casos.
> Si "Mis proyectos" no guarda, usa la Opción B.

### Opción B: servidor local (recomendada)

```bash
node server.js
```

Abre **http://localhost:8080**

Alternativa sin Node:

```bash
python -m http.server 8080     # Python 3
# o
npx serve .                    # con Node/npm
```

### Opción C: Live Server de VS Code

Clic derecho sobre `index.html` → *Open with Live Server*.

---

## 3. Cómo probar cada funcionalidad

| Qué probar | Dónde | Pasos |
|---|---|---|
| Crear perfil | Pantalla inicial → **Comenzar** | Escribe un apodo, mueve la edad, elige personaje y preferencias |
| Diagnóstico | Tras guardar el perfil → **Jugar** | 8 mini retos; al final verás tu perfil de habilidades |
| Dibujo libre | **Crear → Dibujar** | Dibuja, cambia herramienta/color/grosor, deshaz, guarda |
| Dibujo guiado | **Crear → Dibujar → Dibujo guiado** | Elige "Dibuja un árbol" y pasa los 4 pasos |
| Dibujo instruido | **Crear → Dibujar → Según instrucciones** | "Casa con puerta azul y dos ventanas" |
| Dibuja y describe | **Crear → Dibujar → Dibuja y describe** | Dibuja y escribe/dicta qué es; se guarda el proyecto |
| Cuaderno | **Crear → Cuaderno** | Lápiz, marcador, borrador, colores, deshacer, páginas, guardar |
| Colorear | **Crear → Colorear** | Elige categoría, toca las figuras para rellenar; al terminar celebra |
| Trazado | **Escribir → Trazar letras** | Traza sobre la guía y pulsa **Comprobar**: mide % de seguimiento |
| Motor de actividades | **Matemática → Jugar ahora** | 5 retos con pista, ejemplo y reintento |
| Lectura | **Leer** | Pestañas Letras / Sílabas / Palabras / Cuentos |
| Escucha y pronuncia | **Leer → Palabras** | Reproducir, Responder (mic) o Repetir |
| Cuento interactivo | **Leer → Cuentos → La puerta misteriosa** | Tus decisiones cambian la historia |
| Crear cuento | **Crear → Crear un cuento** | Personaje, lugar, objeto, problema, solución, orden, dictado, reproducción |
| Suma visual | **Matemática** (baja hasta el final) | Objetos visuales, pista y comprobación |
| Torres y bloques | **Matemática** | Suma/borra bloques y responde cuántos quedan |
| Dinero | **Matemática** | Presupuesto y compra con restas |
| Lógica / Memoria / Atención | **Pensar** | Patrones, memoriza objetos, encuentra el objeto |
| Rompecabezas | **Juegos** | Piezas, secuencia, laberinto, diferencias, figuras |
| Colorear y construir con retos | **Construir** | Retos: torre de 5, casa con 2 ventanas, puente, vehículo con 4 ruedas |
| Ciencia | **Ciencia** | Hechos con audio + experimentos con predicción y resultado |
| Música | **Música** | Piano, secuencia de colores, reconocer sonidos |
| Emociones | **Emociones** | Cara, ayudar, convivir |
| Programación | **Programar** | Bloques AVANZAR / GIRAR / SALTAR / REPETIR / SI…ENTONCES + robot en canvas |
| Misiones | **Misiones** | Misión del día, de la semana y máquina de retos |
| Logros | **Logros** | Mapa de aprendizaje, insignias y trofeos |
| Proyectos | **Mis proyectos** | Ver, escuchar, eliminar, exportar/importar JSON |
| Panel padres | **Padres** | PIN por defecto `1234` → estadísticas, tiempo, seguridad |
| Panel docente | **Docentes** | Generador de actividades, asignar, resultados, cambiar nombre |
| Ajustes | **Ajustes** | Sonido, voz, tamaño de texto, contraste, reducir movimiento |
| Descanso | Automático | Cada N minutos aparece la pantalla de descanso (configurable) |

---

## 4. Prueba guiada recomendada (10 minutos)

1. Abre la app y pulsa **Comenzar**.
2. Escribe un apodo, pon la edad en **6**, elige personaje, guarda.
3. Juega el **diagnóstico** (8 retos cortos) o pula *Ahora no*.
4. Entra a **Matemática → Jugar ahora** y responde 5 retos.
   - Falla a propósito dos veces: verás **pista** y luego **ejemplo**.
   - Acierta tres seguidos: la dificultad sube automáticamente.
5. Ve a **Crear → Dibujar → Dibujo guiado** y dibuja un árbol paso a paso.
6. Guarda el dibujo y abre **Mis proyectos**.
7. Entra a **Programar**, agrega bloques y pulsa **Ejecutar**.
8. Abre **Padres**, escribe `1234` y revisa el progreso.

---

## 5. El nombre de la aplicación

El nombre provisional es **MUNDO CRECE** y se cambia desde:

**Docentes → pestaña "Nombre"**

Se actualiza en la portada, la pestaña del navegador y toda la interfaz.

---

## 6. Requisitos y compatibilidad

- Navegador moderno: Chrome, Edge, Firefox o Safari (2020 en adelante).
- Funciona en computadora, tablet y celular (diseño mobile-first).
- Tailwind CSS se carga desde CDN **solo como apoyo**: el CSS propio de
  `css/styles.css` sostiene toda la interfaz, así que la app funciona **sin internet**.
- Web Speech API: si el navegador no la ofrece, la app ofrece alternativas de
  teclado y selección automáticamente.
- Web Audio API: los sonidos se sintetizan, no hay archivos de audio.

---

## 7. Privacidad y seguridad infantil

- No solicita nombre real, correo ni ningún dato personal.
- El correo usado en Git es el **noreply de GitHub**, no uno personal.
- Sin cuentas en servidor, sin chat, sin publicidad, sin enlaces externos.
- Todo el progreso se guarda **solo en el dispositivo** (localStorage / IndexedDB).
- Panel de adultos protegido con PIN.
- El export/import de datos es manual y lo controla la familia.

---

## 8. Cómo ampliar el sistema

### Añadir una actividad

Edita `js/data.js` y agrega un objeto al array `ACTIVITIES`:

```js
A({
  id: 'math_900',
  area: 'matematica',
  skill: 'suma',
  ageMin: 6, ageMax: 8,
  difficulty: 2,
  type: 'selection',          // selection | number | text | speak | open | order | ...
  question: '¿Cuánto es 3 + 4?',
  options: ['6', '7', '8', '9'],
  answer: '7',
  hint: 'Cuenta tres dedos y añade cuatro.',
  explain: '3 + 4 = 7.'
})
```

No hay que tocar nada más: el motor lo detecta solo.

### Añadir un área

1. Agrega la entrada en `Data.areas`.
2. Agrega las actividades con esa `area`.
3. Agrega la tarjeta en `NAV` (o en `HUBS`) de `js/app.js`.

### Añadir un módulo nuevo

1. Crea la sección `<section id="screen-tuModulo" class="screen" data-title="...">` en `index.html`.
2. Crea `js/tumodulo.js` con `global.TuModulo = { init() {...} }`.
3. Incluye el `<script>` **antes** de `app.js`.
4. Llama `TuModulo.init()` dentro de `initModules()` en `app.js`.
5. Añade la tarjeta en `NAV` o en el hub correspondiente.

---

## 9. Decisiones de diseño pedagógico

- **El niño demuestra lo que sabe de muchas formas**: escribe, dibuja, habla,
  escucha, selecciona, arrastra, ordena, construye, explica.
- **Retroalimentación escalonada**: acierto → elogio concreto; fallo 1 → pista;
  fallo 2 → ejemplo; fallo 3 → solución explicada.
- **Nunca solo "correcto/incorrecto"**: los mensajes varían y siempre invitan a reintentar.
- **Respuestas abiertas** (`type: 'open'`) se aceptan siempre que aporten algo.
- **Actividades creativas** se evalúan por criterios objetivos
  (¿tiene dos ventanas? ¿existe estructura?), nunca por gusto estético.
- **La dificultad se adapta** a rachas de aciertos y de fallos.
- **Los porcentajes no etiquetan**: solo sirven para ajustar el nivel.

---

## 10. Fases implementadas

| Fase | Estado |
|---|---|
| 1. Interfaz, navegación, usuario, edades, dashboard, almacenamiento | Hecha |
| 2. Canvas: dibujo, pintura, escritura, trazado | Hecha |
| 3. Matemática, lenguaje, lógica, memoria | Hecha |
| 4. Audio, voz, lectura, actividades multimodales | Hecha |
| 5. Construcción, diseño, historias, proyectos | Hecha |
| 6. Ciencia, música, emociones, programación | Hecha |
| 7. Padres, docentes, progreso, accesibilidad, seguridad | Hecha |
| 8. Optimización, responsive, manejo de errores | Hecha |

---

## 11. Pruebas automáticas

`test/smoke.js` carga la aplicación completa en un DOM simulado (jsdom),
recorre todas las pantallas, pulsa botones reales y comprueba que no se
produzca ningún error de ejecución.

```bash
npm install jsdom --no-save   # solo la primera vez
node test/smoke.js            # sale con código 0 si todo pasa
```

Cubre: arranque de los 16 módulos, navegación completa, perfil, diagnóstico,
motor de actividades con pista/ejemplo/reintento, dibujo, cuaderno, colorear,
trazado, construcción, rompecabezas, robot, música, ciencia, emociones,
lectura, cuento interactivo, creador de historias, misiones, logros,
proyectos, PIN de padres, panel docente, ajustes, persistencia en
`localStorage`, canvas reutilizable y áreas.

Comprobación de sintaxis de todos los módulos:

```bash
# Linux / macOS / Git Bash
for f in js/*.js; do node --check "$f"; done

# PowerShell
Get-ChildItem js\*.js | ForEach-Object { node --check $_.FullName }
```

---

Hecho con HTML5, CSS3, JavaScript ES6+, Canvas, SVG, Web Audio API,
Web Speech API, LocalStorage e IndexedDB.
