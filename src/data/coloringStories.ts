// Bible story coloring pages for Aviva Kids.
// Each page is simple original line art on a 400 x 320 canvas.
// "fill" shapes are tappable regions; "line" shapes are outline-only details.
// Verses: NIV (English) and RVR1960 (Spanish).

export type Shape =
  | { kind: 'path'; d: string; line?: boolean }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx?: number };

export interface ColoringStory {
  id: string;
  title: { en: string; es: string };
  verse: { en: string; es: string };
  ref: { en: string; es: string };
  shapes: Shape[];
}

const p = (d: string): Shape => ({ kind: 'path', d });
const ln = (d: string): Shape => ({ kind: 'path', d, line: true });
const c = (cx: number, cy: number, r: number): Shape => ({ kind: 'circle', cx, cy, r });
const e = (cx: number, cy: number, rx: number, ry: number): Shape => ({ kind: 'ellipse', cx, cy, rx, ry });
const r = (x: number, y: number, w: number, h: number, rx?: number): Shape => ({ kind: 'rect', x, y, w, h, rx });

const sky = r(2, 2, 396, 316, 14);
const sea = (y: number) =>
  p(`M2,${y} q33,-14 66,0 t66,0 t66,0 t66,0 t66,0 t66,0 V304 a14,14 0 0 1 -14,14 H16 a14,14 0 0 1 -14,-14 z`);
const band = (R: number, rr: number) =>
  p(`M${200 - R},200 A${R},${R} 0 0 1 ${200 + R},200 L${200 + rr},200 A${rr},${rr} 0 0 0 ${200 - rr},200 Z`);
const star = (x: number, y: number, s: number) =>
  p(`M${x},${y - s} L${x + s * 0.3},${y - s * 0.3} L${x + s},${y} L${x + s * 0.3},${y + s * 0.3} L${x},${y + s} L${x - s * 0.3},${y + s * 0.3} L${x - s},${y} L${x - s * 0.3},${y - s * 0.3} Z`);

