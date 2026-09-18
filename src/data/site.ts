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
  address: {
    line1: 'Plot No. 708, MIE, Part A',
    line2: 'Bahadurgarh, Haryana 124507',
    country: 'India',
  },
  social: {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    linkedin: 'https://www.linkedin.com/company/supertherm-corporations-bahadhurgarh/',
    youtube: 'https://youtube.com/channel/UCdn_1NjWcb1Pb01WV25j7fA',
  },
};

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
  { value: 30, suffix: '+', label: 'Years of engineering', sub: 'Serving industry since 1994' },
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
      ['Machine dimensions', '2.5 m × 1 m × 1.4 m (I-Series)'],
      ['Machine weight', '1.55 ton (I) · 2.5 ton (T)'],
      ['Cooling', 'DWRS bronze pump, plate-type heat exchanger, pressure & temperature gauges'],
      ['Automation', 'Allen Bradley / Siemens / Mitsubishi PLC with colour HMI'],
    ],
    safety: [
      'Door interlock',
      'Water-system pressure switch',
      'Temperature switch',
      'Return-line temperature switch',
      'Flow switch on critical circuits',
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
    ],
    meta: [
      ['Configuration', 'Double-spindle & two-station changeover'],
      ['Mechanical modules', 'Scan · lift/rotate · rotary index'],
      ['Installation', 'Complete machine on a single base, single utility connection'],
      ['Maintenance', 'Easy-removable plumbing cover for quick changeover'],
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
      ['Power', 'Up to 750 KW IGBT'],
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
    title: '24/7 Support',
    text: 'Round-the-clock service line and genuine spare parts keep your line running.',
    icon: 'support',
  },
  {
    title: 'In-house R&D',
    text: 'Electronics, electrical, automation, mechanical and metallurgical engineers under one roof.',
    icon: 'rnd',
  },
  {
    title: 'Operator Training',
    text: 'Hands-on training programs so your team runs equipment at peak efficiency.',
    icon: 'training',
  },
  {
    title: 'IGBT Technology',
    text: 'Modern solid-state IGBT power sources up to 750 KW for efficiency and reliability.',
    icon: 'chip',
  },
];

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
    ['Running cost', 'Rs. 3/kg (Rs. 7/unit)', 'Rs. 5.6/kg', 'Rs. 5/kg'],
    ['Scale loss (steel saving)', '0.8%', '4.5%', '3.4%'],
    ['Productivity', '30–40% increase (automation)', 'Very less (manual)', 'Less (operator dependent)'],
    ['Environmental quality', 'Friendly', 'Very polluting', 'Polluting'],
    ['Heating uniformity', '± 25 °C', '± 75 °C', '± 75 °C'],
    ['Starting time', 'Instant', '1–2 minutes', 'At least 1 hour'],
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

export const testimonials = [
  {
    quote:
      'Supertherm re-engineered our billet heating line and cut scale loss dramatically. Support has been outstanding for over a decade.',
    name: 'Plant Head',
    org: 'Automotive Forging Unit',
  },
  {
    quote:
      'Their melting furnaces run reliably shift after shift. The in-house R&D team understands foundry problems, not just electronics.',
    name: 'Works Manager',
    org: 'Steel Foundry',
  },
  {
    quote:
      'From coil design to operator training, the whole project was turnkey. The 24/7 service line has genuinely saved us downtime.',
    name: 'Maintenance Lead',
    org: 'Pipe & Tube Mill',
  },
];
