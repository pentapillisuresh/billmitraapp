export const STORE = {
  name: 'Sri Lakshmi Restaurant',
  owner: 'Suresh',
  businessType: 'Restaurant',
  address: 'MVP Colony, Visakhapatnam',
  gst: '37ABCDE1234F1Z5',
};

export const INVENTORY = [
  { id:'I001', name:'Water Bottle', category:'Beverages', unit:'Piece', mrp:20, gst:5, reserve:70, live:30, min:10 },
  { id:'I002', name:'Coca Cola', category:'Beverages', unit:'Bottle', mrp:40, gst:5, reserve:12, live:6, min:10 },
  { id:'I003', name:'Ice Cream', category:'Food', unit:'Cup', mrp:50, gst:5, reserve:0, live:0, min:5 },
  { id:'I004', name:'Biryani Plate', category:'Food', unit:'Plate', mrp:180, gst:5, reserve:45, live:15, min:10 },
  { id:'I005', name:'French Fries', category:'Food', unit:'Plate', mrp:120, gst:5, reserve:20, live:5, min:10 },
  { id:'I006', name:'Chips Pack', category:'Snacks', unit:'Pack', mrp:20, gst:5, reserve:100, live:50, min:20 },
];

export const RAW_MATERIALS = [
  { id:'R001', name:'Cooking Oil', unit:'Ltr', unitCost:180 },
  { id:'R002', name:'Tomato', unit:'Kg', unitCost:30 },
  { id:'R003', name:'Onion', unit:'Kg', unitCost:25 },
  { id:'R004', name:'Chicken', unit:'Kg', unitCost:80 },
  { id:'R005', name:'Basmati Rice', unit:'Kg', unitCost:70 },
  { id:'R006', name:'Spices Mix', unit:'Kg', unitCost:60 },
];

export const USAGE_HISTORY = [
  { id:'U001', materialId:'R001', material:'Cooking Oil', qty:5, unit:'Ltr', type:'Given to Cook', date:'05 Oct 2026', time:'10:30 AM', remarks:'Used for cooking today', unitCost:180, cost:900 },
  { id:'U002', materialId:'R003', material:'Onion', qty:15, unit:'Kg', type:'Given to Cook', date:'04 Oct 2026', time:'11:15 AM', remarks:'Kitchen usage', unitCost:25, cost:375 },
  { id:'U003', materialId:'R004', material:'Chicken', qty:8, unit:'Kg', type:'Given to Cook', date:'03 Oct 2026', time:'01:20 PM', remarks:'Used for biryani', unitCost:80, cost:640 },
  { id:'U004', materialId:'R005', material:'Basmati Rice', qty:5, unit:'Kg', type:'Given to Cook', date:'02 Oct 2026', time:'09:45 AM', remarks:'Kitchen usage', unitCost:70, cost:350 },
  { id:'U005', materialId:'R002', material:'Tomato', qty:20, unit:'Kg', type:'Given to Cook', date:'01 Oct 2026', time:'10:10 AM', remarks:'Kitchen usage', unitCost:30, cost:600 },
];

export const RECENT_SALES = [
  { id:'B1001', total:630, date:'01 Oct 2026, 01:15 PM' },
  { id:'B1000', total:420, date:'01 Oct 2026, 12:10 PM' },
  { id:'B0999', total:580, date:'01 Oct 2026, 11:42 AM' },
];
