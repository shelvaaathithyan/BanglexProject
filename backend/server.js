require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const User = require('./models/User');
const Product = require('./models/Product');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session required for Passport Google Auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());

const seedProductsData = [
  // Glass Bangles
  {
    name: 'Thanvi Glass Bangles',
    description: 'Beautiful traditional maroon glass bangles with exquisite golden embellishments, perfect for festive occasions.',
    category: 'Glass Bangles',
    price: 400,
    salePrice: 139,
    isOnSale: true,
    images: ['/thanvi-glass-bangles.jpg'],
    color: 'Maroon',
    stock: 25
  },
  {
    name: 'Anvi Glass Bangles',
    description: 'Sleek red glass bangles with detailed sparkle accents, ideal for daily and celebratory wear.',
    category: 'Glass Bangles',
    price: 200,
    salePrice: 139,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Red',
    stock: 30
  },
  {
    name: 'Jelly Ghungroo Bangles',
    description: 'Fascinating purple translucent glass bangles adorned with delicate metallic ghungroo beads.',
    category: 'Glass Bangles',
    price: 280,
    salePrice: 140,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
    color: 'Purple',
    stock: 15
  },
  {
    name: 'Jasmine Glass Bangles',
    description: 'Vibrant Haldi yellow glass bangles studded with glinting crystal stones.',
    category: 'Glass Bangles',
    price: 399,
    salePrice: 139,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'],
    color: 'Haldi',
    stock: 20
  },
  {
    name: 'Maya Glass Bangles',
    description: 'Dazzling red glass bangles with heavy glitter lines for a premium, ethnic sparkle.',
    category: 'Glass Bangles',
    price: 299,
    salePrice: 125,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
    color: 'Red',
    stock: 18
  },
  {
    name: 'Yara Glass Bangles',
    description: 'Elegant wine colored glass bangles featuring micro-stone setting for a subtle, classic style.',
    category: 'Glass Bangles',
    price: 350,
    salePrice: 125,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Wine',
    stock: 22
  },
  {
    name: 'Raindrop Bangles(SPECIAL COLOURS)',
    description: 'A multi-colored special edition glass bangle collection showcasing a rainbow spectrum of shades.',
    category: 'Glass Bangles',
    price: 229,
    salePrice: 145,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    color: 'Multi-color',
    stock: 10
  },
  {
    name: 'Aarvi Glass Bangles',
    description: 'Charming red glass bangles featuring thin spiral gold lines, perfect for pairing with ethnic attire.',
    category: 'Glass Bangles',
    price: 250,
    salePrice: 125,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
    color: 'Red',
    stock: 35
  },
  {
    name: 'Diya Glass Bangles',
    description: 'Stunning teal Ramar blue glass bangles detailed with premium beads and kundan stones.',
    category: 'Glass Bangles',
    price: 299,
    salePrice: 99,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
    color: 'Ramar',
    stock: 14
  },
  {
    name: 'Leaf Glass Bangles',
    description: 'Intricately textured radiant violet glass bangles resembling pattern of delicate leaves.',
    category: 'Glass Bangles',
    price: 299,
    salePrice: 99,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
    color: 'Radiant violet',
    stock: 12
  },
  {
    name: 'Lily (New colours) Glass Bangles',
    description: 'Brand new lilac shade glass bangles set with a smooth satin finish and minimal stone borders.',
    category: 'Glass Bangles',
    price: 349,
    salePrice: 250,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
    color: 'Lilac',
    stock: 16
  },
  {
    name: 'Bubble Bangles',
    description: 'Fun bubble-textured violet glass bangles that reflect light beautifully in every movement.',
    category: 'Glass Bangles',
    price: 200,
    salePrice: 129,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
    color: 'VOILET',
    stock: 20
  },

  // Baby Shower
  {
    name: 'Shreya Baby Shower Set',
    description: 'Charming yellow and green traditional bangle set customized for baby shower functions.',
    category: 'Baby Shower',
    price: 600,
    salePrice: 450,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    color: 'Yellow-Green',
    stock: 15
  },
  {
    name: 'Pooja Baby Shower Special',
    description: 'Gorgeous pink and blue combination bangles representing the bundle of joy.',
    category: 'Baby Shower',
    price: 800,
    salePrice: 599,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop'],
    color: 'Pink-Blue',
    stock: 20
  },
  {
    name: 'Traditional Valaikappu Combo',
    description: 'Authentic South Indian Valaikappu glass bangles combination set with green and gold accents.',
    category: 'Baby Shower',
    price: 1200,
    salePrice: 899,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'],
    color: 'Gold-Green',
    stock: 12
  },
  {
    name: 'Mom-to-Be Premium Set',
    description: 'Luxurious pink and gold stone-studded silk thread bangles designed to make the mom-to-be shine.',
    category: 'Baby Shower',
    price: 1500,
    salePrice: 1199,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Pink-Gold',
    stock: 10
  },
  {
    name: 'Riddhi Baby Shower Kada',
    description: 'Premium broad red and green silk thread kada set decorated with beads and mirrors.',
    category: 'Baby Shower',
    price: 450,
    salePrice: 299,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
    color: 'Red-Green',
    stock: 25
  },
  {
    name: 'Gouri Valaikappu Set',
    description: 'Bright multi-color glass bangles designed for traditional baby shower ceremonies.',
    category: 'Baby Shower',
    price: 550,
    salePrice: 399,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    color: 'Multi-color',
    stock: 15
  },

  // Antique Bangles
  {
    name: 'Royal Antique Kada',
    description: 'Regal matte gold antique finish broad kada featuring beautiful nakshi engravings.',
    category: 'Antique Bangles',
    price: 999,
    salePrice: 799,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'],
    color: 'Antique Gold',
    stock: 10
  },
  {
    name: 'Temple Jewellery Kada Set',
    description: 'Traditional temple style kada pair with ruby red stones and intricate deity patterns.',
    category: 'Antique Bangles',
    price: 1800,
    salePrice: 1499,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Ruby Red',
    stock: 8
  },
  {
    name: 'Vintage Lakshmi Bangles',
    description: 'Beautiful vintage style bangles featuring goddess Lakshmi figures and micro kundan stones.',
    category: 'Antique Bangles',
    price: 1200,
    salePrice: 950,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'],
    color: 'Kundan Gold',
    stock: 12
  },
  {
    name: 'Heritage Floral Kada',
    description: 'Heritage designer gold kada decorated with floral embossing and black polish.',
    category: 'Antique Bangles',
    price: 850,
    salePrice: 650,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'],
    color: 'Bronze Gold',
    stock: 14
  },
  {
    name: 'Nakshi Work Bangle Pair',
    description: 'Exquisite antique gold bangle pair highlighted with detailed hand-carved Nakshi style art.',
    category: 'Antique Bangles',
    price: 1400,
    salePrice: 1100,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'],
    color: 'Antique Gold',
    stock: 7
  },

  // Combos
  {
    name: 'Daily Wear Bangle Combo',
    description: 'Convenient mix-and-match colorful glass bangles for everyday outfit styling.',
    category: 'Combos',
    price: 500,
    salePrice: 350,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    color: 'Mixed',
    stock: 20
  },
  {
    name: 'Bridal Glass Bangle Combo',
    description: 'Premium heavy chooda-style glass bangles set with gold metallic dividers.',
    category: 'Combos',
    price: 1200,
    salePrice: 899,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
    color: 'Red-Gold',
    stock: 15
  },
  {
    name: 'Silk Thread Bangle Combo',
    description: 'Colorful silk thread bangles combo set matching standard traditional Indian sarees.',
    category: 'Combos',
    price: 650,
    salePrice: 499,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    color: 'Rainbow',
    stock: 18
  },
  {
    name: 'Festive Velvet Bangle Set',
    description: 'A premium combination of velvet metal bangles and stone studded kadas.',
    category: 'Combos',
    price: 800,
    salePrice: 599,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    color: 'Green-Pink-Gold',
    stock: 10
  },
  {
    name: 'Matt Kada & Glass Bangle Combo',
    description: 'Charming mix of matte gold kadas paired with sleek maroon glass bangles.',
    category: 'Combos',
    price: 950,
    salePrice: 750,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Maroon-Gold',
    stock: 12
  },

  // Plus Size Bangles
  {
    name: 'Size 2.10 Glass Bangles',
    description: 'Sturdy red glass bangles specifically sized in 2.10 diameter for comfortable wear.',
    category: 'Plus Size Bangles',
    price: 350,
    salePrice: 249,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'],
    color: 'Red',
    stock: 12
  },
  {
    name: 'Size 2.12 Silk Thread Kada',
    description: 'Broad silk thread kada set in large 2.12 size with royal blue wrap and mirror works.',
    category: 'Plus Size Bangles',
    price: 450,
    salePrice: 325,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'],
    color: 'Royal Blue',
    stock: 15
  },
  {
    name: 'Size 2.10 Antique Kada Pair',
    description: 'Antique finish broad temple kadas in size 2.10, featuring leaf work pattern.',
    category: 'Plus Size Bangles',
    price: 999,
    salePrice: 799,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'],
    color: 'Gold',
    stock: 8
  },
  {
    name: 'Size 2.12 Daily Wear Glass',
    description: 'Comfortable size 2.12 daily wear green glass bangles pack of 24.',
    category: 'Plus Size Bangles',
    price: 300,
    salePrice: 199,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
    color: 'Green',
    stock: 20
  },
  {
    name: 'Size 2.10 Bridal Chooda',
    description: 'Complete size 2.10 bridal chooda set in maroon and cream color tones.',
    category: 'Plus Size Bangles',
    price: 1500,
    salePrice: 1200,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Maroon-Cream',
    stock: 6
  },

  // Daily wear (Terracotta)
  {
    name: 'Daily wear Clay Pendant',
    description: 'Earthy and lightweight handcrafted terracotta clay pendant with simple patterns.',
    category: 'Daily wear',
    price: 290,
    salePrice: 180,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Terracotta',
    stock: 18
  },
  {
    name: 'Minimalist Earthy Necklace',
    description: 'Naturally dyed brown terracotta clay bead necklace, stylish and eco-friendly.',
    category: 'Daily wear',
    price: 350,
    salePrice: 220,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Brown',
    stock: 14
  },
  {
    name: 'Handcrafted Clay Studs Set',
    description: 'Pack of 3 simple geometric terracotta clay studs for regular wear.',
    category: 'Daily wear',
    price: 150,
    salePrice: 99,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Terracotta Red',
    stock: 25
  },
  {
    name: 'Simple Bead Terracotta Set',
    description: 'Lightweight earthy clay beads neckpiece matching casual cotton kurtas.',
    category: 'Daily wear',
    price: 400,
    salePrice: 299,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Multi-color',
    stock: 16
  },
  {
    name: 'Ethnic Leaf Clay Pendant',
    description: 'Finely hand-carved leaf patterned pendant on adjustable thread necklace.',
    category: 'Daily wear',
    price: 320,
    salePrice: 210,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Green-Brown',
    stock: 15
  },

  // Jumkas
  {
    name: 'Handpainted Jhumkas',
    description: 'Traditional terracotta clay jhumkas handpainted in beautiful shades of blue and white.',
    category: 'Jumkas',
    price: 250,
    salePrice: 150,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
    color: 'Blue',
    stock: 22
  },
  {
    name: 'Traditional Temple Jhumkas',
    description: 'Grand terracotta temple style jhumkas highlighted in gold paint and red beads.',
    category: 'Jumkas',
    price: 350,
    salePrice: 249,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
    color: 'Gold-Red',
    stock: 12
  },
  {
    name: 'Peacock Handcrafted Jhumkas',
    description: 'Classic clay peacock-engraved jhumkas, painted in bright metallic green and blue.',
    category: 'Jumkas',
    price: 299,
    salePrice: 199,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
    color: 'Green-Gold',
    stock: 18
  },
  {
    name: 'Floral Clay Jhumkas',
    description: 'Cute, medium-sized clay jhumkas with tiny yellow and red handpainted flowers.',
    category: 'Jumkas',
    price: 180,
    salePrice: 120,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
    color: 'Yellow-Red',
    stock: 25
  },
  {
    name: 'Dual Tone Ethnic Jhumkas',
    description: 'Beautiful black and antique silver painted double-layer clay jhumkas.',
    category: 'Jumkas',
    price: 280,
    salePrice: 180,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
    color: 'Black-Silver',
    stock: 14
  },

  // Studs
  {
    name: 'Minimalist Clay Studs',
    description: 'Tiny pink terracotta clay ear studs, lightweight and perfect for daily wear.',
    category: 'Studs',
    price: 120,
    salePrice: 79,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Pink',
    stock: 30
  },
  {
    name: 'Handpainted Floral Studs',
    description: 'Handcarved clay ear studs featuring detailed white and blue painting.',
    category: 'Studs',
    price: 150,
    salePrice: 99,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'White-Blue',
    stock: 20
  },
  {
    name: 'Earthy Spiral Studs',
    description: 'Terracotta clay studs showcasing a spiral pattern pressed in wet clay.',
    category: 'Studs',
    price: 140,
    salePrice: 89,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Brown',
    stock: 15
  },
  {
    name: 'Gold Glaze Clay Studs',
    description: 'Elegant black clay studs glazed with premium metallic gold borders.',
    category: 'Studs',
    price: 160,
    salePrice: 110,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Gold-Black',
    stock: 18
  },
  {
    name: 'Geometry Clay Studs Trio',
    description: 'Combipack containing three pairs of geometric clay studs (circle, square, triangle).',
    category: 'Studs',
    price: 250,
    salePrice: 180,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Multi-color',
    stock: 22
  },

  // Jewellery Set
  {
    name: 'Festive Terracotta Set',
    description: 'Splendid terracotta clay necklace and matching jhumka earrings set in yellow and red.',
    category: 'Jewellery Set',
    price: 699,
    salePrice: 499,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Yellow-Red',
    stock: 12
  },
  {
    name: 'Royal Peacock Clay Set',
    description: 'Magnificent heavy designer clay neckpiece featuring detailed peacock emblems.',
    category: 'Jewellery Set',
    price: 850,
    salePrice: 650,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Blue-Green',
    stock: 8
  },
  {
    name: 'Modern Geometric Clay Set',
    description: 'Sleek contemporary set featuring hexagonal clay structures on gold ropes.',
    category: 'Jewellery Set',
    price: 550,
    salePrice: 399,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Grey-Gold',
    stock: 10
  },
  {
    name: 'Handcarved Mandala Set',
    description: 'Earthy black and silver neckpiece decorated with handcarved circular mandala art.',
    category: 'Jewellery Set',
    price: 750,
    salePrice: 550,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Black-Silver',
    stock: 15
  },
  {
    name: 'Traditional Mango Mala Set',
    description: 'Clay-crafted Mango design traditional South Indian design necklace and hangings.',
    category: 'Jewellery Set',
    price: 999,
    salePrice: 799,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Gold-Red',
    stock: 9
  },

  // Bridal Set
  {
    name: 'Grand Terracotta Bridal Set',
    description: 'Ornate multi-layered handcrafted terracotta necklace set detailed with gold and maroon paint.',
    category: 'Bridal Set',
    price: 1999,
    salePrice: 1499,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Maroon-Gold',
    stock: 5
  },
  {
    name: 'Royal Antique Bridal Clay Set',
    description: 'Luxurious heavy bridal set featuring goddess figures, heavy pendants, and thick kadas.',
    category: 'Bridal Set',
    price: 2500,
    salePrice: 1999,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Ruby-Gold',
    stock: 3
  },
  {
    name: 'Traditional Temple Bridal Set',
    description: 'Traditional temple design heavy clay neckpiece decorated with gold leaf paintings.',
    category: 'Bridal Set',
    price: 2200,
    salePrice: 1699,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Gold',
    stock: 4
  },
  {
    name: 'Handpainted Floral Bridal Set',
    description: 'Heavy multi-strand necklace detailed with clay roses and painted in wedding colors.',
    category: 'Bridal Set',
    price: 1800,
    salePrice: 1350,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Pink-Green-Gold',
    stock: 6
  },
  {
    name: 'Heavy Kundan Neckpiece Set',
    description: 'A terracotta translation of heritage kundan bridal sets with emerald green drop beads.',
    category: 'Bridal Set',
    price: 2800,
    salePrice: 2200,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'],
    color: 'Emerald-Gold',
    stock: 5
  },

  // Kids wear
  {
    name: 'Little Princess Clay Pendant',
    description: 'Cute, small baby pink elephant clay pendant set for kids.',
    category: 'Kids wear',
    price: 199,
    salePrice: 120,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Pink-Yellow',
    stock: 25
  },
  {
    name: 'Mini Handpainted Jhumkas',
    description: 'Small kid-friendly lightweight jhumkas with colorful stripes.',
    category: 'Kids wear',
    price: 150,
    salePrice: 99,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=600&auto=format&fit=crop'],
    color: 'Green',
    stock: 30
  },
  {
    name: 'Colorful Bead Clay Necklace',
    description: 'A fun necklace made of round clay beads painted in rainbow colors.',
    category: 'Kids wear',
    price: 250,
    salePrice: 160,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Rainbow',
    stock: 15
  },
  {
    name: 'Cute Elephant Studs Set',
    description: 'Tiny elephant-shaped clay studs, lightweight and cute for little ones.',
    category: 'Kids wear',
    price: 120,
    salePrice: 80,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Grey-Pink',
    stock: 20
  },
  {
    name: 'Sweetheart Pendant Set',
    description: 'Heart-shaped red clay pendant necklace with small matching ear studs.',
    category: 'Kids wear',
    price: 299,
    salePrice: 199,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop'],
    color: 'Red-White',
    stock: 18
  },

  // Organiser
  {
    name: 'Velvet 3-Row Bangle Stand',
    description: 'Keep your bangles organized and dust-free in this premium velvet-wrapped 3-tier stand.',
    category: 'Organiser',
    price: 599,
    salePrice: 399,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'],
    color: 'Red',
    stock: 15
  },
  {
    name: 'Wooden Jewellery Storage Chest',
    description: 'Beautiful solid wood jewellery organiser box featuring brass latch detail and velvet compartments.',
    category: 'Organiser',
    price: 1200,
    salePrice: 899,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'],
    color: 'Mahogany',
    stock: 10
  },
  {
    name: 'Portable Travel Bangle Box',
    description: 'Hard-shell velvet-padded travel organiser for bangles and watches.',
    category: 'Organiser',
    price: 350,
    salePrice: 249,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'],
    color: 'Pink Velvet',
    stock: 18
  },
  {
    name: 'Luxury Velvet Ring-Earring Tray',
    description: 'Flat stackable vanity organiser tray with special slots for rings and stud earrings.',
    category: 'Organiser',
    price: 450,
    salePrice: 299,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'],
    color: 'Grey',
    stock: 14
  },
  {
    name: 'Clear Acrylic Makeup-Jewellery Box',
    description: 'Multi-drawer transparent acrylic box with removable black velvet padding layers.',
    category: 'Organiser',
    price: 800,
    salePrice: 599,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop'],
    color: 'Transparent',
    stock: 22
  },

  // Hampers
  {
    name: 'Festive Shubh Labh Gift Hamper',
    description: 'A beautiful traditional gift box containing high-quality glass bangles, dry fruits, and a subh labh wall hanging.',
    category: 'Hampers',
    price: 1499,
    salePrice: 999,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'],
    color: 'Red-Gold',
    stock: 8
  },
  {
    name: 'Royal Bangle Gift Box Hamper',
    description: 'Luxury velvet box featuring two sets of traditional glass bangles and a customized greeting card.',
    category: 'Hampers',
    price: 1800,
    salePrice: 1299,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'],
    color: 'Maroon-Gold',
    stock: 10
  },
  {
    name: 'Baby Shower Gifting Hamper',
    description: 'Special gifting pack filled with baby shower glass bangles, clay matching studs, and sweet treats.',
    category: 'Hampers',
    price: 2200,
    salePrice: 1699,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'],
    color: 'Multi-color',
    stock: 5
  },
  {
    name: 'Miniature Terracotta Shringaar Kit',
    description: 'A traditional clay-pot design gift box containing a handcarved clay set and aromatic oils.',
    category: 'Hampers',
    price: 999,
    salePrice: 699,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'],
    color: 'Earthy Colors',
    stock: 12
  },
  {
    name: 'Elegant Organiser Gift Hamper',
    description: 'A curated gift box containing a velvet travel bangle box and a floral clay jhumka pair.',
    category: 'Hampers',
    price: 1250,
    salePrice: 899,
    isOnSale: true,
    images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'],
    color: 'Pink-Silver',
    stock: 15
  }
];

const seedProducts = async () => {
  try {
    // Reset collection to load the full set of categories and products
    await Product.deleteMany({});
    await Product.insertMany(seedProductsData);
    console.log('📦 Mock products successfully seeded and reset in MongoDB!');
  } catch (err) {
    console.error('Error seeding products:', err);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    if (process.env.SEED_DATA === 'true') {
      // Force drop the old username index to prevent duplicate key errors
      try {
        await mongoose.connection.collection('users').dropIndex('username_1');
      } catch (e) {
        // Ignore if index doesn't exist
      }
      
      // Seed Admin User
      try {
        const adminExists = await User.findOne({ email: 'admin@banglex.com' });
        if (!adminExists) {
          const newAdmin = new User({
            email: 'admin@banglex.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true
          });
          await newAdmin.save();
          console.log('Default Admin user seeded (admin@banglex.com / admin123)');
        }
      } catch (err) {
        console.error('Error seeding admin user:', err);
      }
      
      // Seed Products
      await seedProducts();
    }
  })
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.send('Banglex API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post('/api/dump', (req, res) => { console.log('--- DOM DUMP ---'); console.log(JSON.stringify(req.body, null, 2)); res.json({ok: true}); });
