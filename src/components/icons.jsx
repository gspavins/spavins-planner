const base = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.6" {...base}><path d="M12 5v14M5 12h14" /></svg>
);
export const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.2" {...base}><path d="M15 18l-6-6 6-6" /></svg>
);
export const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.2" {...base}><path d="M9 18l6-6-6-6" /></svg>
);
export const CarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <path d="M5 17h14M6 17l1.5-6h9L18 17" /><circle cx="8" cy="18" r="1.6" /><circle cx="16" cy="18" r="1.6" />
  </svg>
);
export const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="2.4" {...base}><path d="M5 12l4 4 10-10" /></svg>
);
export const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
