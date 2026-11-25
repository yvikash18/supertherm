// Single source of truth for all site content.
// Extracted & restructured from superthermcorporations.com

export const company = {
  name: 'Supertherm Corporations',
  short: 'Supertherm',
  tagline: 'Excellence in Induction Technology',
  intro:
    'World-class manufacturer of induction heating equipment — hardening, forging, melting and high-frequency welding systems engineered for the modern foundry.',
  established: 1994,
  phone: '+91 99900 98477',
  phoneRaw: '+919990098477',
  support: '+91 70829 10292',
  supportRaw: '+917082910292',
  email: 'rameshyadav72@gmail.com',
  accountsEmail: 'accounts@superthermcorporations.com',
  address: {
    line1: 'Plot No. 708, MIE, Part A',
    line2: 'Bahadurgarh, Haryana 124507',
    country: 'India',
  },
};

// Social links shown in the footer, in this order. Add, remove or reorder freely;
// a link with an empty address is not shown.
export const socialLinks = [
  { label: 'Facebook', url: 'https://facebook.com/' },
  { label: 'Twitter', url: 'https://twitter.com/' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/supertherm-corporations-bahadhurgarh/' },
  { label: 'YouTube', url: 'https://youtube.com/channel/UCdn_1NjWcb1Pb01WV25j7fA' },
];

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Branches', href: '/branches' },
  { label: 'Clients', href: '/clients' },
  { label: 'Contact', href: '/contact' },
];

export const stats = [
  { value: 30, suffix: '+', label: 'Years of engineering', sub: 'In induction heating' },
  { value: 550, suffix: '+', label: 'Hardening & melting units', sub: 'Installed and running' },
  { value: 1000, suffix: '+', label: 'Machines delivered', sub: 'Across Asian markets' },
  { value: 9, suffix: '', label: 'Countries served', sub: 'And expanding' },
];

