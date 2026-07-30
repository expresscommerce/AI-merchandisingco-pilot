/**
 * Dummy Results Dataset per Store Category (Home & Kitchen, Apparel, Electronics, Beauty, General).
 * Includes both "measured" (completed before/after outcomes) and "tracking" (in-progress) states.
 */

export const DUMMY_RESULTS = {
  home_kitchen: [
    {
      id: 'res-hk-01',
      type: 'price_change',
      product_name: 'Lodge 10.25" Cast Iron Skillet',
      change_summary: 'Price reduced from $34.99 → $29.99',
      approved_at: 'Jul 22, 2026',
      days_since_approval: 8,
      tracking_status: 'measured',
      outcome: '18 units sold since approval, vs. 4 in prior 6 weeks (+350% volume)',
    },
    {
      id: 'res-hk-02',
      type: 'copy_rewrite',
      product_name: 'Artisan Ceramic Mug Set (4-pack)',
      change_summary: 'Description rewritten with cozy morning-coffee social proof angle',
      approved_at: 'Jul 20, 2026',
      days_since_approval: 10,
      tracking_status: 'measured',
      outcome: 'Conversion rate up from 1.8% → 3.2% (+77% uplift)',
    },
    {
      id: 'res-hk-03',
      type: 'bundle_suggestion',
      product_name: 'Kitchen Essentials Cutting Board Bundle',
      change_summary: 'Created 15% off bundle: Bamboo + Walnut + Cutting Mats',
      approved_at: 'Jul 25, 2026',
      days_since_approval: 5,
      tracking_status: 'measured',
      outcome: 'AOV increased from $34.20 → $48.70 on bundle orders',
    },
    {
      id: 'res-hk-04',
      type: 'price_change',
      product_name: 'Stainless Steel Water Bottle (32oz)',
      change_summary: 'Price adjusted from $28.99 → $25.99',
      approved_at: 'Jul 28, 2026',
      days_since_approval: 2,
      tracking_status: 'tracking',
      outcome: null,
    },
    {
      id: 'res-hk-05',
      type: 'copy_rewrite',
      product_name: 'Organic Cotton Throw Blanket',
      change_summary: 'Description updated with tactile luxury & gift-giving hooks',
      approved_at: 'Jul 29, 2026',
      days_since_approval: 1,
      tracking_status: 'tracking',
      outcome: null,
    },
  ],

  apparel: [
    {
      id: 'res-ap-01',
      type: 'price_change',
      product_name: 'Heavyweight Organic Cotton Hoodie',
      change_summary: 'Price reduced from $78.00 → $69.00',
      approved_at: 'Jul 21, 2026',
      days_since_approval: 9,
      tracking_status: 'measured',
      outcome: '42 units sold since approval, vs. 12 in prior 4 weeks (+250% recovery)',
    },
    {
      id: 'res-ap-02',
      type: 'copy_rewrite',
      product_name: 'Water-Resistant Commuter Jacket',
      change_summary: 'Updated listing with 3-layer DWR technical weatherproofing specs',
      approved_at: 'Jul 18, 2026',
      days_since_approval: 12,
      tracking_status: 'measured',
      outcome: 'Conversion rate up from 1.2% → 2.8% (+133% uplift)',
    },
    {
      id: 'res-ap-03',
      type: 'bundle_suggestion',
      product_name: 'Ultimate Everyday Apparel Capsule',
      change_summary: 'Created 12% off bundle: Tee 3-pack + Socks + Chinos',
      approved_at: 'Jul 24, 2026',
      days_since_approval: 6,
      tracking_status: 'measured',
      outcome: 'Average Order Value up by +$16.40 across capsule purchasers',
    },
    {
      id: 'res-ap-04',
      type: 'price_change',
      product_name: 'Minimalist Everyday Crewneck Tee (3-pack)',
      change_summary: 'Price adjusted from $48.00 → $45.00',
      approved_at: 'Jul 28, 2026',
      days_since_approval: 2,
      tracking_status: 'tracking',
      outcome: null,
    },
    {
      id: 'res-ap-05',
      type: 'copy_rewrite',
      product_name: 'Stretch Tech Chino Pants',
      change_summary: 'Copy rewritten to feature hidden zippered travel pockets',
      approved_at: 'Jul 30, 2026',
      days_since_approval: 0,
      tracking_status: 'tracking',
      outcome: null,
    },
  ],

  electronics: [
    {
      id: 'res-el-01',
      type: 'price_change',
      product_name: 'Noise-Cancelling Wireless Headphones',
      change_summary: 'Price repositioned from $149.99 → $134.99',
      approved_at: 'Jul 19, 2026',
      days_since_approval: 11,
      tracking_status: 'measured',
      outcome: '64 units sold since approval, vs. 19 in prior month (+236% boost)',
    },
    {
      id: 'res-el-02',
      type: 'copy_rewrite',
      product_name: 'Magnetic 3-in-1 Wireless Charging Stand',
      change_summary: 'Copy rewritten to lead with MagSafe 15W fast-charging & nightstand decluttering',
      approved_at: 'Jul 23, 2026',
      days_since_approval: 7,
      tracking_status: 'measured',
      outcome: 'Product detail page dwell time increased from 3.8s → 7.4s (+95%)',
    },
    {
      id: 'res-el-03',
      type: 'bundle_suggestion',
      product_name: 'Desk Productivity Power Bundle',
      change_summary: 'Created 15% off bundle: Vertical Mouse + 65W GaN Charger + Charging Stand',
      approved_at: 'Jul 26, 2026',
      days_since_approval: 4,
      tracking_status: 'measured',
      outcome: 'Attach rate reached 28% of all workspace accessory orders',
    },
    {
      id: 'res-el-04',
      type: 'price_change',
      product_name: 'Compact 65W GaN Fast Wall Charger',
      change_summary: 'Price adjusted from $39.99 → $34.99',
      approved_at: 'Jul 29, 2026',
      days_since_approval: 1,
      tracking_status: 'tracking',
      outcome: null,
    },
    {
      id: 'res-el-05',
      type: 'copy_rewrite',
      product_name: 'Ergonomic Vertical Wireless Mouse',
      change_summary: 'Added 57-degree posture science & wrist pain prevention callouts',
      approved_at: 'Jul 30, 2026',
      days_since_approval: 0,
      tracking_status: 'tracking',
      outcome: null,
    },
  ],
};

/**
 * Helper to fetch results by store category.
 * Falls back to home_kitchen if category is missing or general.
 */
export function getResultsForCategory(category) {
  const key = category ? category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') : 'home_kitchen';
  return DUMMY_RESULTS[key] || DUMMY_RESULTS.home_kitchen;
}
