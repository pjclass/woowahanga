const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('open', !isOpen);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.site-nav a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%' });
sections.forEach((section) => sectionObserver.observe(section));
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    event.currentTarget.querySelector('.form-status').textContent = '현재는 사이트 준비 중이라 문의가 저장되지 않습니다. 이메일로 연락해주세요.';
  });
}

const productGrids = document.querySelectorAll('[data-product-grid]');
const curatedProducts = document.querySelector('[data-curated-products]');

function createProductCard(product, index, featured = false) {
  const card = document.createElement('article');
  card.className = featured ? 'product-card featured-product-card' : 'product-card';

  const imageLink = document.createElement('a');
  imageLink.className = 'product-image-link';
  imageLink.href = product.url;
  imageLink.target = '_blank';
  imageLink.rel = 'noopener noreferrer';
  imageLink.setAttribute('aria-label', `${product.name} 구매 페이지 열기`);

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.name;
  image.loading = index === 0 ? 'eager' : 'lazy';
  image.decoding = 'async';
  imageLink.append(image);

  const body = document.createElement('div');
  body.className = 'product-card-body';

  const name = document.createElement('h3');
  name.textContent = product.name;

  const tagline = document.createElement('p');
  tagline.className = 'product-tagline';
  tagline.textContent = product.tagline || '';

  const price = document.createElement('p');
  price.className = 'product-price';
  price.textContent = `${Number(product.price).toLocaleString('ko-KR')}원`;

  const buyLink = document.createElement('a');
  buyLink.className = 'buy-button';
  buyLink.href = product.url;
  buyLink.target = '_blank';
  buyLink.rel = 'noopener noreferrer';
  buyLink.textContent = '구매하기';

  body.append(name, tagline, price, buyLink);
  card.append(imageLink, body);
  return card;
}

async function renderProducts() {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('제품 정보를 불러오지 못했습니다.');
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('제품 정보 형식이 올바르지 않습니다.');

    productGrids.forEach((grid) => {
      const limit = Number(grid.dataset.limit) || products.length;
      const visibleProducts = products.slice(0, limit);
      grid.replaceChildren(...visibleProducts.map(createProductCard));
    });

    if (curatedProducts) {
      const keyword = curatedProducts.dataset.featuredKeyword || '';
      const secondaryLimit = Number(curatedProducts.dataset.secondaryLimit) || 5;
      const featuredProduct = products.find((product) => product.name.includes(keyword)) || products[0];
      const secondaryProducts = products.filter((product) => product !== featuredProduct).slice(0, secondaryLimit);
      const featuredCard = createProductCard(featuredProduct, 0, true);
      const secondaryGrid = document.createElement('div');
      secondaryGrid.className = 'product-card-grid curated-secondary-grid';
      secondaryGrid.append(...secondaryProducts.map((product, index) => createProductCard(product, index + 1)));
      curatedProducts.replaceChildren(featuredCard, secondaryGrid);
    }
  } catch (error) {
    productGrids.forEach((grid) => {
      const message = document.createElement('p');
      message.className = 'product-error';
      message.textContent = '제품 정보를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.';
      grid.replaceChildren(message);
    });
    if (curatedProducts) {
      const message = document.createElement('p');
      message.className = 'product-error';
      message.textContent = '제품 정보를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.';
      curatedProducts.replaceChildren(message);
    }
  }
}

if (productGrids.length || curatedProducts) renderProducts();