// Real engineering data restructured from the original superthermcorporations.com product pages.
export const products = [
  {
    slug: 'induction-forging',
    name: 'Induction Forging',
    series: 'Forge Master · I-Series & T-Series',
    tag: 'Heating',
    icon: 'forge',
    image: '/assets/process-1.jpg',
    image2: '/assets/process-2.jpg',
    seoTitle: 'Induction Forging Machine Manufacturer & Supplier | Forge Master I & T Series',
    seoDescription:
      'Supertherm Forge Master induction forging machines (I-Series & T-Series), 50 KW to 2000 KW, IGBT & thyristor power sources for billet, bar and pipe heating. Manufacturer in India, exporting across Asia & the Gulf.',
    keywords: ['induction forging machine', 'billet heater', 'forge master', 'IGBT forging', 'induction billet heating'],
    blurb:
      'High-throughput billet and bar heating for forging lines. Forge Master IGBT & thyristor power sources deliver uniform through-heating with tight temperature control, from 50 KW compact cells to 2000 KW forging lines.',
    specs: ['50–2000 KW output', 'IGBT & thyristor source', 'Billet 7–200 mm', '0.5–30 KHz range'],
    specGroups: [
      {
        title: 'I-Series — Forge Master (IGBT Type)',
        headers: ['Power', 'Billet Size', 'Frequency', 'Type'],
        rows: [
          ['50–250 KW', '7–24 mm', '30 KHz', 'IGBT'],
          ['50–350 KW', '20–40 mm', '10 KHz', 'IGBT'],
          ['50–350 KW', '40–65 mm', '3 KHz', 'IGBT'],
        ],
      },
      {
        title: 'T-Series — Forge Master',
        headers: ['Power', 'Billet Size', 'Frequency', 'Type'],
        rows: [
          ['100–1000 KW', '40–65 mm', '6 KHz', 'IGBT & Thyristor'],
          ['100–1000 KW', '50–70 mm', '3 KHz', 'IGBT & Thyristor'],
          ['100–1500 KW', '60–120 mm', '1 KHz', 'IGBT & Thyristor'],
          ['100–2000 KW', '120–200 mm', '0.5 KHz', 'IGBT & Thyristor'],
        ],
      },
    ],
    meta: [
      ['Machine dimensions', '2.5 m × 1 m × 1.4 m (I-Series) · 2.8 m × 1.5 m × 1.7 m (T-Series)'],
      ['Job size, T-Series', 'Round / RCS 36–100 mm'],
      ['Machine weight', '1.55 ton (I) · 2.5 ton (T)'],
      ['Cooling', 'De-mineralised water system: Alfa Laval plate-type heat exchanger, bronze or stainless-steel pump, pressure & temperature gauges at inlet and outlet, valves'],
      ['Automation', 'Allen Bradley / Siemens / Mitsubishi PLC with colour HMI'],
    ],
    safety: [
      'Door interlock',
      'Water-system pressure switch',
      'Temperature switch',
      'Return-line temperature switch',
      'Flow switches on all critical water paths',
      'Pressure switches in both water circuits (DM and cooling tower)',
      'Emergency off',
    ],
    extra: [
      {
        title: 'Optional systems',
        items: [
          'Job feeder: pusher or conveyor type, semi-automatic or fully automatic',
          'Accept / reject system',
          'Infrared laser pyrometer, single or double colour',
          'Energy monitoring system',
          'Fast extractor',
          'Horizontal end-bar heating mechanics (T-Series)',
          'Pick-and-place robotics (T-Series)',
        ],
      },
      { title: 'Built as', items: ['Billet heater', 'End bar heater', 'Long bar heater'] },
    ],
    features: [
      'Semi & fully-automatic billet feeders (pusher / conveyor)',
      'Accept–reject system',
      'Infrared laser pyrometer (closed-loop)',
      'Uniform core-to-surface heating, low scale loss',
    ],
    applications: ['Automotive forging', 'Fasteners & bolts', 'Bearings', 'Hand tools', 'Agricultural parts'],
  },
  {
    slug: 'induction-hardening',
    name: 'Induction Hardening',
    series: 'Supertherm Scan',
    tag: 'Heating',
    icon: 'hardening',
    image: '/assets/process-3.jpg',
    image2: '/assets/g7.jpg',
    seoTitle: 'Induction Hardening Machine Manufacturer & Supplier | Supertherm Scan',
    seoDescription:
      'Supertherm Scan induction hardening machines, 50–300 KW, 3 KHz to 400 KHz IGBT, for gears, shafts, axles and rolls. Double-spindle, two-station changeover. Manufacturer & supplier in India.',
    keywords: ['induction hardening machine', 'surface hardening', 'scan hardening', 'gear hardening', 'shaft hardening'],
    blurb:
      'The Supertherm Scan is a high-performance induction hardening system for mid-to-high-volume, multi-shift operations. Surface and case hardening for gears, shafts, axles and rolls with repeatable case depth and minimal distortion.',
    specs: ['50–300 KW output', '3–400 KHz range', 'IGBT solid-state', 'Double-spindle option'],
    specGroups: [
      {
        title: 'Power & Frequency Range',
        headers: ['Power', 'Frequency', 'Type'],
        rows: [
          ['50–300 KW', '100–400 KHz', 'IGBT'],
          ['50–250 KW', '30 KHz', 'IGBT'],
          ['50–250 KW', '10 KHz', 'IGBT'],
          ['50–250 KW', '3 KHz', 'IGBT'],
        ],
      },
      {
        // As published on the original site (its last column was headed "Pump Watt" but lists flow).
        title: 'Utility details',
        headers: ['Power', 'Input voltage', 'Demand', 'Cable Cu / Al', 'Chiller', 'Pump'],
        rows: [
          ['25 KW', '415 V', '25.5 kVA', '15 / 35', '0.75 HP / 50 LPM', '37 LPM'],
          ['50 KW', '415 V', '51 kVA', '35 / 80', '0.75 HP / 50 LPM', '71 LPM'],
          ['100 KW', '415 V', '102 kVA', '60 / 160', '2 HP / 100 LPM', '143 LPM'],
          ['150 KW', '415 V', '153 kVA', '120 / 250', '3 HP / 125 LPM', '210 LPM'],
          ['200 KW', '415 V', '204 kVA', '150 / 325', '3 HP / 150 LPM', '286 LPM'],
          ['250 KW', '415 V', '255 kVA', '180 / 400', '5 HP / 250 LPM', '350 LPM'],
          ['300 KW', '415 V', '306 kVA', '250 / 250×2', '5 HP / 300 LPM', '430 LPM'],
          ['350 KW', '415 V', '365 kVA', '330 / 330×2', '7 HP / 400 LPM', '500 LPM'],
          ['450 KW', '580 V', '460 kVA', '400 / 400×2', '7.5 HP / 550 LPM', '645 LPM'],
          ['550 KW', '580 V', '561 kVA', '400 / 400×2', '7.5 HP / 650 LPM', '930 LPM'],
          ['650 KW', '580 V', '663 kVA', '400 / 400×2', '10 HP / 650 LPM', '1075 LPM'],
          ['750 KW', '580 V', '765 kVA', '225×2 / 550×2', '12.5 HP / 1000 LPM', '1433 LPM'],
          ['1000 KW', '580 V', '1020 kVA', '1350×2 / 350×2', '17.5 HP / 1200 LPM', '1791 LPM'],
          ['1250 KW', '580 V', '1275 kVA', '400×2 / 400×4', '17.5 HP / 1200 LPM', '2150 LPM'],
          ['1500 KW', '580 V', '1530 kVA', '–', '–', '–'],
        ],
      },
    ],
    extra: [
      {
        title: 'Controls and cooling',
        items: [
          'PC / PLC / CNC controls for set-up, changeover, diagnostics and monitoring',
          'Touch-screen navigation with process logging for each part',
          'Closed-loop recirculating water cooling for inverter and coils',
          'Quench recirculating system with plate-type heat exchanger',
          'Power supplies and controls can be changed or upgraded later',
        ],
      },
      {
        title: 'Optional',
        items: ['Energy monitoring system', 'Quench flow monitoring system', 'Temper monitoring system'],
      },
    ],
    meta: [
      ['Configuration', 'Double-spindle & two-station changeover'],
      ['Mechanical modules', 'Scan · lift/rotate · rotary index'],
      ['Installation', 'Complete machine on a single base, single utility connection'],
      ['Maintenance', 'Easy-removable plumbing cover for quick changeover'],
      ['Built for long life', 'Field-proven components, with more than 30 years of experience behind each machine, backed by the people who designed and built it'],
    ],
    safety: [
      'Single utility connection for fast install & relocation',
      'Flexible design for a wide range of power supplies & controls',
      'Robust, heavy-duty hardening frame',
    ],
    features: [
      'Repeatable metallurgical results',
      'Mid-to-high volume, multi-shift ready',
      'Low distortion, high cycle rate',
      'Vertical / horizontal configurations',
    ],
    applications: ['Gears', 'Shafts & axles', 'Rolls', 'Auto components', 'Hand tools'],
  },
  {
    slug: 'induction-melting-furnace',
    name: 'Induction Melting Furnace',
    series: 'Medium Frequency · Ferrous & Non-Ferrous',
    tag: 'Melting',
    icon: 'melt',
    image: '/assets/process-4.jpg',
    image2: '/assets/g13.jpg',
    seoTitle: 'Induction Melting Furnace Manufacturer & Supplier in India | Supertherm',
    seoDescription:
      'Supertherm medium-frequency induction melting furnaces for iron, steel and non-ferrous metals — up to 750 KW IGBT, clean and cost-effective melting with EMC & noise compliance. Turnkey foundry projects.',
    keywords: ['induction melting furnace', 'medium frequency furnace', 'foundry furnace', 'steel melting furnace', 'non-ferrous melting'],
    blurb:
      'Induction melting furnaces designed, built and repaired by Supertherm. Medium-frequency equipment for iron, steel and non-ferrous metals — a clean, efficient, cost-effective melting system with state-of-the-art technology and environmental protection.',
    specs: ['Up to 750 KW IGBT', 'Medium frequency', 'Ferrous & non-ferrous', 'Melting + holding'],
    specGroups: [
      {
        title: 'Furnace Range',
        headers: ['Type', 'Metals', 'Technology'],
        rows: [
          ['Melting furnace', 'Iron · steel', 'Medium frequency IGBT'],
          ['Melting furnace', 'Copper · brass · aluminium', 'Medium frequency IGBT'],
          ['Holding furnace', 'Ferrous & non-ferrous', 'Closed-loop cooling'],
        ],
      },
    ],
    meta: [
      ['Power', 'Up to 750 KW IGBT (1 to 1.5 ton)'],
      ['Compliance', 'Electromagnetic compatibility (EMC) & noise requirements'],
      ['Cooling', 'Complete closed-loop cooling system'],
      ['Scope', 'Turnkey foundry projects — design, build & repair'],
    ],
    safety: [
      'Designed to applicable regulations & safety requirements',
      'EMC-compliant installation',
      'User-friendly operation',
    ],
    features: [
      'Clean, efficient, cost-effective melting',
      'Proven technical design for high performance',
      'Versatile installation configurations',
      'Complete foundry engineering',
    ],
    extra: [
      {
        title: 'Technical characteristics',
        items: ['Flexible melting', 'Rapid start-up', 'Rugged construction', 'Magnetically screened', 'Digital control'],
      },
      {
        title: 'Economic benefits',
        items: ['High power-consumption efficiency', 'Low capital investment', 'High power densities', 'Reduced operating costs'],
      },
      {
        title: 'Converter',
        items: [
          'IGBT technology, with thyristors for extreme load conditions',
          'High electrical efficiency',
          'Converter loaded only through active current',
          'Fully controlled inverter and rectifier circuits',
          'Water-cooled high-power devices',
          'Digital control with automatic maximum power control',
          'Solid smoothing reactor in the DC intermediate circuit',
          'Constant power input throughout the melt',
        ],
      },
    ],
    applications: ['Steel foundries', 'Iron foundries', 'Copper & brass', 'Aluminium', 'Rolling mills'],
  },
  {
    slug: 'high-frequency-welder',
    name: 'High Frequency Welder',
    series: 'CFI · Tube & Pipe',
    tag: 'Welding',
    icon: 'weld',
    image: '/assets/process-5.jpg',
    image2: '/assets/g16.jpg',
    seoTitle: 'High Frequency Welder Manufacturer & Supplier | HF Induction Welding',
    seoDescription:
      'Supertherm high-frequency (HF) welders with Current-Fed Inverter (CFI) design for tube and pipe mills — 85% efficiency, welds carbon & stainless steel, brass, copper, aluminium and exotic alloys. 30 years of HF welding expertise.',
    keywords: ['high frequency welder', 'HF welding', 'tube welder', 'pipe mill welder', 'CFI welding'],
    blurb:
      'All of our welders are based on the High Frequency (HF) welding process we developed almost 30 years ago. The Current-Fed Inverter (CFI) design welds almost any metal efficiently and economically — for continuous tube and pipe mills.',
    specs: ['Current-Fed Inverter', '85% efficiency', 'Tube & pipe mills', 'Continuous seam weld'],
    specGroups: [
      {
        title: 'Weldable Metals',
        headers: ['Category', 'Materials'],
        rows: [
          ['Standard', 'Carbon steel · stainless steel'],
          ['Non-ferrous', 'Brass · copper · aluminium'],
          ['Exotic alloys', 'Boron steel · HSLA · AHSS · TRIP steels'],
        ],
      },
      {
        title: 'Technical specifications',
        headers: ['Item', 'Value'],
        rows: [
          ['Power range', 'Up to 1000 kW'],
          ['Output frequency', '150–400 kHz, ±1% stabilised per load'],
          ['Diameter range', 'Unlimited'],
          ['Induction coils', 'Standard'],
          ['HF contact welding', 'Yes'],
          ['Dual induction / contact', 'Yes'],
          ['Weld tables', 'Single, 2 or 3'],
          ['AutoMatch', 'Yes'],
          ['PLC', 'Yes'],
          ['Speed Power Control', 'Yes'],
          ['Tachometer', 'Yes'],
          ['Efficiency', 'Over 85%'],
          ['Power factor', '0.92'],
          ['Ripple', 'About 1%'],
          ['WeldScan', 'Yes'],
          ['ThermaView', 'Yes'],
          ['ThermaSure', 'Yes'],
        ],
      },
    ],
    extra: [
      {
        title: 'Welder features',
        items: [
          'Efficiency of 85% or more, to meet worldwide energy standards',
          'Full power across a wide range of product sizes',
          'Predictive algorithm sets starting frequency and power from product geometry and material',
          'Frequency adjustable by the operator or from stored screen settings',
          'Operator-friendly control system for tailoring weld parameters',
          'Weld parameters can be stored and recalled for later runs',
          'Table positioning servo sets coil or contacts to the vee from the HMI',
          'Speed Power Control to start, stop and jog the mill, reducing open seam',
          'Selectable power and frequency for any tube or pipe mill and material',
          'Power supply sealed with gaskets against contamination',
          'Doors fitted with lift-off hinges',
        ],
      },
      {
        title: 'Consumables',
        items: [
          'Induction coils in high-conductivity copper for solid-state HF welders from 50 kW to 2 MW, 150–800 kHz; custom coils on request',
          'Impeders from small-diameter thin-wall tube to large-diameter heavy-wall API line pipe; booster pumps available',
          'Ferrites in four types, cut to length on request',
        ],
      },
    ],
    meta: [
      ['Technology', 'Current-Fed Inverter (CFI) design'],
      ['Efficiency', 'High efficiency rating of 85%'],
      ['Power output', 'Patented full-range output over wide product sizes'],
      ['Control', 'Predictive algorithm for stable welding'],
    ],
    safety: [
      'Meets increasing worldwide electrical energy standards',
      'Robust industrial build for continuous duty',
      'Low-maintenance operation',
    ],
    features: [
      'Stable weld quality at line speed',
      'Energy-efficient, economical operation',
      'Wide range of product sizes',
      '30 years of HF welding leadership',
    ],
    applications: ['ERW tube mills', 'Pipe mills', 'Section welding', 'Profile welding'],
  },
];

