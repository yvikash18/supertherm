-- Seed the CMS with the current site content (run after 0001_init.sql).
-- Each route is one row in `pages`; `content` is the editable JSON for that route.
-- Deeper structured data (e.g. full product spec tables) can be pasted into the
-- JSON via the admin console later.

insert into public.pages (slug, label, content) values
('global', 'Global (company & contact)', '{
  "name": "Supertherm Corporations",
  "tagline": "Excellence in Induction Technology",
  "intro": "World-class manufacturer of induction heating equipment — hardening, forging, melting and high-frequency welding systems engineered for the modern foundry.",
  "phone": "+91 99900 98477",
  "support": "+91 70829 10292",
  "email": "rameshyadav72@gmail.com",
  "address": { "line1": "Plot No. 708, MIE, Part A", "line2": "Bahadurgarh, Haryana 124507", "country": "India" },
  "social": {
    "linkedin": "https://www.linkedin.com/company/supertherm-corporations-bahadhurgarh/",
    "youtube": "https://youtube.com/channel/UCdn_1NjWcb1Pb01WV25j7fA",
    "facebook": "https://facebook.com/",
    "twitter": "https://twitter.com/"
  }
}'::jsonb),

('home', 'Home page', '{
  "heroTitleLine1": "Precision heat,",
  "heroTitleLine2": "forged into power.",
  "heroLead": "Supertherm Corporations engineers world-class induction systems — hardening, forging, melting and high-frequency welding — built for the modern foundry and shop floor.",
  "stats": [
    { "value": 30, "suffix": "+", "label": "Years of engineering", "sub": "Serving industry since 1994" },
    { "value": 550, "suffix": "+", "label": "Hardening & melting units", "sub": "Installed and running" },
    { "value": 1000, "suffix": "+", "label": "Machines delivered", "sub": "Across Asian markets" },
    { "value": 9, "suffix": "", "label": "Countries served", "sub": "And expanding" }
  ]
}'::jsonb),

('about', 'About page', '{
  "eyebrow": "About us",
  "title": "Three decades of induction expertise",
  "subtitle": "Since 1994, Supertherm Corporations has designed and built induction systems that heat, harden, melt and weld metal for manufacturers across Asia and the Gulf."
}'::jsonb),

('products', 'Products page', '{
  "eyebrow": "Our products",
  "title": "Induction systems for every process",
  "subtitle": "Four core product lines — Forge Master forging, Supertherm Scan hardening, medium-frequency melting furnaces and CFI high-frequency welders. Each engineered to your part, tonnage and cycle-time, and built in-house."
}'::jsonb),

('gallery', 'Gallery page', '{
  "eyebrow": "Gallery",
  "title": "Machines on the floor",
  "subtitle": "Real installations and equipment from Supertherm projects across India and abroad. Filter by process, tap any photo to enlarge."
}'::jsonb),

('branches', 'Branches page', '{
  "eyebrow": "Branches",
  "title": "Close to your factory floor",
  "subtitle": "A head office and works in Haryana, backed by regional offices nationwide and a service reach that spans nine countries."
}'::jsonb),

('clients', 'Clients page', '{
  "eyebrow": "Clients",
  "title": "Trusted where heat means business",
  "subtitle": "From automotive forging giants to independent foundries, manufacturers rely on Supertherm induction systems to run shift after shift."
}'::jsonb),

('contact', 'Contact page', '{
  "eyebrow": "Contact",
  "title": "Let''s engineer your heat",
  "subtitle": "Tell us about your part and process — our engineers will get back with the right induction solution."
}'::jsonb)

on conflict (slug) do update
  set content = excluded.content,
      label = excluded.label;
