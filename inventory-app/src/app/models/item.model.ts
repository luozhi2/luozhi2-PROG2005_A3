export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Tools',
  'Miscellaneous',
] as const;

export const STOCK_STATUSES = ['In Stock', 'Low Stock', 'Out of Stock'] as const;

export type Category = string;
export type StockStatus = string;

export interface Item {
  item_id: number;
  item_name: string;
  category: Category;
  quantity: number;
  price: number;
  supplier_name: string;
  stock_status: StockStatus;
  featured_item: number;
  special_note: string | null;
}

export type ItemPayload = Omit<Item, 'item_id'>;