export const capabilities = [
  { title: 'Billet & Bar Heating', text: 'Through-heating for forging, upsetting and extrusion.' },
  { title: 'Surface Hardening', text: 'Gears, shafts, rolls and axles with controlled case depth.' },
  { title: 'Melting & Holding', text: 'Ferrous and non-ferrous furnaces up to 750 KW.' },
  { title: 'HF Welding', text: 'Continuous tube and pipe seam welding.' },
  { title: 'Annealing & Brazing', text: 'Precise localized heating for joining and stress relief.' },
  { title: 'Foundry Projects', text: 'Turnkey engineering, cooling systems and automation.' },
];

export const advantages = [
  {
    title: 'Customer support',
    text: 'Service support 24 hours a day, 365 days a year, with genuine and cost-effective spare parts. Customer care: +91 70829 10292.',
    icon: 'support',
  },
  {
    title: 'Customer training',
    text: 'Training for your team in preventive maintenance, predictive maintenance, coil repair and rail repair.',
    icon: 'training',
  },
  {
    title: 'Research and development',
    text: '30 years in induction, with our own R&D team across electronics, electrical, automation, mechanical and metallurgical engineering.',
    icon: 'rnd',
  },
];

// "What we do" on the original home page: everything the two divisions build.
export const divisions = [
  {
    title: 'Melting and furnace division',
    items: [
      'Ferrous melting furnace',
      'Non-ferrous melting furnace',
      'Laboratory furnace',
      'Holding furnace',
      'Lining vibrators',
      'Power demand controller / manager',
      'Water softener units',
      'Water cooling chillers and cooling towers',
      'Turnkey projects for foundries',
    ],
  },
  {
    title: 'Heating division',
    items: [
      'Billet heater',
      'Long bar heater',
      'End bar heater',
      'Pipe heater',
      'Hardening equipment',
      'Flat heater',
      'Special equipment',
    ],
  },
];

