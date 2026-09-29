export interface CardPointValue {
  card: string;
  points: string;
}

export interface ExtraGameRule {
  id: string;
  title: string;
  subtitle: string;
  category: 'bazas' | 'descarte' | 'apuestas' | 'familia';
  categoryLabel: string;
  players: string;
  deck: string;
  objective: string;
  cardValues?: CardPointValue[];
  rules: {
    heading: string;
    text: string;
  }[];
  scoring: string[];
  howToWin: string;
  tips: string[];
  suggestedTargetScore?: number;
  isCountdown?: boolean;
}

export const EXTRA_GAMES_RULES: ExtraGameRule[] = [
  {
    id: 'el-culo',
    title: 'El Culo (Presidente)',
    subtitle: 'Empieza el 3 de Oros · El 2 de Oros cierra todo · El 2 es la más alta',
    category: 'descarte',
    categoryLabel: 'Descarte y Rangos',
    players: '3 a 8 jugadores (ideal 4 a 6)',
    deck: 'Baraja española de 40 cartas',
    objective: 'Deshacerte de todas tus cartas lo antes posible para proclamarte Presidente y evitar quedar el último (el Culo).',
    cardValues: [
      { card: '2 de Oros (⭐ Cierra Todo)', points: 'Carta suprema: limpia la mesa y vuelve a salir' },
      { card: 'Los demás 2 (Copas, Espadas, Bastos)', points: 'Las cartas ordinarias más altas' },
      { card: '1 (Ases)', points: '2ª más alta (superan a los Reyes)' },
      { card: 'Rey (12)', points: '3ª más alta' },
      { card: 'Caballo (11)', points: '4ª más alta' },
      { card: 'Sota (10)', points: '5ª más alta' },
      { card: '7, 6, 5, 4', points: 'Valores intermedios descendentes' },
      { card: '3 (Treses)', points: 'La carta más baja (el 3 de Oros inicia)' },
    ],
    rules: [
      {
        heading: 'Quién empieza: El 3 de Oros',
        text: 'Al comenzar la primera partida, sale obligatoriamente el jugador que tenga el 3 de Oros. Puede tirarlo solo, o acompañado de otros treses (pareja, trío o cuarteto de treses).',
      },
      {
        heading: 'Jerarquía de cartas (El 2 es la más alta)',
        text: 'El orden de mayor a menor es: 2 > 1 (As) > Rey (12) > Caballo (11) > Sota (10) > 7 > 6 > 5 > 4 > 3 (el 3 es la peor carta). Para superar una jugada, hay que tirar el mismo número de cartas (una sola, pareja o trío) pero de número SUPERIOR.',
      },
      {
        heading: '¡El 2 de Oros cierra todo!',
        text: 'El 2 de Oros es la carta todopoderosa del juego. Al tirarlo sobre la mesa, automáticamente "cierra todo": el montón de cartas se retira de inmediato, la mesa queda limpia y el jugador que tiró el 2 de Oros vuelve a salir con la carta o combinación que prefiera.',
      },
      {
        heading: 'Dinámica y Pasar Turno',
        text: 'Por turno, los jugadores tiran cartas superiores o pasan diciendo "Paso". Pasar no impide volver a tirar si el turno vuelve a llegar. Si todos los demás pasan consecutivamente, el montón se limpia ("se quema") y el último en tirar vuelve a salir.',
      },
      {
        heading: 'Cuartetos (Limpiar montón)',
        text: 'Si se juegan 4 cartas del mismo número juntas (o 4 consecutivas en la mesa), el montón también se limpia de inmediato y sale quien tiró la cuarta carta.',
      },
      {
        heading: 'Rangos al terminar la mano',
        text: 'Según el orden en que se van quedando sin cartas: 1º Presidente (o Gran Culo), 2º Vicepresidente, intermedios Neutros, penúltimo Viceculo, y el último jugador con cartas es "El Culo".',
      },
      {
        heading: 'El Intercambio de cartas (Impuestos)',
        text: 'En la siguiente ronda, antes de jugar: El Culo debe entregar sus 2 cartas MÁS ALTAS al Presidente, y el Presidente le devuelve 2 cartas cualesquiera que no quiera. El Viceculo le da su carta más alta al Vicepresidente, y el Vicepresidente le devuelve 1 que no quiera. Además, ¡el Culo reparte las cartas!',
      },
    ],
    scoring: [
      'Presidente: +3 puntos por ronda ganada.',
      'Vicepresidente: +2 puntos.',
      'Neutros: +1 punto.',
      'Viceculo / Culo: 0 puntos.',
      'En Mesa Libre se puede jugar a llegar a 15 o 20 puntos, o registrar las veces que cada uno ha sido Presidente o Culo.',
    ],
    howToWin: 'Gana la partida quien acumule más puntos de Presidente o sea el primero en alcanzar la puntuación meta.',
    tips: [
      'Guarda el 2 de Oros para un momento crítico en el que quieras recuperar el turno o salvarte de cartas malas.',
      'Si tienes parejas o tríos de cartas bajas (como 4s o 5s), intenta sacarlas de mano cuando salgas tú.',
      'El intercambio de cartas condena al Culo si no juega con picardía sus cartas intermedias.',
    ],
    suggestedTargetScore: 15,
    isCountdown: false,
  },
  {
    id: 'brisca',
    title: 'La Brisca',
    subtitle: 'El clásico de bazas con triunfo y cartas de gran valor',
    category: 'bazas',
    categoryLabel: 'Bazas y Triunfos',
    players: '2, 3 o 4 jugadores (individual o parejas de 2 contra 2)',
    deck: 'Baraja española de 40 cartas',
    objective: 'Conseguir el mayor número de puntos posibles ganando bazas que contengan cartas valiosas. Hay 120 puntos en total en juego.',
    cardValues: [
      { card: 'As', points: '11 puntos' },
      { card: 'Tres', points: '10 puntos' },
      { card: 'Rey (12)', points: '4 puntos' },
      { card: 'Caballo (11)', points: '3 puntos' },
      { card: 'Sota (10)', points: '2 puntos' },
      { card: '7, 6, 5, 4, 2 (blancas)', points: '0 puntos' },
    ],
    rules: [
      {
        heading: 'Reparto y Pinta (Triunfo)',
        text: 'Se reparten 3 cartas a cada jugador. Se deja el mazo en el centro y se descubre la siguiente carta boca arriba, colocándola cruzada bajo el mazo: su palo es el "Triunfo" o "Pinta" durante toda la mano.',
      },
      {
        heading: 'Dinámica de las bazas',
        text: 'Sale el jugador mano tirando una carta. Cada jugador echa una carta. NO es obligatorio asistir al palo de salida ni montar la carta más alta. El triunfo supera a cualquier carta de otro palo. Si no hay triunfo, gana la carta más alta del palo de salida.',
      },
      {
        heading: 'Robo y salida',
        text: 'El ganador de la baza recoge las cartas y roba la primera carta del mazo. Después roban los demás en orden. Quien ganó la baza sale en la siguiente ronda.',
      },
      {
        heading: 'El cambio del Triunfo (Pinta)',
        text: 'Quien tenga el 7 del palo de triunfo puede cambiarlo por la carta de muestra boca arriba si ésta es As, 3 o una figura. Si la descubierta es un 7 o inferior, puede cambiarse por el 2 de triunfo.',
      },
    ],
    scoring: [
      'As = 11 pts, Tres = 10 pts, Rey = 4 pts, Caballo = 3 pts, Sota = 2 pts.',
      'Total de puntos en la baraja: 120 puntos.',
      'Superar 60 puntos da la victoria (ej. 61 puntos o más). En caso de empate a 60-60 no gana nadie.',
    ],
    howToWin: 'Gana la partida quien consiga más de 60 puntos al final de la mano (o quien gane 2 o 3 partidas convenidas).',
    tips: [
      'Guarda tus triunfos para matar los Ases y Treses de los contrarios.',
      'Si tu compañero va a ganar la baza, échale tus cartas de mayor valor (cárgale puntos).',
      'Cambiar el triunfo a tiempo te asegura tener una carta alta en la mano.',
    ],
    suggestedTargetScore: 61,
    isCountdown: false,
  },
  {
    id: 'guinote',
    title: 'El Guiñote',
    subtitle: 'Pasión aragonesa con arrastre, 10 de últimas y cantes con la Sota',
    category: 'bazas',
    categoryLabel: 'Bazas y Cantes',
    players: '4 jugadores (2 parejas enfrentadas) o 2 individuales',
    deck: 'Baraja española de 40 cartas',
    objective: 'Alcanzar 101 tantos (o ganar 2 cotos de 3 juegos) sumando puntos de bazas, cantes de las 40 y las 20, y las diez de monte.',
    cardValues: [
      { card: 'As', points: '11 puntos' },
      { card: 'Tres', points: '10 puntos' },
      { card: 'Rey (12)', points: '4 puntos' },
      { card: 'Caballo (11)', points: '3 puntos' },
      { card: 'Sota (10)', points: '2 puntos' },
      { card: '7, 6, 5, 4, 2', points: '0 puntos' },
    ],
    rules: [
      {
        heading: 'Reparto y Triunfo',
        text: 'Se reparten 6 cartas a cada jugador (de 3 en 3). Se levanta la carta de triunfo bajo el mazo. Hay 2 fases diferenciadas: fase con mazo y fase de arrastre.',
      },
      {
        heading: 'Primera Fase (Con Mazo)',
        text: 'No es obligatorio asistir al palo ni montar. Cada jugador tira una carta, gana la baza la carta más alta o el triunfo más alto, y cada uno roba una carta del mazo.',
      },
      {
        heading: 'Los Cantes (Rey + Sota)',
        text: 'Tras ganar una baza, un jugador puede cantar si posee el Rey y la Sota del mismo palo: Las Cuarenta (+40 pts) en triunfo, o Las Veinte (+20 pts) en otro palo. En Guiñote el cante se hace con la Sota (a diferencia del Tute que es con Caballo).',
      },
      {
        heading: 'Segunda Fase (El Arrastre)',
        text: 'Cuando se agota el mazo, se entra en "el arrastre": es ESTRICTAMENTE OBLIGATORIO asistir al palo jugado, montar (superar con carta más alta) y fallar con triunfo si no se tiene del palo.',
      },
      {
        heading: 'Diez de Últimas (Diez de Monte)',
        text: 'La pareja que gane la última baza de la partida suma 10 puntos extra a su recuento de cartas.',
      },
    ],
    scoring: [
      '120 puntos en cartas + 10 de últimas = 130 puntos por partida.',
      'Cantes de 40 (triunfo) y de 20 (otros palos) se suman al marcador.',
      'Las partidas se juegan habitualmente a 101 tantos (llamadas buenas).',
    ],
    howToWin: 'Gana la pareja que primero alcance 101 tantos o gane el coto pactado.',
    tips: [
      'Memoriza los triunfos y Ases que van cayendo.',
      'En el arrastre, guarda un triunfo dominante para no ser arrastrado por el rival.',
      'Cantar las 40 al principio condiciona y asusta a los oponentes.',
    ],
    suggestedTargetScore: 101,
    isCountdown: false,
  },
  {
    id: 'pocha',
    title: 'La Pocha',
    subtitle: 'El emocionante juego de predecir exactamente tus bazas',
    category: 'bazas',
    categoryLabel: 'Predicción de Bazas',
    players: '3 a 8 jugadores (ideal 4 a 6, individual)',
    deck: 'Baraja española de 40 cartas',
    objective: 'Adivinar con absoluta exactitud cuántas bazas vas a ganar en cada mano. ¡Hacer una baza de más o de menos te resta puntos!',
    cardValues: [
      { card: 'Orden de cartas', points: 'As > Tres > Rey > Caballo > Sota > 7 > 6 > 5 > 4 > 2' },
      { card: 'Triunfo', points: 'Supera a cualquier carta de otro palo' },
    ],
    rules: [
      {
        heading: 'Estructura de Rondas (Subida y Bajada)',
        text: 'En la ronda 1 se reparte 1 carta por jugador. En la ronda 2, dos cartas... y así sucesivamente hasta repartir toda la baraja ("la mano de todas"). Luego va bajando de una en una hasta llegar de nuevo a 1 carta.',
      },
      {
        heading: 'La Petición y la Prohibición del Postre',
        text: 'Se levanta el triunfo. En orden, cada jugador declara en voz alta cuántas bazas promete ganar. El repartidor (el postre) pide el último y TIENE PROHIBIDO pedir un número que haga que la suma total sea igual al número de cartas de la mano. ¡Siempre habrá alguien que falle!',
      },
      {
        heading: 'Obligaciones de juego',
        text: 'Es obligatorio asistir al palo de salida, montar si se puede y fallar con triunfo si no se tiene del palo.',
      },
    ],
    scoring: [
      'Acierto exacto: 10 puntos fijos + 5 puntos por cada baza conseguida.',
      'Fallo: -5 puntos por cada baza de diferencia con lo que pediste (sea por exceso o por defecto).',
      'Ejemplo: Si pediste 2 bazas y haces 2 -> 10 + 10 = 20 pts. Si haces 3 -> -5 pts. Si haces 0 -> -10 pts.',
    ],
    howToWin: 'Gana quien acumule más puntos al completarse todas las rondas de subida y bajada.',
    tips: [
      'Si tienes cartas bajas y no quieres bazas, pide 0 ("me voy a cero") y juega cartas intermedias cuando otros lleven triunfo.',
      'Forzar al postre a asumir bazas incómodas es la clave psicológica de la Pocha.',
    ],
    suggestedTargetScore: 0,
    isCountdown: false,
  },
  {
    id: 'cinquillo',
    title: 'El Cinquillo y Cinquillo Cabrón',
    subtitle: 'Coloca escaleras a partir de los 5 y ahoga a tus rivales',
    category: 'descarte',
    categoryLabel: 'Descarte y Escaleras',
    players: '3 a 6 jugadores (individual)',
    deck: 'Baraja española de 40 cartas',
    objective: 'Ser el primer jugador en colocar todas las cartas de tu mano sobre el tapete.',
    rules: [
      {
        heading: 'Reparto',
        text: 'Se barajan y se reparten todas las cartas entre los jugadores lo más equitativamente posible.',
      },
      {
        heading: 'Inicio con el 5 de Oros',
        text: 'Empieza la partida quien tenga el 5 de Oros, colocándolo en el centro de la mesa.',
      },
      {
        heading: 'Turno de colocación',
        text: 'En su turno, cada jugador solo puede colocar una carta: o bien sacar otro 5 (de Copas, Espadas o Bastos), o continuar una serie ya abierta con la carta inmediatamente superior (ej. el 6) o inferior (ej. el 4) del mismo palo.',
      },
      {
        heading: 'Pasar turno (Cinquillo Clásico vs Cabrón)',
        text: 'En el Cinquillo Clásico, si puedes poner una carta, es OBLIGATORIO ponerla; solo pasas si no tienes ninguna válida. En la variante "Cinquillo Cabrón", se permite pasar voluntariamente teniendo cartas válidas para guardarte cartas clave y bloquear a los rivales.',
      },
    ],
    scoring: [
      'El primer jugador que se quede sin cartas gana la mano (+5 o +10 puntos o las fichas del pozo).',
      'En anotador libre, se suele anotar 1 punto por cada mano ganada, o penalizar a los rivales con 1 punto por carta restante en mano.',
    ],
    howToWin: 'Gana quien gane un número determinado de manos (ej. 5 manos) o acumule menos cartas de castigo.',
    tips: [
      'Retén los 5 de los palos donde tengas los extremos (Ases y Reyes) para que nadie pueda avanzar.',
      'Si tienes el 6 y el 4 de un palo, al colocar uno obligas al rival a abrirte el paso.',
    ],
    suggestedTargetScore: 5,
    isCountdown: false,
  },
  {
    id: 'truco',
    title: 'El Truco (Argentino / Valenciano)',
    subtitle: 'El juego de engaño, señas, envido y picardía por excelencia',
    category: 'apuestas',
    categoryLabel: 'Farol y Bazas',
    players: '2, 4 (2 parejas) o 6 jugadores',
    deck: 'Baraja de 40 cartas (sin 8 ni 9)',
    objective: 'Llegar a 30 puntos (divididos en 15 "malas" y 15 "buenas") mediante apuestas de Envido y bazas de Truco.',
    cardValues: [
      { card: '1 de Espadas (Macho / Espadilla)', points: 'Carta más alta del juego' },
      { card: '1 de Bastos (Bastillo)', points: '2ª más alta' },
      { card: '7 de Espadas (Manilla espada)', points: '3ª más alta' },
      { card: '7 de Oros (Manilla oro)', points: '4ª más alta' },
      { card: 'Los 3 (todos)', points: '5º lugar' },
      { card: 'Los 2 (todos)', points: '6º lugar' },
      { card: 'Ases falsos (Copas y Oros)', points: '7º lugar' },
      { card: 'Reyes (12), Caballos (11), Sotas (10)', points: 'Siguientes en orden descendente' },
      { card: '7s falsos (Copas y Bastos), 6, 5, 4', points: 'Cartas más bajas' },
    ],
    rules: [
      {
        heading: 'Reparto y Bazas',
        text: 'Se reparten 3 cartas a cada jugador. Se juegan 3 bazas. La pareja que gane 2 de las 3 bazas gana el "Truco".',
      },
      {
        heading: 'El Envido (Puntos de mano)',
        text: 'Antes de jugar cartas de baza, se puede cantar "Envido". Se suman los puntos de dos cartas del mismo palo sumando 20 + sus valores faciales (figuras valen 0). Envido vale 2 pts, Real Envido vale 3 pts, Falta Envido vale los puntos restantes para ganar.',
      },
      {
        heading: 'El Truco, Retruco y Vale Cuatro',
        text: 'Durante las bazas se puede cantar: ¡Truco! (vale 2 puntos si se acepta, 1 si se rechaza). Se puede responder ¡Retruco! (3 puntos) y ¡Vale Cuatro! (4 puntos).',
      },
      {
        heading: 'Señas tradicionales',
        text: 'Macho (guiñar un ojo), Bastillo (guiñar el otro ojo), 7 de espadas (torcer boca a la derecha), 7 de oros (torcer a la izquierda), Treses (morder labio inferior), Dos (beso / labios juntos).',
      },
    ],
    scoring: [
      'Envido no querido = 1 punto. Envido querido = 2 puntos (o más).',
      'Truco querido = 2 puntos. Retruco = 3 puntos. Vale Cuatro = 4 puntos.',
      'Partida a 30 tantos (15 malas y 15 buenas).',
    ],
    howToWin: 'La primera pareja en sumar 30 tantos gana la partida.',
    tips: [
      'Farolear ("mentir") es indispensable: cantar truco con cartas malas para que el rival tire sus cartas.',
      'Aprende a comunicarte con tu compañero con señas discretas.',
    ],
    suggestedTargetScore: 30,
    isCountdown: false,
  },
  {
    id: 'sieteymedia',
    title: 'Siete y Media',
    subtitle: 'El clásico de apuestas rápidas contra la Banca',
    category: 'apuestas',
    categoryLabel: 'Apuestas y Cálculo',
    players: '2 a 8 jugadores',
    deck: 'Baraja española de 40 cartas',
    objective: 'Sumar exactamente 7 y media con tus cartas, o acercarse lo más posible sin sobrepasar esa cifra.',
    cardValues: [
      { card: 'As al 7', points: 'Su valor nominal (1 a 7 puntos)' },
      { card: 'Sota, Caballo, Rey (10, 11, 12)', points: 'Medio punto (0.5 pts) cada una' },
    ],
    rules: [
      {
        heading: 'La Banca y el Reparto',
        text: 'Un jugador ejerce de Banca. Reparte 1 carta cubierta a cada jugador. Cada jugador mira su carta y realiza su apuesta.',
      },
      {
        heading: 'Pedir Carta o Plantarse',
        text: 'Por turno, el jugador puede pedir cartas adicionales que se entregan descubiertas ("¡Carta!"). Si la suma supera 7.5, el jugador "se pasa", pierde su apuesta al instante y devuelve sus cartas. Si decide detenerse dice "¡Me planto!".',
      },
      {
        heading: 'Turno de la Banca',
        text: 'Una vez todos los jugadores se han plantado o pasado, la banca descubre su carta oculta y juega para sí misma. La banca gana a todos los que tengan igual o menor puntuación que ella.',
      },
      {
        heading: 'Siete y Media Real',
        text: 'Si un jugador consigue 7 y media con solo 2 cartas (ej. un 7 y una figura), cobra el doble de su apuesta y pasa a ser la nueva Banca en la siguiente mano.',
      },
    ],
    scoring: [
      'Ganar a la banca: cobra 1 a 1 su apuesta.',
      'Siete y media con 2 cartas: cobra 2 a 1.',
      'En el tanteador libre, se registran las fichas o puntos acumulados por cada jugador.',
    ],
    howToWin: 'Gana el jugador que acumule más fichas o dinero tras un número fijo de rondas.',
    tips: [
      'Con 6 o 6.5 suele ser conveniente plantarse si la banca no tiene carta vista alta.',
      'Las figuras valen 0.5 y permiten ajustar sumas milimétricas.',
    ],
    suggestedTargetScore: 50,
    isCountdown: false,
  },
  {
    id: 'continental',
    title: 'El Continental',
    subtitle: 'Rummy con baraja española y contratos progresivos por manos',
    category: 'descarte',
    categoryLabel: 'Combinaciones Rummy',
    players: '2 a 6 jugadores',
    deck: '2 barajas españolas de 40 cartas (80 cartas) con 4 comodines',
    objective: 'Cumplir el contrato obligatorio de cada una de las 7 manos y cerrar descartándote de todas tus cartas.',
    rules: [
      {
        heading: 'Los 7 Contratos Obligatorios',
        text: 'Mano 1: Dos tríos (6 cartas) · Mano 2: Un trío y una escalera (7 cartas) · Mano 3: Dos escaleras (8 cartas) · Mano 4: Tres tríos (9 cartas) · Mano 5: Dos tríos y una escalera (10 cartas) · Mano 6: Un trío y dos escaleras (11 cartas) · Mano 7: Tres escaleras completas (12 cartas sin descarte).',
      },
      {
        heading: 'Robo y Compra fuera de turno',
        text: 'En tu turno robas del mazo o del pozo. Si un jugador no está en turno pero quiere la carta del pozo, puede pedir "Compro", llevándose esa carta más una de penalización del mazo si nadie anterior la quiere.',
      },
      {
        heading: 'Bajar y Cerrar',
        text: 'No puedes bajar cartas sueltas hasta que no bajes tu contrato completo de una sola vez. Una vez bajado, en siguientes turnos puedes colocar cartas en las combinaciones tuyas o de los rivales hasta quedarte sin cartas.',
      },
    ],
    scoring: [
      'Quien cierra la mano anota 0 puntos.',
      'Los demás suman el valor de sus cartas no ligadas: Comodín = 25 pts, As = 11 pts, Figuras = 10 pts, números su valor.',
      'Gana quien tenga MENOS puntos acumulados tras las 7 manos.',
    ],
    howToWin: 'Gana el jugador con la puntuación acumulada más baja tras completar los 7 contratos.',
    tips: [
      'No compres a menos que la carta te complete de inmediato una combinación.',
      'Deshazte primero de figuras y ases si ves que un rival está a punto de cerrar.',
    ],
    suggestedTargetScore: 0,
    isCountdown: false,
  },
  {
    id: 'burro',
    title: 'El Burro',
    subtitle: 'Velocidad, reflejos y carcajadas para toda la familia',
    category: 'familia',
    categoryLabel: 'Fiesta y Reflejos',
    players: '3 a 8 jugadores',
    deck: 'Baraja española (se usan 4 cartas del mismo número por cada jugador presente)',
    objective: 'Reunir 4 cartas iguales en la mano antes que nadie y ser rápido poniendo la mano en el centro.',
    rules: [
      {
        heading: 'Preparación',
        text: 'Por cada jugador presente se escoge un cuarteto de cartas (ej. para 4 jugadores: los 4 Ases, los 4 Reyes, los 4 Caballos y las 4 Sotas). Se barajan y se reparten 4 cartas a cada jugador.',
      },
      {
        heading: '¡Uno, dos y tres!',
        text: 'Todos los jugadores a la vez cantan "¡Uno, dos y tres!" y pasan una carta boca abajo al jugador de su derecha, recogiendo la que le pasa el de su izquierda.',
      },
      {
        heading: '¡BURRO!',
        text: 'En el momento en que un jugador consiga tener en su mano las 4 cartas del mismo número, pone su mano en el centro de la mesa y grita "¡BURRO!" (o se queda en silencio fingiendo despiste). Todos los demás deben colocar su mano encima lo más rápido posible.',
      },
      {
        heading: 'Letras de penalización',
        text: 'El último jugador en poner la mano recibe una letra de la palabra B - U - R - R - O. Si alguien pone la mano sin que nadie tuviese 4 iguales (falsa alarma), ese jugador se lleva la letra.',
      },
    ],
    scoring: [
      'Cada derrota añade una letra: B -> U -> R -> R -> O (5 faltas).',
      'En Mesa Libre, se puede usar en modo cuenta atrás (de 5 a 0) o sumando faltas hasta 5.',
    ],
    howToWin: 'El jugador que complete la palabra B-U-R-R-O queda eliminado. Gana el último superviviente.',
    tips: [
      'Presta atención a la mano de enfrente; a veces alguien reúne 4 cartas y pone la mano despacio para pillar a todos desprevenidos.',
    ],
    suggestedTargetScore: 5,
    isCountdown: true,
  },
  {
    id: 'mentiroso',
    title: 'El Mentiroso',
    subtitle: 'Detecta los faroles y vacía tu mano antes que nadie',
    category: 'apuestas',
    categoryLabel: 'Faroles y Descarte',
    players: '3 a 6 jugadores',
    deck: 'Baraja española de 40 cartas',
    objective: 'Deshacerse de todas las cartas de la mano sin que te pillen mintiendo.',
    rules: [
      {
        heading: 'Reparto inicial',
        text: 'Se baraja y se reparten todas las cartas de la baraja entre los jugadores.',
      },
      {
        heading: 'Tirar cartas boca abajo',
        text: 'El jugador inicial echa de 1 a 3 cartas boca abajo en el centro de la mesa diciendo en voz alta qué cartas son (ej. "van dos caballos"). Puede decir la verdad o mentir completamente.',
      },
      {
        heading: 'Continuar o Dudar ("¡Mentira!")',
        text: 'El siguiente jugador puede: a) Creerlo y tirar más cartas declarando el mismo número (ej. "y otro caballo"), o b) Decir "¡Mentira!" y levantar las cartas que acaba de tirar el anterior.',
      },
      {
        heading: 'Resolución de la mentira',
        text: 'Si las cartas levantadas NO eran las declaradas (era mentira), el jugador que mintió se come TODO el montón acumulado. Si eran de verdad las declaradas, el jugador que dudó se come todo el montón acumulado.',
      },
    ],
    scoring: [
      'Gana quien se quede sin cartas en la mano.',
      'En Mesa Libre, anota 1 punto al ganador de cada mano.',
    ],
    howToWin: 'El primer jugador que consiga quedarse sin ninguna carta en la mano se proclama vencedor.',
    tips: [
      'Si tienes 3 cartas del mismo número en mano y alguien dice que tira 2 de ese número, ¡sabes con seguridad matemática que miente!',
    ],
    suggestedTargetScore: 5,
    isCountdown: false,
  },
  {
    id: 'cuarenta',
    title: 'La Cuarenta',
    subtitle: 'Estrategia y capturas con caída, limpia y rondas',
    category: 'bazas',
    categoryLabel: 'Capturas y Puntos',
    players: '2 jugadores o 4 (en 2 parejas)',
    deck: 'Baraja de 40 cartas (sin 8s ni 9s)',
    objective: 'Ser la primera persona o pareja en sumar 40 puntos a base de caídas, limpias y sumas.',
    rules: [
      {
        heading: 'Reparto',
        text: 'Se reparten 5 cartas a cada jugador. Las cartas se juegan sobre la mesa una a una.',
      },
      {
        heading: 'Caída (+2 puntos)',
        text: 'Si juegas una carta de idéntico valor a la carta que acaba de tirar el oponente anterior a ti, haces "Caída" y te anotas 2 puntos.',
      },
      {
        heading: 'Limpia (+2 puntos)',
        text: 'Si al capturar cartas levantas todas las cartas presentes en la mesa, haces "Limpia" y te anotas 2 puntos adicionales.',
      },
      {
        heading: 'Rondas en mano',
        text: 'Tener 3 cartas del mismo número al recibir la mano da "Ronda" (+2 puntos). Tener 4 cartas iguales da "Doble Ronda" (+4 puntos).',
      },
      {
        heading: 'Cartas por pasada',
        text: 'Al final de la mano se cuentan las cartas acumuladas. Las parejas que superen 19 cartas reciben puntos adicionales ("dos por pasada").',
      },
    ],
    scoring: [
      'Caída = +2 puntos · Limpia = +2 puntos · Caída y Limpia juntos = +4 puntos.',
      'Ronda = +2 puntos · Doble Ronda = +4 puntos.',
      'Se juega a 40 puntos exactos.',
    ],
    howToWin: 'Gana quien primero alcance los 40 puntos ("chico ganado"). Habitualmente se juega a ganar 2 chicos.',
    tips: [
      'Fíjate siempre en la carta que tira el rival de la derecha para intentar hacer caída inmediata.',
    ],
    suggestedTargetScore: 40,
    isCountdown: false,
  },
  {
    id: 'remigio',
    title: 'El Remigio (Rabino)',
    subtitle: 'Ligas de cartas, descarte y límite de eliminación a 101 puntos',
    category: 'descarte',
    categoryLabel: 'Ligas y Escaleras',
    players: '2 a 5 jugadores',
    deck: 'Baraja de 40 cartas con comodines (o 2 barajas)',
    objective: 'Ligar las 10 cartas de tu mano en series del mismo número o escaleras del mismo palo para cerrar y sumar 0.',
    rules: [
      {
        heading: 'Reparto y Dinámica',
        text: 'Se reparten 10 cartas a cada jugador. Por turno se roba una carta del mazo o del pozo y se descarta una carta al pozo.',
      },
      {
        heading: 'Condiciones de Cierre',
        text: 'Para cerrar hay que tener ligadas todas las cartas (salvo un máximo residual acordado de 3 o 5 puntos). Si cierras con todas las cartas ligadas, anotas 0 puntos.',
      },
      {
        heading: 'El Remigio Directo',
        text: 'Ligar las 10 cartas en una sola combinación o escalera consecutiva se llama "Remigio" y gana la partida directamente eliminando a los demás.',
      },
    ],
    scoring: [
      'Quien cierra anota 0 puntos.',
      'Los demás jugadores suman el valor de sus cartas no ligadas.',
      'El límite de eliminación suele situarse en 101 puntos.',
    ],
    howToWin: 'Gana el último superviviente que no haya superado los 101 puntos de penalización.',
    tips: [
      'Vigila las cartas que descartan tus oponentes para no darles la carta que necesitan para cerrar.',
    ],
    suggestedTargetScore: 101,
    isCountdown: false,
  },
];
