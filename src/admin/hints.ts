// Wording and widget choices for the generated forms. Everything here is
// optional polish: a field with no entry still gets a sensible input and label.

/** Labels for site.ts exports (the blocks inside each section). */
export const BLOCK_LABELS: Record<string, string> = {
  company: 'Company',
  companyDetails: 'Registration details',
  bankDetails: 'Bank details',
  socialLinks: 'Social links',
  nav: 'Main menu',
  stats: 'Figures',
  advantages: 'Service advantages',
  process: 'How we work',
  capabilities: 'Capabilities',
  products: 'Machines',
  divisions: 'Divisions',
  visionMission: 'Vision and mission',
  productFeatures: 'Product features',
  comparison: 'Induction versus furnace comparison',
  branches: 'Offices',
  serviceCities: 'Service cities',
  countries: 'Countries served',
  testimonials: 'Testimonials',
  clientSectors: 'Sectors served',
  clients: 'Client names',
  galleryImages: 'Gallery photos',
  clientLogos: 'Client logos',
  aboutImages: 'About page photos',
  heroBanners: 'Banner photos',
  heroPhotos: 'Home page slideshow photos',
  pageHeadings: 'Headings',
};

/** Field labels by key name. Anything not listed is derived from the key. */
export const FIELD_LABELS: Record<string, string> = {
  short: 'Short name',
  intro: 'Introduction',
  established: 'Year established',
  phoneRaw: 'Phone, digits only',
  support: 'Support phone',
  supportRaw: 'Support phone, digits only',
  accountsEmail: 'Accounts email',
  line1: 'Address line 1',
  line2: 'Address line 2',
  gst: 'GST number',
  pan: 'PAN',
  udyogAadhar: 'Udyog Aadhar',
  arn: 'ARN',
  hsnMachines: 'HSN code, machines',
  hsnServices: 'HSN code, services',
  ifsc: 'IFSC',
  account: 'Account number',
  href: 'Link',
  sub: 'Small print',
  slug: 'Link name',
  tag: 'Category',
  icon: 'Diagram',
  image: 'Photo',
  image2: 'Second photo',
  seoTitle: 'Search result title',
  seoDescription: 'Search result description',
  keywords: 'Search keywords',
  blurb: 'Description',
  specs: 'Headline specifications',
  specGroups: 'Specification tables',
  meta: 'Details',
  safety: 'Safety and build',
  extra: 'More lists',
  src: 'Photo',
  org: 'Organisation',
  phones: 'Phone numbers',
  contact: 'Contact person',
  role: 'Office type',
  capability: 'Capability photo',
  capability2: 'Second capability photo',
  secondary: 'Secondary photo',
};

/** Labels by path, where the key name alone is ambiguous. */
export const PATH_LABELS: Record<string, string> = {
  'branches.*.primary': 'This is the head office',
  'aboutImages.primary': 'Main photo',
  'aboutImages.secondary': 'Second photo',
};

/** Help text by key name. */
export const FIELD_HELP: Record<string, string> = {
  phoneRaw: 'With country code and no spaces, for example +919990098477. Used for call and WhatsApp links.',
  supportRaw: 'With country code and no spaces.',
  slug: 'Used in links to this machine. Lower-case letters and hyphens only. Changing it breaks existing links.',
  suffix: 'Shown after the number, for example +',
  keywords: 'Phrases people search for.',
};

/** Help text by path, where the key name alone is ambiguous. */
export const PATH_HELP: Record<string, string> = {
  'pageHeadings.*.subtitle': 'Write {name} where the company name should appear.',
  'pageHeadings.*.title': 'The large heading at the top of the page.',
  'nav.*.href': 'A page address on this site, for example /products.',
};

/** Fields that hold an image path or web address. `*` stands for any list position or key. */
export const IMAGE_PATHS = new Set([
  'products.*.image',
  'products.*.image2',
  'heroBanners.*',
  'heroPhotos.*',
  'clientLogos.*',
  'aboutImages.*',
  'galleryImages.*.src',
]);

/** Fields with a fixed set of choices. */
export const CHOICES: Record<string, string[]> = {
  'products.*.icon': ['forge', 'hardening', 'melt', 'weld'],
  'advantages.*.icon': ['support', 'training', 'rnd', 'chip', 'phone', 'mail', 'pin', 'globe', 'spark', 'clock', 'check'],
};

/** Two-column label and value tables. */
export const PAIR_PATHS = new Set(['products.*.meta']);

/** Keys always shown as a multi-line box. */
export const LONG_KEYS = new Set(['intro', 'blurb', 'text', 'quote', 'seoDescription', 'subtitle', 'address', 'vision', 'mission']);

/** What one entry of a list is called, for "Add ..." buttons and untitled entries. */
export const ITEM_NAMES: Record<string, string> = {
  nav: 'menu link',
  stats: 'figure',
  advantages: 'advantage',
  process: 'step',
  capabilities: 'capability',
  products: 'machine',
  divisions: 'division',
  productFeatures: 'feature',
  branches: 'office',
  serviceCities: 'city',
  socialLinks: 'link',
  countries: 'country',
  testimonials: 'testimonial',
  clientSectors: 'sector',
  clients: 'client',
  galleryImages: 'photo',
  clientLogos: 'logo',
  heroBanners: 'photo',
  heroPhotos: 'photo',
  specGroups: 'table',
  extra: 'list',
  phones: 'phone number',
  keywords: 'keyword',
  specs: 'specification',
  safety: 'point',
  features: 'feature',
  applications: 'application',
  items: 'entry',
};

export function humanise(key: string) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const s = key.replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
