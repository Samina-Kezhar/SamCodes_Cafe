export const initialMenuItems = [
  // --- SIGNATURE FRAPPES ---
  {
    id: "frap-01",
    name: "Coffee Stand Signature Frappe",
    category: "signature_frappes",
    price: 280,
    description: "Our house special blended frappe crafted with double espresso, velvety milk, chocolate shavings & mountain of whipped cream.",
    image: "/images/signature-frappe.jpg",
    tags: ["Best Seller", "Signature"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 8,
    customizable: {
      sizes: [
        { name: "Regular (350ml)", price: 0 },
        { name: "Large (480ml)", price: 50 }
      ],
      milk: ["Regular Milk", "Oat Milk (+₹50)", "Almond Milk (+₹50)", "Soy Milk (+₹40)"],
      sweetness: ["Regular Sweet", "Less Sweet", "No Sugar Added"],
      addons: [
        { name: "Extra Espresso Shot", price: 40 },
        { name: "Extra Whipped Cream", price: 30 },
        { name: "Caramel Drizzle", price: 25 },
        { name: "Biscoff Crumble", price: 35 }
      ]
    }
  },
  {
    id: "frap-02",
    name: "Lotus Biscoff Dream Frappe",
    category: "signature_frappes",
    price: 310,
    description: "Original Lotus Biscoff spread blended with espresso, topped with whipped cream, golden caramel swirl & crunchy biscuit crumbs.",
    image: "/images/signature-frappe.jpg",
    tags: ["Must Try", "Trending"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 8,
    customizable: {
      sizes: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 50 }
      ],
      milk: ["Regular Milk", "Oat Milk (+₹50)", "Almond Milk (+₹50)"],
      sweetness: ["Regular Sweet", "Less Sweet"],
      addons: [
        { name: "Extra Biscoff Cookie", price: 30 },
        { name: "Extra Espresso Shot", price: 40 }
      ]
    }
  },
  {
    id: "frap-03",
    name: "Nutella Hazelnut Crunch Frappe",
    category: "signature_frappes",
    price: 320,
    description: "Decadent Nutella ribboned with roasted hazelnut syrup, espresso, and topped with chopped praline & whipped cream.",
    image: "/images/signature-frappe.jpg",
    tags: ["Chef Special"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 8,
    customizable: {
      sizes: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 50 }
      ],
      milk: ["Regular Milk", "Oat Milk (+₹50)"],
      sweetness: ["Regular Sweet", "Less Sweet"],
      addons: [
        { name: "Extra Nutella Shot", price: 40 },
        { name: "Choco Fudge Drizzle", price: 25 }
      ]
    }
  },
  {
    id: "frap-04",
    name: "Dark Mocha Belgian Fudge Frappe",
    category: "signature_frappes",
    price: 290,
    description: "70% Belgian dark chocolate fudge blended with our bold house roast and chilled milk, topped with cocoa dusting.",
    image: "/images/signature-frappe.jpg",
    tags: ["Bestseller"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 8,
    customizable: {
      sizes: [{ name: "Regular", price: 0 }, { name: "Large", price: 50 }],
      milk: ["Regular Milk", "Oat Milk (+₹50)"],
      sweetness: ["Regular Sweet", "Dark & Bold (Less Sweet)"],
      addons: [{ name: "Extra Espresso Shot", price: 40 }]
    }
  },

  // --- HOT SPECIALTY COFFEES ---
  {
    id: "hot-01",
    name: "Artisan Rosetta Cappuccino",
    category: "hot_coffee",
    price: 190,
    description: "Balanced double shot of freshly ground Arabica beans, silky steamed milk, and velvety micro-foam with hand-poured latte art.",
    image: "/images/latte-art.jpg",
    tags: ["Classic", "Barista Choice"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 6,
    customizable: {
      sizes: [
        { name: "Standard (220ml)", price: 0 },
        { name: "Mug (320ml)", price: 40 }
      ],
      milk: ["Full Cream Dairy", "Oat Milk (+₹50)", "Almond Milk (+₹50)"],
      sweetness: ["Unsweetened", "Brown Sugar on side", "Stevia"],
      addons: [
        { name: "Cinnamon Dust", price: 0 },
        { name: "Vanilla Syrup", price: 30 },
        { name: "Extra Espresso Shot", price: 40 }
      ]
    }
  },
  {
    id: "hot-02",
    name: "Spanish Caramel Cortado / Latte",
    category: "hot_coffee",
    price: 240,
    description: "Rich espresso sweetened with steamed condensed milk and caramelized brown sugar notes, smooth and comforting.",
    image: "/images/latte-art.jpg",
    tags: ["Popular"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 6,
    customizable: {
      sizes: [{ name: "Regular", price: 0 }, { name: "Large", price: 40 }],
      milk: ["Full Cream Dairy", "Oat Milk (+₹50)"],
      sweetness: ["Signature Sweet", "Less Sweet"],
      addons: [{ name: "Salted Caramel Drizzle", price: 25 }]
    }
  },
  {
    id: "hot-03",
    name: "Irish Cream Velvet Latte (Non-Alcoholic)",
    category: "hot_coffee",
    price: 250,
    description: "Silky steamed milk infused with rich Irish cream syrup and dark roasted espresso, crowned with velvety foam.",
    image: "/images/latte-art.jpg",
    tags: ["Cozy Warm"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 6,
    customizable: {
      sizes: [{ name: "Regular", price: 0 }, { name: "Large", price: 40 }],
      milk: ["Dairy Milk", "Oat Milk (+₹50)"],
      sweetness: ["Regular Sweet", "Less Sweet"],
      addons: [{ name: "Extra Shot", price: 40 }]
    }
  },
  {
    id: "hot-04",
    name: "Pure Double Shot Espresso (Doppio)",
    category: "hot_coffee",
    price: 140,
    description: "Two pure shots of single-origin Indian Arabica roast with a thick golden-hazelnut crema.",
    image: "/images/latte-art.jpg",
    tags: ["Intense"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 4,
    customizable: {
      sizes: [{ name: "Doppio (60ml)", price: 0 }],
      milk: ["No Milk"],
      sweetness: ["No Sugar", "Sugar on Side"],
      addons: [{ name: "Hot Water (Americano Style)", price: 20 }]
    }
  },

  // --- COLD BREWS & ICED COFFEE ---
  {
    id: "cold-01",
    name: "Vietnamese Slow Drip Iced Coffee",
    category: "cold_brews",
    price: 240,
    description: "Traditional slow-dripped bold dark roast over sweetened condensed milk and crushed crystal ice.",
    image: "/images/signature-frappe.jpg",
    tags: ["Customer Favorite"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 7,
    customizable: {
      sizes: [{ name: "Standard (300ml)", price: 0 }],
      milk: ["Condensed Milk Blend"],
      sweetness: ["Traditional Sweet", "Less Sweet"],
      addons: [{ name: "Extra Espresso Shot", price: 40 }]
    }
  },
  {
    id: "cold-02",
    name: "Vanilla Sweet Cream Cold Brew",
    category: "cold_brews",
    price: 250,
    description: "18-hour slow-steeped smooth cold brew coffee topped with a cascading cloud of house-made vanilla sweet cream.",
    image: "/images/signature-frappe.jpg",
    tags: ["Smooth", "Low Acidity"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 5,
    customizable: {
      sizes: [{ name: "Regular", price: 0 }, { name: "Large", price: 50 }],
      milk: ["Sweet Cream Top", "Oat Sweet Cream (+₹40)"],
      sweetness: ["Mildly Sweet", "Unsweetened Brew"],
      addons: [{ name: "Caramel Float", price: 25 }]
    }
  },
  {
    id: "cold-03",
    name: "Classic Coffee Stand Iced Frappe with Gelato",
    category: "cold_brews",
    price: 230,
    description: "The timeless Ahmedabad classic: thick creamy cold coffee blended and served with a scoop of Madagascar vanilla gelato.",
    image: "/images/signature-frappe.jpg",
    tags: ["All-Time Hit"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 6,
    customizable: {
      sizes: [{ name: "Regular", price: 0 }, { name: "Large", price: 50 }],
      milk: ["Full Cream Dairy"],
      sweetness: ["Sweet", "Medium Sweet"],
      addons: [{ name: "Extra Gelato Scoop", price: 50 }]
    }
  },

  // --- REFRESHERS & ARTISAN COOLERS ---
  {
    id: "ref-01",
    name: "Wild Berry Hibiscus Iced Tea",
    category: "refreshers",
    price: 190,
    description: "Brewed whole organic hibiscus flowers, wild berries, touch of fresh mint, served on ice. Ruby red, tart, and refreshing.",
    image: "/images/iced-refresher.jpg",
    tags: ["Refreshing", "Vegan"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 5,
    customizable: {
      sizes: [{ name: "Tall Glass (380ml)", price: 0 }],
      milk: ["No Milk"],
      sweetness: ["Crisp & Balanced", "Low Sugar"],
      addons: [{ name: "Chia Seeds", price: 20 }, { name: "Lemon Wheel", price: 0 }]
    }
  },
  {
    id: "ref-02",
    name: "Fizzy Peach Passionfruit Sparkler",
    category: "refreshers",
    price: 210,
    description: "Sun-ripened peach puree, passionfruit pulp, sparkling soda, and torn fresh mint leaves over cracked ice.",
    image: "/images/iced-refresher.jpg",
    tags: ["Sparkling", "Fruity"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 5,
    customizable: {
      sizes: [{ name: "Tall Glass", price: 0 }],
      milk: ["No Milk"],
      sweetness: ["Regular Sweet", "Extra Tangy"],
      addons: []
    }
  },
  {
    id: "ref-03",
    name: "Iced Ceremonial Matcha Latte",
    category: "refreshers",
    price: 270,
    description: "Authentic stone-ground Japanese ceremonial grade Uji matcha whisked fresh and layered over chilled milk with honey.",
    image: "/images/iced-refresher.jpg",
    tags: ["Antioxidant Rich", "Superfood"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 6,
    customizable: {
      sizes: [{ name: "Regular", price: 0 }, { name: "Large", price: 50 }],
      milk: ["Dairy Milk", "Oat Milk (+₹50)", "Almond Milk (+₹50)"],
      sweetness: ["Light Honey", "Unsweetened"],
      addons: [{ name: "Vanilla Shot", price: 30 }]
    }
  },

  // --- GOURMET PANINIS & SANDWICHES ---
  {
    id: "food-01",
    name: "Paneer Tikka Herb Panini",
    category: "sandwiches",
    price: 260,
    description: "Char-grilled spiced malai paneer cubes, fresh basil pesto, caramelized onions, and stretchy mozzarella pressed on artisan sourdough.",
    image: "/images/paneer-panini.jpg",
    tags: ["Chef Special", "Bestseller"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 12,
    customizable: {
      sizes: [{ name: "Full Panini (2 Halves)", price: 0 }],
      milk: [],
      sweetness: [],
      addons: [
        { name: "Extra Mozzarella Cheese", price: 40 },
        { name: "Side Peri-Peri Dip", price: 25 },
        { name: "Jalapeno Slices", price: 20 }
      ]
    }
  },
  {
    id: "food-02",
    name: "Triple Cheese Basil Pesto Melt",
    category: "sandwiches",
    price: 250,
    description: "Gooey blend of aged cheddar, creamy mozzarella, and parmesan with garlic herb butter on toasted golden multigrain sourdough.",
    image: "/images/paneer-panini.jpg",
    tags: ["Cheese Pull", "Comfort Food"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 10,
    customizable: {
      sizes: [{ name: "Standard", price: 0 }],
      milk: [],
      sweetness: [],
      addons: [{ name: "Chipotle Dip", price: 25 }, { name: "Sundried Tomatoes", price: 30 }]
    }
  },
  {
    id: "food-03",
    name: "Mexican Fiesta Jalapeño Quesadilla Toast",
    category: "sandwiches",
    price: 240,
    description: "Sweet American corn, black olives, pickled jalapeños, bell peppers, and melted cheese seasoned with Mexican smoked spices.",
    image: "/images/paneer-panini.jpg",
    tags: ["Spicy"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 10,
    customizable: {
      sizes: [{ name: "Standard", price: 0 }],
      milk: [],
      sweetness: [],
      addons: [{ name: "Extra Cheese", price: 40 }]
    }
  },

  // --- WAFFLES & SWEET DELIGHTS ---
  {
    id: "dessert-01",
    name: "Belgian Dark Choco Berry Waffle",
    category: "waffles_desserts",
    price: 280,
    description: "Crispy freshly baked golden Belgian waffle stacked high, drenched in warm Belgian chocolate ganache, fresh strawberries & vanilla bean gelato.",
    image: "/images/belgian-waffle.jpg",
    tags: ["Decadent", "Must Try"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 12,
    customizable: {
      sizes: [{ name: "Full Waffle Stack", price: 0 }],
      milk: [],
      sweetness: [],
      addons: [
        { name: "Extra Gelato Scoop", price: 50 },
        { name: "Nutella Drizzle", price: 40 },
        { name: "Roasted Almond Flakes", price: 30 }
      ]
    }
  },
  {
    id: "dessert-02",
    name: "Lotus Biscoff Crunch Waffle",
    category: "waffles_desserts",
    price: 310,
    description: "Fresh hot waffle smothered in melted Biscoff cookie spread, sprinkled with spiced biscuit crumble and white chocolate drops.",
    image: "/images/belgian-waffle.jpg",
    tags: ["Trending"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 12,
    customizable: {
      sizes: [{ name: "Full Waffle", price: 0 }],
      milk: [],
      sweetness: [],
      addons: [{ name: "Vanilla Gelato", price: 50 }]
    }
  },
  {
    id: "dessert-03",
    name: "Sizzling Dark Walnut Brownie",
    category: "waffles_desserts",
    price: 240,
    description: "Gooey chocolate walnut fudge brownie served on a smoking sizzler plate with cold vanilla gelato and hot melted chocolate fountain sauce.",
    image: "/images/belgian-waffle.jpg",
    tags: ["Warm & Cold"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 8,
    customizable: {
      sizes: [{ name: "Standard", price: 0 }],
      milk: [],
      sweetness: [],
      addons: [{ name: "Extra Hot Chocolate Shot", price: 35 }]
    }
  },

  // --- SIDES & MUNCHIES ---
  {
    id: "side-01",
    name: "Peri-Peri Seasoned Crinkle Fries",
    category: "snacks",
    price: 170,
    description: "Golden crispy crinkle-cut potatoes tossed in African bird's eye chili seasoning, served with creamy garlic dip.",
    image: "/images/paneer-panini.jpg",
    tags: ["Crispy", "Snack"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 8,
    customizable: {
      sizes: [{ name: "Regular Bucket", price: 0 }, { name: "Large Share Bucket", price: 60 }],
      milk: [],
      sweetness: [],
      addons: [{ name: "Melted Cheese Sauce", price: 40 }]
    }
  },
  {
    id: "side-02",
    name: "Cheesy Garlic Herb Pull-Apart Bread",
    category: "snacks",
    price: 210,
    description: "Warm artisan loaf stuffed with melted mozzarella, roasted garlic butter, parsley, and chili flakes.",
    image: "/images/paneer-panini.jpg",
    tags: ["Comfort"],
    is_veg: 1,
    in_stock: 1,
    prep_time_mins: 10,
    customizable: {
      sizes: [{ name: "Standard Loaf", price: 0 }],
      milk: [],
      sweetness: [],
      addons: [{ name: "Extra Dip", price: 25 }]
    }
  }
];

export const initialOffers = [
  {
    id: "offer-01",
    code: "BREW20",
    title: "Morning Brew Bliss",
    tagline: "Start your morning right",
    discount: "20% OFF",
    discount_percent: 20,
    min_order: 199,
    description: "Enjoy 20% off all handcrafted hot and cold brews before 12:00 PM every day.",
    badge: "Daily 9 AM - 12 PM",
    highlight: true
  },
  {
    id: "offer-02",
    code: "COMBO349",
    title: "Frappe & Panini Power Combo",
    tagline: "The ultimate afternoon hunger savior",
    discount: "Flat ₹349",
    discount_amount: 110,
    min_order: 450,
    description: "Get any Signature Frappe paired with a Gourmet Panini of your choice for just ₹349 (Save up to ₹190).",
    badge: "Crowd Favorite",
    highlight: true
  },
  {
    id: "offer-03",
    code: "STUDENT15",
    title: "Student & Co-Working Perks",
    tagline: "Work, study, and sip with high-speed WiFi",
    discount: "15% OFF",
    discount_percent: 15,
    min_order: 250,
    description: "Flash your student ID or working badge on weekdays and unlock 15% off your entire bill.",
    badge: "Mon - Fri",
    highlight: false
  },
  {
    id: "offer-04",
    code: "MIDNIGHT10",
    title: "Late Night Cravings Deal",
    tagline: "Open until 12:00 AM midnight in Nikol",
    discount: "10% OFF",
    discount_percent: 10,
    min_order: 300,
    description: "Special night owl discount on all hot coffees and Belgian waffles after 10:00 PM.",
    badge: "10 PM - 12 AM",
    highlight: false
  }
];
