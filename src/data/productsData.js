export const makeSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export const productCategories = [
  "All Categories",
  "Diagnostic Analyzers",
  "Molecular Diagnostics",
  "Hospital & ICU Gear",
  "Laboratory Equipment",
  "Reagents & Consumables"
];
