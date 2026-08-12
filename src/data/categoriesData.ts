import { Category, Subcategory } from '../types';

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export const INITIAL_PLATFORM_CATEGORIES: CategoryWithSubcategories[] = [
  {
    id: 'cat_fashion',
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    description: 'Apparel, footwear, jewelry, watches, and fashion accessories',
    icon: 'Shirt',
    sortOrder: 1,
    isActive: true,
    subcategories: [
      { id: 'sub_fashion_men', categoryId: 'cat_fashion', name: "Men's Clothing", slug: 'mens-clothing', isActive: true, sortOrder: 1 },
      { id: 'sub_fashion_women', categoryId: 'cat_fashion', name: "Women's Clothing", slug: 'womens-clothing', isActive: true, sortOrder: 2 },
      { id: 'sub_fashion_kids', categoryId: 'cat_fashion', name: "Kids' Clothing", slug: 'kids-clothing', isActive: true, sortOrder: 3 },
      { id: 'sub_fashion_shoes', categoryId: 'cat_fashion', name: 'Shoes', slug: 'shoes', isActive: true, sortOrder: 4 },
      { id: 'sub_fashion_bags', categoryId: 'cat_fashion', name: 'Bags', slug: 'bags', isActive: true, sortOrder: 5 },
      { id: 'sub_fashion_acc', categoryId: 'cat_fashion', name: 'Accessories', slug: 'accessories', isActive: true, sortOrder: 6 },
      { id: 'sub_fashion_jewelry', categoryId: 'cat_fashion', name: 'Jewelry', slug: 'jewelry', isActive: true, sortOrder: 7 },
      { id: 'sub_fashion_watches', categoryId: 'cat_fashion', name: 'Watches', slug: 'watches', isActive: true, sortOrder: 8 },
      { id: 'sub_fashion_general', categoryId: 'cat_fashion', name: 'General', slug: 'general', isActive: true, sortOrder: 9 },
    ],
  },
  {
    id: 'cat_beauty',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Skincare, haircare, cosmetics, fragrances, and tools',
    icon: 'Sparkles',
    sortOrder: 2,
    isActive: true,
    subcategories: [
      { id: 'sub_beauty_skin', categoryId: 'cat_beauty', name: 'Skincare', slug: 'skincare', isActive: true, sortOrder: 1 },
      { id: 'sub_beauty_hair', categoryId: 'cat_beauty', name: 'Hair Care', slug: 'hair-care', isActive: true, sortOrder: 2 },
      { id: 'sub_beauty_makeup', categoryId: 'cat_beauty', name: 'Makeup', slug: 'makeup', isActive: true, sortOrder: 3 },
      { id: 'sub_beauty_fragrance', categoryId: 'cat_beauty', name: 'Fragrances', slug: 'fragrances', isActive: true, sortOrder: 4 },
      { id: 'sub_beauty_personal', categoryId: 'cat_beauty', name: 'Personal Care', slug: 'personal-care', isActive: true, sortOrder: 5 },
      { id: 'sub_beauty_tools', categoryId: 'cat_beauty', name: 'Beauty Tools', slug: 'beauty-tools', isActive: true, sortOrder: 6 },
      { id: 'sub_beauty_general', categoryId: 'cat_beauty', name: 'General', slug: 'general', isActive: true, sortOrder: 7 },
    ],
  },
  {
    id: 'cat_electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Mobile phones, computers, audio equipment, cameras and accessories',
    icon: 'Smartphone',
    sortOrder: 3,
    isActive: true,
    subcategories: [
      { id: 'sub_elec_phones', categoryId: 'cat_electronics', name: 'Phones', slug: 'phones', isActive: true, sortOrder: 1 },
      { id: 'sub_elec_tablets', categoryId: 'cat_electronics', name: 'Tablets', slug: 'tablets', isActive: true, sortOrder: 2 },
      { id: 'sub_elec_computers', categoryId: 'cat_electronics', name: 'Computers & Laptops', slug: 'computers-laptops', isActive: true, sortOrder: 3 },
      { id: 'sub_elec_comp_acc', categoryId: 'cat_electronics', name: 'Computer Accessories', slug: 'computer-accessories', isActive: true, sortOrder: 4 },
      { id: 'sub_elec_audio', categoryId: 'cat_electronics', name: 'Audio', slug: 'audio', isActive: true, sortOrder: 5 },
      { id: 'sub_elec_cameras', categoryId: 'cat_electronics', name: 'Cameras', slug: 'cameras', isActive: true, sortOrder: 6 },
      { id: 'sub_elec_smart', categoryId: 'cat_electronics', name: 'Smart Devices', slug: 'smart-devices', isActive: true, sortOrder: 7 },
      { id: 'sub_elec_chargers', categoryId: 'cat_electronics', name: 'Chargers & Cables', slug: 'chargers-cables', isActive: true, sortOrder: 8 },
      { id: 'sub_elec_acc', categoryId: 'cat_electronics', name: 'Electronic Accessories', slug: 'electronic-accessories', isActive: true, sortOrder: 9 },
      { id: 'sub_elec_general', categoryId: 'cat_electronics', name: 'General', slug: 'general', isActive: true, sortOrder: 10 },
    ],
  },
  {
    id: 'cat_home',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, home decor, kitchen, bedding, and home appliances',
    icon: 'Home',
    sortOrder: 4,
    isActive: true,
    subcategories: [
      { id: 'sub_home_furniture', categoryId: 'cat_home', name: 'Furniture', slug: 'furniture', isActive: true, sortOrder: 1 },
      { id: 'sub_home_decor', categoryId: 'cat_home', name: 'Home Decor', slug: 'home-decor', isActive: true, sortOrder: 2 },
      { id: 'sub_home_kitchen', categoryId: 'cat_home', name: 'Kitchen & Dining', slug: 'kitchen-dining', isActive: true, sortOrder: 3 },
      { id: 'sub_home_bedding', categoryId: 'cat_home', name: 'Bedding', slug: 'bedding', isActive: true, sortOrder: 4 },
      { id: 'sub_home_storage', categoryId: 'cat_home', name: 'Storage & Organization', slug: 'storage-organization', isActive: true, sortOrder: 5 },
      { id: 'sub_home_lighting', categoryId: 'cat_home', name: 'Lighting', slug: 'lighting', isActive: true, sortOrder: 6 },
      { id: 'sub_home_bathroom', categoryId: 'cat_home', name: 'Bathroom', slug: 'bathroom', isActive: true, sortOrder: 7 },
      { id: 'sub_home_appliances', categoryId: 'cat_home', name: 'Home Appliances', slug: 'home-appliances', isActive: true, sortOrder: 8 },
      { id: 'sub_home_general', categoryId: 'cat_home', name: 'General', slug: 'general', isActive: true, sortOrder: 9 },
    ],
  },
  {
    id: 'cat_food',
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Groceries, snacks, coffee, tea, beverages, and packaged goods',
    icon: 'Coffee',
    sortOrder: 5,
    isActive: true,
    subcategories: [
      { id: 'sub_food_groceries', categoryId: 'cat_food', name: 'Groceries', slug: 'groceries', isActive: true, sortOrder: 1 },
      { id: 'sub_food_snacks', categoryId: 'cat_food', name: 'Snacks', slug: 'snacks', isActive: true, sortOrder: 2 },
      { id: 'sub_food_beverages', categoryId: 'cat_food', name: 'Beverages', slug: 'beverages', isActive: true, sortOrder: 3 },
      { id: 'sub_food_coffee', categoryId: 'cat_food', name: 'Coffee & Tea', slug: 'coffee-tea', isActive: true, sortOrder: 4 },
      { id: 'sub_food_bakery', categoryId: 'cat_food', name: 'Bakery', slug: 'bakery', isActive: true, sortOrder: 5 },
      { id: 'sub_food_spices', categoryId: 'cat_food', name: 'Spices & Seasonings', slug: 'spices-seasonings', isActive: true, sortOrder: 6 },
      { id: 'sub_food_packaged', categoryId: 'cat_food', name: 'Packaged Foods', slug: 'packaged-foods', isActive: true, sortOrder: 7 },
      { id: 'sub_food_general', categoryId: 'cat_food', name: 'General', slug: 'general', isActive: true, sortOrder: 8 },
    ],
  },
  {
    id: 'cat_health',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Fitness equipment, supplements, and personal health items',
    icon: 'Activity',
    sortOrder: 6,
    isActive: true,
    subcategories: [
      { id: 'sub_health_fitness_eq', categoryId: 'cat_health', name: 'Fitness Equipment', slug: 'fitness-equipment', isActive: true, sortOrder: 1 },
      { id: 'sub_health_sports_fit', categoryId: 'cat_health', name: 'Sports & Fitness', slug: 'sports-fitness', isActive: true, sortOrder: 2 },
      { id: 'sub_health_products', categoryId: 'cat_health', name: 'Wellness Products', slug: 'wellness-products', isActive: true, sortOrder: 3 },
      { id: 'sub_health_personal', categoryId: 'cat_health', name: 'Personal Wellness', slug: 'personal-wellness', isActive: true, sortOrder: 4 },
      { id: 'sub_health_general', categoryId: 'cat_health', name: 'General', slug: 'general', isActive: true, sortOrder: 5 },
    ],
  },
  {
    id: 'cat_baby',
    name: 'Baby & Kids',
    slug: 'baby-kids',
    description: 'Baby clothing, toys, care products, and school supplies',
    icon: 'Smile',
    sortOrder: 7,
    isActive: true,
    subcategories: [
      { id: 'sub_baby_clothing', categoryId: 'cat_baby', name: 'Baby Clothing', slug: 'baby-clothing', isActive: true, sortOrder: 1 },
      { id: 'sub_baby_care', categoryId: 'cat_baby', name: 'Baby Care', slug: 'baby-care', isActive: true, sortOrder: 2 },
      { id: 'sub_baby_toys', categoryId: 'cat_baby', name: 'Toys', slug: 'toys', isActive: true, sortOrder: 3 },
      { id: 'sub_baby_acc', categoryId: 'cat_baby', name: "Kids' Accessories", slug: 'kids-accessories', isActive: true, sortOrder: 4 },
      { id: 'sub_baby_school', categoryId: 'cat_baby', name: 'School Supplies', slug: 'school-supplies', isActive: true, sortOrder: 5 },
      { id: 'sub_baby_general', categoryId: 'cat_baby', name: 'General', slug: 'general', isActive: true, sortOrder: 6 },
    ],
  },
  {
    id: 'cat_auto',
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car & motorcycle accessories, care, tools, and spare parts',
    icon: 'Car',
    sortOrder: 8,
    isActive: true,
    subcategories: [
      { id: 'sub_auto_car_acc', categoryId: 'cat_auto', name: 'Car Accessories', slug: 'car-accessories', isActive: true, sortOrder: 1 },
      { id: 'sub_auto_moto_acc', categoryId: 'cat_auto', name: 'Motorcycle Accessories', slug: 'motorcycle-accessories', isActive: true, sortOrder: 2 },
      { id: 'sub_auto_car_care', categoryId: 'cat_auto', name: 'Car Care', slug: 'car-care', isActive: true, sortOrder: 3 },
      { id: 'sub_auto_parts', categoryId: 'cat_auto', name: 'Spare Parts', slug: 'spare-parts', isActive: true, sortOrder: 4 },
      { id: 'sub_auto_tools', categoryId: 'cat_auto', name: 'Tools', slug: 'tools', isActive: true, sortOrder: 5 },
      { id: 'sub_auto_general', categoryId: 'cat_auto', name: 'General', slug: 'general', isActive: true, sortOrder: 6 },
    ],
  },
  {
    id: 'cat_office',
    name: 'Office & Business',
    slug: 'office-business',
    description: 'Office supplies, stationery, printers, and commercial gear',
    icon: 'Briefcase',
    sortOrder: 9,
    isActive: true,
    subcategories: [
      { id: 'sub_office_supplies', categoryId: 'cat_office', name: 'Office Supplies', slug: 'office-supplies', isActive: true, sortOrder: 1 },
      { id: 'sub_office_stationery', categoryId: 'cat_office', name: 'Stationery', slug: 'stationery', isActive: true, sortOrder: 2 },
      { id: 'sub_office_printers', categoryId: 'cat_office', name: 'Printers & Accessories', slug: 'printers-accessories', isActive: true, sortOrder: 3 },
      { id: 'sub_office_equipment', categoryId: 'cat_office', name: 'Business Equipment', slug: 'business-equipment', isActive: true, sortOrder: 4 },
      { id: 'sub_office_general', categoryId: 'cat_office', name: 'General', slug: 'general', isActive: true, sortOrder: 5 },
    ],
  },
  {
    id: 'cat_books',
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Books, educational materials, and physical media',
    icon: 'BookOpen',
    sortOrder: 10,
    isActive: true,
    subcategories: [
      { id: 'sub_books_reading', categoryId: 'cat_books', name: 'Books', slug: 'books', isActive: true, sortOrder: 1 },
      { id: 'sub_books_edu', categoryId: 'cat_books', name: 'Educational Materials', slug: 'educational-materials', isActive: true, sortOrder: 2 },
      { id: 'sub_books_media', categoryId: 'cat_books', name: 'Music & Media', slug: 'music-media', isActive: true, sortOrder: 3 },
      { id: 'sub_books_general', categoryId: 'cat_books', name: 'General', slug: 'general', isActive: true, sortOrder: 4 },
    ],
  },
  {
    id: 'cat_sports',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sportswear, athletic gear, and outdoor activity equipment',
    icon: 'Dumbbell',
    sortOrder: 11,
    isActive: true,
    subcategories: [
      { id: 'sub_sports_wear', categoryId: 'cat_sports', name: 'Sportswear', slug: 'sportswear', isActive: true, sortOrder: 1 },
      { id: 'sub_sports_equipment', categoryId: 'cat_sports', name: 'Sports Equipment', slug: 'sports-equipment', isActive: true, sortOrder: 2 },
      { id: 'sub_sports_outdoor', categoryId: 'cat_sports', name: 'Outdoor Equipment', slug: 'outdoor-equipment', isActive: true, sortOrder: 3 },
      { id: 'sub_sports_acc', categoryId: 'cat_sports', name: 'Fitness Accessories', slug: 'fitness-accessories', isActive: true, sortOrder: 4 },
      { id: 'sub_sports_general', categoryId: 'cat_sports', name: 'General', slug: 'general', isActive: true, sortOrder: 5 },
    ],
  },
  {
    id: 'cat_pets',
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    description: 'Pet food, toys, collars, beds, and grooming care',
    icon: 'Heart',
    sortOrder: 12,
    isActive: true,
    subcategories: [
      { id: 'sub_pets_food', categoryId: 'cat_pets', name: 'Pet Food', slug: 'pet-food', isActive: true, sortOrder: 1 },
      { id: 'sub_pets_acc', categoryId: 'cat_pets', name: 'Pet Accessories', slug: 'pet-accessories', isActive: true, sortOrder: 2 },
      { id: 'sub_pets_care', categoryId: 'cat_pets', name: 'Pet Care', slug: 'pet-care', isActive: true, sortOrder: 3 },
      { id: 'sub_pets_general', categoryId: 'cat_pets', name: 'General', slug: 'general', isActive: true, sortOrder: 4 },
    ],
  },
  {
    id: 'cat_tools',
    name: 'Tools & Hardware',
    slug: 'tools-hardware',
    description: 'Hand tools, power tools, electrical, plumbing, and hardware',
    icon: 'Wrench',
    sortOrder: 13,
    isActive: true,
    subcategories: [
      { id: 'sub_tools_hand', categoryId: 'cat_tools', name: 'Hand Tools', slug: 'hand-tools', isActive: true, sortOrder: 1 },
      { id: 'sub_tools_power', categoryId: 'cat_tools', name: 'Power Tools', slug: 'power-tools', isActive: true, sortOrder: 2 },
      { id: 'sub_tools_hardware', categoryId: 'cat_tools', name: 'Hardware', slug: 'hardware', isActive: true, sortOrder: 3 },
      { id: 'sub_tools_elec', categoryId: 'cat_tools', name: 'Electrical', slug: 'electrical', isActive: true, sortOrder: 4 },
      { id: 'sub_tools_plumbing', categoryId: 'cat_tools', name: 'Plumbing', slug: 'plumbing', isActive: true, sortOrder: 5 },
      { id: 'sub_tools_general', categoryId: 'cat_tools', name: 'General', slug: 'general', isActive: true, sortOrder: 6 },
    ],
  },
  {
    id: 'cat_agri',
    name: 'Agriculture & Gardening',
    slug: 'agriculture-gardening',
    description: 'Gardening supplies, farming tools, seeds, plants, and equipment',
    icon: 'Sprout',
    sortOrder: 14,
    isActive: true,
    subcategories: [
      { id: 'sub_agri_gardening', categoryId: 'cat_agri', name: 'Gardening', slug: 'gardening', isActive: true, sortOrder: 1 },
      { id: 'sub_agri_farming', categoryId: 'cat_agri', name: 'Farming Supplies', slug: 'farming-supplies', isActive: true, sortOrder: 2 },
      { id: 'sub_agri_seeds', categoryId: 'cat_agri', name: 'Seeds & Plants', slug: 'seeds-plants', isActive: true, sortOrder: 3 },
      { id: 'sub_agri_equipment', categoryId: 'cat_agri', name: 'Agricultural Equipment', slug: 'agricultural-equipment', isActive: true, sortOrder: 4 },
      { id: 'sub_agri_general', categoryId: 'cat_agri', name: 'General', slug: 'general', isActive: true, sortOrder: 5 },
    ],
  },
  {
    id: 'cat_other',
    name: 'Other',
    slug: 'other',
    description: 'Products that do not fit into the standard predefined categories',
    icon: 'Package',
    sortOrder: 99,
    isActive: true,
    subcategories: [
      { id: 'sub_other_general', categoryId: 'cat_other', name: 'General', slug: 'general', isActive: true, sortOrder: 1 },
    ],
  },
];

