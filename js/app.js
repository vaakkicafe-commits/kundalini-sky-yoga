// Main Application Controller with Full English & Tamil Bilingual Engine, Scientific Mounam Suite & Asana Video Carousel

let currentSlideIndex = 0;
let slideInterval = null;
let showAnimationMode = true; // Toggle between Motion Demo and Still Photo

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Renders
  renderAsanaCarousel();
  startSlideTimer();
  renderScientificTabs();
  renderScientificCard();
  renderCourses('all');
  renderPublications();
  renderDonations();
  updatePromptDisplay();
  updateQuoteDisplay();

  // 2. Setup Category Filter Tabs
  const filterBtns = document.querySelectorAll('.tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      renderCourses(category);
    });
  });

  // 3. Introspection Prompts Handler
  let currentPromptIndex = 0;
  window.nextJournalPrompt = function() {
    const prompts = window.SKY_DATA.introspectionPrompts;
    currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
    updatePromptDisplay();
  };

  window.updatePromptDisplay = function() {
    const lang = window.currentLang || 'en';
    const prompts = window.SKY_DATA.introspectionPrompts;
    const promptObj = prompts[currentPromptIndex] || prompts[0];

    const titleEl = document.getElementById('journalTitle');
    const questEl = document.getElementById('journalQuestion');
    const mantraEl = document.getElementById('journalMantra');

    const titleStr = typeof promptObj.title === 'object' ? promptObj.title[lang] || promptObj.title.en : promptObj.title;
    const questStr = typeof promptObj.question === 'object' ? promptObj.question[lang] || promptObj.question.en : promptObj.question;
    const mantraStr = typeof promptObj.mantra === 'object' ? promptObj.mantra[lang] || promptObj.mantra.en : promptObj.mantra;

    if (titleEl) titleEl.textContent = titleStr;
    if (questEl) questEl.textContent = `"${questStr}"`;
    if (mantraEl) mantraEl.textContent = `${lang === 'ta' ? 'மகரிஷியின் உரை:' : 'Vethathiri Wisdom:'} ${mantraStr}`;
  };

  // 4. Daily SKY Quote Switcher
  let currentQuoteIndex = 0;
  window.nextDailyQuote = function() {
    const quotes = window.SKY_DATA.quotes;
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    updateQuoteDisplay();
  };

  window.updateQuoteDisplay = function() {
    const quotes = window.SKY_DATA.quotes;
    const q = quotes[currentQuoteIndex] || quotes[0];

    const enEl = document.getElementById('quoteEn');
    const taEl = document.getElementById('quoteTa');

    if (enEl) enEl.textContent = `"${q.en}"`;
    if (taEl) taEl.textContent = `"${q.ta}"`;
  };

  // 5. Hero Canvas Particle Animation
  initHeroCanvas();

  // 6. Modal System Setup
  setupModalSystem();
});

