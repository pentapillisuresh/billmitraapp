export const C = {
  // BillMitra Brand
  primary: '#800080',
  primaryDark: '#4B005C',
  primarySoft: '#F0E4FF',

  // App Background
  bg: '#FAF8FC',
  card: '#FFFFFF',

  // Text
  text: '#17124A',
  muted: '#6F6A86',

  // Borders
  border: '#E3D8F0',

  // Stock Status
  green: '#198754',
  greenSoft: '#E9F7EF',

  amber: '#C28A19',
  amberSoft: '#FFF6DC',

  red: '#D64545',
  redSoft: '#FDECEC',

  // Common
  black: '#111111',
  white: '#FFFFFF'
};

export const STATUS = {
  IN: {
    label: 'In Stock',
    color: C.green,
    bg: C.greenSoft
  },

  LOW: {
    label: 'Low Stock',
    color: C.amber,
    bg: C.amberSoft
  },

  OUT: {
    label: 'Out of Stock',
    color: C.red,
    bg: C.redSoft
  }
};