/**
 * Normalization helper: maps legacy/custom category string to a standardized platform category.
 * If cannot be mapped confidently, returns "Other".
 */
export function normalizeCategoryName(rawCategory?: string): string {
  if (!rawCategory || !rawCategory.trim()) return 'Other';
  const clean = rawCategory.trim().toLowerCase();

  for (const cat of INITIAL_PLATFORM_CATEGORIES) {
    if (cat.name.toLowerCase() === clean) return cat.name;
  }

  // Common aliases mapping
  if (clean.includes('elec') || clean.includes('audio') || clean.includes('phone') || clean.includes('gadget')) {
    return 'Electronics';
  }
  if (clean.includes('apparel') || clean.includes('fashion') || clean.includes('cloth') || clean.includes('wear') || clean.includes('streetwear')) {
    return 'Fashion & Clothing';
  }
  if (clean.includes('beauty') || clean.includes('skin') || clean.includes('personal care') || clean.includes('cosmetic')) {
    return 'Beauty & Personal Care';
  }
  if (clean.includes('home') || clean.includes('living') || clean.includes('decor') || clean.includes('kitchen') || clean.includes('furniture')) {
    return 'Home & Living';
  }
  if (clean.includes('food') || clean.includes('beverage') || clean.includes('coffee') || clean.includes('snack')) {
    return 'Food & Beverages';
  }
  if (clean.includes('health') || clean.includes('wellness') || clean.includes('fit')) {
    return 'Health & Wellness';
  }
  if (clean.includes('baby') || clean.includes('kid') || clean.includes('toy')) {
    return 'Baby & Kids';
  }
  if (clean.includes('auto') || clean.includes('car') || clean.includes('motor')) {
    return 'Automotive';
  }
  if (clean.includes('office') || clean.includes('stationery') || clean.includes('business')) {
    return 'Office & Business';
  }
  if (clean.includes('book') || clean.includes('media')) {
    return 'Books & Media';
  }
  if (clean.includes('sport') || clean.includes('outdoor')) {
    return 'Sports & Outdoors';
  }
  if (clean.includes('pet')) {
    return 'Pet Supplies';
  }
  if (clean.includes('tool') || clean.includes('hardware')) {
    return 'Tools & Hardware';
  }
  if (clean.includes('agri') || clean.includes('garden') || clean.includes('plant')) {
    return 'Agriculture & Gardening';
  }

  return 'Other';
}

export function getSubcategoriesForCategory(categoriesList: CategoryWithSubcategories[], categoryName: string): Subcategory[] {
  if (!categoryName || !categoryName.trim()) return [];
  const normCat = normalizeCategoryName(categoryName);
  const found = categoriesList.find((c) => c.name === normCat || c.name.toLowerCase() === categoryName.toLowerCase());
  if (found && found.subcategories && found.subcategories.length > 0) {
    return found.subcategories.filter((s) => s.isActive !== false);
  }
  // Default general subcategory if none found
  return [{ id: 'sub_gen', categoryId: found?.id || 'cat_other', name: 'General', slug: 'general', isActive: true }];
}