// Asanas & Ashram Video Carousel Controller
window.renderAsanaCarousel = function() {
  const track = document.getElementById("asanas-carousel-track");
  const dotsContainer = document.getElementById("carousel-dots-container");
  if (!track || !dotsContainer || !window.SKY_DATA || !window.SKY_DATA.asanasCarouselData) return;

  const lang = window.currentLang || 'en';
  const dataList = window.SKY_DATA.asanasCarouselData;

  track.innerHTML = dataList.map((item, idx) => {
    const hasAnimation = item.animation && showAnimationMode;

    const mediaMarkup = hasAnimation && item.mediaType === "video"
      ? `
        <video 
          class="slide-media-element asana-video" 
          autoplay 
          muted 
          loop 
          playsinline 
          poster="${item.img}">
          <source src="${item.animation}" type="video/mp4">
          <img src="${item.img}" alt="${item.title.en}">
        </video>
      `
      : `
        <img 
          class="slide-media-element asana-image" 
          src="${hasAnimation && item.mediaType === "gif" ? item.animation : item.img}" 
          alt="${item.title.en}" 
          onerror="this.src='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'" />
      `;

    const motionBadgeStr = window.translations[lang] && window.translations[lang].motion_demo ? window.translations[lang].motion_demo : 'Motion Demo';

    return `
      <div class="carousel-slide ${idx === currentSlideIndex ? 'active-slide' : ''}">
        <div class="slide-card">
          <div class="slide-media-container">
            ${mediaMarkup}
            <span class="slide-step-badge">${item.stage[lang] || item.stage.en}</span>
            ${item.animation ? `
              <span class="motion-indicator-badge">
                <span class="pulse-dot"></span> ${motionBadgeStr}
              </span>
            ` : ''}
          </div>
          <div class="slide-content">
            <span class="slide-pill">${item.tag[lang] || item.tag.en}</span>
            <h3 class="slide-title">${item.title[lang] || item.title.en}</h3>
            <p class="slide-description">${item.desc[lang] || item.desc.en}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");

  dotsContainer.innerHTML = dataList.map((_, idx) => `
    <button class="carousel-dot ${idx === currentSlideIndex ? 'active-dot' : ''}" onclick="goToSlide(${idx})"></button>
  `).join("");

  updateSlidePosition();
};

window.updateSlidePosition = function() {
  const track = document.getElementById("asanas-carousel-track");
  if (track) {
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  }

  // Synchronize dots
  document.querySelectorAll(".carousel-dot").forEach((dot, idx) => {
    dot.classList.toggle("active-dot", idx === currentSlideIndex);
  });

  // Background resource management: Play active video, pause offscreen videos
  document.querySelectorAll(".carousel-slide").forEach((slide, idx) => {
    const video = slide.querySelector("video");
    if (video) {
      if (idx === currentSlideIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  });
};

window.rotateSlide = function(direction) {
  const dataList = window.SKY_DATA.asanasCarouselData;
  if (!dataList) return;
  currentSlideIndex = (currentSlideIndex + direction + dataList.length) % dataList.length;
  updateSlidePosition();
  resetSlideTimer();
};

window.goToSlide = function(index) {
  currentSlideIndex = index;
  updateSlidePosition();
  resetSlideTimer();
};

function startSlideTimer() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    rotateSlide(1);
  }, 5000);
}

function resetSlideTimer() {
  clearInterval(slideInterval);
  startSlideTimer();
}

// Scientific Practice Suite Controller
let activePracticeId = "mounam";

window.renderScientificTabs = function() {
  const tabsContainer = document.getElementById("science-practice-tabs");
  if (!tabsContainer || !window.SKY_DATA || !window.SKY_DATA.scientificPracticesData) return;

  const lang = window.currentLang || 'en';
  const dataList = window.SKY_DATA.scientificPracticesData;

  tabsContainer.innerHTML = dataList.map(practice => `
    <button 
      class="science-tab-btn ${practice.id === activePracticeId ? 'active-science-tab' : ''}" 
      onclick="selectScientificPractice('${practice.id}')">
      <span class="tab-badge">${practice.badge[lang] || practice.badge.en}</span>
      <span class="tab-label">${practice.title[lang] || practice.title.en}</span>
    </button>
  `).join("");
};

window.selectScientificPractice = function(id) {
  activePracticeId = id;
  renderScientificTabs();
  renderScientificCard();
};

window.renderScientificCard = function() {
  const displayContainer = document.getElementById("science-display-card");
  if (!displayContainer || !window.SKY_DATA || !window.SKY_DATA.scientificPracticesData) return;

  const lang = window.currentLang || 'en';
  const data = window.SKY_DATA.scientificPracticesData.find(p => p.id === activePracticeId);
  if (!data) return;

  displayContainer.innerHTML = `
    <div class="science-grid">
      <!-- Left Column: Neuroscience Biomarkers & Mechanisms -->
      <div class="science-content-pane">
        <div class="science-meta-header">
          <span class="meta-tag"><i class="fa-solid fa-wave-square" style="color: var(--color-saffron);"></i> ${data.brainwave}</span>
          <h3 class="science-title" style="font-family: var(--font-heading); font-size: 1.6rem; margin: 10px 0 6px;">${data.title[lang] || data.title.en}</h3>
          <p class="science-tagline" style="color: var(--color-ochre); font-weight: 500; margin-bottom: 20px;">${data.tagline[lang] || data.tagline.en}</p>
        </div>

        <div class="biomarker-box">
          <h4>${lang === 'ta' ? 'உடலியல் & நரம்பியல் மாற்றங்கள் (Biomarkers)' : 'Biological & Neural Shifts'}</h4>
          <p>${data.biomarkers[lang] || data.biomarkers.en}</p>
        </div>

        <div class="mechanism-list">
          ${data.scientificMechanisms.map(m => `
            <div class="mechanism-item">
              <h5><span class="glow-bullet">✦</span> ${(m.head[lang] || m.head.en)}</h5>
              <p style="font-size: 0.9rem; color: #4B5563;">${(m.desc[lang] || m.desc.en)}</p>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Right Column: Interactive Practice Structure & Action Callout -->
      <div class="science-action-pane">
        <div class="retreat-preview-box">
          <div>
            <div class="retreat-badge" style="display: inline-block; padding: 4px 12px; background: rgba(212, 175, 55, 0.2); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; color: var(--color-ochre); text-transform: uppercase; margin-bottom: 12px;">
              ${lang === 'ta' ? 'நடைமுறை பயிற்சி முறை' : 'Session Architecture'}
            </div>
            <p class="retreat-desc" style="font-size: 0.95rem; color: var(--color-charcoal); font-weight: 500; margin-bottom: 20px;">${data.scheduleStructure[lang] || data.scheduleStructure.en}</p>

            <div class="brainwave-visualizer-mock" style="background: rgba(26, 14, 4, 0.05); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
              <div class="frequency-indicator" style="font-size: 0.85rem; color: var(--color-muted); display: flex; justify-content: space-between;">
                <span>Target Brainwave Frequency:</span>
                <strong style="color: var(--color-saffron);">${data.brainwave.split('&')[0]}</strong>
              </div>
              <div class="wave-lines-container">
                <span class="wave-line"></span>
                <span class="wave-line"></span>
                <span class="wave-line"></span>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;" onclick="openModal('bookingModal')">
            ${lang === 'ta' ? 'மௌன முகாம் / பயிற்சியில் இணைய' : 'Enroll in Mounam Retreat'}
          </button>
        </div>
      </div>
    </div>
  `;
};

// Render Courses Grid
window.renderCourses = function(category) {
  const container = document.getElementById('coursesGridContainer');
  if (!container || !window.SKY_DATA) return;

  const lang = window.currentLang || 'en';
  const courses = window.SKY_DATA.courses;
  const filtered = (category === 'all' || !category) ? courses : courses.filter(c => c.category === category);

  container.innerHTML = '';
  filtered.forEach(course => {
    const titleStr = typeof course.title === 'object' ? course.title[lang] || course.title.en : course.title;
    const descStr = typeof course.description === 'object' ? course.description[lang] || course.description.en : course.description;
    const durStr = typeof course.duration === 'object' ? course.duration[lang] || course.duration.en : course.duration;
    const lvlStr = typeof course.level === 'object' ? course.level[lang] || course.level.en : course.level;

    const card = document.createElement('div');
    card.className = 'course-card sacred-card';
    card.innerHTML = `
      <div class="course-card-img-wrap">
        <img src="${course.image}" alt="${titleStr}" class="course-card-img" />
        <span class="course-badge">${lvlStr}</span>
      </div>
      <div class="course-content">
        <h3 class="course-title">${titleStr}</h3>
        <p class="course-desc">${descStr}</p>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
          <i class="fa-solid fa-clock text-saffron"></i> ${durStr} &nbsp;•&nbsp; 
          <i class="fa-solid fa-language text-saffron"></i> ${course.languages ? course.languages.join(', ') : 'English, Tamil'}
        </div>
        <div class="course-footer" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="${course.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">
            ${lang === 'ta' ? 'இப்பொழுதே முன்பதிவு செய்ய' : 'BOOK NOW'} <i class="fa-solid fa-up-right-from-square"></i>
          </a>
          <button class="btn btn-outline" style="padding: 8px 12px; font-size: 0.85rem;" onclick="openCourseModal('${course.id}')">
            ${lang === 'ta' ? 'விவரங்கள்' : 'Details'}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
};

// Render Temple of Consciousness Donations Grid
window.renderDonations = function() {
  const container = document.getElementById('donationsGridContainer');
  if (!container || !window.SKY_DATA || !window.SKY_DATA.donations) return;

  const lang = window.currentLang || 'en';
  const donations = window.SKY_DATA.donations;

  container.innerHTML = '';
  donations.forEach(item => {
    const titleStr = item.title[lang] || item.title.en;
    const subStr = item.subtitle[lang] || item.subtitle.en;
    const descStr = item.desc[lang] || item.desc.en;
    const badgeStr = item.badge[lang] || item.badge.en;

    const card = document.createElement('div');
    card.className = 'course-card sacred-card';
    card.style.padding = '28px';
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--gold-primary), var(--siddha-copper)); display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 1.4rem; box-shadow: var(--shadow-glow);">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <div>
          <span class="sacred-pill" style="margin-bottom: 4px;">${badgeStr}</span>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--text-primary); margin: 0;">${titleStr}</h3>
        </div>
      </div>
      <p style="font-family: var(--font-subheading); color: var(--gold-primary); font-weight: 600; font-size: 1.05rem; margin-bottom: 10px;">${subStr}</p>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">${descStr}</p>
      <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700;">
        ${lang === 'ta' ? 'இப்பொழுதே நன்கொடை அளிக்க' : 'DONATE NOW'} <i class="fa-solid fa-heart"></i>
      </a>
    `;
    container.appendChild(card);
  });
};

// Render Publications Grid
window.renderPublications = function() {
  const container = document.getElementById('publicationsContainer');
  if (!container || !window.SKY_DATA) return;

  const lang = window.currentLang || 'en';
  const books = window.SKY_DATA.publications;
  container.innerHTML = '';
  books.forEach(book => {
    const titleStr = typeof book.title === 'object' ? book.title[lang] || book.title.en : book.title;
    const descStr = typeof book.description === 'object' ? book.description[lang] || book.description.en : book.description;

    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-card-img-wrap" style="height: 180px;">
        <img src="${book.image}" alt="${titleStr}" class="course-card-img" />
        <span class="course-badge" style="background: rgba(212, 175, 55, 0.9); color: #1A0E04;">${book.category}</span>
      </div>
      <div class="course-content">
        <h3 class="course-title" style="font-size: 1.1rem;">${titleStr}</h3>
        <p style="font-size: 0.85rem; color: #854D0E; font-weight: 600; margin-bottom: 8px;">By ${book.author}</p>
        <p class="course-desc" style="font-size: 0.85rem;">${descStr}</p>
        <div class="course-footer">
          <span class="course-price">${book.price}</span>
          <button class="btn btn-primary" style="padding: 6px 16px; font-size: 0.85rem;" onclick="orderBook('${titleStr}')">
            ${lang === 'ta' ? 'நூல் வாங்க' : 'Order E-Book / Print'}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
};

// Modal Control System
window.openCourseModal = function(courseId) {
  const lang = window.currentLang || 'en';
  const course = window.SKY_DATA.courses.find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('courseDetailModal');
  const body = document.getElementById('courseModalBody');

  const titleStr = typeof course.title === 'object' ? course.title[lang] || course.title.en : course.title;
  const subStr = typeof course.subtitle === 'object' ? course.subtitle[lang] || course.subtitle.en : course.subtitle;
  const descStr = typeof course.description === 'object' ? course.description[lang] || course.description.en : course.description;
  const durStr = typeof course.duration === 'object' ? course.duration[lang] || course.duration.en : course.duration;
  const lvlStr = typeof course.level === 'object' ? course.level[lang] || course.level.en : course.level;

  const modulesList = course.modules[lang] || course.modules.en || course.modules;

  if (modal && body) {
    body.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="course-badge" style="position: static;">${lvlStr}</span>
        <h2 style="font-size: 1.8rem; margin-top: 10px;">${titleStr}</h2>
        <p style="color: #B85B14; font-family: var(--font-subheading); font-size: 1.2rem;">${subStr}</p>
      </div>

      <p style="margin-bottom: 24px; color: #4B5563;">${descStr}</p>

      <h4 style="margin-bottom: 12px; font-family: var(--font-heading);">${lang === 'ta' ? 'பாடத்திட்டம் & முக்கியப் பயிற்சிகள்' : 'Syllabus & Core Modules'}</h4>
      <ul style="margin-bottom: 24px; padding-left: 20px; color: #374151;">
        ${modulesList.map(m => `<li style="margin-bottom: 8px;">${m}</li>`).join('')}
      </ul>

      <div style="background: rgba(212, 175, 55, 0.1); padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.8rem; text-transform: uppercase; color: #6B7280;">${lang === 'ta' ? 'கால அளவு' : 'Duration'}</div>
          <div style="font-weight: 600;">${durStr} (${course.languages.join(', ')})</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; text-transform: uppercase; color: #6B7280;">${lang === 'ta' ? 'கட்டணம்' : 'Course Fee'}</div>
          <div style="font-weight: 700; font-size: 1.3rem; color: #D97706;">${course.price}</div>
        </div>
      </div>

      <button class="btn btn-gold" style="width: 100%; justify-content: center; padding: 14px;" onclick="simulateEnrollment('${titleStr}')">
        ${lang === 'ta' ? 'பயிற்சியில் சேர' : 'Enroll Now & Start Practice'}
      </button>
    `;
    modal.classList.add('active');
  }
};

window.simulateEnrollment = function(title) {
  alert(`Vazhga Vaiyagam! Thank you for enrolling in "${title}". Redirecting to student portal.`);
  closeModals();
};

window.orderBook = function(bookTitle) {
  alert(`"${bookTitle}" added to your order cart!`);
};

function setupModalSystem() {
  const overlay = document.querySelectorAll('.modal-overlay');
  overlay.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        modal.classList.remove('active');
      }
    });
  });
}

window.closeModals = function() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
};

window.openModal = function(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
};

window.handleBookingSubmit = function(e) {
  e.preventDefault();
  alert('Booking request received! Our center team will contact you shortly on WhatsApp/Phone.');
  closeModals();
};

function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.clientWidth;
  let height = canvas.height = canvas.clientHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
  });

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speedY: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      gold: Math.random() > 0.4
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.y -= p.speedY;
      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.gold ? `rgba(212, 175, 55, ${p.opacity})` : `rgba(217, 119, 6, ${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  animate();
}