// Bank details for RTGS / NEFT payments, as published on the original branches page.
export const bankDetails = {
  bank: 'ICICI Bank',
  branch: 'West Patel Nagar Branch, New Delhi',
  ifsc: 'ICIC0000332',
  account: '033205003480',
};

// Service locations listed in the original site footer, besides the branch offices.
export const serviceCities = ['Pune', 'Jalandhar', 'Bengaluru', 'Chennai', 'Baddi', 'Mohali', 'Jaipur', 'Delhi NCR'];

export const process = [
  { step: '01', title: 'Consult & Assess', text: 'We study your part, tonnage and cycle-time targets.' },
  { step: '02', title: 'Engineer', text: 'Coil, power source and automation designed to your process.' },
  { step: '03', title: 'Build & Test', text: 'Manufactured in-house and validated before dispatch.' },
  { step: '04', title: 'Install & Support', text: 'Commissioning, operator training and lifetime service.' },
];

// Real branch network from superthermcorporations.com/branches.php
export const branches = [
  {
    city: 'Bahadurgarh',
    region: 'Haryana',
    role: 'Head Office & Works',
    primary: true,
    contact: '',
    address: 'MIE Phase-1, 708 & 686, Urban Estate, Bahadurgarh, Distt. Jhajjar, Haryana 124507',
    phones: ['01276-267477', '+91 99900 98477', '+91 99963 59481'],
    email: 'rameshyadav72@gmail.com',
  },
  {
    city: 'Aurangabad',
    region: 'Maharashtra',
    role: 'Branch Office',
    contact: '',
    address: 'RX-4/2, Bajaj Nagar, MIDC Waluj, Aurangabad, Maharashtra 431136',
    phones: ['+91 70829 10292'],
    email: 'rameshyadav72@gmail.com',
  },
  {
    city: 'Ludhiana',
    region: 'Punjab',
    role: 'Branch Office',
    contact: '',
    address: 'St. No. 4, Surjit Colony, 33 Ft. Road, Bhamian Kalan, Ludhiana 141015',
    phones: ['+91 70829 10292'],
    email: 'jaysharma1696@gmail.com',
  },
  {
    city: 'Bengaluru',
    region: 'Karnataka',
    role: 'Branch Office',
    contact: 'Mr A. Sreenivasan',
    address: '385/1, 1st Cross, BEML Layout, 3rd Stage, Rajarajeshwari Nagar, Bengaluru 560098',
    phones: ['+91 93413 24438'],
    email: 'margservice1@yahoo.com',
  },
  {
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    role: 'Branch Office',
    contact: 'Mr A. S. Kushwaha',
    address: 'Plot No. 3, Jarauli Phase-1, Kanpur 212620, U.P.',
    phones: ['+91 98389 87486'],
    email: 'ashok.kushwaha16@gmail.com',
  },
  {
    city: 'Kolkata',
    region: 'West Bengal',
    role: 'Branch Office',
    contact: 'Mr Deepak Kumar Jena',
    address: '47/B, 2nd Floor, Nawaritala Road, Kolkata, West Bengal',
    phones: ['+91 81449 70436'],
    email: 'deepak.10151981@gmail.com',
  },
  {
    city: 'Balasore',
    region: 'Odisha',
    role: 'Branch Office',
    contact: 'Mr Deepak Kumar Jena',
    address: 'At Nahara, Post Demuria, Dist. Balasore, Odisha 756034',
    phones: ['+91 81449 70436'],
    email: 'deepak.10151981@gmail.com',
  },
];

