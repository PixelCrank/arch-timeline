/**
 * Marche Bleue - Multilingual Translation System
 * Supports French, English, Arabic (RTL), and Spanish
 */

const TranslationSystem = {
  currentLang: 'fr',
  translations: {},
  
  // Available languages with display info
  languages: {
    fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
    ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' }
  },

  /**
   * Initialize translation system
   */
  async init() {
    // Get language from URL, localStorage, or default to French
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const savedLang = localStorage.getItem('marcheBleue_language');
    
    this.currentLang = urlLang || savedLang || 'fr';
    
    // Validate language
    if (!this.languages[this.currentLang]) {
      this.currentLang = 'fr';
    }
    
    // Load all translation files
    await this.loadTranslations();
    
    // Apply translations
    this.applyTranslations();
    
    // Setup language switcher
    this.setupLanguageSwitcher();
    
    // Apply direction (RTL/LTR)
    this.applyDirection();
  },

  /**
   * Load translation JSON files
   */
  async loadTranslations() {
    const promises = Object.keys(this.languages).map(async (lang) => {
      try {
        const response = await fetch(`js/lang/${lang}.json`);
        this.translations[lang] = await response.json();
      } catch (error) {
        console.error(`Failed to load ${lang} translations:`, error);
      }
    });
    
    await Promise.all(promises);
  },

  /**
   * Get translation by key
   */
  t(key, lang = null) {
    const targetLang = lang || this.currentLang;
    const keys = key.split('.');
    let value = this.translations[targetLang];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${targetLang}`);
        return key;
      }
    }
    
    return value;
  },

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  applyTranslations() {
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLang;
    
    // Update page title
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
      document.title = this.t(titleKey);
    } else {
      document.title = this.t('meta.title');
    }
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', this.t('meta.description'));
    }
    
    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // Handle different element types
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.placeholder !== undefined) {
          element.placeholder = translation;
        }
      } else {
        // Check if we need to preserve HTML structure
        if (element.getAttribute('data-i18n-html') === 'true') {
          element.innerHTML = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // Translate aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      element.setAttribute('aria-label', this.t(key));
    });
    
    // Translate alt attributes
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      element.setAttribute('alt', this.t(key));
    });
    
    // Re-initialize feather icons if present
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  },

  /**
   * Apply text direction (RTL for Arabic)
   */
  applyDirection() {
    const dir = this.languages[this.currentLang].dir;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    
    // Add/remove RTL class for styling
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  },

  /**
   * Change language
   */
  async changeLanguage(lang) {
    if (!this.languages[lang]) {
      console.error(`Language ${lang} not supported`);
      return;
    }
    
    this.currentLang = lang;
    
    // Save preference
    localStorage.setItem('marcheBleue_language', lang);
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
    
    // Apply translations and direction
    this.applyTranslations();
    this.applyDirection();
    
    // Update active state in switcher
    document.querySelectorAll('.lang-option').forEach(option => {
      if (option.getAttribute('data-lang') === lang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
    
    // Update map if it exists
    if (typeof updateMapLanguage === 'function') {
      updateMapLanguage(lang);
    }
  },

  /**
   * Setup language switcher UI
   */
  setupLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    if (!switcher) return;
    
    // Create switcher HTML
    const currentLangData = this.languages[this.currentLang];
    
    let html = `
      <button class="lang-button" aria-label="Change language">
        <span class="lang-flag">${currentLangData.flag}</span>
        <span class="lang-name">${currentLangData.name}</span>
        <i data-feather="chevron-down" style="width: 16px; height: 16px;"></i>
      </button>
      <div class="lang-dropdown">
    `;
    
    Object.entries(this.languages).forEach(([code, data]) => {
      const activeClass = code === this.currentLang ? 'active' : '';
      html += `
        <button class="lang-option ${activeClass}" data-lang="${code}">
          <span class="lang-flag">${data.flag}</span>
          <span class="lang-name">${data.name}</span>
        </button>
      `;
    });
    
    html += '</div>';
    switcher.innerHTML = html;
    
    // Add event listeners
    const langButton = switcher.querySelector('.lang-button');
    const langDropdown = switcher.querySelector('.lang-dropdown');
    
    langButton.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('open');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('open');
      }
    });
    
    // Language option clicks
    switcher.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        this.changeLanguage(lang);
        switcher.classList.remove('open');
      });
    });
    
    // Re-initialize feather icons
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => TranslationSystem.init());
} else {
  TranslationSystem.init();
}

// Export for use in other scripts
window.TranslationSystem = TranslationSystem;
