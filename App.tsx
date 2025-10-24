import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [walletSubScreen, setWalletSubScreen] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [storeSubScreen, setStoreSubScreen] = useState<string | null>(null);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            console.log('Logout realizado com sucesso!');
            setIsLoggedIn(false);
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    console.log('Login realizado com sucesso!');
    setIsLoggedIn(true);
  };

  const categories = [
    { name: 'Vestuário', icon: '👔' },
    { name: 'Alimentação', icon: '🍽️' },
    { name: 'Eletrônicos', icon: '📱' },
    { name: 'Farmácia', icon: '💊' },
    { name: 'Beleza', icon: '💄' },
    { name: 'Pet Shop', icon: '🐾' },
    { name: 'Academia', icon: '💪' },
    { name: 'Mais', icon: '+' },
  ];

  const bottomNavItems = [
    { name: 'Início', icon: '🏠', active: currentScreen === 'home', screen: 'home' },
    { name: 'Ranking', icon: '📊', active: currentScreen === 'ranking', screen: 'ranking' },
    { name: 'Comparar', icon: '🔍', active: currentScreen === 'compare', screen: 'compare' },
    { name: 'Carteira', icon: '💰', active: currentScreen === 'wallet', screen: 'wallet' },
    { name: 'Perfil', icon: '👤', active: false, screen: 'profile' },
  ];

  // Dados para filtro "Mais Vendas"
  const salesRankingStores = [
    {
      id: 1,
      name: 'TechWorld',
      category: 'Eletrônicos',
      sales: 1247,
      rating: 4.9,
      cashback: '10%',
      logo: '⚡',
      logoBg: '#4CAF50',
      position: 1,
      isTop3: true,
    },
    {
      id: 2,
      name: 'Boutique Elegance',
      category: 'Vestuário',
      sales: 1189,
      rating: 4.8,
      cashback: '15%',
      logo: '👔',
      logoBg: '#9E9E9E',
      position: 2,
      isTop3: true,
    },
    {
      id: 3,
      name: 'Restaurante Sabor',
      category: 'Alimentação',
      sales: 1056,
      rating: 4.7,
      cashback: '12%',
      logo: '🍽️',
      logoBg: '#8D6E63',
      position: 3,
      isTop3: true,
    },
    {
      id: 4,
      name: 'Farmácia Saúde+',
      category: 'Farmácia',
      sales: 987,
      rating: 4.7,
      cashback: '8%',
      logo: '💊',
      logoBg: '#4CAF50',
      position: 4,
      isTop3: false,
    },
    {
      id: 5,
      name: 'Academia FitLife',
      category: 'Academia',
      sales: 876,
      rating: 4.6,
      cashback: '20%',
      logo: '💪',
      logoBg: '#2196F3',
      position: 5,
      isTop3: false,
    },
  ];

  // Dados para filtro "Maior Cashback" (ordenado por cashback)
  const cashbackRankingStores = [
    {
      id: 5,
      name: 'Academia FitLife',
      category: 'Academia',
      sales: 876,
      rating: 4.6,
      cashback: '20%',
      logo: '💪',
      logoBg: '#2196F3',
      position: 1,
      isTop3: true,
    },
    {
      id: 2,
      name: 'Boutique Elegance',
      category: 'Vestuário',
      sales: 1189,
      rating: 4.8,
      cashback: '15%',
      logo: '👔',
      logoBg: '#9E9E9E',
      position: 2,
      isTop3: true,
    },
    {
      id: 3,
      name: 'Restaurante Sabor',
      category: 'Alimentação',
      sales: 1056,
      rating: 4.7,
      cashback: '12%',
      logo: '🍽️',
      logoBg: '#8D6E63',
      position: 3,
      isTop3: true,
    },
    {
      id: 1,
      name: 'TechWorld',
      category: 'Eletrônicos',
      sales: 1247,
      rating: 4.9,
      cashback: '10%',
      logo: '⚡',
      logoBg: '#4CAF50',
      position: 4,
      isTop3: false,
    },
    {
      id: 4,
      name: 'Farmácia Saúde+',
      category: 'Farmácia',
      sales: 987,
      rating: 4.7,
      cashback: '8%',
      logo: '💊',
      logoBg: '#4CAF50',
      position: 5,
      isTop3: false,
    },
  ];

  // Dados para comparação de preços
  const compareResults = [
    {
      id: 1,
      storeName: 'TechWorld',
      distance: '1.2 km',
      rating: 4.9,
      cashback: '10%',
      originalPrice: 7299.00,
      cashbackAmount: 729.90,
      finalPrice: 6569.10,
      isBestOffer: true,
    },
    {
      id: 2,
      storeName: 'Eletrônicos Premium',
      distance: '2.5 km',
      rating: 4.7,
      cashback: '8%',
      originalPrice: 7499.00,
      cashbackAmount: 599.92,
      finalPrice: 6899.08,
      isBestOffer: false,
    },
    {
      id: 3,
      storeName: 'MegaStore Tech',
      distance: '3.1 km',
      rating: 4.8,
      cashback: '5%',
      originalPrice: 7599.00,
      cashbackAmount: 379.95,
      finalPrice: 7219.05,
      isBestOffer: false,
    },
  ];

  const featuredStores = [
    {
      id: 1,
      name: 'Boutique Elegance',
      category: 'Vestuário',
      distance: '0.5 km',
      rating: 4.8,
      cashback: '15%',
      badge: 'Top da Cidade',
      badgeColor: '#5C8FFC',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
      description: 'Loja especializada em roupas elegantes e modernas para todas as ocasiões.',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 99999-9999',
      hours: 'Seg-Sex: 9h-18h | Sáb: 9h-16h',
      products: [
        {
          id: 1,
          name: 'Vestido Elegante',
          price: 299.90,
          originalPrice: 399.90,
          image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
          category: 'Vestidos',
          rating: 4.9,
          reviews: 127,
        },
        {
          id: 2,
          name: 'Blusa Premium',
          price: 149.90,
          originalPrice: 199.90,
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
          category: 'Blusas',
          rating: 4.7,
          reviews: 89,
        },
        {
          id: 3,
          name: 'Calça Social',
          price: 199.90,
          originalPrice: 279.90,
          image: 'https://images.unsplash.com/photo-1506629905607-0b2b4b0b0b0b?w=300&h=300&fit=crop',
          category: 'Calças',
          rating: 4.8,
          reviews: 156,
        },
      ],
    },
    {
      id: 2,
      name: 'TechWorld',
      category: 'Eletrônicos',
      distance: '1.2 km',
      rating: 4.9,
      cashback: '10%',
      badge: 'Loja Premium',
      badgeColor: '#5C8FFC',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
      description: 'A melhor loja de eletrônicos com os últimos lançamentos em tecnologia.',
      address: 'Av. Paulista, 1000 - Bela Vista',
      phone: '(11) 88888-8888',
      hours: 'Seg-Sex: 8h-20h | Sáb-Dom: 9h-18h',
      products: [
        {
          id: 4,
          name: 'iPhone 15 Pro',
          price: 8999.00,
          originalPrice: 9999.00,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
          category: 'Smartphones',
          rating: 4.9,
          reviews: 234,
        },
        {
          id: 5,
          name: 'MacBook Air M2',
          price: 7999.00,
          originalPrice: 8999.00,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
          category: 'Notebooks',
          rating: 4.8,
          reviews: 189,
        },
        {
          id: 6,
          name: 'AirPods Pro',
          price: 1299.00,
          originalPrice: 1499.00,
          image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
          category: 'Acessórios',
          rating: 4.7,
          reviews: 312,
        },
      ],
    },
    {
      id: 3,
      name: 'Farmácia Central',
      category: 'Farmácia',
      distance: '0.8 km',
      rating: 4.7,
      cashback: '8%',
      badge: 'Loja do Mês',
      badgeColor: '#5C8FFC',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=200&fit=crop',
      description: 'Farmácia completa com medicamentos e produtos de saúde e beleza.',
      address: 'Rua da Saúde, 456 - Centro',
      phone: '(11) 77777-7777',
      hours: 'Seg-Dom: 24h',
      products: [
        {
          id: 7,
          name: 'Vitamina D3',
          price: 45.90,
          originalPrice: 59.90,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
          category: 'Vitaminas',
          rating: 4.6,
          reviews: 78,
        },
        {
          id: 8,
          name: 'Protetor Solar FPS 60',
          price: 29.90,
          originalPrice: 39.90,
          image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
          category: 'Cosméticos',
          rating: 4.8,
          reviews: 145,
        },
        {
          id: 9,
          name: 'Termômetro Digital',
          price: 35.90,
          originalPrice: 49.90,
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop',
          category: 'Equipamentos',
          rating: 4.5,
          reviews: 92,
        },
      ],
    },
  ];

  // Componente da Tela de Detalhes da Loja
  const StoreDetailScreen = () => {
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    const calculateCashback = (price: number) => {
      if (!selectedStore) return 0;
      const cashbackPercent = parseFloat(selectedStore.cashback.replace('%', ''));
      return (price * cashbackPercent) / 100;
    };

    if (!selectedStore) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Loja não encontrada</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.errorButtonText}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.storeDetailHeader}>
          <View style={styles.storeDetailHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.storeDetailTitle}>{selectedStore.name}</Text>
            <TouchableOpacity>
              <Text style={styles.shareIcon}>📤</Text>
            </TouchableOpacity>
          </View>

          {/* Store Image */}
          <View style={styles.storeDetailImageContainer}>
            <Image source={{ uri: selectedStore.image }} style={styles.storeDetailImage} />

            {/* Badges */}
            <View style={styles.storeDetailBadges}>
              <View style={[styles.badge, { backgroundColor: selectedStore.badgeColor }]}>
                <Text style={styles.badgeText}>{selectedStore.badge}</Text>
              </View>
              <View style={[styles.cashbackBadge, { backgroundColor: '#1E293B' }]}>
                <Text style={styles.cashbackText}>{selectedStore.cashback} cashback</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.storeDetailContent} showsVerticalScrollIndicator={false}>
          {/* Store Info */}
          <View style={styles.storeInfoSection}>
            <Text style={styles.storeDetailName}>{selectedStore.name}</Text>
            <Text style={styles.storeDetailCategory}>{selectedStore.category}</Text>
            <Text style={styles.storeDetailDescription}>{selectedStore.description}</Text>

            {/* Store Details */}
            <View style={styles.storeDetailItems}>
              <View style={styles.storeDetailItem}>
                <Text style={styles.storeDetailItemIcon}>📍</Text>
                <Text style={styles.storeDetailItemText}>{selectedStore.address}</Text>
              </View>
              <View style={styles.storeDetailItem}>
                <Text style={styles.storeDetailItemIcon}>📞</Text>
                <Text style={styles.storeDetailItemText}>{selectedStore.phone}</Text>
              </View>
              <View style={styles.storeDetailItem}>
                <Text style={styles.storeDetailItemIcon}>🕒</Text>
                <Text style={styles.storeDetailItemText}>{selectedStore.hours}</Text>
              </View>
              <View style={styles.storeDetailItem}>
                <Text style={styles.storeDetailItemIcon}>⭐</Text>
                <Text style={styles.storeDetailItemText}>{selectedStore.rating} ({selectedStore.distance})</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.storeActionButtons}>
            <TouchableOpacity style={styles.storeActionButton}>
              <Text style={styles.storeActionButtonIcon}>📞</Text>
              <Text style={styles.storeActionButtonText}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storeActionButton}>
              <Text style={styles.storeActionButtonIcon}>🗺️</Text>
              <Text style={styles.storeActionButtonText}>Navegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.storeActionButtonPrimary}
              onPress={() => setStoreSubScreen('products')}
            >
              <Text style={styles.storeActionButtonIcon}>🛍️</Text>
              <Text style={styles.storeActionButtonTextPrimary}>Ver Produtos</Text>
            </TouchableOpacity>
          </View>

          {/* Products Preview */}
          <View style={styles.productsPreviewSection}>
            <View style={styles.productsPreviewHeader}>
              <Text style={styles.productsPreviewTitle}>Produtos em Destaque</Text>
              <TouchableOpacity onPress={() => setStoreSubScreen('products')}>
                <Text style={styles.seeAllProductsLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedStore.products.slice(0, 3).map((product: any) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productPreviewCard}
                  onPress={() => {
                    console.log('Produto selecionado (preview):', product);
                    setSelectedProduct(product);
                    setStoreSubScreen('product-detail');
                  }}
                >
                  <Image source={{ uri: product.image }} style={styles.productPreviewImage} />
                  <Text style={styles.productPreviewName}>{product.name}</Text>
                  <View style={styles.productPreviewPrice}>
                    <Text style={styles.productPreviewCurrentPrice}>{formatPrice(product.price)}</Text>
                    <Text style={styles.productPreviewOriginalPrice}>{formatPrice(product.originalPrice)}</Text>
                  </View>
                  <View style={styles.productPreviewRating}>
                    <Text style={styles.productPreviewRatingText}>⭐ {product.rating}</Text>
                    <Text style={styles.productPreviewReviewsText}>({product.reviews})</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Produtos da Loja
  const StoreProductsScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    if (!selectedStore || !selectedStore.products) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Loja não encontrada</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setStoreSubScreen(null)}
            >
              <Text style={styles.errorButtonText}>Voltar à Loja</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const categories = ['Todos', ...Array.from(new Set(selectedStore.products.map((p: any) => p.category)))];

    const filteredProducts = selectedCategory === 'Todos'
      ? selectedStore.products
      : selectedStore.products.filter((p: any) => p.category === selectedCategory);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.storeProductsHeader}>
          <View style={styles.storeProductsHeaderTop}>
            <TouchableOpacity onPress={() => setStoreSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.storeProductsTitle}>Produtos - {selectedStore.name}</Text>
            <TouchableOpacity>
              <Text style={styles.filterIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesFilter}>
            {categories.map((category, index) => {
              const categoryStr = String(category);
              return (
                <TouchableOpacity
                  key={categoryStr}
                  style={[
                    styles.categoryFilterItem,
                    selectedCategory === categoryStr && styles.categoryFilterItemActive
                  ]}
                  onPress={() => setSelectedCategory(categoryStr)}
                >
                  <Text style={[
                    styles.categoryFilterText,
                    selectedCategory === categoryStr && styles.categoryFilterTextActive
                  ]}>
                    {categoryStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <ScrollView style={styles.storeProductsContent} showsVerticalScrollIndicator={false}>
          <View style={styles.productsGrid}>
            {filteredProducts.map((product: any) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => {
                  console.log('Produto selecionado:', product);
                  setSelectedProduct(product);
                  setStoreSubScreen('product-detail');
                }}
              >
                <Image source={{ uri: product.image }} style={styles.productImage} />

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>

                  <View style={styles.productPriceContainer}>
                    <Text style={styles.productCurrentPrice}>{formatPrice(product.price)}</Text>
                    <Text style={styles.productOriginalPrice}>{formatPrice(product.originalPrice)}</Text>
                  </View>

                  <View style={styles.productRating}>
                    <Text style={styles.productRatingText}>⭐ {product.rating}</Text>
                    <Text style={styles.productReviewsText}>({product.reviews})</Text>
                  </View>

                  <View style={styles.productCashback}>
                    <Text style={styles.productCashbackText}>
                      +{selectedStore.cashback} cashback
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Detalhes do Produto
  const ProductDetailScreen = () => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Preto');

    console.log('ProductDetailScreen - selectedProduct:', selectedProduct);
    console.log('ProductDetailScreen - selectedStore:', selectedStore);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    const calculateCashback = () => {
      if (!selectedProduct || !selectedStore) return 0;
      const cashbackPercent = parseFloat(selectedStore.cashback.replace('%', ''));
      return (selectedProduct.price * quantity * cashbackPercent) / 100;
    };

    if (!selectedProduct || !selectedStore) {
      console.log('Produto ou loja não encontrados, exibindo tela de erro');
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Produto não encontrado</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setStoreSubScreen('products')}
            >
              <Text style={styles.errorButtonText}>Voltar aos Produtos</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const totalPrice = selectedProduct.price * quantity;
    const cashbackAmount = calculateCashback();

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.productDetailHeader}>
          <View style={styles.productDetailHeaderTop}>
            <TouchableOpacity onPress={() => setStoreSubScreen('products')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.productDetailTitle}>Detalhes do Produto</Text>
            <TouchableOpacity>
              <Text style={styles.favoriteIcon}>❤️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.productDetailContent} showsVerticalScrollIndicator={false}>
          {/* Product Image */}
          <View style={styles.productDetailImageContainer}>
            <Image source={{ uri: selectedProduct.image }} style={styles.productDetailImage} />
          </View>

          {/* Product Info */}
          <View style={styles.productDetailInfo}>
            <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
            <Text style={styles.productDetailCategory}>{selectedProduct.category}</Text>

            <View style={styles.productDetailRating}>
              <Text style={styles.productDetailRatingText}>⭐ {selectedProduct.rating}</Text>
              <Text style={styles.productDetailReviewsText}>({selectedProduct.reviews} avaliações)</Text>
            </View>

            {/* Price */}
            <View style={styles.productDetailPriceContainer}>
              <Text style={styles.productDetailCurrentPrice}>{formatPrice(selectedProduct.price)}</Text>
              <Text style={styles.productDetailOriginalPrice}>{formatPrice(selectedProduct.originalPrice)}</Text>
              <View style={styles.productDetailDiscount}>
                <Text style={styles.productDetailDiscountText}>
                  {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                </Text>
              </View>
            </View>

            {/* Cashback Info */}
            <View style={styles.productDetailCashback}>
              <Text style={styles.productDetailCashbackIcon}>💰</Text>
              <Text style={styles.productDetailCashbackText}>
                Ganhe {selectedStore.cashback} de cashback ({formatPrice(cashbackAmount)})
              </Text>
            </View>

            {/* Size Selection */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Tamanho</Text>
              <View style={styles.sizeOptions}>
                {['P', 'M', 'G', 'GG'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      selectedSize === size && styles.sizeOptionSelected
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                      styles.sizeOptionText,
                      selectedSize === size && styles.sizeOptionTextSelected
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Cor</Text>
              <View style={styles.colorOptions}>
                {['Preto', 'Branco', 'Azul', 'Vermelho'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      selectedColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <Text style={[
                      styles.colorOptionText,
                      selectedColor === color && styles.colorOptionTextSelected
                    ]}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity Selection */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Quantidade</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Product Description */}
            <View style={styles.productDetailSection}>
              <Text style={styles.productDetailSectionTitle}>Descrição</Text>
              <Text style={styles.productDetailDescription}>
                Produto de alta qualidade com excelente custo-benefício.
                Perfeito para uso diário com design moderno e confortável.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.productDetailBottomBar}>
          <View style={styles.productDetailTotal}>
            <Text style={styles.productDetailTotalLabel}>Total:</Text>
            <Text style={styles.productDetailTotalPrice}>{formatPrice(totalPrice)}</Text>
            <Text style={styles.productDetailCashbackAmount}>
              +{formatPrice(cashbackAmount)} cashback
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => setStoreSubScreen('checkout')}
          >
            <Text style={styles.addToCartButtonText}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Componente da Tela de Checkout
  const CheckoutScreen = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cashback');
    const [useCashback, setUseCashback] = useState(true);
    const [cashbackAmount, setCashbackAmount] = useState(50.00);

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    if (!selectedProduct || !selectedStore) {
      return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Produto não encontrado</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setStoreSubScreen('product-detail')}
            >
              <Text style={styles.errorButtonText}>Voltar ao Produto</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const subtotal = selectedProduct.price;
    const cashbackEarned = (subtotal * parseFloat(selectedStore.cashback.replace('%', ''))) / 100;
    const cashbackUsed = useCashback ? Math.min(cashbackAmount, subtotal) : 0;
    const total = subtotal - cashbackUsed;

    const paymentMethods = [
      { id: 'cashback', name: 'Cashback', icon: '💰', description: 'Usar saldo disponível' },
      { id: 'pix', name: 'PIX', icon: '⚡', description: 'Aprovação instantânea' },
      { id: 'credit', name: 'Cartão de Crédito', icon: '💳', description: 'Parcelamento disponível' },
    ];

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.checkoutHeader}>
          <View style={styles.checkoutHeaderTop}>
            <TouchableOpacity onPress={() => setStoreSubScreen('product-detail')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.checkoutTitle}>Finalizar Compra</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.checkoutContent} showsVerticalScrollIndicator={false}>
          {/* Product Summary */}
          <View style={styles.checkoutProductSummary}>
            <Image source={{ uri: selectedProduct.image }} style={styles.checkoutProductImage} />
            <View style={styles.checkoutProductInfo}>
              <Text style={styles.checkoutProductName}>{selectedProduct.name}</Text>
              <Text style={styles.checkoutProductCategory}>{selectedProduct.category}</Text>
              <Text style={styles.checkoutProductPrice}>{formatPrice(selectedProduct.price)}</Text>
            </View>
          </View>

          {/* Store Info */}
          <View style={styles.checkoutStoreInfo}>
            <Text style={styles.checkoutStoreName}>{selectedStore.name}</Text>
            <Text style={styles.checkoutStoreAddress}>{selectedStore.address}</Text>
            <Text style={styles.checkoutStoreCashback}>
              {selectedStore.cashback} de cashback disponível
            </Text>
          </View>

          {/* Payment Method */}
          <View style={styles.checkoutPaymentSection}>
            <Text style={styles.checkoutSectionTitle}>Forma de Pagamento</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.checkoutPaymentMethod,
                  selectedPaymentMethod === method.id && styles.checkoutPaymentMethodSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.checkoutPaymentMethodLeft}>
                  <Text style={styles.checkoutPaymentMethodIcon}>{method.icon}</Text>
                  <View style={styles.checkoutPaymentMethodInfo}>
                    <Text style={styles.checkoutPaymentMethodName}>{method.name}</Text>
                    <Text style={styles.checkoutPaymentMethodDescription}>{method.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.checkoutPaymentMethodRadio,
                  selectedPaymentMethod === method.id && styles.checkoutPaymentMethodRadioSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Cashback Usage */}
          {selectedPaymentMethod === 'cashback' && (
            <View style={styles.checkoutCashbackSection}>
              <Text style={styles.checkoutSectionTitle}>Usar Cashback</Text>
              <View style={styles.checkoutCashbackToggle}>
                <Text style={styles.checkoutCashbackToggleText}>Usar cashback disponível</Text>
                <TouchableOpacity
                  style={[styles.checkoutToggle, useCashback && styles.checkoutToggleActive]}
                  onPress={() => setUseCashback(!useCashback)}
                >
                  <View style={[styles.checkoutToggleButton, useCashback && styles.checkoutToggleButtonActive]} />
                </TouchableOpacity>
              </View>

              {useCashback && (
                <View style={styles.checkoutCashbackAmount}>
                  <Text style={styles.checkoutCashbackAmountLabel}>Valor a usar:</Text>
                  <TextInput
                    style={styles.checkoutCashbackAmountInput}
                    value={cashbackAmount.toString()}
                    onChangeText={(text) => setCashbackAmount(parseFloat(text) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.checkoutOrderSummary}>
            <Text style={styles.checkoutSectionTitle}>Resumo do Pedido</Text>

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryLabel}>Subtotal:</Text>
              <Text style={styles.checkoutSummaryValue}>{formatPrice(subtotal)}</Text>
            </View>

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryLabel}>Cashback usado:</Text>
              <Text style={styles.checkoutSummaryDiscount}>-{formatPrice(cashbackUsed)}</Text>
            </View>

            <View style={styles.checkoutSummaryDivider} />

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryTotalLabel}>Total:</Text>
              <Text style={styles.checkoutSummaryTotalValue}>{formatPrice(total)}</Text>
            </View>

            <View style={styles.checkoutSummaryRow}>
              <Text style={styles.checkoutSummaryLabel}>Cashback ganho:</Text>
              <Text style={styles.checkoutSummaryCashback}>+{formatPrice(cashbackEarned)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.checkoutBottomBar}>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Componente da Tela de Login
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View style={styles.loginContainer}>
        <StatusBar style="dark" />

        {/* Header Section */}
        <View style={styles.loginHeaderSection}>
          <View style={styles.loginLogoContainer}>
            <View style={styles.loginLogoBackground}>
              <Text style={styles.loginWalletIcon}>💳</Text>
              <Text style={styles.loginStarIcon}>✨</Text>
            </View>
          </View>

          <Text style={styles.loginWelcomeText}>Bem-vindo de volta!</Text>
          <Text style={styles.loginSubtitleText}>Entre e aproveite cashback nas lojas locais</Text>
        </View>

        {/* Login Form */}
        <View style={styles.loginFormCard}>
          {/* Email/CPF Field */}
          <View style={styles.loginInputContainer}>
            <Text style={styles.loginInputLabel}>E-mail ou CPF</Text>
            <View style={styles.loginInputWrapper}>
              <Text style={styles.loginInputIcon}>✉️</Text>
              <TextInput
                style={styles.loginTextInput}
                placeholder="seu@email.com ou 000.000.000-0"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.loginInputContainer}>
            <View style={styles.loginPasswordHeader}>
              <Text style={styles.loginInputLabel}>Senha</Text>
              <TouchableOpacity>
                <Text style={styles.loginForgotPassword}>Esqueceu?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.loginInputWrapper}>
              <Text style={styles.loginInputIcon}>🔒</Text>
              <TextInput
                style={styles.loginTextInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.loginEyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.loginDivider}>
            <View style={styles.loginDividerLine} />
            <Text style={styles.loginDividerText}>ou continue com</Text>
            <View style={styles.loginDividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.loginSocialButtons}>
            <TouchableOpacity style={styles.loginSocialButton}>
              <Text style={styles.loginGoogleIcon}>G</Text>
              <Text style={styles.loginSocialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginSocialButton}>
              <Text style={styles.loginFacebookIcon}>f</Text>
              <Text style={styles.loginSocialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.loginFooter}>
          <Text style={styles.loginFooterText}>Não tem uma conta? </Text>
          <TouchableOpacity>
            <Text style={styles.loginRegisterLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Componente da Tela de Ranking
  const RankingScreen = () => {
    const [selectedTab, setSelectedTab] = useState('sales');

    // Selecionar dados baseado no filtro ativo
    const currentRankingStores = selectedTab === 'sales' ? salesRankingStores : cashbackRankingStores;
    const top3Stores = currentRankingStores.filter(store => store.isTop3);

    // Título dinâmico baseado no filtro
    const getTop3Title = () => {
      return selectedTab === 'sales' ? 'Top 3 do Mês' : 'Top 3 Cashback';
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.rankingHeader}>
          <View style={styles.rankingHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.rankingHeaderContent}>
              <Text style={styles.rankingTitle}>Rankings</Text>
              <Text style={styles.rankingSubtitle}>Descubra as lojas mais populares e com melhores cashbacks</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.rankingTabs}>
            <TouchableOpacity
              style={[styles.rankingTab, selectedTab === 'sales' && styles.rankingTabActive]}
              onPress={() => setSelectedTab('sales')}
            >
              <Text style={[styles.rankingTabText, selectedTab === 'sales' && styles.rankingTabTextActive]}>
                Mais Vendas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rankingTab, selectedTab === 'cashback' && styles.rankingTabActive]}
              onPress={() => setSelectedTab('cashback')}
            >
              <Text style={[styles.rankingTabText, selectedTab === 'cashback' && styles.rankingTabTextActive]}>
                Maior Cashback
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.rankingContent} showsVerticalScrollIndicator={false}>
          {/* Top 3 Section */}
          <View style={styles.top3Section}>
            <View style={styles.top3Header}>
              <Text style={styles.top3Icon}>👑</Text>
              <Text style={styles.top3Title}>{getTop3Title()}</Text>
            </View>

            <View style={styles.top3Container}>
              {/* 2nd Place */}
              <View style={styles.top3Item}>
                <View style={styles.top3Medal}>
                  <Text style={styles.top3MedalIcon}>🥈</Text>
                </View>
                <View style={[styles.top3Logo, { backgroundColor: top3Stores[1].logoBg }]}>
                  <Text style={styles.top3LogoIcon}>{top3Stores[1].logo}</Text>
                </View>
                <Text style={styles.top3StoreName}>{top3Stores[1].name}</Text>
                <Text style={styles.top3Sales}>
                  {selectedTab === 'sales' ? `${top3Stores[1].sales} vendas` : `${top3Stores[1].cashback} cashback`}
                </Text>
              </View>

              {/* 1st Place */}
              <View style={styles.top3Item}>
                <View style={styles.top3Crown}>
                  <Text style={styles.top3CrownIcon}>👑</Text>
                </View>
                <View style={[styles.top3Logo, styles.top3LogoFirst, { backgroundColor: top3Stores[0].logoBg }]}>
                  <Text style={styles.top3LogoIcon}>{top3Stores[0].logo}</Text>
                </View>
                <View style={styles.top3Badge}>
                  <Text style={styles.top3BadgeText}>
                    {selectedTab === 'sales' ? 'Loja do Mês' : 'Melhor Cashback'}
                  </Text>
                </View>
                <Text style={styles.top3StoreName}>{top3Stores[0].name}</Text>
                <Text style={styles.top3Sales}>
                  {selectedTab === 'sales' ? `${top3Stores[0].sales} vendas` : `${top3Stores[0].cashback} cashback`}
                </Text>
              </View>

              {/* 3rd Place */}
              <View style={styles.top3Item}>
                <View style={styles.top3Medal}>
                  <Text style={styles.top3MedalIcon}>🥉</Text>
                </View>
                <View style={[styles.top3Logo, { backgroundColor: top3Stores[2].logoBg }]}>
                  <Text style={styles.top3LogoIcon}>{top3Stores[2].logo}</Text>
                </View>
                <Text style={styles.top3StoreName}>{top3Stores[2].name}</Text>
                <Text style={styles.top3Sales}>
                  {selectedTab === 'sales' ? `${top3Stores[2].sales} vendas` : `${top3Stores[2].cashback} cashback`}
                </Text>
              </View>
            </View>
          </View>

          {/* Ranking List */}
          <View style={styles.rankingList}>
            {currentRankingStores.map((store) => (
              <TouchableOpacity key={store.id} style={styles.rankingItem}>
                <View style={styles.rankingItemLeft}>
                  {store.position <= 3 ? (
                    store.position === 1 ? (
                      <Text style={styles.rankingCrownIcon}>👑</Text>
                    ) : store.position === 2 ? (
                      <Text style={styles.rankingMedalIcon}>🥈</Text>
                    ) : (
                      <Text style={styles.rankingMedalIcon}>🥉</Text>
                    )
                  ) : (
                    <Text style={styles.rankingPosition}>#{store.position}</Text>
                  )}

                  <View style={[styles.rankingItemLogo, { backgroundColor: store.logoBg }]}>
                    <Text style={styles.rankingItemLogoIcon}>{store.logo}</Text>
                  </View>

                  <View style={styles.rankingItemInfo}>
                    <Text style={styles.rankingItemName}>{store.name}</Text>
                    <Text style={styles.rankingItemCategory}>{store.category}</Text>
                    <Text style={styles.rankingItemSales}>
                      {selectedTab === 'sales' ? `${store.sales} vendas` : `${store.cashback} cashback`}
                    </Text>
                    <View style={styles.rankingItemRating}>
                      <Text style={styles.rankingItemRatingText}>{store.rating}</Text>
                      <Text style={styles.rankingStarIcon}>⭐</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.rankingCashback}>
                  <Text style={styles.rankingCashbackPercent}>
                    {selectedTab === 'sales' ? store.cashback : `${store.sales}`}
                  </Text>
                  <Text style={styles.rankingCashbackText}>
                    {selectedTab === 'sales' ? 'cashback' : 'vendas'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <Text style={[styles.navIcon, item.active && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela de Comparar Preços
  const CompareScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedProduct, setSearchedProduct] = useState('iPhone 15 Pro 256GB');

    const handleSearch = () => {
      if (searchText.trim()) {
        setSearchedProduct(searchText);
      }
    };

    const formatPrice = (price: number) => {
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.compareHeader}>
          <View style={styles.compareHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.compareHeaderContent}>
              <Text style={styles.compareTitle}>Comparar Preços</Text>
              <Text style={styles.compareSubtitle}>Use IA para encontrar o melhor preço com cashback</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.compareContent} showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Text style={styles.compareSearchIcon}>🔍</Text>
              <TextInput
                style={styles.compareSearchInput}
                placeholder="Digite o nome do produto..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>📷</Text>
                <Text style={styles.actionButtonText}>Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>📤</Text>
                <Text style={styles.actionButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

            {/* AI Smart Search Box */}
            <View style={styles.aiSearchBox}>
              <Text style={styles.aiSearchIcon}>✨</Text>
              <View style={styles.aiSearchContent}>
                <Text style={styles.aiSearchTitle}>Busca Inteligente com IA</Text>
                <Text style={styles.aiSearchDescription}>
                  Tire uma foto ou faça upload de um print do produto. Nossa IA encontra as melhores ofertas para você!
                </Text>
              </View>
            </View>
          </View>

          {/* Results Section */}
          {searchedProduct && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Resultados para:</Text>
                <Text style={styles.resultsProduct}>{searchedProduct}</Text>
              </View>

              {/* Store Cards */}
              {compareResults.map((result) => (
                <View key={result.id} style={styles.compareCard}>
                  {/* Card Header */}
                  <View style={styles.compareCardHeader}>
                    {result.isBestOffer && (
                      <View style={styles.bestOfferBadge}>
                        <Text style={styles.bestOfferText}>Melhor Oferta</Text>
                      </View>
                    )}
                    <View style={styles.compareCardHeaderRight}>
                      <Text style={styles.compareCashbackBadge}>{result.cashback} cashback</Text>
                    </View>
                  </View>

                  {/* Store Info */}
                  <View style={styles.compareStoreInfo}>
                    <Text style={styles.compareStoreName}>{result.storeName}</Text>
                    <Text style={styles.compareStoreDetails}>
                      {result.distance} ⭐ {result.rating}
                    </Text>
                  </View>

                  {/* Price Details */}
                  <View style={styles.priceDetails}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Preço original:</Text>
                      <Text style={styles.priceValue}>{formatPrice(result.originalPrice)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Cashback:</Text>
                      <Text style={styles.cashbackValue}>-{formatPrice(result.cashbackAmount)}</Text>
                    </View>
                  </View>

                  {/* Separator */}
                  <View style={styles.priceSeparator} />

                  {/* Final Price */}
                  <View style={styles.finalPriceRow}>
                    <Text style={styles.finalPriceLabel}>Preço final:</Text>
                    <Text style={styles.finalPriceValue}>{formatPrice(result.finalPrice)}</Text>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity style={styles.viewStoreButton}>
                    <Text style={styles.viewStoreButtonText}>Ver na Loja</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <Text style={[styles.navIcon, item.active && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela de Comprar Cashback
  const BuyCashbackScreen = () => {
    const [selectedAmount, setSelectedAmount] = useState(50);
    const [selectedMethod, setSelectedMethod] = useState('pix');

    const cashbackPackages = [
      { id: 1, amount: 25, price: 20, bonus: 0, popular: false },
      { id: 2, amount: 50, price: 40, bonus: 5, popular: true },
      { id: 3, amount: 100, price: 80, bonus: 15, popular: false },
      { id: 4, amount: 200, price: 160, bonus: 40, popular: false },
    ];

    const paymentMethods = [
      { id: 'pix', name: 'PIX', icon: '⚡', description: 'Aprovação instantânea' },
      { id: 'credit', name: 'Cartão de Crédito', icon: '💳', description: 'Parcelamento disponível' },
      { id: 'debit', name: 'Cartão de Débito', icon: '🏦', description: 'Débito em conta' },
    ];

    const selectedPackage = cashbackPackages.find(pkg => pkg.amount === selectedAmount);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.buyCashbackHeader}>
          <View style={styles.buyCashbackHeaderTop}>
            <TouchableOpacity onPress={() => setWalletSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.buyCashbackTitle}>Comprar Cashback</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.buyCashbackContent} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>💰 Como funciona?</Text>
            <Text style={styles.infoCardText}>
              Compre cashback e use em qualquer loja parceira. Quanto mais você compra, maior o bônus!
            </Text>
          </View>

          {/* Package Selection */}
          <View style={styles.packageSection}>
            <Text style={styles.sectionTitle}>Escolha seu pacote</Text>
            <View style={styles.packagesGrid}>
              {cashbackPackages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    selectedAmount === pkg.amount && styles.packageCardSelected,
                    pkg.popular && styles.packageCardPopular
                  ]}
                  onPress={() => setSelectedAmount(pkg.amount)}
                >
                  {pkg.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
                    </View>
                  )}
                  <Text style={styles.packageAmount}>R$ {pkg.amount}</Text>
                  <Text style={styles.packagePrice}>R$ {pkg.price}</Text>
                  {pkg.bonus > 0 && (
                    <Text style={styles.packageBonus}>+R$ {pkg.bonus} bônus</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Forma de pagamento</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedMethod === method.id && styles.paymentMethodCardSelected
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.paymentMethodLeft}>
                  <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.paymentMethodRadio,
                  selectedMethod === method.id && styles.paymentMethodRadioSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo da compra</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cashback:</Text>
              <Text style={styles.summaryValue}>R$ {selectedPackage?.amount}</Text>
            </View>
            {selectedPackage && selectedPackage.bonus > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bônus:</Text>
                <Text style={styles.summaryBonusValue}>+R$ {selectedPackage.bonus}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total a pagar:</Text>
              <Text style={styles.summaryTotalValue}>R$ {selectedPackage?.price}</Text>
            </View>
          </View>

          {/* Buy Button */}
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Comprar Agora</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Vouchers
  const VouchersScreen = () => {
    const [activeTab, setActiveTab] = useState('available');

    const availableVouchers = [
      {
        id: 1,
        storeName: 'TechWorld',
        discount: '10%',
        description: 'Desconto em eletrônicos',
        expiryDate: '31/01/2025',
        minValue: 100,
        icon: '⚡',
        iconBg: '#4CAF50',
      },
      {
        id: 2,
        storeName: 'Boutique Elegance',
        discount: '15%',
        description: 'Desconto em roupas',
        expiryDate: '28/01/2025',
        minValue: 50,
        icon: '👔',
        iconBg: '#9E9E9E',
      },
      {
        id: 3,
        storeName: 'Farmácia Saúde+',
        discount: '8%',
        description: 'Desconto em medicamentos',
        expiryDate: '25/01/2025',
        minValue: 30,
        icon: '💊',
        iconBg: '#4CAF50',
      },
    ];

    const usedVouchers = [
      {
        id: 4,
        storeName: 'Restaurante Sabor',
        discount: '12%',
        description: 'Desconto em refeições',
        usedDate: '15/01/2025',
        icon: '🍽️',
        iconBg: '#8D6E63',
      },
    ];

    const currentVouchers = activeTab === 'available' ? availableVouchers : usedVouchers;

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.vouchersHeader}>
          <View style={styles.vouchersHeaderTop}>
            <TouchableOpacity onPress={() => setWalletSubScreen(null)}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.vouchersTitle}>Meus Vouchers</Text>
          </View>

          {/* Tabs */}
          <View style={styles.vouchersTabs}>
            <TouchableOpacity
              style={[styles.vouchersTab, activeTab === 'available' && styles.vouchersTabActive]}
              onPress={() => setActiveTab('available')}
            >
              <Text style={[styles.vouchersTabText, activeTab === 'available' && styles.vouchersTabTextActive]}>
                Disponíveis ({availableVouchers.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.vouchersTab, activeTab === 'used' && styles.vouchersTabActive]}
              onPress={() => setActiveTab('used')}
            >
              <Text style={[styles.vouchersTabText, activeTab === 'used' && styles.vouchersTabTextActive]}>
                Usados ({usedVouchers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.vouchersContent} showsVerticalScrollIndicator={false}>
          {currentVouchers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎫</Text>
              <Text style={styles.emptyStateTitle}>Nenhum voucher encontrado</Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'available'
                  ? 'Você não possui vouchers disponíveis no momento.'
                  : 'Você ainda não usou nenhum voucher.'
                }
              </Text>
            </View>
          ) : (
            currentVouchers.map((voucher) => (
              <View key={voucher.id} style={styles.voucherCard}>
                <View style={styles.voucherLeft}>
                  <View style={[styles.voucherIcon, { backgroundColor: voucher.iconBg }]}>
                    <Text style={styles.voucherIconText}>{voucher.icon}</Text>
                  </View>
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherStoreName}>{voucher.storeName}</Text>
                    <Text style={styles.voucherDiscount}>{voucher.discount} de desconto</Text>
                    <Text style={styles.voucherDescription}>{voucher.description}</Text>
                    {activeTab === 'available' ? (
                      <>
                        <Text style={styles.voucherExpiry}>Expira em: {'expiryDate' in voucher ? voucher.expiryDate : ''}</Text>
                        <Text style={styles.voucherMinValue}>Valor mínimo: R$ {'minValue' in voucher ? voucher.minValue : ''}</Text>
                      </>
                    ) : (
                      <Text style={styles.voucherUsedDate}>Usado em: {'usedDate' in voucher ? voucher.usedDate : ''}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.voucherRight}>
                  {activeTab === 'available' ? (
                    <TouchableOpacity style={styles.useVoucherButton}>
                      <Text style={styles.useVoucherButtonText}>Usar</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.usedBadge}>
                      <Text style={styles.usedBadgeText}>Usado</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  // Componente da Tela de Carteira
  const WalletScreen = () => {
    // Dados das transações do histórico
    const transactions = [
      {
        id: 1,
        storeName: 'Boutique Elegance',
        date: '17/01/2025',
        amount: 45.50,
        type: 'received',
        expiresIn: 43,
        icon: '👔',
        iconBg: '#4CAF50',
        iconColor: '#2E7D32',
      },
      {
        id: 2,
        storeName: 'TechWorld',
        date: '16/01/2025',
        amount: 30.00,
        type: 'used',
        expiresIn: null,
        icon: '⚡',
        iconBg: '#FFCDD2',
        iconColor: '#D32F2F',
      },
      {
        id: 3,
        storeName: 'Farmácia Saúde+',
        date: '14/01/2025',
        amount: 12.80,
        type: 'received',
        expiresIn: 41,
        icon: '💊',
        iconBg: '#4CAF50',
        iconColor: '#2E7D32',
      },
      {
        id: 4,
        storeName: 'Restaurante Sabor',
        date: '13/01/2025',
        amount: 18.90,
        type: 'received',
        expiresIn: 40,
        icon: '🍽️',
        iconBg: '#4CAF50',
        iconColor: '#2E7D32',
      },
      {
        id: 5,
        storeName: 'Clube iLocash',
        date: '09/01/2025',
        amount: 50.00,
        type: 'purchased',
        expiresIn: 36,
        icon: '🎁',
        iconBg: '#2196F3',
        iconColor: '#1976D2',
      },
    ];

    return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Header Section */}
        <View style={styles.walletHeader}>
          <View style={styles.walletHeaderTop}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.walletTitle}>Minha Carteira</Text>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.walletContent} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Total em Cashback</Text>
            <Text style={styles.balanceAmount}>R$ 127,50</Text>
            <Text style={styles.balanceExpiry}>Expira em até 45 dias</Text>

            {/* Action Buttons */}
            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={styles.buyCashbackButton}
                onPress={() => setWalletSubScreen('buy')}
              >
                <Text style={styles.buyCashbackIcon}>🎁</Text>
                <Text style={styles.buyCashbackText}>Comprar Cashback</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewVouchersButton}
                onPress={() => setWalletSubScreen('vouchers')}
              >
                <Text style={styles.viewVouchersText}>Ver Vouchers</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>R$ 247</Text>
              <Text style={styles.statLabel}>Ganho Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>R$ 119</Text>
              <Text style={styles.statLabel}>Usado</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Transações</Text>
            </View>
          </View>

          {/* Cashback Distribution */}
          <View style={styles.distributionSection}>
            <Text style={styles.distributionTitle}>Distribuição de Cashback</Text>
            <View style={styles.distributionItem}>
              <View style={styles.distributionLeft}>
                <View style={styles.distributionDotFree} />
                <Text style={styles.distributionText}>Livre (todas as lojas)</Text>
              </View>
              <Text style={styles.distributionAmount}>R$ 85,00</Text>
            </View>
            <View style={styles.distributionItem}>
              <View style={styles.distributionLeft}>
                <View style={styles.distributionDotSpecific} />
                <Text style={styles.distributionText}>Lojas específicas</Text>
              </View>
              <Text style={styles.distributionAmount}>R$ 42,50</Text>
            </View>
          </View>

          {/* History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Histórico</Text>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBg }]}>
                    <Text style={styles.transactionIconText}>{transaction.icon}</Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionStore}>{transaction.storeName}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                    {transaction.expiresIn && (
                      <View style={styles.transactionExpiry}>
                        <Text style={styles.expiryIcon}>🕒</Text>
                        <Text style={styles.expiryText}>Expira em {transaction.expiresIn} dias</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'used' ? styles.transactionAmountUsed : styles.transactionAmountReceived
                  ]}>
                    {transaction.type === 'used' ? `R$ ${transaction.amount.toFixed(2).replace('.', ',')}` : `+R$ ${transaction.amount.toFixed(2).replace('.', ',')}`}
                  </Text>
                  <TouchableOpacity style={[
                    styles.transactionStatus,
                    transaction.type === 'purchased' ? styles.transactionStatusPurchased : styles.transactionStatusDefault
                  ]}>
                    <Text style={styles.transactionStatusText}>
                      {transaction.type === 'received' ? 'Recebido' :
                        transaction.type === 'used' ? 'Usado' : 'Comprado'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {bottomNavItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.screen)}
            >
              <Text style={[styles.navIcon, item.active && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navText, item.active && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Componente da Tela Home
  const HomeScreen = () => (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>ILocash</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>São Paulo, SP</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>R$ 127,50</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lojas ou produtos..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryItem}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clube ILocash Banner */}
        <View style={styles.clubBanner}>
          <View style={styles.clubContent}>
            <Text style={styles.clubIcon}>✨</Text>
            <Text style={styles.clubTitle}>Clube ILocash</Text>
            <Text style={styles.clubDescription}>Compre cashback e economize ainda mais!</Text>
            <TouchableOpacity style={styles.clubButton}>
              <Text style={styles.clubButtonText}>Conhecer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Stores Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lojas em Destaque</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('ranking')}>
              <Text style={styles.seeRankingLink}>Ver ranking</Text>
            </TouchableOpacity>
          </View>

          {/* Store Cards */}
          {featuredStores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeCard}
              onPress={() => {
                setSelectedStore(store);
                setCurrentScreen('store-detail');
              }}
            >
              <View style={styles.storeImageContainer}>
                <Image source={{ uri: store.image }} style={styles.storeImage} />

                {/* Badges */}
                <View style={styles.storeBadges}>
                  <View style={[styles.badge, { backgroundColor: store.badgeColor }]}>
                    <Text style={styles.badgeText}>{store.badge}</Text>
                  </View>
                  <View style={[styles.cashbackBadge, { backgroundColor: '#1E293B' }]}>
                    <Text style={styles.cashbackText}>{store.cashback} cashback</Text>
                  </View>
                </View>
              </View>

              {/* Store Info */}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeCategory}>{store.category}</Text>

                <View style={styles.storeDetails}>
                  <View style={styles.storeDetailItem}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{store.distance}</Text>
                  </View>
                  <View style={styles.storeDetailItem}>
                    <Text style={styles.detailIcon}>⭐</Text>
                    <Text style={styles.detailText}>{store.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomNavItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => setCurrentScreen(item.screen)}
          >
            <Text style={[styles.navIcon, item.active && styles.navIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.navText, item.active && styles.navTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Renderizar a tela baseada no estado de login e tela atual
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  if (currentScreen === 'ranking') {
    return <RankingScreen />;
  }

  if (currentScreen === 'compare') {
    return <CompareScreen />;
  }

  if (currentScreen === 'wallet') {
    if (walletSubScreen === 'buy') {
      return <BuyCashbackScreen />;
    }
    if (walletSubScreen === 'vouchers') {
      return <VouchersScreen />;
    }
    return <WalletScreen />;
  }

  if (currentScreen === 'store-detail') {
    console.log('Renderizando store-detail, storeSubScreen:', storeSubScreen);
    console.log('selectedProduct:', selectedProduct);
    console.log('selectedStore:', selectedStore);

    if (storeSubScreen === 'products') {
      return <StoreProductsScreen />;
    }
    if (storeSubScreen === 'product-detail') {
      return <ProductDetailScreen />;
    }
    if (storeSubScreen === 'checkout') {
      return <CheckoutScreen />;
    }
    return <StoreDetailScreen />;
  }

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  // Login Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loginHeaderSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginLogoContainer: {
    marginBottom: 20,
  },
  loginLogoBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#5C8FFC',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loginWalletIcon: {
    fontSize: 40,
    color: 'white',
  },
  loginStarIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 20,
    color: '#1F2937',
  },
  loginWelcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  loginSubtitleText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginFormCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginInputContainer: {
    marginBottom: 20,
  },
  loginInputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  loginPasswordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loginForgotPassword: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: '500',
  },
  loginInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loginInputIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#6B7280',
  },
  loginTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  loginEyeIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  loginButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  loginDividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  loginSocialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loginSocialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    marginHorizontal: 6,
  },
  loginGoogleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 8,
  },
  loginFacebookIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1877F2',
    marginRight: 8,
  },
  loginSocialButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginFooterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginRegisterLink: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  // Home Screen Styles
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Header Styles
  header: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: 'white',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  // Main Content Styles
  mainContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeRankingLink: {
    fontSize: 14,
    color: '#60A5FA',
    fontWeight: '500',
  },
  // Categories Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '22%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Club Banner
  clubBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  clubContent: {
    alignItems: 'center',
  },
  clubIcon: {
    fontSize: 32,
    marginBottom: 12,
    color: '#60A5FA',
  },
  clubTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginBottom: 8,
  },
  clubDescription: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  clubButton: {
    backgroundColor: '#60A5FA',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  clubButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#9CA3AF',
  },
  navIconActive: {
    color: '#5C8FFC',
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#5C8FFC',
  },
  // Store Card Styles
  storeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  storeImageContainer: {
    position: 'relative',
    height: 160,
  },
  storeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storeBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  cashbackBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  storeInfo: {
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Ranking Screen Styles
  rankingHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  rankingHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 16,
    marginTop: 4,
  },
  rankingHeaderContent: {
    flex: 1,
  },
  rankingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  rankingSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  rankingTabs: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 4,
  },
  rankingTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  rankingTabActive: {
    backgroundColor: '#0F172A',
  },
  rankingTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  rankingTabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  rankingContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Top 3 Section Styles
  top3Section: {
    marginTop: 24,
    marginBottom: 32,
  },
  top3Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  top3Icon: {
    fontSize: 20,
    marginRight: 8,
  },
  top3Title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  top3Container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  top3Item: {
    alignItems: 'center',
    flex: 1,
  },
  top3Medal: {
    marginBottom: 8,
  },
  top3MedalIcon: {
    fontSize: 24,
  },
  top3Crown: {
    marginBottom: 8,
  },
  top3CrownIcon: {
    fontSize: 24,
  },
  top3Logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  top3LogoFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  top3LogoIcon: {
    fontSize: 24,
    color: 'white',
  },
  top3Badge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  top3BadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  top3StoreName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  top3Sales: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Ranking List Styles
  rankingList: {
    marginBottom: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rankingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingCrownIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  rankingMedalIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  rankingPosition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginRight: 12,
    minWidth: 32,
  },
  rankingItemLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankingItemLogoIcon: {
    fontSize: 18,
    color: 'white',
  },
  rankingItemInfo: {
    flex: 1,
  },
  rankingItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  rankingItemCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  rankingItemSales: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  rankingItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingItemRatingText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  rankingStarIcon: {
    fontSize: 12,
  },
  rankingCashback: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rankingCashbackPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  rankingCashbackText: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
  },
  // Compare Screen Styles
  compareHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  compareHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  compareHeaderContent: {
    flex: 1,
    alignItems: 'center',
  },
  compareTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  compareSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  compareContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Search Section Styles
  searchSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  compareSearchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#9CA3AF',
  },
  compareSearchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 6,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  aiSearchBox: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  aiSearchIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  aiSearchContent: {
    flex: 1,
  },
  aiSearchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  aiSearchDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  // Results Section Styles
  resultsSection: {
    marginTop: 24,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  resultsProduct: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Compare Card Styles
  compareCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compareCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bestOfferBadge: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bestOfferText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  compareCardHeaderRight: {
    alignItems: 'flex-end',
  },
  compareCashbackBadge: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  compareStoreInfo: {
    marginBottom: 16,
  },
  compareStoreName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  compareStoreDetails: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Price Details Styles
  priceDetails: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  cashbackValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  priceSeparator: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 12,
  },
  finalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  finalPriceLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  finalPriceValue: {
    fontSize: 18,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  viewStoreButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewStoreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Wallet Screen Styles
  walletHeader: {
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  walletHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  walletContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Balance Card Styles
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  balanceExpiry: {
    fontSize: 14,
    color: 'white',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buyCashbackButton: {
    flex: 1,
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  buyCashbackIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buyCashbackText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  viewVouchersButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  viewVouchersText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  // Stats Cards Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  // Distribution Section Styles
  distributionSection: {
    marginBottom: 24,
  },
  distributionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionDotFree: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5C8FFC',
    marginRight: 12,
  },
  distributionDotSpecific: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9CA3AF',
    marginRight: 12,
  },
  distributionText: {
    fontSize: 14,
    color: 'white',
  },
  distributionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  // History Section Styles
  historySection: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  transactionExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionAmountReceived: {
    color: '#10B981',
  },
  transactionAmountUsed: {
    color: '#EF4444',
  },
  transactionStatus: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  transactionStatusDefault: {
    backgroundColor: '#374151',
  },
  transactionStatusPurchased: {
    backgroundColor: '#5C8FFC',
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  // Buy Cashback Screen Styles
  buyCashbackHeader: {
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buyCashbackHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyCashbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  buyCashbackContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Info Card Styles
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  // Package Section Styles
  packageSection: {
    marginBottom: 24,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  packageCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  packageCardPopular: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  packageAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 16,
    color: '#5C8FFC',
    marginBottom: 4,
  },
  packageBonus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  // Payment Section Styles
  paymentSection: {
    marginBottom: 24,
  },
  paymentMethodCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodCardSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentMethodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  paymentMethodRadioSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#5C8FFC',
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  summaryBonusValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 18,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  // Buy Button Styles
  buyButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Vouchers Screen Styles
  vouchersHeader: {
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  vouchersHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vouchersTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  vouchersTabs: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 4,
  },
  vouchersTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  vouchersTabActive: {
    backgroundColor: '#1E293B',
  },
  vouchersTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  vouchersTabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  vouchersContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Voucher Card Styles
  voucherCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  voucherIconText: {
    fontSize: 20,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherStoreName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  voucherDiscount: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  voucherDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  voucherExpiry: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 2,
  },
  voucherMinValue: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  voucherUsedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  voucherRight: {
    alignItems: 'flex-end',
  },
  useVoucherButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  useVoucherButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  usedBadge: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  usedBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  // Store Detail Screen Styles
  storeDetailHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeDetailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  shareIcon: {
    fontSize: 20,
    color: 'white',
  },
  storeDetailImageContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  storeDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storeDetailBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeDetailContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  storeInfoSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  storeDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  storeDetailCategory: {
    fontSize: 16,
    color: '#5C8FFC',
    marginBottom: 12,
  },
  storeDetailDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 20,
  },
  storeDetailItems: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  storeDetailItemIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  storeDetailItemText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  storeActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  storeActionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  storeActionButtonPrimary: {
    flex: 2,
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  storeActionButtonIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  storeActionButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  storeActionButtonTextPrimary: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  productsPreviewSection: {
    marginBottom: 20,
  },
  productsPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  seeAllProductsLink: {
    fontSize: 14,
    color: '#5C8FFC',
    fontWeight: '500',
  },
  productPreviewCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 150,
  },
  productPreviewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productPreviewName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  productPreviewPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPreviewCurrentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginRight: 8,
  },
  productPreviewOriginalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productPreviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPreviewRatingText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  productPreviewReviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Store Products Screen Styles
  storeProductsHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeProductsHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  filterIcon: {
    fontSize: 20,
    color: 'white',
  },
  categoriesFilter: {
    marginBottom: 8,
  },
  categoryFilterItem: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryFilterItemActive: {
    backgroundColor: '#0F172A',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  storeProductsContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCurrentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginRight: 8,
  },
  productOriginalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRatingText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  productReviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  productCashback: {
    backgroundColor: '#1E40AF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  productCashbackText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  // Product Detail Screen Styles
  productDetailHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productDetailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
    color: 'white',
  },
  productDetailContent: {
    flex: 1,
    backgroundColor: '#000000',
  },
  productDetailImageContainer: {
    height: 300,
    backgroundColor: '#1A1A1A',
  },
  productDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetailInfo: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  productDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  productDetailCategory: {
    fontSize: 16,
    color: '#5C8FFC',
    marginBottom: 12,
  },
  productDetailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productDetailRatingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
  },
  productDetailReviewsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  productDetailPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productDetailCurrentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5C8FFC',
    marginRight: 12,
  },
  productDetailOriginalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  productDetailDiscount: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productDetailDiscountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  productDetailCashback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  productDetailCashbackIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  productDetailCashbackText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  productDetailSection: {
    marginBottom: 24,
  },
  productDetailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sizeOptionSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  sizeOptionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  sizeOptionTextSelected: {
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  colorOptionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  colorOptionTextSelected: {
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 20,
  },
  productDetailDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  productDetailBottomBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  productDetailTotal: {
    flex: 1,
  },
  productDetailTotalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  productDetailTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  productDetailCashbackAmount: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  addToCartButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Checkout Screen Styles
  checkoutHeader: {
    backgroundColor: '#5C8FFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  checkoutHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  checkoutContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  checkoutProductSummary: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  checkoutProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  checkoutProductInfo: {
    flex: 1,
  },
  checkoutProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  checkoutProductCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  checkoutProductPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C8FFC',
  },
  checkoutStoreInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  checkoutStoreName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  checkoutStoreAddress: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  checkoutStoreCashback: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  checkoutPaymentSection: {
    marginBottom: 20,
  },
  checkoutSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  checkoutPaymentMethod: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  checkoutPaymentMethodSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#1E293B',
  },
  checkoutPaymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkoutPaymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  checkoutPaymentMethodInfo: {
    flex: 1,
  },
  checkoutPaymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  checkoutPaymentMethodDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkoutPaymentMethodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  checkoutPaymentMethodRadioSelected: {
    borderColor: '#5C8FFC',
    backgroundColor: '#5C8FFC',
  },
  checkoutCashbackSection: {
    marginBottom: 20,
  },
  checkoutCashbackToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  checkoutCashbackToggleText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  checkoutToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  checkoutToggleActive: {
    backgroundColor: '#5C8FFC',
  },
  checkoutToggleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  checkoutToggleButtonActive: {
    alignSelf: 'flex-end',
  },
  checkoutCashbackAmount: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  checkoutCashbackAmountLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  checkoutCashbackAmountInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: '#374151',
  },
  checkoutOrderSummary: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  checkoutSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkoutSummaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  checkoutSummaryValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  checkoutSummaryDiscount: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  checkoutSummaryDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  checkoutSummaryTotalLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  checkoutSummaryTotalValue: {
    fontSize: 18,
    color: '#5C8FFC',
    fontWeight: 'bold',
  },
  checkoutSummaryCashback: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  checkoutBottomBar: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  checkoutButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Error Screen Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#5C8FFC',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});