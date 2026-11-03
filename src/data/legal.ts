// Angaben für Impressum & Datenschutz. Bitte die Platzhalter in [eckigen Klammern] mit echten Daten ersetzen.
// (Impressumspflicht: ladungsfähige Anschrift + E-Mail. Die Seite bleibt rechtlich angreifbar, solange hier Platzhalter stehen.)
export const legal = {
  name: 'Leon Schubert',
  street: '[Straße und Hausnummer]',
  zip: '[PLZ]',
  city: '[Ort]',
  country: 'Deutschland',
  email: 'admin@ithilfeschubert.xyz',
  phone: '', // optional, z. B. '+49 123 456789'
  authority: '[zuständige Landesdatenschutzbehörde deines Bundeslands]',
}

export const hasPlaceholders = () => Object.values(legal).some((v) => v.includes('['))
