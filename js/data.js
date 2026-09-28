/* =========================================================
   data.js - Banco de actividades iniciales
   Cada actividad es un objeto con un esquema estable:
   { id, area, skill, ageMin, ageMax, difficulty, type,
     question, options[], answer, hint, feedback, explain }

   Tipos soportados por el motor (activities.js):
     selection      -> opciones de texto/imagen
     number         -> casilla numérica
     text           -> campo de texto libre
     speak          -> respuesta por voz
     visual         -> objetos visuales que se cuentan
     order          -> ordenar elementos con flechas
     sequence       -> completar un patrón
     errorFind      -> encontrar el error
     build          -> pedir construcción (se resuelve en Construir)
     draw           -> pedir dibujo (se resuelve en Dibujar)
     open           -> respuesta abierta (texto, voz o dibujo)

   Para ampliar: basta con añadir objetos a este array.
   ========================================================= */
(function (global) {
  'use strict';

  function A(o) {
    return {
      id: o.id,
      area: o.area,
      skill: o.skill,
      ageMin: o.ageMin || 4,
      ageMax: o.ageMax || 16,
      difficulty: o.difficulty || 1,
      type: o.type || 'selection',
      question: o.question,
      visual: o.visual || null,          // tipo de objeto visual: apple|star|ball|fish|tree
      visualCount: o.visualCount || 0,
      options: o.options || [],
      answer: o.answer,
      hint: o.hint || '',
      feedback: o.feedback || '¡Muy bien!',
      explain: o.explain || '',
      prompt: o.prompt || '',            // instrucción para audio
      skillArea: o.skillArea || o.skill
    };
  }

  var ACTIVITIES = [

    /* ============ MATEMÁTICA (12) ============ */
    A({ id: 'math_001', area: 'matematica', skill: 'conteo', ageMin: 4, ageMax: 5, difficulty: 1, type: 'visual',
      visual: 'apple', visualCount: 3,
      question: 'Cuenta las manzanas.', options: ['2', '3', '4', '5'], answer: '3',
      hint: 'Toca cada manzana mientras la cuentas.', explain: 'Hay 3 manzanas: 1, 2, 3.' }),
    A({ id: 'math_002', area: 'matematica', skill: 'conteo', ageMin: 4, ageMax: 5, difficulty: 1, type: 'visual',
      visual: 'star', visualCount: 5,
      question: '¿Cuántas estrellas ves?', options: ['4', '5', '6', '7'], answer: '5',
      hint: 'Cuenta de izquierda a derecha.', explain: 'Contamos 5 estrellas.' }),
    A({ id: 'math_003', area: 'matematica', skill: 'suma', ageMin: 5, ageMax: 7, difficulty: 1, type: 'visual',
      visual: 'apple', visualCount: 5, addend: 2,
      question: '2 manzanas más 3 manzanas. ¿Cuántas en total?', options: ['4', '5', '6', '7'], answer: '5',
      hint: 'Une los dos grupos y cuenta todas juntas.', explain: '2 + 3 = 5.' }),
    A({ id: 'math_004', area: 'matematica', skill: 'suma', ageMin: 6, ageMax: 7, difficulty: 2, type: 'number',
      question: '5 + 3 =', answer: '8',
      hint: 'Empieza en 5 y avanza 3 casillas más.', explain: '5 + 3 = 8.' }),
    A({ id: 'math_005', area: 'matematica', skill: 'suma', ageMin: 8, ageMax: 9, difficulty: 3, type: 'number',
      question: '12 + 8 =', answer: '20',
      hint: 'Suma primero las decenas: 10 + 8 = 18 y luego añade 2.', explain: '12 + 8 = 20.' }),
    A({ id: 'math_006', area: 'matematica', skill: 'resta', ageMin: 6, ageMax: 7, difficulty: 2, type: 'number',
      question: '9 - 4 =', answer: '5',
      hint: 'Cuenta hacia atrás desde 9.', explain: '9 - 4 = 5.' }),
    A({ id: 'math_007', area: 'matematica', skill: 'resta', ageMin: 8, ageMax: 9, difficulty: 3, type: 'number',
      question: 'Juan tiene 15 manzanas y regala 6. ¿Cuántas quedan?', answer: '9',
      hint: 'Quita 6 del total de 15.', explain: '15 - 6 = 9 manzanas.' }),
    A({ id: 'math_008', area: 'matematica', skill: 'multiplicacion', ageMin: 8, ageMax: 10, difficulty: 3, type: 'number',
      question: '4 x 6 =', answer: '24',
      hint: 'Es lo mismo que sumar 6 cuatro veces: 6 + 6 + 6 + 6.', explain: '4 x 6 = 24.' }),
    A({ id: 'math_009', area: 'matematica', skill: 'division', ageMin: 8, ageMax: 10, difficulty: 3, type: 'number',
      question: '20 repartidos en 4 iguales =', answer: '5',
      hint: '¿Cuántas veces cabe 4 en 20?', explain: '20 / 4 = 5.' }),
    A({ id: 'math_010', area: 'matematica', skill: 'fracciones', ageMin: 9, ageMax: 12, difficulty: 4, type: 'selection',
      question: 'Si partes una pizza en 8 y comes 2, ¿qué fracción comiste?',
      options: ['2/8', '8/2', '1/8', '3/8'], answer: '2/8',
      hint: 'Arriba va lo que comiste, abajo el total de partes.', explain: '2 de 8 partes es 2/8.' }),
    A({ id: 'math_011', area: 'matematica', skill: 'dinero', ageMin: 10, ageMax: 13, difficulty: 4, type: 'number',
      question: 'Tienes S/ 20 y compras un producto de S/ 8. ¿Cuánto queda?', answer: '12',
      hint: 'Resta el precio al dinero que tenías.', explain: '20 - 8 = 12.' }),
    A({ id: 'math_012', area: 'matematica', skill: 'porcentajes', ageMin: 11, ageMax: 16, difficulty: 5, type: 'number',
      question: '¿Cuánto es el 10% de 50?', answer: '5',
      hint: 'El 10% es dividir entre 10.', explain: '10% de 50 = 5.' }),
    A({ id: 'math_013', area: 'matematica', skill: 'secuencias', ageMin: 6, ageMax: 8, difficulty: 2, type: 'sequence',
      question: 'Completa la serie: 2, 4, 6, ...', options: ['7', '8', '9', '10'], answer: '8',
      hint: 'Cada número aumenta en 2.', explain: 'Los pares: 2, 4, 6, 8.' }),
    A({ id: 'math_014', area: 'matematica', skill: 'geometria', ageMin: 8, ageMax: 11, difficulty: 3, type: 'selection',
      question: '¿Cuántos lados tiene un hexágono?', options: ['5', '6', '7', '8'], answer: '6',
      hint: 'Hexa significa seis.', explain: 'El hexágono tiene 6 lados.' }),

    /* ============ LENGUAJE (12) ============ */
    A({ id: 'lang_001', area: 'lenguaje', skill: 'vocabulario', ageMin: 4, ageMax: 5, difficulty: 1, type: 'selection',
      question: '¿Qué animal ves?', art: 'fish', options: ['Pez', 'Gato', 'Árbol', 'Casa'], answer: 'Pez',
      hint: 'Vive en el agua y nada.', explain: 'Es un pez.' }),
    A({ id: 'lang_002', area: 'lenguaje', skill: 'vocabulario', ageMin: 4, ageMax: 6, difficulty: 1, type: 'text',
      question: 'Escribe qué animal ves: ', art: 'butterfly', answer: 'mariposa',
      hint: 'Tiene alas de colores y sale de una oruga.', explain: 'Es una mariposa.' }),
    A({ id: 'lang_003', area: 'lenguaje', skill: 'letras', ageMin: 4, ageMax: 5, difficulty: 1, type: 'selection',
      question: '¿Con qué letra empieza MARIPOSA?', options: ['M', 'A', 'P', 'S'], answer: 'M',
      hint: 'Hace el sonido "mmm".', explain: 'Mariposa empieza con M.' }),
    A({ id: 'lang_004', area: 'lenguaje', skill: 'silabas', ageMin: 5, ageMax: 7, difficulty: 2, type: 'selection',
      question: '¿Cuántas sílabas tiene la palabra GATO?', options: ['1', '2', '3', '4'], answer: '2',
      hint: 'GAT-O. Sopla mientras dices cada parte.', explain: 'GA-TO, dos sílabas.' }),
    A({ id: 'lang_005', area: 'lenguaje', skill: 'lectura', ageMin: 6, ageMax: 8, difficulty: 2, type: 'selection',
      question: 'Lee: "El gato duerme en la silla." ¿Dónde duerme?',
      options: ['En la silla', 'En la mesa', 'En el suelo', 'Fuera'], answer: 'En la silla',
      hint: 'Busca la palabra "en" y mira qué viene después.', explain: 'La frase dice que duerme en la silla.' }),
    A({ id: 'lang_006', area: 'lenguaje', skill: 'ortografia', ageMin: 7, ageMax: 9, difficulty: 3, type: 'selection',
      question: 'Elige la forma correcta: "Yo ___ manzanas."', options: ['como', 'como con h', 'como con m', 'commo'], answer: 'como',
      hint: 'Es el verbo comer en primera persona.', explain: 'Se escribe "como", sin h.' }),
    A({ id: 'lang_007', area: 'lenguaje', skill: 'vocabulario', ageMin: 7, ageMax: 10, difficulty: 3, type: 'selection',
      question: '¿Cuál es lo contrario de "rápido"?',
      options: ['Lento', 'Alto', 'Feliz', 'Grande'], answer: 'Lento',
      hint: 'Piensa en alguien que tarda mucho en llegar.', explain: 'Lo contrario de rápido es lento.' }),
    A({ id: 'lang_008', area: 'lenguaje', skill: 'comprension', ageMin: 8, ageMax: 11, difficulty: 4, type: 'open',
      question: 'Cuenta con tus palabras qué harías si encontrases una puerta misteriosa.',
      answer: '', hint: 'Puedes escribir, hablar o dibujar tu idea.',
      feedback: 'Me encanta cómo lo explicaste.', explain: 'No hay una única respuesta correcta: todas las ideas razonables cuentan.' }),
    A({ id: 'lang_009', area: 'lenguaje', skill: 'escritura', ageMin: 6, ageMax: 8, difficulty: 2, type: 'text',
      question: 'Escribe una frase sobre un animal. ¿Qué animal elegiste?', answer: 'perro',
      hint: 'Empieza con mayúscula y termina con punto.',
      feedback: 'Buena frase. Recuerda la mayúscula inicial.',
      explain: 'Una frase se escribe con mayúscula al empezar y punto al final.' }),
    A({ id: 'lang_010', area: 'lenguaje', skill: 'sinonimos', ageMin: 9, ageMax: 12, difficulty: 4, type: 'selection',
      question: '¿Cuál es sinónimo de "alegre"?',
      options: ['Feliz', 'Cansado', 'Pequeño', 'Rápido'], answer: 'Feliz',
      hint: 'Significa casi lo mismo.', explain: 'Alegre y feliz expresan lo mismo.' }),
    A({ id: 'lang_011', area: 'lenguaje', skill: 'gramatica', ageMin: 9, ageMax: 13, difficulty: 4, type: 'selection',
      question: '¿Cuál es el sujeto de la oración "Los niños juegan en el parque"?',
      options: ['Los niños', 'El parque', 'Juegan', 'En'], answer: 'Los niños',
      hint: 'Es quien realiza la acción.', explain: 'El sujeto es "los niños": son los que juegan.' }),
    A({ id: 'lang_012', area: 'lenguaje', skill: 'audio', ageMin: 5, ageMax: 8, difficulty: 2, type: 'audio_selection',
      question: 'Escucha la palabra y selecciónala.', audio: 'MARIPOSA',
      options: ['MARIPOSA', 'MARMOTA', 'MARAVILLA', 'MONTAÑA'], answer: 'MARIPOSA',
      hint: 'Toca el botón de escuchar otra vez.', explain: 'La palabra era mariposa.' }),

    /* ============ LÓGICA (12) ============ */
    A({ id: 'log_001', area: 'logica', skill: 'patrones', ageMin: 4, ageMax: 6, difficulty: 1, type: 'sequence',
      question: '¿Qué sigue? Rojo, azul, rojo, azul, ...',
      options: ['Rojo', 'Verde', 'Amarillo', 'Morado'], answer: 'Rojo',
      hint: 'Se alternan dos colores.', explain: 'El patrón alterna rojo y azul.' }),
    A({ id: 'log_002', area: 'logica', skill: 'clasificacion', ageMin: 4, ageMax: 6, difficulty: 1, type: 'selection',
      question: '¿Cuál NO es una fruta?', options: ['Manzana', 'Plátano', 'Zanahoria', 'Uva'], answer: 'Zanahoria',
      hint: 'Una de ellas crece bajo la tierra y no es fruta.', explain: 'La zanahoria es una verdura.' }),
    A({ id: 'log_003', area: 'logica', skill: 'series', ageMin: 6, ageMax: 8, difficulty: 2, type: 'sequence',
      question: 'Completa: círculo, cuadrado, triángulo, círculo, cuadrado, ...',
      options: ['Círculo', 'Cuadrado', 'Triángulo', 'Estrella'], answer: 'Triángulo',
      hint: 'Se repiten siempre en el mismo orden.', explain: 'La serie se repite de 3 en 3.' }),
    A({ id: 'log_004', area: 'logica', skill: 'analogias', ageMin: 7, ageMax: 10, difficulty: 3, type: 'selection',
      question: 'Mano : dedo :: cabeza : ___', options: ['Cabello', 'Oreja', 'Cara', 'Boca'], answer: 'Cabello',
      hint: 'La mano tiene dedos; la cabeza tiene... ', explain: 'La cabeza está cubierta de cabello.' }),
    A({ id: 'log_005', area: 'logica', skill: 'errorFind', ageMin: 7, ageMax: 11, difficulty: 3, type: 'errorFind',
      question: 'Hay un error en esta operación. ¿Cuál es?',
      options: ['2 + 2 = 5', '2 + 2 = 4', 'Todas están bien', 'Falta información'], answer: '2 + 2 = 5',
      hint: 'Une dos dedos con otros dos dedos.', explain: '2 + 2 es 4, no 5.' }),
    A({ id: 'log_006', area: 'logica', skill: 'causaEfecto', ageMin: 7, ageMax: 10, difficulty: 3, type: 'selection',
      question: 'Si dejas el hielo al sol, ¿qué ocurre?', options: ['Se derrite', 'Se congela', 'Desaparece', 'Se vuelve duro'], answer: 'Se derrite',
      hint: 'El calor cambia el estado del hielo.', explain: 'El calor hace que el hielo se convierta en agua.' }),
    A({ id: 'log_007', area: 'logica', skill: 'acertijos', ageMin: 7, ageMax: 11, difficulty: 3, type: 'selection',
      question: 'Tiene dientes pero no muerde. ¿Qué es?',
      options: ['Un peine', 'Un perro', 'Un tiburón', 'Un serrucho'], answer: 'Un peine',
      hint: 'Lo usas en el cabello.', explain: 'El peine tiene dientes pero no muerde.' }),
    A({ id: 'log_008', area: 'logica', skill: 'espacial', ageMin: 5, ageMax: 8, difficulty: 2, type: 'selection',
      question: 'Si el gato está a la IZQUIERDA del perro, ¿dónde está el perro respecto al gato?',
      options: ['A la derecha', 'A la izquierda', 'Arriba', 'Detrás'], answer: 'A la derecha',
      hint: 'Al girar la idea, los lados se cambian.', explain: 'Si A está a la izquierda de B, B está a la derecha de A.' }),
    A({ id: 'log_009', area: 'logica', skill: 'ordenar', ageMin: 6, ageMax: 9, difficulty: 3, type: 'order',
      question: 'Ordena de menor a mayor.', options: ['3', '7', '12', '5'], answer: '3,5,7,12',
      hint: 'Empieza por el más pequeño.', explain: 'El orden correcto es 3, 5, 7, 12.' }),
    A({ id: 'log_010', area: 'logica', skill: 'matematicasL', ageMin: 9, ageMax: 13, difficulty: 4, type: 'selection',
      question: 'Si hoy es lunes, ¿qué día será dentro de 3 días?',
      options: ['Jueves', 'Miércoles', 'Martes', 'Viernes'], answer: 'Jueves',
      hint: 'Cuenta lunes + 3.', explain: 'Lunes, martes, miércoles, jueves.' }),
    A({ id: 'log_011', area: 'logica', skill: 'deduccion', ageMin: 10, ageMax: 16, difficulty: 5, type: 'selection',
      question: 'Ana es mayor que Luis. Luis es mayor que Pedro. ¿Quién es el menor?',
      options: ['Pedro', 'Luis', 'Ana', 'No se puede saber'], answer: 'Pedro',
      hint: 'Coloca a los tres en una fila de mayor a menor.', explain: 'Ana > Luis > Pedro, así que Pedro es el menor.' }),
    A({ id: 'log_012', area: 'logica', skill: 'patrones', ageMin: 9, ageMax: 14, difficulty: 4, type: 'sequence',
      question: 'Completa: 1, 1, 2, 3, 5, ...', options: ['6', '7', '8', '9'], answer: '8',
      hint: 'Suma los dos números anteriores.', explain: '3 + 5 = 8 (sucesión de Fibonacci).' }),

    /* ============ MEMORIA (6) ============ */
    A({ id: 'mem_001', area: 'memoria', skill: 'memoriaVisual', ageMin: 4, ageMax: 6, difficulty: 1, type: 'memory',
      question: 'Observa los objetos 5 segundos y recuerda cuál había.', memoryItems: ['sol', 'pez', 'casa'], target: 'pez',
      options: ['pez', 'sol', 'casa', 'arbol'], answer: 'pez',
      hint: 'Cierra los ojos y revívelo en tu mente.', explain: 'Había un pez.' }),
    A({ id: 'mem_002', area: 'memoria', skill: 'memoriaVisual', ageMin: 5, ageMax: 8, difficulty: 2, type: 'memory',
      question: 'Memoriza la posición de la estrella.', memoryGrid: 6, targetIndex: 3,
      options: ['1', '2', '3', '4', '5', '6'], answer: '4',
      hint: 'Recuerda en qué fila estaba.', explain: 'La estrella estaba en la posición 4.' }),
    A({ id: 'mem_003', area: 'memoria', skill: 'memoriaAuditiva', ageMin: 6, ageMax: 9, difficulty: 3, type: 'sequence_audio',
      question: 'Escucha la secuencia y elige el orden correcto.', audioSeq: ['sol', 'luna', 'estrella'],
      options: ['sol-luna-estrella', 'luna-sol-estrella', 'estrella-sol-luna', 'sol-estrella-luna'], answer: 'sol-luna-estrella',
      hint: 'Puedes repetirla en voz alta mientras la escuchas.', explain: 'El orden era sol, luna, estrella.' }),
    A({ id: 'mem_004', area: 'memoria', skill: 'memoriaInstrucciones', ageMin: 5, ageMax: 8, difficulty: 2, type: 'selection',
      question: 'Recuerda: "Toca el rojo, luego el azul y termina con el verde." ¿Cuál fue el último?',
      options: ['Verde', 'Azul', 'Rojo', 'Amarillo'], answer: 'Verde',
      hint: 'Era la tercera instrucción.', explain: 'El último fue el verde.' }),
    A({ id: 'mem_005', area: 'memoria', skill: 'memoriaVisual', ageMin: 7, ageMax: 11, difficulty: 3, type: 'memory',
      question: 'Observa estos 5 objetos y recuerda solo uno.', memoryItems: ['sol', 'pez', 'casa', 'arbol', 'luna'], target: 'luna',
      options: ['luna', 'sol', 'casa', 'arbol'], answer: 'luna',
      hint: 'Repítelo en tu cabeza: luna, luna, luna.', explain: 'La luna estaba en la lista.' }),
    A({ id: 'mem_006', area: 'memoria', skill: 'memoriaSecuencial', ageMin: 8, ageMax: 12, difficulty: 4, type: 'order',
      question: 'Ordena como los escuchaste: 3, 1, 2', options: ['1', '2', '3'], answer: '3,1,2',
      hint: 'El primero que sonó va arriba.', explain: 'El orden de escucha era 3, 1, 2.' }),

    /* ============ DIBUJO (6) ============ */
    A({ id: 'drw_001', area: 'dibujo', skill: 'creatividad', ageMin: 4, ageMax: 7, difficulty: 1, type: 'draw',
      question: 'Dibuja un árbol.', prompt: 'Dibuja un árbol con su tronco y hojas.',
      hint: 'Empieza por el tronco, luego las ramas y al final las hojas.',
      feedback: '¡Qué bonito árbol! ¿Cómo se llama el tuyo?', criteria: ['tronco', 'hojas'], explain: 'Un árbol tiene tronco y copa.' }),
    A({ id: 'drw_002', area: 'dibujo', skill: 'creatividad', ageMin: 4, ageMax: 7, difficulty: 1, type: 'draw',
      question: 'Dibuja una casa.', prompt: 'Dibuja una casa con puerta y ventanas.',
      hint: 'Usa un cuadrado para la base y un triángulo para el techo.',
      feedback: '¡Me encanta tu casa! ¿Quién vive ahí?', criteria: ['casa'], explain: 'Cualquier casa dibujada con esfuerzo es válida.' }),
    A({ id: 'drw_003', area: 'dibujo', skill: 'instrucciones', ageMin: 6, ageMax: 9, difficulty: 3, type: 'draw',
      question: 'Dibuja una casa con una puerta azul y dos ventanas.', prompt: 'Puerta azul, dos ventanas.',
      hint: 'Primero la casa, luego la puerta azul y cuenta las ventanas.',
      feedback: 'Cumpliste todas las instrucciones.', criteria: ['puerta', 'ventana'], explain: 'Se evalúa si la instrucción se cumplió, no si es bonito.' }),
    A({ id: 'drw_004', area: 'dibujo', skill: 'expresion', ageMin: 6, ageMax: 10, difficulty: 2, type: 'draw',
      question: 'Dibuja cómo te sientes hoy.', prompt: 'Dibuja tu emoción de hoy.',
      hint: 'Usa colores que sientas que van con esa emoción.',
      feedback: 'Gracias por compartir cómo te sientes.', criteria: [], explain: 'No existe una respuesta única.' }),
    A({ id: 'drw_005', area: 'dibujo', skill: 'motricidad', ageMin: 4, ageMax: 6, difficulty: 2, type: 'draw',
      question: 'Dibuja un sol grande en el centro.', prompt: 'Un sol grande en el centro.',
      hint: 'Haz un círculo y añade los rayos.',
      feedback: '¡Qué sol más brillante!', criteria: ['sol'], explain: 'Practicamos el movimiento circular.' }),
    A({ id: 'drw_006', area: 'dibujo', skill: 'creatividad', ageMin: 8, ageMax: 14, difficulty: 4, type: 'draw',
      question: 'Dibuja algo que pueda volar.', prompt: 'Algo que pueda volar.',
      hint: 'Puede ser un avión, un cohete, un pájaro o algo que inventes.',
      feedback: 'Todas las ideas cuentan. ¡Imaginación total!', criteria: [], explain: 'Actividad abierta: hay muchas respuestas válidas.' }),

    /* ============ TRAZADO / ESCRITURA (6) ============ */
    A({ id: 'trz_001', area: 'trazado', skill: 'motricidad', ageMin: 4, ageMax: 5, difficulty: 1, type: 'trace',
      question: 'Traza la línea recta.', traceTarget: 'line', letter: 'I',
      hint: 'Empieza arriba y baja sin levantar el lápiz.', explain: 'Las líneas rectas preparan la escritura.' }),
    A({ id: 'trz_002', area: 'trazado', skill: 'motricidad', ageMin: 4, ageMax: 5, difficulty: 1, type: 'trace',
      question: 'Traza el círculo.', traceTarget: 'circle', letter: 'O',
      hint: 'Empieza arriba y cierra el círculo.', explain: 'El círculo es la base de muchas letras.' }),
    A({ id: 'trz_003', area: 'trazado', skill: 'letras', ageMin: 4, ageMax: 6, difficulty: 2, type: 'trace',
      question: 'Traza la letra A.', traceTarget: 'A', letter: 'A',
      hint: 'Una diagonal hacia abajo, otra diagonal y el travesaño.', explain: 'La A tiene dos diagonales y un travesaño.' }),
    A({ id: 'trz_004', area: 'trazado', skill: 'letras', ageMin: 5, ageMax: 7, difficulty: 2, type: 'trace',
      question: 'Traza la letra B.', traceTarget: 'B', letter: 'B',
      hint: 'Una línea recta y dos curvas.', explain: 'La B tiene una vertical y dos bultos.' }),
    A({ id: 'trz_005', area: 'trazado', skill: 'numeros', ageMin: 4, ageMax: 6, difficulty: 2, type: 'trace',
      question: 'Traza el número 3.', traceTarget: '3', letter: '3',
      hint: 'Dos curvas una encima de otra.', explain: 'El 3 se hace con dos curvas.' }),
    A({ id: 'trz_006', area: 'trazado', skill: 'escritura', ageMin: 6, ageMax: 9, difficulty: 3, type: 'trace',
      question: 'Traza la palabra SOL.', traceTarget: 'SOL', letter: 'SOL',
      hint: 'Ve letra por letra sin levantar mucho el lápiz.', explain: 'Las palabras se forman juntando letras.' }),

    /* ============ CONSTRUCCIÓN (6) ============ */
    A({ id: 'bld_001', area: 'construccion', skill: 'espacial', ageMin: 4, ageMax: 6, difficulty: 1, type: 'build',
      question: 'Construye una torre de 5 bloques.', buildRule: 'tower', targetCount: 5,
      hint: 'Apila los bloques uno encima del otro.', explain: 'Contamos 5 bloques apilados.' }),
    A({ id: 'bld_002', area: 'construccion', skill: 'espacial', ageMin: 5, ageMax: 8, difficulty: 2, type: 'build',
      question: 'Construye una casa con dos ventanas.', buildRule: 'house', windows: 2,
      hint: 'Necesitas una base y dos ventanas.', explain: 'Se cumple si existe estructura y dos ventanas.' }),
    A({ id: 'bld_003', area: 'construccion', skill: 'matematica', ageMin: 6, ageMax: 9, difficulty: 2, type: 'build',
      question: 'Construye una torre de 8 bloques y luego quita 3.', buildRule: 'remove', startCount: 8, removeCount: 3,
      hint: 'Construye 8 y borra 3. ¿Cuántos quedan?', explain: '8 - 3 = 5 bloques.' }),
    A({ id: 'bld_004', area: 'construccion', skill: 'espacial', ageMin: 7, ageMax: 11, difficulty: 3, type: 'build',
      question: 'Construye un puente.', buildRule: 'bridge',
      hint: 'Necesitas dos soportes y una parte encima.', explain: 'Un puente necesita apoyos y una cubierta.' }),
    A({ id: 'bld_005', area: 'construccion', skill: 'creatividad', ageMin: 6, ageMax: 10, difficulty: 3, type: 'build',
      question: 'Construye un vehículo con cuatro ruedas.', buildRule: 'vehicle', wheels: 4,
      hint: 'Añade una carrocería y cuenta las ruedas.', explain: 'Se evalúa el número de ruedas y que exista estructura.' }),
    A({ id: 'bld_006', area: 'construccion', skill: 'geometria', ageMin: 7, ageMax: 12, difficulty: 3, type: 'build',
      question: 'Construye una figura con dos triángulos.', buildRule: 'triangles', triangles: 2,
      hint: 'Junta dos triángulos por un lado.', explain: 'Dos triángulos pueden formar un cuadrado o un rombo.' }),

    /* ============ LECTURA (6) ============ */
    A({ id: 'rd_001', area: 'lectura', skill: 'letras', ageMin: 4, ageMax: 5, difficulty: 1, type: 'audio_selection',
      question: 'Escucha y elige la letra.', audio: 'M',
      options: ['M', 'S', 'W', 'N'], answer: 'M',
      hint: 'Suena "mmm" como en gato.', explain: 'La letra M suena mmm.' }),
    A({ id: 'rd_002', area: 'lectura', skill: 'letras', ageMin: 4, ageMax: 6, difficulty: 1, type: 'selection',
      question: '¿Qué letra falta? P _ R A', options: ['E', 'A', 'O', 'U'], answer: 'E',
      hint: 'Lee la palabra completa: PERA.', explain: 'P-E-R-A forma pera.' }),
    A({ id: 'rd_003', area: 'lectura', skill: 'silabas', ageMin: 5, ageMax: 7, difficulty: 2, type: 'order',
      question: 'Ordena las sílabas para formar MARIPOSA.', options: ['MAR', 'I', 'PO', 'SA'], answer: 'MAR,I,PO,SA',
      hint: 'Empieza por la primera sílaba que suenas.', explain: 'MA-RI-PO-SA.' }),
    A({ id: 'rd_004', area: 'lectura', skill: 'comprension', ageMin: 6, ageMax: 9, difficulty: 3, type: 'selection',
      story: 'Luna era una niña curiosa. Un día encontró una puerta misteriosa en el jardín. ¿Qué haría?',
      question: '¿Quién es la personaje principal?',
      options: ['Luna', 'El gato', 'La puerta', 'El jardín'], answer: 'Luna',
      hint: 'Es la que aparece primero y hace las acciones.', explain: 'La protagonista es Luna.' }),
    A({ id: 'rd_005', area: 'lectura', skill: 'comprension', ageMin: 7, ageMax: 11, difficulty: 4, type: 'open',
      question: 'Cuenta con tus propias palabras qué ocurrió en la historia de Luna.',
      answer: '', hint: 'Puedes escribirlo o contarlo con tu voz.',
      feedback: 'Excelente forma de contarlo.', explain: 'Se valora la comprensión, no la redacción perfecta.' }),
    A({ id: 'rd_006', area: 'lectura', skill: 'expresion', ageMin: 6, ageMax: 12, difficulty: 3, type: 'speak',
      question: 'Pronuncia la palabra: ELEFANTE', expected: 'ELEFANTE',
      hint: 'Escucha primero y divídela: E-LE-FAN-TE.', explain: 'Comparación orientativa de pronunciación.' }),

    /* ============ CIENCIAS (6) ============ */
    A({ id: 'sci_001', area: 'ciencia', skill: 'animales', ageMin: 4, ageMax: 7, difficulty: 1, type: 'selection',
      question: '¿Qué animal hace "muuu"?', options: ['Vaca', 'Gato', 'Pato', 'Conejo'], answer: 'Vaca',
      hint: 'Es un animal de la granja que da leche.', explain: 'La vaca hace muuu.' }),
    A({ id: 'sci_002', area: 'ciencia', skill: 'plantas', ageMin: 5, ageMax: 8, difficulty: 2, type: 'selection',
      question: '¿Qué necesita una planta para crecer?', options: ['Agua y sol', 'Solo juguete', 'Televisor', 'Arena'], answer: 'Agua y sol',
      hint: 'Piensa en lo que le pones en el jardín.', explain: 'Las plantas necesitan agua, luz y tierra.' }),
    A({ id: 'sci_003', area: 'ciencia', skill: 'espacio', ageMin: 6, ageMax: 10, difficulty: 2, type: 'selection',
      question: '¿Qué planeta vivimos nosotros?', options: ['Tierra', 'Marte', 'Júpiter', 'Venus'], answer: 'Tierra',
      hint: 'Es el planeta azul y verde.', explain: 'Vivimos en la Tierra.' }),
    A({ id: 'sci_004', area: 'ciencia', skill: 'agua', ageMin: 6, ageMax: 9, difficulty: 3, type: 'selection',
      experiment: true,
      question: 'Si pones una piedra en un vaso con agua, ¿qué crees que ocurrirá?',
      options: ['Se hunde', 'Flota', 'Se evapora', 'Desaparece'], answer: 'Se hunde',
      hint: 'Las piedras son más pesadas que el agua.', explain: 'La piedra es más densa que el agua y se hunde.' }),
    A({ id: 'sci_005', area: 'ciencia', skill: 'medioAmbiente', ageMin: 7, ageMax: 11, difficulty: 3, type: 'selection',
      question: '¿En qué recipiente colocarías una botella de plástico usada?',
      options: ['Reciclaje', 'Tacho común', 'La calle', 'El inodoro'], answer: 'Reciclaje',
      hint: 'El plástico se puede transformar en algo nuevo.', explain: 'El plástico va al reciclaje.' }),
    A({ id: 'sci_006', area: 'ciencia', skill: 'cuerpoHumano', ageMin: 7, ageMax: 11, difficulty: 3, type: 'selection',
      question: '¿Qué órgano bombea la sangre?', options: ['Corazón', 'Pulmón', 'Hueso', 'Estómago'], answer: 'Corazón',
      hint: 'Lo sientes latir en el pecho.', explain: 'El corazón bombea la sangre por todo el cuerpo.' }),

    /* ============ EMOCIONES (6) ============ */
    A({ id: 'emo_001', area: 'emociones', skill: 'emociones', ageMin: 4, ageMax: 7, difficulty: 1, type: 'selection',
      question: '¿Cómo crees que se siente?', face: 'feliz',
      options: ['Feliz', 'Triste', 'Enojado', 'Asustado'], answer: 'Feliz',
      hint: 'Mira la boca y los ojos.', explain: 'Sonríe y tiene los ojos brillantes: está feliz.' }),
    A({ id: 'emo_002', area: 'emociones', skill: 'emociones', ageMin: 4, ageMax: 7, difficulty: 1, type: 'selection',
      question: '¿Qué cara muestra esta emoción?', face: 'triste',
      options: ['Triste', 'Feliz', 'Sorprendido', 'Enojado'], answer: 'Triste',
      hint: 'La boca está hacia abajo.', explain: 'Esa cara expresa tristeza.' }),
    A({ id: 'emo_003', area: 'emociones', skill: 'emociones', ageMin: 5, ageMax: 9, difficulty: 2, type: 'selection',
      question: 'Un amigo llora solo en un rincón. ¿Qué harías?',
      options: ['Ir a preguntarle si está bien', 'Reírme', 'Ignorarlo', 'Contarlo a todos'], answer: 'Ir a preguntarle si está bien',
      hint: 'Piensa en lo que te gustaría que hicieran contigo.', explain: 'La empatía consiste en acercarse y ofrecer ayuda.' }),
    A({ id: 'emo_004', area: 'emociones', skill: 'emociones', ageMin: 6, ageMax: 10, difficulty: 3, type: 'open',
      question: '¿Qué harías para ayudar a alguien que está triste?',
      answer: '', hint: 'Puedes responder escribiendo, hablando o dibujando.',
      feedback: 'Qué buen detalle de tu parte.', explain: 'Toda ayuda razonable es válida.' }),
    A({ id: 'emo_005', area: 'emociones', skill: 'social', ageMin: 6, ageMax: 10, difficulty: 3, type: 'selection',
      question: 'Alguien tiene un juguete y tú lo quieres. ¿Qué haces?',
      options: ['Pido esperar mi turno', 'Lo quito a la fuerza', 'Lloro', 'Me voy'], answer: 'Pido esperar mi turno',
      hint: 'La solución que respeta a los dos.', explain: 'Respetar los turnos es una habilidad social importante.' }),
    A({ id: 'emo_006', area: 'emociones', skill: 'emociones', ageMin: 8, ageMax: 14, difficulty: 4, type: 'open',
      question: '¿Por qué crees que a veces sentimos enojo?',
      answer: '', hint: 'Piensa en qué situaciones te ha pasado.',
      feedback: 'Buen análisis. El enojo también nos avisa algo.', explain: 'Las emociones nos informan sobre nuestras necesidades.' }),

    /* ============ PROGRAMACIÓN (6) ============ */
    A({ id: 'cod_001', area: 'programacion', skill: 'secuencias', ageMin: 6, ageMax: 9, difficulty: 1, type: 'selection',
      question: 'El robot está en la casilla 1. Si AVANZAS 2 veces, ¿dónde llega?',
      options: ['Casilla 3', 'Casilla 2', 'Casilla 4', 'No se mueve'], answer: 'Casilla 3',
      hint: '1 + 1 + 1.', explain: 'AVANZAR, AVANZAR lleva de la 1 a la 3.' }),
    A({ id: 'cod_002', area: 'programacion', skill: 'secuencias', ageMin: 7, ageMax: 10, difficulty: 2, type: 'order',
      question: 'Ordena el programa para que el robot llegue a la meta.',
      options: ['AVANZAR', 'AVANZAR', 'GIRAR DERECHA', 'AVANZAR'], answer: 'AVANZAR,AVANZAR,GIRAR DERECHA,AVANZAR',
      hint: 'Primero camina, luego gira y vuelve a caminar.', explain: 'Las instrucciones se ejecutan de arriba hacia abajo.' }),
    A({ id: 'cod_003', area: 'programacion', skill: 'condicionales', ageMin: 8, ageMax: 12, difficulty: 3, type: 'selection',
      question: 'SI hay obstáculo ENTONCES girar. ¿Qué tipo de instrucción es "SI... ENTONCES"?',
      options: ['Condicional', 'Repetición', 'Movimiento', 'Sonido'], answer: 'Condicional',
      hint: 'Sirve para decidir según lo que pasa.', explain: 'Los condicionales solo se ejecutan si se cumple la condición.' }),
    A({ id: 'cod_004', area: 'programacion', skill: 'iteracion', ageMin: 8, ageMax: 12, difficulty: 3, type: 'selection',
      question: 'REPETIR 4 veces { AVANZAR }. ¿Cuántas casillas avanza?',
      options: ['4', '8', '2', '1'], answer: '4',
      hint: 'El bloque se repite el número de veces indicado.', explain: 'REPETIR 4 veces AVANZAR = 4 avances.' }),
    A({ id: 'cod_005', area: 'programacion', skill: 'depuracion', ageMin: 9, ageMax: 14, difficulty: 4, type: 'errorFind',
      question: 'Este programa no llega a la meta. ¿Cuál es el error?',
      options: ['Falta un AVANZAR', 'Sobra un GIRAR', 'Está bien hecho', 'No tiene sentido'], answer: 'Falta un AVANZAR',
      hint: 'Cuenta los pasos que necesita hasta la meta.', explain: 'Al faltar un AVANZAR, el robot se queda corto.' }),
    A({ id: 'cod_006', area: 'programacion', skill: 'robotica', ageMin: 10, ageMax: 16, difficulty: 5, type: 'open',
      question: 'Explica cómo programarías un robot para que recoja tres objetos.',
      answer: '', hint: 'Piensa en pasos: moverse, agarrar, repetir.',
      feedback: 'Muy buena secuencia de instrucciones.', explain: 'Programar es descomponer una tarea en pasos ordenados.' })
  ];

  /* ---- Índices ---- */
  var byId = {};
  var byArea = {};
  ACTIVITIES.forEach(function (a) {
    byId[a.id] = a;
    (byArea[a.area] = byArea[a.area] || []).push(a);
  });

  var AREA_INFO = {
    matematica: { name: 'Matemática', icon: 'math', color: '#38bdf8', skill: 'matematica',
      desc: 'Conteo, operaciones, fracciones, dinero y problemas.' },
    lenguaje: { name: 'Lenguaje', icon: 'read', color: '#a855f7', skill: 'lenguaje',
      desc: 'Palabras, frases, lectura, escritura y vocabulario.' },
    logica: { name: 'Lógica', icon: 'think', color: '#f59e0b', skill: 'logica',
      desc: 'Patrones, series, clasificación y acertijos.' },
    memoria: { name: 'Memoria', icon: 'brain', color: '#34d399', skill: 'memoria',
      desc: 'Recordar imágenes, sonidos e instrucciones.' },
    atencion: { name: 'Atención', icon: 'star', color: '#fb7185', skill: 'atencion',
      desc: 'Encontrar, comparar y seguir instrucciones.' },
    dibujo: { name: 'Dibujar', icon: 'pencil', color: '#f43f5e', skill: 'creatividad',
      desc: 'Expresión libre, dibujo guiado y descripción.' },
    trazado: { name: 'Escribir', icon: 'write', color: '#8b5cf6', skill: 'coordinacion',
      desc: 'Trazos, letras, números y palabras.' },
    construccion: { name: 'Construir', icon: 'build', color: '#10b981', skill: 'coordinacion',
      desc: 'Bloques, figuras y retos de construcción.' },
    lectura: { name: 'Leer', icon: 'book', color: '#6366f1', skill: 'lenguaje',
      desc: 'Letras, sílabas, palabras, cuentos y comprensión.' },
    ciencia: { name: 'Ciencia', icon: 'science', color: '#0ea5e9', skill: 'ciencia',
      desc: 'Animales, plantas, espacio y experimentos.' },
    emociones: { name: 'Emociones', icon: 'heart', color: '#ec4899', skill: 'social',
      desc: 'Reconocer emociones y convivir mejor.' },
    programacion: { name: 'Programar', icon: 'code', color: '#7c3aed', skill: 'programacion',
      desc: 'Secuencias, condiciones y robot virtual.' },
    musica: { name: 'Música', icon: 'music', color: '#f97316', skill: 'atencion',
      desc: 'Piano, ritmos y reconocer sonidos.' },
    creatividad: { name: 'Crear', icon: 'create', color: '#ec4899', skill: 'creatividad',
      desc: 'Dibujo, colores, historias y diseño.' }
  };

  function forAge(age, area) {
    return ACTIVITIES.filter(function (a) {
      if (age && (age < a.ageMin || age > a.ageMax)) return false;
      if (area && a.area !== area) return false;
      return true;
    });
  }

  function pickFor(level, area, age, excludeIds) {
    var pool = ACTIVITIES.filter(function (a) {
      if (area && a.area !== area) return false;
      if (age && (age < a.ageMin || age > a.ageMax)) return false;
      var d = Math.abs(a.difficulty - (level || 1));
      if (d > 2) return false;
      if (excludeIds && excludeIds.indexOf(a.id) >= 0) return false;
      return true;
    });
    if (!pool.length) pool = ACTIVITIES.slice();
    pool.sort(function (a, b) {
      return Math.abs(a.difficulty - (level || 1)) - Math.abs(b.difficulty - (level || 1));
    });
    var top = pool.slice(0, Math.max(3, Math.ceil(pool.length / 2)));
    return top[Math.floor(Math.random() * top.length)];
  }

  global.Data = {
    activities: ACTIVITIES,
    byId: function (id) { return byId[id]; },
    byArea: function (area) { return byArea[area] || []; },
    areas: AREA_INFO,
    forAge: forAge,
    pickFor: pickFor,
    count: ACTIVITIES.length
  };
})(window);
