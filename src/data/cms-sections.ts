// How the content in site.ts is grouped for editing.
// Each section is one row in the CMS (`pages.slug`), holding the listed
// site.ts exports as top-level keys. Shared by the build-time loader
// (content.ts), the /admin console, the backend and the seed script.

export interface CmsSection {
  slug: string;
  label: string;
  blurb: string;
  /** Names of the site.ts exports stored in this section. */
  keys: string[];
}

export const SECTIONS: CmsSection[] = [
  {
    slug: 'global',
    label: 'Company & contact',
    blurb: 'Company name, phone numbers, email, address, social links, registration and bank details and the main menu.',
    keys: ['company', 'socialLinks', 'companyDetails', 'bankDetails', 'nav'],
  },
  {
    slug: 'home',
    label: 'Home',
    blurb: 'Figures, service advantages and the working process shown on the home page.',
    keys: ['stats', 'advantages', 'process', 'capabilities'],
  },
  {
    slug: 'products',
    label: 'Products',
    blurb: 'The machine families with their descriptions, specification tables, features and photos, and the two divisions.',
    keys: ['products', 'divisions'],
  },
  {
    slug: 'about',
    label: 'About',
    blurb: 'Vision and mission, the product feature list and the induction versus furnace comparison table.',
    keys: ['visionMission', 'productFeatures', 'comparison'],
  },
  {
    slug: 'branches',
    label: 'Branches',
    blurb: 'Head office and branch offices, service cities and countries served.',
    keys: ['branches', 'serviceCities', 'countries'],
  },
  {
    slug: 'clients',
    label: 'Clients & testimonials',
    blurb: 'Customer quotes, the sectors served and client names.',
    keys: ['testimonials', 'clientSectors', 'clients'],
  },
  {
    slug: 'media',
    label: 'Gallery & images',
    blurb: 'Gallery photos, client logos and the photos used on the about and home pages.',
    keys: ['galleryImages', 'clientLogos', 'aboutImages', 'heroBanners'],
  },
  {
    slug: 'headings',
    label: 'Page headings',
    blurb: 'The heading and intro line at the top of each inner page.',
    keys: ['pageHeadings'],
  },
];

export const SECTION_SLUGS = SECTIONS.map((s) => s.slug);

/** Exports that exist in site.ts but are not used by any page in the current design. */
export const UNUSED_KEYS = ['capabilities', 'clients', 'heroBanners'];