// Company registration / statutory details (from branches.php)
export const companyDetails = {
  gst: '06ABAPY3446P3Z0',
  pan: 'ABAPY3446P',
  udyogAadhar: 'HR07A0003950',
  arn: 'AA060217025977Z',
  hsnMachines: '8514 (Spares & Machines)',
  hsnServices: '9987 (Repairing & Services)',
};

// About page — vision, mission, product features & comparison (from about-us.php)
export const visionMission = {
  vision: 'Customer satisfaction through technological leadership.',
  mission: 'Always innovate for a better future.',
};

export const productFeatures = [
  'Input power factor 0.98–0.99 from 0 to 100% output power',
  'Very low voltage & current harmonics',
  'Very high machine efficiency',
  'Output regulation accuracy of 2%',
  'IGBT design with precise power control',
  'Most reliable, qualitative and rugged build',
  'Single control board',
  'Easy installation, maintenance-free',
  'Manual, semi & fully-automatic PLC / CNC control with HMI',
  'Operator-friendly operation',
  'Energy monitoring system (as required)',
  'Compact in size and portable',
  'Low installation cost',
  'Quick change-over of coil',
  'Ease of maintenance & job-holding property',
];

// Induction billet heater vs conventional heating (running-cost / quality comparison)
export const comparison = {
  headers: ['Parameter', 'Induction Billet Heater', 'Oil Fired', 'Gas Fired'],
  rows: [
    ['Running cost', 'Rs. 3/kg (Rs. 7/unit)', 'Rs. 5.6/kg (124 L × 45)', 'Rs. 5/kg (147 × 34)'],
    ['Scale loss (steel saving)', '0.8%', '4.5%', '3.4%'],
    ['Productivity', '30–40% increase (automation)', 'Very less (manual)', 'Less (operator dependent)'],
    ['Environmental quality', 'Friendly', 'Very polluting', 'Polluting'],
    ['Heating uniformity', '± 25 °C', '± 75 °C', '± 75 °C'],
    ['Starting time', 'Instant, 1–2 minutes', 'At least 1 hour', '1 hour'],
    ['Die life', 'Increased', 'Less', 'Less'],
  ],
};