export const COLORING_STORIES: ColoringStory[] = [
  {
    id: 'creation',
    title: { en: 'God Made the World', es: 'Dios Creó el Mundo' },
    verse: {
      en: '“In the beginning God created the heavens and the earth.”',
      es: '“En el principio creó Dios los cielos y la tierra.”',
    },
    ref: { en: 'Genesis 1:1', es: 'Génesis 1:1' },
    shapes: [
      p('M16,2 H200 V318 H16 a14,14 0 0 1 -14,-14 V16 a14,14 0 0 1 14,-14 Z'),
      p('M200,2 H384 a14,14 0 0 1 14,14 V304 a14,14 0 0 1 -14,14 H200 Z'),
      c(90, 70, 34),
      p('M330,40 a34,34 0 1 0 22,60 a28,28 0 1 1 -22,-60 Z'),
      star(250, 60, 12),
      star(370, 130, 9),
      star(260, 140, 8),
      c(200, 220, 78),
      p('M150,190 c20,-24 50,-18 56,2 c6,18 -12,30 -30,28 c-14,-2 -36,-12 -26,-30 z'),
      p('M214,250 c12,-20 46,-22 50,-2 c4,18 -20,30 -38,26 c-10,-2 -18,-12 -12,-24 z'),
      r(56, 250, 14, 50),
      c(63, 236, 26),
    ],
  },
  {
    id: 'noah',
    title: { en: "Noah's Ark", es: 'El Arca de Noé' },
    verse: {
      en: '“I have set my rainbow in the clouds, and it will be the sign of the covenant between me and the earth.”',
      es: '“Mi arco he puesto en las nubes, el cual será por señal del pacto entre mí y la tierra.”',
    },
    ref: { en: 'Genesis 9:13', es: 'Génesis 9:13' },
    shapes: [
      sky,
      c(332, 62, 30),
      band(150, 128),
      band(128, 106),
      band(106, 84),
      p('M30,96 a22,22 0 0 1 36,-16 a26,26 0 0 1 46,8 a18,18 0 0 1 4,34 h-82 a16,16 0 0 1 -4,-26 z'),
      sea(236),
      p('M70,214 H330 L300,262 H100 Z'),
      r(130, 170, 140, 44),
      p('M118,172 L200,134 L282,172 Z'),
      c(166, 192, 10),
      c(200, 192, 10),
      c(234, 192, 10),
      p('M262,104 q14,-14 30,-4 q10,-12 22,-6 q-8,6 -10,14 q-20,10 -42,-4 z'),
    ],
  },
  {
    id: 'jonah',
    title: { en: 'Jonah and the Big Fish', es: 'Jonás y el Gran Pez' },
    verse: { en: '“Salvation comes from the LORD.”', es: '“La salvación es de Jehová.”' },
    ref: { en: 'Jonah 2:9', es: 'Jonás 2:9' },
    shapes: [
      sky,
      c(70, 62, 30),
      sea(120),
      p('M300,206 L372,164 L360,214 L372,262 Z'),
      p('M60,214 C80,150 180,130 250,160 C285,174 300,196 306,210 C298,236 270,262 230,272 C150,292 76,270 60,214 Z'),
      p('M60,214 C100,236 160,240 214,226 C190,262 120,276 80,250 C68,240 62,228 60,214 Z'),
      p('M190,158 L214,124 L236,162 Z'),
      c(104, 190, 12),
      ln('M150,196 q14,10 0,22'),
      p('M236,86 H344 L330,110 H250 Z'),
      p('M288,82 V28 L330,78 Z'),
      ln('M288,86 V28'),
    ],
  },
  {
    id: 'david',
    title: { en: 'David and Goliath', es: 'David y Goliat' },
    verse: { en: '“…for the battle is the LORD’s.”', es: '“…porque de Jehová es la batalla.”' },
    ref: { en: '1 Samuel 17:47', es: '1 Samuel 17:47' },
    shapes: [
      sky,
      c(320, 64, 32),
      p('M2,190 C80,120 170,140 230,176 C290,140 350,130 398,160 V318 H2 Z'),
      p('M2,240 C100,200 260,206 398,236 V304 a14,14 0 0 1 -14,14 H16 a14,14 0 0 1 -14,-14 Z'),
      r(60, 140, 18, 70),
      c(69, 122, 36),
      p('M190,236 a18,18 0 0 1 20,-22 a20,20 0 0 1 34,-4 a20,20 0 0 1 34,6 a18,18 0 0 1 8,26 a18,18 0 0 1 -26,14 a22,22 0 0 1 -36,0 a18,18 0 0 1 -34,-20 z'),
      e(300, 228, 18, 14),
      ln('M220,262 v16 M266,262 v16'),
      e(96, 282, 12, 8),
      e(124, 286, 12, 8),
      e(152, 282, 12, 8),
      e(110, 268, 12, 8),
      e(138, 268, 12, 8),
    ],
  },
  {
    id: 'daniel',
    title: { en: "Daniel in the Lions' Den", es: 'Daniel en el Foso de los Leones' },
    verse: {
      en: '“My God sent his angel, and he shut the mouths of the lions.”',
      es: '“Mi Dios envió su ángel, el cual cerró la boca de los leones.”',
    },
    ref: { en: 'Daniel 6:22', es: 'Daniel 6:22' },
    shapes: [
      sky,
      p('M150,120 V60 a50,50 0 0 1 100,0 V120 Z'),
      r(2, 240, 396, 78, 14),
      c(110, 196, 46),
      c(110, 196, 30),
      p('M150,210 C190,190 250,196 270,222 V262 H140 Z'),
      p('M270,214 q30,-6 34,-30 q6,10 -4,22 q-10,14 -30,16 z'),
      c(330, 150, 18),
      p('M306,250 L318,172 H342 L354,250 Z'),
      ln('M100,190 v0.1 M120,190 v0.1 M104,210 q6,6 12,0'),
    ],
  },
  {
    id: 'manger',
    title: { en: 'Baby Jesus Is Born', es: 'Nace el Niño Jesús' },
    verse: {
      en: '“Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.”',
      es: '“Os ha nacido hoy, en la ciudad de David, un Salvador, que es Cristo el Señor.”',
    },
    ref: { en: 'Luke 2:11', es: 'Lucas 2:11' },
    shapes: [
      sky,
      star(200, 44, 26),
      star(70, 60, 9),
      star(330, 70, 9),
      p('M80,150 L200,88 L320,150 Z'),
      r(100, 150, 200, 130),
      r(2, 280, 396, 38, 14),
      p('M140,236 H260 L246,280 H154 Z'),
      e(200, 230, 46, 14),
      e(200, 222, 34, 12),
      c(170, 214, 13),
      ln('M150,252 L130,280 M250,252 L270,280'),
    ],
  },
];

export const CRAYON_COLORS = [
  '#FF6B6B', '#FF9F43', '#FFD000', '#7BD389', '#00C9A7', '#4FC3F7',
  '#3867D6', '#9B59B6', '#FF7EB6', '#8D5A3B', '#F5D0A9', '#1B2452',
];
