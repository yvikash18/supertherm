// Words for the four process animations. Kept apart from the drawing code so
// the page can render them without scripts.
export type Kind = 'hardening' | 'forge' | 'melt' | 'weld';

export const processCopy: Record<Kind, {
  tab: string;
  readouts: [string, string];
  units: [string, string];
  steps: { title: string; text: string }[];
}> = {
  hardening: {
    tab: 'Hardening',
    readouts: ['Surface under the coil', 'Length hardened'],
    units: ['°C', '%'],
    steps: [
      { title: 'Heat', text: 'The coil brings a narrow band of the surface to about 900 °C. The core stays cool.' },
      { title: 'Quench', text: 'A spray ring follows directly behind the coil and cools the band at once.' },
      { title: 'Result', text: 'A hard, wear-resistant case over a tough core, the same on every part.' },
    ],
  },
  forge: {
    tab: 'Forging',
    readouts: ['Billet at the exit', 'Billets heated'],
    units: ['°C', ''],
    steps: [
      { title: 'Feed', text: 'A pusher indexes cold billets into the coil, one billet length at a time.' },
      { title: 'Heat', text: 'Each billet climbs to forging temperature as it moves through, heated right to the core.' },
      { title: 'Check', text: 'A pyrometer reads every billet at the exit before it goes to the press.' },
    ],
  },
  melt: {
    tab: 'Melting',
    readouts: ['Bath temperature', 'Charge melted'],
    units: ['°C', '%'],
    steps: [
      { title: 'Charge and melt', text: 'Scrap is charged into the crucible. Current induced in the metal itself melts it.' },
      { title: 'Stir', text: 'The same field stirs the bath, evening out temperature and chemistry.' },
      { title: 'Tap', text: 'At temperature the furnace tilts and the melt is poured.' },
    ],
  },
  weld: {
    tab: 'Welding',
    readouts: ['Edges at the weld point', 'Weld power'],
    units: ['°C', '%'],
    steps: [
      { title: 'Form', text: 'Rolls close the strip into an open tube, leaving a narrow vee between the edges.' },
      { title: 'Heat the edges', text: 'High-frequency current runs along the two edges and meets where they close. Only the edges get hot.' },
      { title: 'Squeeze', text: 'Squeeze rolls press the hot edges together into a forged seam.' },
    ],
  },
};