export const countries = [
  'India',
  'Oman',
  'Saudi Arabia',
  'Iran',
  'Nepal',
  'Bhutan',
  'Bangladesh',
  'Malaysia',
  'Vietnam',
];

// Client / sector logos are represented as text badges (no source assets).
export const clientSectors = [
  'Automotive Forging',
  'Steel Foundries',
  'Fastener Manufacturing',
  'Bearing Industry',
  'Pipe & Tube Mills',
  'Agricultural Equipment',
  'Hand Tools',
  'Auto Components',
  'Heavy Engineering',
  'Rolling Mills',
];

export const clients = [
  'Hero Group',
  'Sona Group',
  'JBM Group',
  'Rockman Industries',
  'Bharat Forge',
  'Endurance',
  'Jai Bharat',
  'Napino',
  'Omax Autos',
  'Sandhar',
  'Mahle',
  'Talbros',
];

// Real imagery crawled from the original site (public/assets/)
export const heroBanners = [
  '/assets/banner-1.jpg',
  '/assets/banner-2.jpg',
  '/assets/banner-3.jpg',
  '/assets/banner-4.jpg',
];

export const aboutImages = {
  primary: '/assets/about-1.jpg',
  secondary: '/assets/about-2.jpg',
  capability: '/assets/what-we.jpg',
  capability2: '/assets/what-we1.jpg',
};

