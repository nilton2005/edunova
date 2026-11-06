import type { AgeTier, DiagnosticQuestion } from '../../../../packages/shared-types/edunova-contract';

export interface InternalDiagnosticQuestion extends DiagnosticQuestion {
  correctIndex: number;
}

export const DIAGNOSTIC_QUESTIONS: InternalDiagnosticQuestion[] = [
  // Nivel Explorador (7 a 9 años) - 3 preguntas (comprensión lectora y matemática básica)
  {
    id: 'diag-exp-1',
    tier: 'EXPLORADOR_7_9',
    prompt: 'En una laguna tranquila viven tres patitos y una rana verde. Cada mañana nadan juntos hasta la orilla grande. ¿Quiénes nadan juntos por la mañana?',
    options: [
      'Tres peces y un pato',
      'Tres patitos y una rana verde',
      'Dos ranas y un patito',
      'Cuatro patitos solamente',
    ],
    correctIndex: 1,
  },
  {
    id: 'diag-exp-2',
    tier: 'EXPLORADOR_7_9',
    prompt: 'Si tienes 5 manzanas en una cesta y compras 4 manzanas más, ¿cuántas manzanas tienes en total?',
    options: [
      '7 manzanas',
      '8 manzanas',
      '9 manzanas',
      '10 manzanas',
    ],
    correctIndex: 2,
  },
  {
    id: 'diag-exp-3',
    tier: 'EXPLORADOR_7_9',
    prompt: 'Lucas guardó sus lápices en la mochila antes de salir al parque porque iba a llover. ¿Por qué guardó los lápices?',
    options: [
      'Porque tenía hambre',
      'Porque iba a llover',
      'Porque era de noche',
      'Porque se le rompieron',
    ],
    correctIndex: 1,
  },

  // Nivel Aventurero (10 a 12 años) - 3 preguntas (comprensión lectora y matemática básica)
  {
    id: 'diag-ave-1',
    tier: 'AVENTURERO_10_12',
    prompt: 'Las abejas obreras viajan kilómetros buscando flores. Al volver a la colmena, realizan una danza especial que indica a sus compañeras la dirección y distancia exacta del alimento. ¿Para qué realizan la danza?',
    options: [
      'Para asustar a los intrusos',
      'Para calentar la colmena',
      'Para comunicar dónde hay alimento',
      'Para elegir a una nueva reina',
    ],
    correctIndex: 2,
  },
  {
    id: 'diag-ave-2',
    tier: 'AVENTURERO_10_12',
    prompt: 'Un paquete contiene 6 cajas y cada caja trae 8 lápices de colores. ¿Cuántos lápices hay en total en el paquete?',
    options: [
      '42 lápices',
      '48 lápices',
      '54 lápices',
      '14 lápices',
    ],
    correctIndex: 1,
  },
  {
    id: 'diag-ave-3',
    tier: 'AVENTURERO_10_12',
    prompt: 'El agua líquida puede evaporarse con el calor y convertirse en vapor. Cuando el vapor sube y se enfría en la atmósfera, forma pequeñas gotas que componen las nubes. Según el texto, ¿cómo se forman las nubes?',
    options: [
      'Por el viento que sopla sobre los océanos',
      'Por el enfriamiento del vapor en la atmósfera',
      'Por el calor directo del sol sobre las montañas',
      'Por la mezcla de humo y polvo en el aire',
    ],
    correctIndex: 1,
  },

  // Nivel Creador (13 a 15 años) - 3 preguntas (comprensión lectora y matemática básica)
  {
    id: 'diag-cre-1',
    tier: 'CREADOR_13_15',
    prompt: 'La fotosíntesis es el proceso biológico mediante el cual las plantas capturan la energía lumínica y la convierten en energía química, transformando dióxido de carbono y agua en glucosa y oxígeno. De acuerdo con el texto, ¿cuál es uno de los productos resultantes de este proceso?',
    options: [
      'Dióxido de carbono',
      'Energía lumínica',
      'Oxígeno',
      'Suelo fértil',
    ],
    correctIndex: 2,
  },
  {
    id: 'diag-cre-2',
    tier: 'CREADOR_13_15',
    prompt: 'Un tren viaja a una velocidad constante de 75 km/h. Si mantiene el mismo ritmo durante 3 horas y media (3.5 horas), ¿qué distancia habrá recorrido?',
    options: [
      '225 km',
      '250 km',
      '262.5 km',
      '275 km',
    ],
    correctIndex: 2,
  },
  {
    id: 'diag-cre-3',
    tier: 'CREADOR_13_15',
    prompt: 'Aunque la invención de la imprenta facilitó la reproducción masiva de libros, la difusión del conocimiento continuó dependiendo de la alfabetización y del acceso económico de las poblaciones. ¿Qué conclusión se desprende del texto?',
    options: [
      'La tecnología por sí sola no bastó para que el conocimiento llegara a todos',
      'La imprenta impidió que las personas aprendieran a leer',
      'Los libros se volvieron gratuitos inmediatamente después de la imprenta',
      'Solo los inventores podían acceder al conocimiento impreso',
    ],
    correctIndex: 0,
  },
];

export function getPublicDiagnosticQuestions(): DiagnosticQuestion[] {
  return DIAGNOSTIC_QUESTIONS.map(({ id, tier, prompt, options }) => ({
    id,
    tier,
    prompt,
    options,
  }));
}

