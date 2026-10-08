// Person colours. Each has a soft fill, a stronger dot and a readable text colour.
// Lightness differs between neighbours so they stay distinguishable.
export const PALETTE = [
  { name: "Blue",     bg: "#DCE9F7", dot: "#A9C9EC", fg: "#244E73" },
  { name: "Apricot",  bg: "#FCEBCB", dot: "#F4CF8A", fg: "#7A5717" },
  { name: "Sage",     bg: "#DDE8D9", dot: "#AFC8A8", fg: "#365231" },
  { name: "Pink",     bg: "#F9DFE6", dot: "#EFB3C3", fg: "#7E3A50" },
  { name: "Lavender", bg: "#E6DEF2", dot: "#C6B4E2", fg: "#4F3E6B" },
  { name: "Teal",     bg: "#D6EEEC", dot: "#9FD3CE", fg: "#245A55" },
  { name: "Clay",     bg: "#F5E1D3", dot: "#E3B999", fg: "#73452A" },
  { name: "Stone",    bg: "#E4E2DE", dot: "#C3BFB8", fg: "#45413B" },
];

export const UNASSIGNED = { name: "Unassigned", bg: "#EEEEF2", dot: "#CDCDD6", fg: "#4A4A58" };

export function colourFor(index) {
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];
}
