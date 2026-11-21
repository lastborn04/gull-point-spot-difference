// Keep the visible rings as drawn. A tight box can also cover the artwork's corners.
const area = (x, y, rx, ry, edgeBounds) => ({ x, y, rx, ry, edgeBounds });
const change = (id, label, hint, left, right = left) => ({ id, label, hint, left, right });
const buoyArea = x => area(x, 337, 17, 17, { left: x - 19, top: 343, right: x + 19, bottom: 350 });

const differences = {
  pennant: change('pennant', 'the lighthouse pennant', 'Look above the lighthouse roof.', area(144, 73, 22, 13)),
  birds: change('birds', 'the extra gull', 'Count the gulls over the open water.', area(299, 111, 18, 11)),
  awning: change('awning', 'the striped awning', 'Compare the market stalls on the far quay.',
    area(544, 226, 25, 13, { left: 525, top: 211, right: 562, bottom: 231 })),
  sail: change('sail', 'the sail emblem', 'Look at the cloth on the boat in the middle.', area(371, 222, 22, 18)),
  buoy: change('buoy', 'the drifting buoy', 'Look in the water below the sailboat.', buoyArea(397), buoyArea(433)),
  crate: change('crate', 'the fruit crate', 'Look at what’s for sale on the near pier.',
    area(101, 351, 27, 14, { left: 74, top: 340, right: 128, bottom: 356 })),
  window: change('window', 'the round window', 'Compare the windows on the bluff.', area(211, 182, 21, 14)),
  chimney: change('chimney', 'the missing chimney', 'Follow the ridge of the tall quay house.', area(588, 144, 12, 14)),
  stripe: change('stripe', 'the lighthouse band', 'Study the paint on the tower.',
    area(131, 131, 16, 12, { left: 112, top: 122, right: 150, bottom: 140 })),
  barrel: change('barrel', 'the barrel’s bands', 'Check the barrel at the end of the pier.', area(266, 332, 19, 21)),
  basket: change('basket', 'the basket handle', 'Study the basket beside the market stall.', area(602, 238, 15, 15)),
  mooring: change('mooring', 'the stern rope', 'Trace the ropes on the little boat at right.', area(573, 319, 27, 13)),
};

export const plates = [
  {
    title: 'Morning at Gull Point',
    location: 'Gull Point',
    edition: 'Morning survey',
    description: 'The market opens as the fishing boats come in.',
    time: 150000,
    palette: { sky: '#f6dfb2', sun: '#efab63', far: '#99a9a1', sea: '#518b8a', deep: '#2e686e', light: '#9fc0ad', land: '#87966d', rock: '#b79773' },
    differences: ['pennant', 'birds', 'awning', 'sail', 'buoy', 'crate', 'window'].map(id => differences[id]),
  },
  {
    title: 'Last light at Gull Point',
    location: 'Gull Point',
    edition: 'Evening survey',
    description: 'Last light settles over the harbor as the market packs up.',
    time: 125000,
    palette: { sky: '#efd0b6', sun: '#db8b69', far: '#a98f97', sea: '#657f92', deep: '#40596d', light: '#c1afaf', land: '#858667', rock: '#a78072' },
    differences: ['chimney', 'stripe', 'window', 'barrel', 'basket', 'mooring', 'sail', 'crate'].map(id => differences[id]),
  },
];
