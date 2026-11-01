const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const Product = require("../models/Product");

const newProducts = [
  // ----------------------------------------------------
  // 1. PHONES (3 new -> total 9)
  // ----------------------------------------------------
  {
    name: "Google Pixel 10 Pro",
    price: 3999,
    discount: 10,
    description: "Flagship Google AI smartphone featuring Google Tensor G5 chip, 16GB LPDDR5X RAM, 256GB UFS 4.0 storage, 6.7-inch 120Hz Super Actua OLED display, and advanced triple computational camera system with 5x optical telephoto.",
    category: "phones",
    brand: "Google",
    stock: 25,
    image: "/products/phones/google-pixel-10-pro.jpg",
    sku: "GOO-PIX10PRO-001",
    isActive: true,
  },
  {
    name: "Xiaomi 15 Ultra",
    price: 4199,
    discount: 15,
    description: "Premium imaging powerhouse co-engineered with Leica. Packed with Snapdragon 8 Elite, 16GB RAM, 512GB storage, quad 50MP camera setup with 1-inch main sensor, and a 6.73-inch 2K 120Hz LTPO AMOLED display with 5400mAh battery.",
    category: "phones",
    brand: "Xiaomi",
    stock: 20,
    image: "/products/xiaomi-15-ultra.jpg",
    sku: "XIA-15ULTRA-001",
    isActive: true,
  },
  {
    name: "OnePlus 13",
    price: 3399,
    discount: 5,
    description: "Flagship killer powered by Snapdragon 8 Elite processor, 16GB RAM, 512GB internal storage, Hasselblad camera system, 6.82-inch 2K ProXDR display with 120Hz refresh rate, and 100W SUPERVOOC fast charging.",
    category: "phones",
    brand: "OnePlus",
    stock: 30,
    image: "/products/oneplus-13.jpg",
    sku: "1PL-OP13-001",
    isActive: true,
  },

  // ----------------------------------------------------
  // 2. LAPTOPS (3 new -> total 8)
  // ----------------------------------------------------
  {
    name: "Dell XPS 16",
    price: 8999,
    discount: 10,
    description: "Ultra-sleek workstation laptop featuring Intel Core Ultra 9 185H processor, NVIDIA GeForce RTX 4070 8GB GDDR6 GPU, 32GB LPDDR5X RAM, 1TB NVMe PCIe 4.0 SSD, and 16.3-inch 4K+ OLED InfinityEdge touch display.",
    category: "laptops",
    brand: "Dell",
    stock: 15,
    image: "/products/dell-xps-16.jpg",
    sku: "DEL-XPS16-001",
    isActive: true,
  },
  {
    name: "HP Spectre x360 16",
    price: 6799,
    discount: 12,
    description: "2-in-1 convertible laptop powered by Intel Core Ultra 7 155H, 32GB RAM, 1TB PCIe Gen4 SSD, Intel Arc Graphics, 16-inch 2.8K OLED touch screen with 120Hz variable refresh rate, 9MP webcam, and HP Rechargeable MPP2.0 Tilt Pen.",
    category: "laptops",
    brand: "HP",
    stock: 18,
    image: "/products/hp-spectre-x360-16.jpg",
    sku: "HP-SPECTREX360-001",
    isActive: true,
  },
  {
    name: "Razer Blade 16",
    price: 11999,
    discount: 0,
    description: "Ultimate high-performance gaming laptop with Intel Core i9-14900HX, NVIDIA GeForce RTX 4090 16GB GPU, 32GB DDR5 5600MHz RAM, 2TB PCIe 4.0 SSD, dual-mode Mini-LED display (UHD+ 120Hz / FHD+ 240Hz), and CNC aluminum chassis.",
    category: "laptops",
    brand: "Razer",
    stock: 10,
    image: "/products/razer-blade-16.jpg",
    sku: "RAZ-BLADE16-001",
    isActive: true,
  },

  // ----------------------------------------------------
  // 3. AUDIO (3 new -> total 8)
  // ----------------------------------------------------
  {
    name: "Bose QuietComfort Ultra",
    price: 1599,
    discount: 10,
    description: "World-class noise-cancelling wireless headphones with Bose Immersive Audio, CustomTune technology, up to 24 hours of battery life, ultra-soft luxury ear cushions, and Bluetooth 5.3 with multipoint connection.",
    category: "audio",
    brand: "Bose",
    stock: 35,
    image: "/products/bose-qc-ultra.jpg",
    sku: "BOS-QCULTRA-001",
    isActive: true,
  },
  {
    name: "Sennheiser Momentum 4 Wireless",
    price: 1299,
    discount: 15,
    description: "Audiophile-grade wireless over-ear headphones featuring 42mm transducer system, adaptive hybrid noise cancellation, crystal clear call quality, customizable sound via Smart Control app, and industry-leading 60-hour battery life.",
    category: "audio",
    brand: "Sennheiser",
    stock: 25,
    image: "/products/sennheiser-momentum-4.jpg",
    sku: "SEN-MOMENTUM4-001",
    isActive: true,
  },
  {
    name: "Marshall Stanmore III",
    price: 1499,
    discount: 8,
    description: "Iconic home Bluetooth speaker with re-engineered wider soundstage, 80W total RMS output, Bluetooth 5.2, 3.5mm and RCA inputs, signature Marshall brass details, and Dynamic Loudness tonal balance tuning.",
    category: "audio",
    brand: "Marshall",
    stock: 20,
    image: "/products/marshall-stanmore-3.jpg",
    sku: "MAR-STANMORE3-001",
    isActive: true,
  },

  // ----------------------------------------------------
  // 4. WATCHES (7 products)
  // ----------------------------------------------------
  {
    name: "Apple Watch Ultra 2",
    price: 3399,
    discount: 5,
    description: "Rugged GPS + Cellular smartwatch designed for endurance athletes and outdoor adventurers. Features a 49mm aerospace-grade titanium case, 3000-nit Always-On Retina display, S9 SiP dual-core processor, dual-frequency precision GPS, and 36-hour normal battery life (72 hours in Low Power Mode).",
    category: "watches",
    brand: "Apple",
    stock: 25,
    image: "/products/apple-watch-ultra-2.jpg",
    sku: "APP-WATCHULTRA2-001",
    isActive: true,
  },
  {
    name: "Apple Watch Series 10",
    price: 1899,
    discount: 0,
    description: "Slimmest Apple Watch yet with Apple's largest display. Powered by S10 SiP, wide-angle OLED display, sleep apnea notifications, depth gauge and water temperature sensor, ECG sensor, and faster 30-minute 80% magnetic fast charging.",
    category: "watches",
    brand: "Apple",
    stock: 40,
    image: "/products/apple-watch-series-10.jpg",
    sku: "APP-WATCHS10-001",
    isActive: true,
  },
  {
    name: "Samsung Galaxy Watch Ultra",
    price: 2499,
    discount: 10,
    description: "Durable titanium smartwatch built to withstand extreme temperatures and 10ATM ocean swimming. Features 3nm Exynos W1000 processor, dual-frequency GPS, BioActive Sensor with heart rate and sleep apnea monitoring, and up to 100-hour battery life in power saving mode.",
    category: "watches",
    brand: "Samsung",
    stock: 30,
    image: "/products/samsung-galaxy-watch-ultra.jpg",
    sku: "SAM-GWULTRA-001",
    isActive: true,
  },
  {
    name: "Samsung Galaxy Watch7",
    price: 1199,
    discount: 15,
    description: "Intelligent everyday smartwatch with daily Energy Score, advanced Sleep Tracking with AI coaching, dual-frequency GPS, Sapphire Crystal glass, 1.5-inch Super AMOLED display, and 3nm Exynos W1000 fast processor.",
    category: "watches",
    brand: "Samsung",
    stock: 35,
    image: "/products/samsung-galaxy-watch-7.jpg",
    sku: "SAM-GW7-001",
    isActive: true,
  },
  {
    name: "Garmin Fenix 8 AMOLED",
    price: 4299,
    discount: 0,
    description: "Premium multisport GPS smartwatch built for serious athletes. Features 47mm titanium bezel, bright 1.4-inch AMOLED display, speaker and microphone for voice commands, dive-rated 40m leakproof buttons, built-in LED flashlight, and TopoActive multi-continent mapping.",
    category: "watches",
    brand: "Garmin",
    stock: 15,
    image: "/products/garmin-fenix-8.jpg",
    sku: "GAR-FENIX8-001",
    isActive: true,
  },
  {
    name: "Huawei Watch GT 5 Pro",
    price: 1399,
    discount: 10,
    description: "Crafted with aerospace-grade titanium alloy and sapphire glass. Features TruSense health system with ECG analysis, professional golf course and trail run sports modes, NFC payments, and up to 14 days of battery life.",
    category: "watches",
    brand: "Huawei",
    stock: 25,
    image: "/products/huawei-watch-gt5-pro.jpg",
    sku: "HUA-WATCHGT5PRO-001",
    isActive: true,
  },
  {
    name: "Google Pixel Watch 3",
    price: 1499,
    discount: 8,
    description: "45mm Actua display smartwatch with 2000 nits peak brightness, custom FitBit advanced fitness coaching, Morning Brief AI insights, Loss of Pulse Detection, 24-hour battery with Always-On display, and Wear OS 5.",
    category: "watches",
    brand: "Google",
    stock: 20,
    image: "/products/google-pixel-watch-3.jpg",
    sku: "GOO-PIXWATCH3-001",
    isActive: true,
  },

  // ----------------------------------------------------
  // 5. MONITORS (7 products)
  // ----------------------------------------------------
  {
    name: "Samsung Odyssey OLED G9",
    price: 5499,
    discount: 12,
    description: "49-inch Dual QHD (5120 x 1440) curved 1800R gaming monitor with QD-OLED panel, blazing 240Hz refresh rate, 0.03ms (GtG) response time, DisplayHDR True Black 400, AMD FreeSync Premium Pro, and built-in Gaming Hub.",
    category: "monitors",
    brand: "Samsung",
    stock: 12,
    image: "/products/samsung-odyssey-oled-g9.jpg",
    sku: "SAM-ODYSOLEDG9-001",
    isActive: true,
  },
  {
    name: "LG UltraGear 32GS95UE OLED",
    price: 4799,
    discount: 10,
    description: "Dual-mode 31.5-inch 4K UHD 240Hz / FHD 480Hz gaming monitor. Features WOLED anti-glare display, 0.03ms response time, VESA DisplayHDR True Black 400, Pixel Sound audio technology, HDMI 2.1, and G-Sync compatible.",
    category: "monitors",
    brand: "LG",
    stock: 16,
    image: "/products/lg-ultragear-32gs95ue.jpg",
    sku: "LG-UG32GS95UE-001",
    isActive: true,
  },
  {
    name: "Dell UltraSharp 32 4K USB-C Hub (U3224KB)",
    price: 3699,
    discount: 5,
    description: "Productivity monitor featuring 31.5-inch 6K UHD (6144 x 3456) IPS Black panel with 2000:1 contrast ratio, 99% DCI-P3 color gamut, integrated 4K HDR webcam, echo-canceling mics, and Thunderbolt 4 hub with 140W power delivery.",
    category: "monitors",
    brand: "Dell",
    stock: 14,
    image: "/products/dell-ultrasharp-32-4k.jpg",
    sku: "DEL-U3224KB-001",
    isActive: true,
  },
  {
    name: "ASUS ROG Swift PG32UCDM",
    price: 4999,
    discount: 0,
    description: "32-inch 4K (3840 x 2160) QD-OLED gaming monitor with 240Hz refresh rate, 0.03ms response time, custom heatsink with graphene film protection against burn-in, Dolby Vision support, USB-C with 90W PD, and DisplayPort 1.4.",
    category: "monitors",
    brand: "ASUS",
    stock: 15,
    image: "/products/asus-rog-swift-pg32ucdm.jpg",
    sku: "ASUS-PG32UCDM-001",
    isActive: true,
  },
  {
    name: "BenQ PD3225U Designer Monitor",
    price: 3899,
    discount: 8,
    description: "Professional 31.5-inch 4K UHD IPS Black monitor for creators. Features 98% Display P3, Delta E <= 2 factory calibration, Thunderbolt 3 daisy-chaining with 85W PD, Hotkey Puck G2 controller, and Calman Verified certification.",
    category: "monitors",
    brand: "BenQ",
    stock: 18,
    image: "/products/benq-pd3225u.jpg",
    sku: "BNQ-PD3225U-001",
    isActive: true,
  },
  {
    name: "MSI MAG 341CQP QD-OLED",
    price: 3499,
    discount: 15,
    description: "34-inch UWQHD (3440 x 1440) 1800R curved gaming monitor with latest generation QD-OLED panel, 175Hz refresh rate, 0.03ms GtG response, MSI OLED Care 2.0, fanless graphene thermal design, and HDMI 2.1 48Gbps ports.",
    category: "monitors",
    brand: "MSI",
    stock: 20,
    image: "/products/msi-mag-341cqp.jpg",
    sku: "MSI-MAG341CQP-001",
    isActive: true,
  },
  {
    name: "Apple Studio Display 27",
    price: 6299,
    discount: 0,
    description: "Immersive 27-inch 5K Retina display (5120 x 2880) with 600 nits brightness, P3 wide color gamut, 12MP Ultra Wide camera with Center Stage, studio-quality three-mic array, six-speaker sound system with Spatial Audio, and Thunderbolt 3 with 96W charging.",
    category: "monitors",
    brand: "Apple",
    stock: 10,
    image: "/products/apple-studio-display-27.jpg",
    sku: "APP-STUDIODISPLAY-001",
    isActive: true,
  },

  // ----------------------------------------------------
  // 6. ACCESSORIES (7 products)
  // ----------------------------------------------------
  {
    name: "Apple Magic Keyboard with Touch ID and Numeric Keypad",
    price: 699,
    discount: 0,
    description: "Wireless rechargeable keyboard featuring Touch ID for fast secure authentication, full extended numeric keypad, document navigation controls, low-profile scissor mechanism, and USB-C to Lightning woven cable.",
    category: "accessories",
    brand: "Apple",
    stock: 50,
    image: "/products/apple-magic-keyboard.jpg",
    sku: "APP-MAGICKBDNUM-001",
    isActive: true,
  },
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    price: 449,
    discount: 10,
    description: "Iconic performance wireless mouse with Quiet Clicks, 8000 DPI Darkfield sensor that tracks on glass, MagSpeed electromagnetic scrolling wheel (1000 lines/sec), ergonomic thumb rest with gesture button, and Bluetooth / Logi Bolt connectivity.",
    category: "accessories",
    brand: "Logitech",
    stock: 60,
    image: "/products/logitech-mx-master-3s.jpg",
    sku: "LOG-MXMASTER3S-001",
    isActive: true,
  },
  {
    name: "Anker Prime 27650mAh Power Bank (250W)",
    price: 599,
    discount: 15,
    description: "High-capacity ultra-fast power bank equipped with two USB-C and one USB-A ports delivering up to 250W combined output (140W single port). Features smart digital display, Anker app Bluetooth monitoring, and 170W rapid recharge.",
    category: "accessories",
    brand: "Anker",
    stock: 45,
    image: "/products/anker-prime-27650mah.jpg",
    sku: "ANK-PRIME27650-001",
    isActive: true,
  },
  {
    name: "CalDigit TS4 Thunderbolt 4 Dock",
    price: 1599,
    discount: 5,
    description: "Ultimate 18-port connectivity hub providing 98W host laptop charging, 3x Thunderbolt 4 ports, 5x USB-A 10Gbps, 3x USB-C 10Gbps, DisplayPort 1.4, 2.5 Gigabit Ethernet, SD and micro-SD UHS-II readers, and 3.5mm audio jacks.",
    category: "accessories",
    brand: "CalDigit",
    stock: 25,
    image: "/products/caldigit-ts4-dock.jpg",
    sku: "CAL-TS4DOCK-001",
    isActive: true,
  },
  {
    name: "Belkin BoostCharge Pro 3-in-1 MagSafe Wireless Charger",
    price: 549,
    discount: 10,
    description: "Premium fast wireless charging stand delivering official 15W MagSafe charging for iPhone, fast magnetic charging for Apple Watch Series 7/8/9/10/Ultra, and dedicated 5W Qi charging pad for AirPods case with weighted modern chrome design.",
    category: "accessories",
    brand: "Belkin",
    stock: 40,
    image: "/products/belkin-boostcharge-3in1.jpg",
    sku: "BEL-3IN1MAGSAFE-001",
    isActive: true,
  },
  {
    name: "Samsung T9 Portable SSD 2TB",
    price: 799,
    discount: 12,
    description: "High-speed external rugged solid-state drive featuring USB 3.2 Gen 2x2 interface with sequential read/write speeds up to 2000 MB/s, dynamic thermal guard protection, 3-meter drop resistance, AES 256-bit hardware encryption, and USB-C cables.",
    category: "accessories",
    brand: "Samsung",
    stock: 35,
    image: "/products/samsung-t9-ssd-2tb.jpg",
    sku: "SAM-T9SSD2TB-001",
    isActive: true,
  },
  {
    name: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
    price: 899,
    discount: 0,
    description: "75% layout premium fully aluminum mechanical keyboard with wireless Bluetooth 5.1 and wired USB-C, hot-swappable Keychron K Pro Banana tactile switches, double-gasket acoustic mounting, CNC aluminum body, programmable rotary knob, and QMK/VIA support.",
    category: "accessories",
    brand: "Keychron",
    stock: 30,
    image: "/products/keychron-q1-pro.jpg",
    sku: "KEY-Q1PRO-001",
    isActive: true,
  },

  // ----------------------------------------------------
  // 7. GAMING (7 products)
  // ----------------------------------------------------
  {
    name: "Sony PlayStation 5 Pro",
    price: 3299,
    discount: 0,
    description: "Next-generation gaming console featuring PlayStation Spectral Super Resolution (PSSR) AI-driven upscaling, upgraded GPU with 67% more compute units and 28% faster memory, advanced ray tracing architecture, and massive 2TB internal SSD storage.",
    category: "gaming",
    brand: "Sony",
    stock: 20,
    image: "/products/sony-ps5-pro.jpg",
    sku: "SON-PS5PRO-001",
    isActive: true,
  },
  {
    name: "Microsoft Xbox Series X 2TB Galaxy Black Edition",
    price: 2799,
    discount: 5,
    description: "Special edition 4K 120FPS gaming console featuring a sleek Galaxy Black starlight chassis, 2TB high-performance custom NVMe SSD, 12 teraflops of raw graphic processing power, Xbox Velocity Architecture, and 3D Spatial Audio.",
    category: "gaming",
    brand: "Microsoft",
    stock: 22,
    image: "/products/xbox-series-x-2tb.jpg",
    sku: "MSF-XBOXSERIESX2TB-001",
    isActive: true,
  },
  {
    name: "Nintendo Switch OLED Model",
    price: 1399,
    discount: 10,
    description: "Hybrid handheld/docked gaming console with vibrant 7-inch OLED display, wide adjustable tabletop stand, dock with wired LAN port, 64GB internal storage, enhanced onboard speakers, and detachable Joy-Con controllers.",
    category: "gaming",
    brand: "Nintendo",
    stock: 40,
    image: "/products/nintendo-switch-oled.jpg",
    sku: "NIN-SWITCHOLED-001",
    isActive: true,
  },
  {
    name: "ASUS ROG Ally X Handheld Console",
    price: 3399,
    discount: 8,
    description: "Ultimate portable Windows 11 PC gaming machine powered by AMD Ryzen Z1 Extreme processor, 24GB LPDDR5X-7500 RAM, 1TB M.2 2280 NVMe SSD, huge 80Wh battery, 7-inch 1080p 120Hz 500-nit FreeSync Premium display, and redesigned ergonomic grips.",
    category: "gaming",
    brand: "ASUS",
    stock: 18,
    image: "/products/asus-rog-ally-x.jpg",
    sku: "ASUS-ROGALLYX-001",
    isActive: true,
  },
  {
    name: "Sony PlayStation DualSense Edge Wireless Controller",
    price: 899,
    discount: 0,
    description: "High-performance customizable pro controller for PS5 and PC with swappable analog stick modules, remappable back buttons, adjustable trigger stops and deadzones, braided USB cable with lockable housing, and custom haptic feedback profiles.",
    category: "gaming",
    brand: "Sony",
    stock: 35,
    image: "/products/sony-dualsense-edge.jpg",
    sku: "SON-DUALSENSEEDGE-001",
    isActive: true,
  },
  {
    name: "Logitech G PRO X Superlight 2 Wireless Gaming Mouse",
    price: 649,
    discount: 10,
    description: "Elite esports wireless gaming mouse weighing only 60 grams. Equipped with HERO 2 sensor offering up to 32,000 DPI tracking, LIGHTFORCE hybrid optical-mechanical switches, true 4000Hz wireless polling rate, zero-additive PTFE feet, and 95 hours of continuous battery life.",
    category: "gaming",
    brand: "Logitech",
    stock: 50,
    image: "/products/logitech-g-pro-x-superlight-2.jpg",
    sku: "LOG-GPROXSUPERLIGHT2-001",
    isActive: true,
  },
  {
    name: "SteelSeries Arctis Nova Pro Wireless Headset",
    price: 1499,
    discount: 12,
    description: "Premium multi-system gaming headset with Nova Pro Acoustic System, Premium High Fidelity drivers, active 4-mic hybrid noise cancellation, dual audio wireless connection (2.4GHz and Bluetooth), base station with OLED display, and hot-swap dual-battery infinite power system.",
    category: "gaming",
    brand: "SteelSeries",
    stock: 25,
    image: "/products/steelseries-arctis-nova-pro.jpg",
    sku: "STE-ARCTISNOVAPRO-001",
    isActive: true,
  },
];

