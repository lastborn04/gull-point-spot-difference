const ink = '#314749';
const paper = '#f7e9c9';
const rust = '#ab5142';
const ochre = '#da9c52';
const darkWood = '#725447';

const path = (d, fill = 'none', stroke = 'none', width = 1.5) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rect = (x,y,w,h,fill,stroke = 'none') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
const oval = (x,y,rx,ry,fill,stroke = 'none') =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
const group = (x,y,body) => `<g transform="translate(${x} ${y})">${body}</g>`;

function repeat(count, paint) {
  return Array.from({ length: count }, (_, index) => paint(index)).join('');
}

function variation(index, salt) {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function gull(x,y,scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${path('M-12 2Q-6-4 0 2Q5-5 12-3', 'none', ink, 2)}</g>`;
}

function distantCoast(p, changed, evening) {
  return rect(0,0,640,185,p.sky)
    + oval(evening ? 452 : 418, evening ? 126 : 77, 42,42,p.sun)
    + path('M0 106Q37 88 77 99Q104 83 137 90Q164 91 191 100 M329 47Q370 34 410 48 M459 91Q493 78 529 87Q558 75 604 86', 'none', paper, 3)
    + path('M0 167L81 157 124 169 184 162 228 178 259 172 281 159 319 163 342 172 361 170 387 157 423 156 445 145 480 143 520 161 562 156 604 170 640 163V195H0Z',p.far)
    + path('M0 182Q100 179 205 185T405 183T640 182V420H0Z',p.sea)
    + '<g opacity=".54">'
    + repeat(132, i => {
      const y = 185 + variation(i,1) * 235;
      const x = variation(i,2) * 650 - 9;
      const length = (6 + variation(i,3) * 36) * (.35 + (y - 185) / 235);
      return path(`M${x} ${y}q${length / 2} -1.5 ${length} 0`, 'none', i % 3 ? p.light : p.deep, y > 260 ? 1.5 : 1);
    })
    + '</g>'
    + gull(263,95,.85) + gull(281,82,.65) + (changed('birds') ? gull(299,111,.9) : '')
    + gull(491,113,.6) + gull(510,104,.53);
}

function headland(p) {
  return path('M0 180Q26 168 66 171Q99 157 127 165Q151 157 185 177L223 199 253 219 276 236 261 256 228 271 170 275 117 286 55 278 0 292Z',p.rock)
    + path('M0 179Q30 161 63 173Q103 150 128 164Q157 155 191 178L225 200 248 218 272 234 241 233 216 221 186 223 155 208 112 218 78 209 39 223 0 216Z',p.land)
    + path('M0 224L35 226 69 215 93 223 61 245 31 249 15 266 0 265Z','#997b61')
    + path('M112 220L157 211 183 226 220 225 240 239 228 252 193 247 172 257 137 249Z','#c5a384')
    + path('M0 266L37 250 66 247 96 226 117 227 139 252 175 264 209 256 230 261 260 245 276 236 269 255 233 273 171 279 121 291 50 284 0 296Z','#776b59')
    + path('M0 298L54 286 119 292 173 280 229 277 264 262 278 247 M125 300l49-11 48-4 M226 287l17-4', 'none', p.light, 2)
    + repeat(29, i => {
      const x = 7 + variation(i,4) * 205;
      const y = 187 + variation(i,5) * 15 + x * .08;
      return path(`M${x} ${y}l3-4m0 4l4-2`, 'none', '#627454', 1.15);
    })
    + path('M0 198Q52 182 87 188T154 174Q176 178 192 189', 'none', '#d5bd8b', 3)
    + path('M16 261l22-9m11 19l36-13m13-9l10-10m49 24l12 5m29-26l17 3m21-11l10 8', 'none', '#e0b998', 1.6);
}

function lighthouse(changed) {
  return path('M111 171L117 108H144L152 171Q130 177 111 171Z',paper,ink)
    + path('M116 124H146L148 138H114Z', changed('stripe') ? '#627e73' : rust)
    + path('M141 111L149 169 140 171 135 111Z','#d7c4a3')
    + rect(118,94,25,15,'#d4af70',ink)
    + path('M125 95v13m7-13v13m6-13v13M112 110h37', 'none',ink)
    + path('M112 94l18-15 19 15Z',rust,ink)
    + path('M130 79V60', 'none',ink,2)
    + path(changed('pennant') ? 'M130 61l23 6-7 8-16-6Z' : 'M130 61l25 8-25 5Z',rust,ink,1)
    + path('M126 172v-16q5-8 10 0v17',ink)
    + path('M102 172q28 10 57 0', 'none','#5e7459',2);
}

function cottage(x,y,w,h,wall,roof,{ round = false, chimney = false, rows = 1 } = {}) {
  const side = 12;
  return group(x,y,
    path(`M0 0L${w} 0l${side}-5v${h}l-${side} 5H0Z`,wall,ink)
    + path(`M${w} 0l${side}-5v${h}l-${side} 5Z`,'#7b6659')
    + (chimney ? rect(w-10,-38,9,21,wall,ink) + rect(w-12,-39,13,4,ink) : '')
    + path(`M-5 1L${w/2} -25 ${w+5} 1Z`,roof,ink)
    + path(`M${w/2} -25l${side}-5 ${w/2+5} 26 -${side} 5Z`,darkWood,ink)
    + repeat(rows, i => {
      const wy = 8 + i * 17;
      return round ? oval(w/2,wy + 6,6,6,'#557777',ink)
        : rect(8,wy,9,10,'#557777',ink) + rect(w-17,wy,9,10,'#557777',ink)
          + path(`M12 ${wy}v10m${w-25} -10v10`,'none',paper,.9);
    })
    + rect(w/2-5,h-13,10,13,darkWood,ink));
}

function market(changed, p) {
  const canopy = changed('awning') ? '#6e9583' : rust;
  return path('M438 206L640 191V252L480 264 416 249Z','#927e68',ink)
    + path('M425 228L640 211V235L481 251 415 242Z','#d7b38a',ink)
    + cottage(458,185,40,37,'#d6b385','#597976')
    + cottage(498,181,34,39,'#e5c79b',rust)
    + cottage(548,174,46,54,'#e5c9a9','#657777',{ chimney: !changed('chimney'), rows: 2 })
    + cottage(603,184,40,45,'#c4896b',rust,{ rows: 2 })
    + path('M418 243l64 9 158-16v15l-160 14-64-11Z','#746758',ink)
    + repeat(15, i => path(`M${479+i*11} ${253-i*.98}l-2 9`, 'none','#a18a6e',1))
    + path('M525 228v19m36-19v15', 'none',ink,2)
    + rect(525,236,36,8,ochre,ink)
    + path('M523 222l7-9h26l9 9v7h-42Z',paper,ink)
    + repeat(4, i => path(`M${527+i*8} 229v-7l5-9h4l-4 9v7Z`,canopy))
    + path('M423 257l56 12 161-14m-177 21l19 4 104-10', 'none',p.light,1.7)
    + (changed('basket') ? '' : path('M594 237q0-16 14-7l2 7', 'none',darkWood,2))
    + path('M592 235h20l-4 10h-13Z',ochre,ink,1.2)
    + path('M597 237l1 7m4-7v7m4-7l-1 7','none',darkWood,1);
}

function sailboat(changed, p) {
  return path('M310 285Q361 291 443 278M325 294q60 4 91-4', 'none',p.light,2)
    + path('M360 178v95','none',darkWood,3)
    + path('M356 183Q350 222 318 256L356 252Z','#e5c79d',ink)
    + path('M364 183Q386 201 410 250L364 251Z',paper,ink)
    + path('M369 192q6 35 24 56M353 194q-8 33-23 52', 'none','#bca586',1)
    + (changed('sail') ? path('M373 213l8 11-8 8-7-8Z',rust) : oval(373,223,7,7,rust))
    + path('M358 178l16 3-15 6Z',ochre,ink,1)
    + path('M315 261q62 5 115-7l-18 22q-41 10-83 1Z',rust,ink,2)
    + path('M321 267q52 7 103-6', 'none',paper,2)
    + path('M339 258h20m27-1h13', 'none',darkWood,2);
}

function floatingBuoy(x,p) {
  return group(x,337,
    path('M-17 8q17 4 34-1','none',p.light,1.6)
    + path('M-8 2q-1-8 8-12 9 4 8 12-8 7-16 0Z',ochre,ink)
    + path('M-7-2h14M0-10v-6','none',ink,1.2));
}

function foregroundPier(changed, p) {
  return path('M0 350l77-23 168 8 68 42-67 43H0Z',darkWood,ink,2)
    + path('M0 343l80-22 170 10 64 37-75 38H0Z','#c39a72',ink,2)
    + path('M0 364l89-35 166 6 M0 384l97-41 175 2 M0 404l111-48 183 2 M37 406l90-34 180-2 M102 407l52-21 115 2 M167 407l21-10 57 3', 'none','#896a52',2)
    + repeat(23,i => {
      const x = 12 + variation(i, 7) * 232;
      const y = 359 + variation(i, 8) * 39;
      return path(`M${x} ${y}l${4+i%8} -2`,'none','#e0b389',1.1);
    })
    + path('M3 340q30-21 61-11m-45 23q12-8 40-4', 'none','#e7c29a',3)
    + rect(72,353,60,23,darkWood,ink)
    + path('M70 350l11-10h50l5 11-8 12H74Z',ochre,ink)
    + repeat(changed('crate') ? 4 : 5, i => oval(81+i*10,346+(i%2)*4,5,4,changed('crate') ? '#b55444' : '#738650',ink))
    + path('M74 357l54 3m-52 9l51 3', 'none','#cba27a',1.4)
    + path('M252 323q14-8 28 0l-3 26q-12 7-23-1Z','#9f7555',ink)
    + oval(266,323,14,5,'#c5a07a',ink)
    + path('M259 330l1 18m13-18l-1 18','none',darkWood,1)
    + path(changed('barrel') ? 'M253 335q14 5 26 0' : 'M253 331q14 5 26 0m-25 12q13 5 24 0','none',ink,2)
    + path('M300 384v-20q5-6 12 0v22l-12 4Z',darkWood,ink)
    + oval(306,364,6,3,'#d2ad83',ink)
    + path('M307 370q-12 5-24 3t-14 8q0 6 11 5t5-6', 'none',paper,2)
    + path('M257 418l41-23 30-12m-18 19l21-12', 'none',p.light,1.8);
}

function dinghy(changed, p) {
  return path('M483 312q40 12 100 1m-82 16q34 6 72-2', 'none',p.light,1.8)
    + path('M484 297q26-17 78-5l17 9q-25 18-78 13Z','#b97e57',ink,2)
    + path('M495 299q36-11 70 0l-16 8-43 3Z','#e0b779',ink)
    + path('M484 297l16 13q38 4 79-9l-14 15q-32 11-66 1Z','#e5d6b2',ink)
    + path('M506 307l-4-10m24 10l-4-12m25 10l-4-12','none',darkWood,2.3)
    + path('M531 305l24-29m-2 2l5-9','none',darkWood,2.4)
    + (changed('mooring') ? '' : path('M569 311q5 11 23 11', 'none',paper,1.8));
}

export function drawHarbor(plate, side) {
  const alteration = new Set(side === 'right' ? plate.differences.map(item => item.id) : []);
  const changed = id => alteration.has(id);
  const p = plate.palette;
  const evening = plate.edition === 'Evening survey';
  return distantCoast(p, changed, evening)
    + headland(p) + lighthouse(changed)
    + cottage(191,169,40,29,'#e7caa9',rust,{ round: changed('window') })
    + market(changed,p) + sailboat(changed,p)
    + floatingBuoy(changed('buoy') ? 433 : 397,p)
    + dinghy(changed,p) + foregroundPier(changed,p)
    + `<g opacity=".16">${repeat(420, i => {
      const x = variation(i,11) * 640;
      const y = variation(i,12) * 420;
      return oval(x,y,.5+variation(i,13),.38,i%2 ? paper : ink);
    })}</g>`;
}
