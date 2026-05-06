
export interface TransactionItem {
  menu_name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  created_at: string;
  items: TransactionItem[];
  total_price: number;
  payment_amount: number;
  change_amount: number;
}

export const MENU_ITEMS = [
  { id: 'full', name: 'Roti Bakar Full', price: 20000, image: 'https://iili.io/BZlZwQ4.jpg' },
  { id: 'half', name: 'Roti Bakar Setengah', price: 12000, image: 'https://iili.io/BZ0YMlf.md.webp' },
];