async function seedProducts() {
  console.log("--------------------------------------------------");
  console.log("Hadadi E-Commerce — Catalog Expansion Seed Script");
  console.log("--------------------------------------------------");

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing.");
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas successfully.");

  try {
    // 1. Inspect existing products
    const existingProducts = await Product.find({});
    console.log(`\nExisting products before seed: ${existingProducts.length}`);
    const existingSkus = new Set(existingProducts.map((p) => p.sku).filter(Boolean));

    // 2. Perform SKU-based upserts for new products
    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of newProducts) {
      if (!item.sku) {
        console.warn(`Skipping item without SKU: ${item.name}`);
        continue;
      }

      const isNew = !existingSkus.has(item.sku);

      // Perform safe upsert with runValidators enabled
      const result = await Product.updateOne(
        { sku: item.sku },
        { $set: item },
        { upsert: true, runValidators: true }
      );

      if (result.upsertedCount > 0 || isNew) {
        insertedCount++;
        existingSkus.add(item.sku);
      } else if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log(`Seed operation finished:`);
    console.log(`- New products added: ${insertedCount}`);
    console.log(`- Products updated: ${updatedCount}`);

    // 3. Post-seed Verification
    const allProducts = await Product.find({});
    console.log(`\nTotal products after seed: ${allProducts.length}`);

    // Category distribution
    const categoryCounts = {};
    const skuMap = new Map();
    const duplicateSkus = [];

    for (const p of allProducts) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      if (p.sku) {
        if (skuMap.has(p.sku)) {
          duplicateSkus.push(p.sku);
        } else {
          skuMap.set(p.sku, p._id);
        }
      }
    }

    console.log("\nCategory Distribution:");
    console.table(categoryCounts);

    if (duplicateSkus.length > 0) {
      console.error("ERROR: Duplicate SKUs detected:", duplicateSkus);
      throw new Error(`Duplicate SKUs found: ${duplicateSkus.join(", ")}`);
    } else {
      console.log("Duplicate SKU check: PASS (All SKUs are unique)");
    }

    // Verify all 7 categories exist
    const targetCategories = [
      "phones",
      "laptops",
      "audio",
      "watches",
      "monitors",
      "accessories",
      "gaming",
    ];

    const missingCategories = targetCategories.filter((cat) => !categoryCounts[cat]);
    if (missingCategories.length > 0) {
      throw new Error(`Missing categories: ${missingCategories.join(", ")}`);
    } else {
      console.log("7 Unified Categories check: PASS (All 7 categories represented)");
    }

    // Verify existing products were preserved
    const preservedAll = existingProducts.every((ep) =>
      allProducts.some((ap) => ap._id.toString() === ep._id.toString())
    );
    if (!preservedAll) {
      throw new Error("Integrity check failed: One or more existing products were not found!");
    } else {
      console.log("Existing products preservation check: PASS (All original products preserved)");
    }

    console.log("\nSeeding completed successfully! 🎉");
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB Atlas.");
  }
}

if (require.main === module) {
  seedProducts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed with error:", err);
      process.exit(1);
    });
}

module.exports = { seedProducts, newProducts };