export const galleryImages = Array.from({ length: 20 }, (_, i) => ({
  src: `/assets/g${i + 1}.jpg`,
  title: `Installation ${i + 1}`,
}));

// Real client company logos crawled from the original site (white-background marks).
export const clientLogos = Array.from({ length: 20 }, (_, i) => `/assets/${i + 1}.jpg`);
// Back-compat alias
export const certificates = clientLogos;

// Customer testimonials, as published on the original site.
export const testimonials = [
  {
    quote:
      'I am impressed with your induction billet heater for 250KW/3KHz & 450KW in the year 2014 and 2017 and also thankful to Supertherm for services and support. I will recommend Supertherm Corporations.',
    name: 'Tapendera Kumar',
    org: '',
  },
  {
    quote:
      'Our first time to place an order with Supertherm for 150KW/10KHz (2 Nos.) and 200KW and 350KW/1KHz (2 Nos.) of induction billet heater in the year 2013, 2014 and 2018 and we are very satisfied with the services and flexibility. Thank you for the better services and support.',
    name: 'Vipin Yadav',
    org: '',
  },
  {
    quote:
      'First time our company places an order with Supertherm for 400KW/1KHz of induction heater in the year 2014. We are getting proper results as per the commitment made and equipment is with utilized concept, and reduced space requirement and energy-efficient. We are satisfied with the performance of the equipment.',
    name: 'Kamlesh Kumar',
    org: '',
  },
];

// Heading and intro line at the top of each inner page. This is the only copy:
// the pages read it through heroFor('<page>') in content.ts.
// `{name}` is replaced with the company name.
export const pageHeadings = {
  about: {
    title: 'About Supertherm',
    subtitle:
      'For more than 30 years, {name} has designed and built induction systems that heat, harden, melt and weld metal for manufacturers across Asia and the Gulf.',
  },
  products: {
    title: 'Our products',
    subtitle:
      'Four families of induction equipment. Ratings, frequencies and features for each are below; every machine is then sized to your part.',
  },
  gallery: {
    title: 'Gallery',
    subtitle: 'Machines at the works, at customer plants and on our exhibition stands. Select a photo to enlarge it.',
  },
  branches: {
    title: 'Branches and offices',
    subtitle:
      'Head office and works in Haryana, six regional offices across India, and machines in service in nine countries.',
  },
  clients: {
    title: 'Our clients',
    subtitle:
      'Automotive forging groups, gear and bearing makers, tube mills and independent foundries heat with Supertherm induction systems.',
  },
  contact: {
    title: 'Contact us',
    subtitle:
      'Describe the part and the process. An engineer replies with the machine that fits, usually within one working day. We design, build and test every machine at our own works, which is how we keep quality and price under control.',
  },
};
