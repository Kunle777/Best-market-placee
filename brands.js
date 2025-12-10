// Brands page functionality
document.addEventListener('DOMContentLoaded', function() {
  setupBrandInteractions();
});

// Setup brand interactions
function setupBrandInteractions() {
  // View products buttons
  const viewProductsBtns = document.querySelectorAll('.view-products-btn');
  viewProductsBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const brandName = this.closest('.brand-card').querySelector('h3').textContent;
      window.location.href = `shop.html?brand=${encodeURIComponent(brandName)}`;
    });
  });

  // Brand items in list
  const brandItems = document.querySelectorAll('.brand-item');
  brandItems.forEach(item => {
    item.addEventListener('click', function() {
      const brandName = this.querySelector('h4').textContent;
      window.location.href = `shop.html?brand=${encodeURIComponent(brandName)}`;
    });
  });

  // Category cards
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      const categoryName = this.querySelector('h3').textContent;
      window.location.href = `shop.html?category=${encodeURIComponent(categoryName)}`;
    });
  });

  // Search functionality
  const searchInput = document.querySelector('.brands-hero input[type="search"]');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterBrands(this.value);
    });
  }
}

// Filter brands based on search
function filterBrands(searchTerm) {
  const brandCards = document.querySelectorAll('.brand-card');
  const brandItems = document.querySelectorAll('.brand-item');
  
  const term = searchTerm.toLowerCase();
  
  // Filter featured brands
  brandCards.forEach(card => {
    const brandName = card.querySelector('h3').textContent.toLowerCase();
    const brandCategory = card.querySelector('.brand-category').textContent.toLowerCase();
    const brandDescription = card.querySelector('p').textContent.toLowerCase();
    
    if (brandName.includes(term) || brandCategory.includes(term) || brandDescription.includes(term)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Filter brand list
  brandItems.forEach(item => {
    const brandName = item.querySelector('h4').textContent.toLowerCase();
    
    if (brandName.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// Mobile navigation toggle
const mobileToggle = document.getElementById('mobileToggle');
if (mobileToggle) {
  mobileToggle.addEventListener('click', function() {
    const nav = document.getElementById('mainNav');
    if (nav) {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    }
  });
}