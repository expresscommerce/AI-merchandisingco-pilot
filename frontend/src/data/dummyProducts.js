/**
 * Dummy Product Dataset per Category (Home & Kitchen, Apparel, Electronics, Beauty, General).
 * Used for AI agent analysis, tool lookups, and pre-generation of recommendations.
 */

export const DUMMY_PRODUCTS = {
  home_kitchen: [
    {
      id: 'hk-101',
      product_name: 'Lodge 10.25" Cast Iron Skillet',
      category: 'Home & Kitchen',
      current_price: 34.99,
      cost_price: 18.50,
      competitor_prices: { Amazon: 29.99, Target: 28.99, Walmart: 29.50 },
      rating: 4.7,
      review_count: 1420,
      recent_reviews: [
        'Great heavy duty skillet, but price was a bit higher than Target.',
        'Love the heat retention! Perfectly seared steak.',
        'Heavy and reliable, classic kitchen staple.'
      ],
      sales_trend_30d: [3, 2, 4, 2, 3, 1, 2, 3, 2, 1, 2, 3, 2, 2, 1, 3, 2, 1, 2, 2, 3, 1, 2, 2, 1, 3, 2, 1, 2, 2],
      current_copy: 'Set of 1 cast iron skillet. 10.25 inch diameter. Pre-seasoned with 100% natural vegetable oil.'
    },
    {
      id: 'hk-102',
      product_name: 'Artisan Ceramic Mug Set (4-pack)',
      category: 'Home & Kitchen',
      current_price: 38.00,
      cost_price: 14.00,
      competitor_prices: { Etsy: 42.00, WestElm: 48.00 },
      rating: 4.4,
      review_count: 310,
      recent_reviews: [
        'Mugs are pretty but description was so boring.',
        'Hold heat well, nice cozy feel in hand.',
        'Good quality ceramics for morning coffee.'
      ],
      sales_trend_30d: [5, 6, 4, 5, 7, 6, 5, 4, 6, 5, 4, 5, 6, 4, 5, 6, 5, 4, 5, 6, 5, 4, 5, 6, 5, 4, 5, 6, 5, 4],
      current_copy: 'Set of 4 ceramic mugs. 12 oz capacity. Microwave and dishwasher safe. Available in Matte White, Sage Green, and Dusty Rose.'
    },
    {
      id: 'hk-103',
      product_name: 'Bamboo Cutting Board (Large)',
      category: 'Home & Kitchen',
      current_price: 24.99,
      cost_price: 9.20,
      competitor_prices: { Amazon: 22.50, IKEA: 19.99 },
      rating: 4.5,
      review_count: 580,
      sales_trend_30d: [8, 7, 9, 8, 7, 9, 8, 7, 8, 9, 7, 8, 9, 8, 7, 8, 9, 7, 8, 9, 8, 7, 8, 9, 8, 7, 8, 9, 8, 7],
      current_copy: 'Organic bamboo cutting board. Deep juice groove. 17x12 inches.'
    },
    {
      id: 'hk-104',
      product_name: 'Walnut End-Grain Chopping Block',
      category: 'Home & Kitchen',
      current_price: 89.99,
      cost_price: 35.00,
      competitor_prices: { SurLaTable: 110.00, WilliamsSonoma: 125.00 },
      rating: 4.9,
      review_count: 185,
      sales_trend_30d: [2, 1, 2, 3, 1, 2, 1, 2, 3, 2, 1, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 2, 1, 2, 3, 1, 2, 1, 2, 1],
      current_copy: 'End-grain walnut wood block. Handcrafted with food-safe mineral oil finish.'
    },
    {
      id: 'hk-105',
      product_name: 'Flexible Plastic Cutting Mat Set (3-pack)',
      category: 'Home & Kitchen',
      current_price: 12.99,
      cost_price: 3.50,
      competitor_prices: { Amazon: 11.99, BedBath: 14.99 },
      rating: 4.3,
      review_count: 420,
      sales_trend_30d: [10, 12, 11, 10, 9, 11, 10, 12, 11, 10, 9, 11, 10, 12, 11, 10, 9, 11, 10, 12, 11, 10, 9, 11, 10, 12, 11, 10, 9, 11],
      current_copy: 'BPA-free flexible cutting mats with icon indicators for meat, veg, and bread.'
    },
    {
      id: 'hk-106',
      product_name: 'Stainless Steel Water Bottle (32oz)',
      category: 'Home & Kitchen',
      current_price: 28.99,
      cost_price: 10.50,
      competitor_prices: { HydroFlask: 44.95, YETI: 38.00, SimpleModern: 23.99 },
      rating: 4.6,
      review_count: 890,
      sales_trend_30d: [8, 9, 7, 8, 10, 9, 7, 6, 7, 5, 6, 5, 4, 5, 4, 3, 4, 3, 3, 4, 3, 2, 3, 3, 2, 3, 2, 2, 3, 2],
      current_copy: 'Vacuum insulated double wall water bottle. Keeps drinks cold for 24h.'
    },
    {
      id: 'hk-107',
      product_name: 'Ceramic Pour-Over Coffee Dripper',
      category: 'Home & Kitchen',
      current_price: 22.50,
      cost_price: 7.00,
      competitor_prices: { Hario: 25.00, BlueBottle: 30.00 },
      rating: 4.8,
      review_count: 640,
      sales_trend_30d: [6, 5, 7, 6, 5, 8, 6, 5, 7, 6, 5, 8, 6, 5, 7, 6, 5, 8, 6, 5, 7, 6, 5, 8, 6, 5, 7, 6, 5, 8],
      current_copy: 'Single cup pour-over brewer with spiral ribs for optimum extraction.'
    },
    {
      id: 'hk-108',
      product_name: 'Gooseneck Electric Kettle (0.8L)',
      category: 'Home & Kitchen',
      current_price: 64.99,
      cost_price: 28.00,
      competitor_prices: { Fellow: 165.00, Bodum: 49.99, Cosori: 55.99 },
      rating: 4.7,
      review_count: 930,
      sales_trend_30d: [4, 5, 4, 6, 5, 4, 5, 4, 6, 5, 4, 5, 4, 6, 5, 4, 5, 4, 6, 5, 4, 5, 4, 6, 5, 4, 5, 4, 6, 5],
      current_copy: 'Variable temperature pour-over kettle with precision pour spout.'
    }
  ],

  apparel: [
    {
      id: 'ap-201',
      product_name: 'Heavyweight Organic Cotton Hoodie',
      category: 'Apparel',
      current_price: 78.00,
      cost_price: 26.00,
      competitor_prices: { Everlane: 88.00, Gymshark: 65.00, Uniqlo: 49.90 },
      rating: 4.8,
      review_count: 740,
      sales_trend_30d: [12, 14, 11, 13, 10, 12, 11, 9, 10, 8, 9, 7, 8, 6, 7, 5, 6, 5, 4, 5, 4, 3, 4, 3, 3, 2, 3, 2, 2, 2],
      current_copy: '100% organic cotton hoodie. 450 GSM fleece. Pre-shrunk relaxed fit.'
    },
    {
      id: 'ap-202',
      product_name: 'Minimalist Everyday Crewneck Tee (3-pack)',
      category: 'Apparel',
      current_price: 45.00,
      cost_price: 13.50,
      competitor_prices: { BYLT: 68.00, TrueClassic: 54.00, FreshCleanThreads: 48.00 },
      rating: 4.6,
      review_count: 1120,
      sales_trend_30d: [15, 18, 16, 17, 19, 18, 16, 17, 18, 19, 16, 17, 18, 19, 16, 17, 18, 19, 16, 17, 18, 19, 16, 17, 18, 19, 16, 17, 18, 19],
      current_copy: 'Pack of 3 basic crewneck t-shirts. 60% combed ring-spun cotton, 40% polyester.'
    },
    {
      id: 'ap-203',
      product_name: 'Water-Resistant Commuter Jacket',
      category: 'Apparel',
      current_price: 145.00,
      cost_price: 48.00,
      competitor_prices: { Patagonia: 199.00, Lululemon: 168.00, ArcTeryx: 280.00 },
      rating: 4.5,
      review_count: 290,
      recent_reviews: [
        'High quality construction but page copy doesn’t explain technical fabric benefits.',
        'Shed rain well on my daily commute.'
      ],
      sales_trend_30d: [3, 4, 3, 5, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5, 4],
      current_copy: 'Polyester commuter shell. DWR coating. Multiple utility pockets.'
    },
    {
      id: 'ap-204',
      product_name: 'Merino Wool Performance Socks (3-pack)',
      category: 'Apparel',
      current_price: 36.00,
      cost_price: 10.00,
      competitor_prices: { DarnTough: 48.00, Bombas: 46.00, Smartwool: 42.00 },
      rating: 4.9,
      review_count: 860,
      sales_trend_30d: [14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15],
      current_copy: '70% Merino wool cushion socks. Moisture wicking and odor resistant.'
    },
    {
      id: 'ap-205',
      product_name: 'Stretch Tech Chino Pants',
      category: 'Apparel',
      current_price: 88.00,
      cost_price: 27.00,
      competitor_prices: { Vuori: 98.00, Bonobos: 119.00, LuluABC: 128.00 },
      rating: 4.7,
      review_count: 650,
      sales_trend_30d: [7, 8, 7, 9, 8, 7, 8, 7, 9, 8, 7, 8, 7, 9, 8, 7, 8, 7, 9, 8, 7, 8, 7, 9, 8, 7, 8, 7, 9, 8],
      current_copy: '4-way stretch travel chinos. Wrinkle resistant with hidden zippered passport pocket.'
    }
  ],

  electronics: [
    {
      id: 'el-301',
      product_name: 'Noise-Cancelling Wireless Headphones',
      category: 'Electronics',
      current_price: 149.99,
      cost_price: 52.00,
      competitor_prices: { Anker: 129.99, Sony: 198.00, Bose: 249.00 },
      rating: 4.6,
      review_count: 1840,
      sales_trend_30d: [18, 16, 15, 14, 12, 13, 11, 10, 11, 9, 8, 9, 7, 8, 6, 7, 5, 6, 4, 5, 4, 3, 3, 2, 3, 2, 2, 1, 2, 1],
      current_copy: 'Over-ear Bluetooth headphones with active noise cancelling and 30-hour battery life.'
    },
    {
      id: 'el-302',
      product_name: 'Magnetic 3-in-1 Wireless Charging Stand',
      category: 'Electronics',
      current_price: 59.99,
      cost_price: 18.00,
      competitor_prices: { Belkin: 129.95, Anker: 69.99, ESR: 49.99 },
      rating: 4.5,
      review_count: 920,
      sales_trend_30d: [9, 10, 8, 11, 9, 10, 8, 11, 9, 10, 8, 11, 9, 10, 8, 11, 9, 10, 8, 11, 9, 10, 8, 11, 9, 10, 8, 11, 9, 10],
      current_copy: '15W MagSafe compatible stand for Phone, Watch, and Earbuds simultaneously.'
    },
    {
      id: 'el-303',
      product_name: 'Ergonomic Vertical Wireless Mouse',
      category: 'Electronics',
      current_price: 39.99,
      cost_price: 12.00,
      competitor_prices: { Logitech: 99.99, Anker: 27.99, Kensington: 44.99 },
      rating: 4.7,
      review_count: 730,
      sales_trend_30d: [6, 7, 6, 8, 7, 6, 7, 6, 8, 7, 6, 7, 6, 8, 7, 6, 7, 6, 8, 7, 6, 7, 6, 8, 7, 6, 7, 6, 8, 7],
      current_copy: 'Ergonomic 57-degree vertical mouse reduces wrist strain. Dual Bluetooth + 2.4G dongle.'
    },
    {
      id: 'el-304',
      product_name: 'Compact 65W GaN Fast Wall Charger',
      category: 'Electronics',
      current_price: 34.99,
      cost_price: 9.50,
      competitor_prices: { Anker: 39.99, UGREEN: 29.99, Baseus: 31.99 },
      rating: 4.8,
      review_count: 1450,
      sales_trend_30d: [14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15, 13, 16, 14, 15],
      current_copy: 'Dual USB-C and USB-A 65 Watt fast charger for laptops, tablets, and phones.'
    }
  ]
};
