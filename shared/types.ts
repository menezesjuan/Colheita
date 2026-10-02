export type UserRole = 'player' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
}

export interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string;
  level: number;
  xp: number;
  title: string;
  bio: string;
}

export interface Wallet {
  user_id: string;
  gold_coins: number;
  gems: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  currency: 'gold' | 'gems';
  amount: number;
  balance_before: number;
  balance_after: number;
  transaction_type: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type ItemCategory = 'seed' | 'crop' | 'animal_product' | 'feed' | 'tool' | 'decor';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  sprite_id: string;
  base_sell_price: number;
  base_buy_price: number | null;
  max_stack: number;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  item: Item;
}

export type TileState = 'empty' | 'planted' | 'growing' | 'ready' | 'withered';
export type TileType = 'soil' | 'grass' | 'water' | 'building' | 'animal_pen';

export interface Crop {
  id: string;
  name: string;
  seed_item_id: string;
  harvest_item_id: string;
  growth_time_seconds: number;
  water_interval_seconds: number;
  min_level: number;
  min_yield: number;
  max_yield: number;
  xp_reward: number;
}

export interface FarmTile {
  id: string;
  farm_id: string;
  x: number;
  y: number;
  tile_type: TileType;
  crop_id: string | null;
  crop?: Crop;
  planted_at: string | null;
  watered_at: string | null;
  state: TileState;
  seconds_remaining?: number;
  growth_progress_percent?: number;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  width: number;
  height: number;
  tiles: FarmTile[];
}

export interface Animal {
  id: string;
  name: string;
  buy_cost_gold: number;
  feed_item_id: string;
  produce_item_id: string;
  produce_interval_seconds: number;
  min_level: number;
  xp_reward: number;
}

export interface AnimalInstance {
  id: string;
  farm_id: string;
  animal_id: string;
  nickname: string;
  fed_at: string | null;
  last_produce_collected_at: string | null;
  animal?: Animal;
  is_producing: boolean;
  can_collect: boolean;
  seconds_remaining?: number;
  created_at: string;
}

export type ListingStatus = 'active' | 'sold_out' | 'cancelled';

export interface MarketListing {
  id: string;
  seller_id: string;
  seller_username?: string;
  seller_avatar?: string;
  item_id: string;
  item?: Item;
  quantity: number;
  unit_price: number;
  total_price?: number;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface MarketTransaction {
  id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  seller_username?: string;
  buyer_username?: string;
  item_id: string;
  item_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  fee_amount: number;
  seller_net: number;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'plant' | 'harvest' | 'feed' | 'sell_market' | 'buy_market';
  target_amount: number;
  current_amount?: number;
  reward_gold: number;
  reward_xp: number;
  completed?: boolean;
  claimed?: boolean;
}
