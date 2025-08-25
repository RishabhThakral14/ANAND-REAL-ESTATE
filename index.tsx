import { GoogleGenAI, Chat, Type } from "@google/genai";

declare var AOS: any;
declare var marked: any;

// --- AOS (Animate on Scroll) Initialization ---
AOS.init({
    duration: 800,
    once: false,
    offset: 100,
    easing: 'ease-out-cubic',
    anchorPlacement: 'top-bottom',
});

// --- Gemini API Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat;

// --- All Element Selections ---
const preloader = document.getElementById('preloader');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggle?.querySelector('i');
const menuToggle = document.getElementById('menu-toggle');
const closeMenu = document.getElementById('close-menu');
const overlayMenu = document.getElementById('overlay-menu');
const navLinks = document.querySelectorAll<HTMLElement>('.nav-link');
const propertyRegions = document.querySelectorAll<HTMLElement>('.property-region');
const propertiesDisplaySection = document.getElementById('properties-display');
const mapTitle = document.getElementById('map-title');
const officeAddress = document.getElementById('office-address');
const regionMapIframe = document.getElementById('region-map-iframe') as HTMLIFrameElement | null;
const themePopup = document.getElementById('theme-confirmation-popup');
const themePopupText = document.getElementById('theme-confirmation-text');
const header = document.querySelector<HTMLElement>('.main-header');
const heroTitle = document.querySelector<HTMLElement>('.hero-title');
const headerLogoName = document.querySelector<HTMLElement>('.main-header .logo-name');
const backToTopButton = document.getElementById('back-to-top');

// --- AI Feature Elements ---
const aiAnalysisButtons = document.querySelectorAll<HTMLButtonElement>('.ai-analysis-button');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input') as HTMLInputElement | null;
const regionArticlesContainer = document.getElementById('region-articles-container');

// --- Dholera Promotion Elements ---
const dholeraPopupOverlay = document.getElementById('dholera-popup-overlay');
const closePopupButton = document.getElementById('close-popup');
const popupLearnMoreButton = document.getElementById('popup-learn-more');
const countdownTimer = document.getElementById('sale-countdown-timer');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

// --- Map Data Object ---
const mapData = {
    home: {
        title: "Visit Our Office in Hisar",
        address: "SCO 14, Model Town, Near Dev Petrol Pump, Jindal Chowk, Hisar-125001",
        mapSrc: "https://maps.google.com/maps?q=29.134121171431214,75.74738478406043&hl=en&z=17&output=embed"
    },
    hisar: {
        title: "Hisar: The Emerging Aerotropolis",
        address: "A view of Hisar city and its key development zones.",
        mapSrc: "https://maps.google.com/maps?q=Hisar,+Haryana&hl=en&z=12&output=embed"
    },
    gurugram: {
        title: "Gurugram: Millennium City Investment Corridors",
        address: "A view of Gurugram, covering key areas like Golf Course Road and Dwarka Expressway.",
        mapSrc: "https://maps.google.com/maps?q=Gurugram,+Haryana&hl=en&z=12&output=embed"
    },
    bahadurgarh: {
        title: "Bahadurgarh: The Industrial & Logistical Gateway",
        address: "A view of Bahadurgarh, highlighting its strategic location near Delhi.",
        mapSrc: "https://maps.google.com/maps?q=Bahadurgarh,+Haryana&hl=en&z=13&output=embed"
    },
    faridabad: {
        title: "Faridabad: The Resurgent Urban Hub",
        address: "A view of Faridabad, including the developing area of Greater Faridabad (Neharpar).",
        mapSrc: "https://maps.google.com/maps?q=Faridabad,+Haryana&hl=en&z=12&output=embed"
    },
    kharkhoda: {
        title: "Kharkhoda: India's Next Automotive Hub",
        address: "A view of the Kharkhoda-Sonipat region, the site of major industrial development.",
        mapSrc: "https://maps.google.com/maps?q=Kharkhoda,+Sonipat,+Haryana&hl=en&z=13&output=embed"
    },
    dholera: {
        title: "Gujarat: Dholera SIR Smart City",
        address: "A wide view of the Dholera Special Investment Region.",
        mapSrc: "https://maps.google.com/maps?q=Dholera+Special+Investment+Region,+Gujarat&hl=en&z=11&output=embed"
    },
    gandhinagar: {
        title: "Gujarat: Gandhinagar, The Green Capital",
        address: "A view of the well-planned city of Gandhinagar and its surroundings.",
        mapSrc: "https://maps.google.com/maps?q=Gandhinagar,+Gujarat&hl=en&z=12&output=embed"
    }
};

// --- Sticky Header Adjustment ---
const adjustHeaderPosition = () => {
    if (header && countdownTimer) {
        const timerHeight = countdownTimer.offsetHeight;
        // The header's position is sticky, adjust its top offset
        header.style.top = `${timerHeight}px`;
    }
};

// --- Theme Switching Logic ---
const applyTheme = (theme: string) => {
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(`${theme}-mode`);
    if (themeIcon) {
        themeIcon.classList.toggle('fa-sun', theme === 'dark');
        themeIcon.classList.toggle('fa-moon', theme === 'light');
    }
    localStorage.setItem('theme', theme);
};

themeToggle?.addEventListener('click', () => {
    const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(newTheme);
    if(themePopupText) themePopupText.textContent = newTheme === 'dark' ? 'Dark Mode Activated' : 'Light Mode Activated';
    themePopup?.classList.add('show');
    setTimeout(() => {
        themePopup?.classList.remove('show');
    }, 1500);
});

// --- Menu & Content Logic ---
const toggleMenu = () => {
    overlayMenu?.classList.toggle('active');
    body.classList.toggle('menu-open');
};

const showRegion = (regionId: string) => {
    propertyRegions.forEach(region => {
        if (region.classList.contains('region-active')) {
            region.classList.remove('region-active');
            region.classList.add('region-fading-out');
            setTimeout(() => {
                region.style.display = 'none';
                region.classList.remove('region-fading-out');
            }, 400); // Match CSS transition duration
        }
    });

    const newActiveRegion = document.getElementById(`${regionId}-content`);
    if (newActiveRegion) {
        setTimeout(() => {
            newActiveRegion.style.display = 'block';
            void newActiveRegion.offsetWidth;
            newActiveRegion.classList.add('region-active');
            AOS.refresh();
        }, 400);
    }
};

const updateMap = (regionId: string) => {
    const data = mapData[regionId as keyof typeof mapData] || mapData.home;
    if(mapTitle) mapTitle.textContent = data.title;
    if(officeAddress) officeAddress.textContent = data.address;
    if(regionMapIframe) regionMapIframe.src = data.mapSrc;
};

// --- Lightbox Logic ---
const lightbox = document.getElementById('lightbox');
const lightboxContent = lightbox?.querySelector('.lightbox-content');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const lightboxPrev = lightbox?.querySelector('.lightbox-prev');
const lightboxNext = lightbox?.querySelector('.lightbox-next');
const galleryItems = document.querySelectorAll<HTMLElement>('.gallery-item');
let currentIndex = 0;

function showLightbox() {
    lightbox?.setAttribute('aria-hidden', 'false');
    lightbox?.classList.add('active');
    body.classList.add('menu-open');
}

function hideLightbox() {
    lightbox?.setAttribute('aria-hidden', 'true');
    lightbox?.classList.remove('active');
    if (lightboxContent) lightboxContent.innerHTML = '';
    body.classList.remove('menu-open');
}

function renderLightboxContent(index: number) {
    const item = galleryItems[index];
    const type = item.dataset.type;
    const src = item.dataset.src;

    if (lightboxContent) {
        if (type === 'image' && src) {
            lightboxContent.innerHTML = `<img src="${src}" alt="">`;
        } else if (type === 'video' && src) {
            lightboxContent.innerHTML = `<video src="${src}" controls autoplay loop playsinline></video>`;
        }
    }
    currentIndex = index;
}

function showNext() {
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    renderLightboxContent(nextIndex);
}

function showPrev() {
    const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    renderLightboxContent(prevIndex);
}

// --- Home Page Articles Logic ---
const generateAndDisplayRegionArticles = async () => {
    if (!regionArticlesContainer) return;

    const regionsForArticles: { id: string; name: string; isHot?: boolean }[] = [
        { id: 'dholera', name: 'Dholera SIR: India\'s First Smart City', isHot: true },
        { id: 'hisar', name: 'Hisar: The Nation\'s Emerging Aerotropolis' },
        { id: 'gurugram', name: 'Gurugram: The Millennium City' },
        { id: 'bahadurgarh', name: 'Bahadurgarh: The Industrial Gateway' },
        { id: 'faridabad', name: 'Faridabad: The Resurgent Urban Hub' },
        { id: 'kharkhoda', name: 'Kharkhoda: The Automotive Future' },
        { id: 'gandhinagar', name: 'Gandhinagar: The Green Capital' },
    ];

    regionArticlesContainer.innerHTML = '<div class="loader"></div>';

    let articles: { id: string; articleText: string }[] = [];

    try {
        const regionDescriptions = regionsForArticles.map(r => `- ${r.id}: ${r.name}`).join('\n');
        const prompt = `Generate a short, engaging introductory article (100-120 words) for a real estate website about the investment potential for each region below. The tone must be professional and optimistic. Do not use markdown.

Regions:
${regionDescriptions}

Return a valid JSON array where each object represents a region and has "id" and "articleText" properties.`;
        
        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    articleText: { type: Type.STRING }
                },
                required: ["id", "articleText"]
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        articles = JSON.parse(response.text);

    } catch (error) {
        console.error(`Failed to generate articles in a batch:`, error);
        // Fallback to generating default text for all regions if the batch call fails
        articles = regionsForArticles.map(region => {
            const fallbackName = region.name.split(':')[0];
            return {
                id: region.id,
                articleText: `Discover unparalleled growth and strategic investment opportunities in ${fallbackName}. A hub of future development, this region promises significant returns and a prosperous future. Explore the potential that awaits.`
            };
        });
    }
    
    regionArticlesContainer.innerHTML = '';

    const articleMap = new Map(articles.map(a => [a.id, a.articleText]));

    regionsForArticles.forEach((region) => {
        const articleText = articleMap.get(region.id) || `Learn more about the opportunities in ${region.name.split(':')[0]}.`;
        
        const articleCard = document.createElement('div');
        articleCard.className = 'region-article-card';
        articleCard.setAttribute('data-aos', 'ios-fade-up');
        
        const bannerHTML = region.isHot ? '<div class="hot-topic-banner">🔥 Hot Topic</div>' : '';
        const regionNameForButton = region.id === 'dholera' ? 'Dholera' : region.id.charAt(0).toUpperCase() + region.id.slice(1);

        articleCard.innerHTML = `
            ${bannerHTML}
            <h3>${region.name}</h3>
            <p>${articleText}</p>
            <a href="#" class="explore-region-button" data-region="${region.id}">Explore ${regionNameForButton} <i class="fas fa-arrow-right"></i></a>
        `;
        
        regionArticlesContainer.appendChild(articleCard);

        const button = articleCard.querySelector<HTMLAnchorElement>('.explore-region-button');
        button?.addEventListener('click', (e) => {
            e.preventDefault();
            const regionId = button.getAttribute('data-region');
            if (regionId) {
                showRegion(regionId);
                updateMap(regionId);
                setTimeout(() => {
                    propertiesDisplaySection?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    });
    AOS.refresh();
};

// --- Dholera Promotion Logic ---
const deadline = new Date("August 31, 2025 23:59:59").getTime();

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance < 0) {
        if (countdownTimer) {
            countdownTimer.style.display = 'none'; // Hide the timer
            adjustHeaderPosition(); // Recalculate header position to fix layout
        }
        clearInterval(countdownInterval);
        return;
    }
    
    if (daysEl && hoursEl && minutesEl && secondsEl) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
        daysEl.innerText = String(days).padStart(2, '0');
        hoursEl.innerText = String(hours).padStart(2, '0');
        minutesEl.innerText = String(minutes).padStart(2, '0');
        secondsEl.innerText = String(seconds).padStart(2, '0');
    }
    
    countdownTimer?.classList.add('show');
};
const countdownInterval = setInterval(updateCountdown, 1000);

const showDholeraPopup = () => {
    if (sessionStorage.getItem('dholeraPopupShown')) {
        return;
    }
    setTimeout(() => {
        dholeraPopupOverlay?.classList.add('show');
        body.classList.add('menu-open');
        sessionStorage.setItem('dholeraPopupShown', 'true');
    }, 2000);
};

const hideDholeraPopup = () => {
    dholeraPopupOverlay?.classList.remove('show');
    // only remove menu-open if overlay menu is not active
    if (!overlayMenu?.classList.contains('active')) {
      body.classList.remove('menu-open');
    }
};

// --- AI Region Analysis Logic ---
aiAnalysisButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const region = button.dataset.region;
        if (!region) return;

        const contentContainer = document.getElementById(`${region}-content`);
        if (!contentContainer) return;

        const article = contentContainer.querySelector<HTMLElement>('.article');
        const resultContainer = contentContainer.querySelector<HTMLElement>('.ai-analysis-result');
        const regionNameElement = contentContainer.querySelector('h2');

        if (!article || !resultContainer || !regionNameElement) return;

        button.disabled = true;
        resultContainer.innerHTML = '<div class="loader"></div>';

        const regionText = article.innerText;
        const regionName = regionNameElement.innerText;

        const prompt = `Based on the following information about ${regionName}, provide a concise investment analysis and future outlook. Highlight the key advantages in bullet points. Information: "${regionText}"`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            const formattedResponse = marked.parse(response.text);
            resultContainer.innerHTML = `${formattedResponse}<small>Powered by Gemini</small>`;
        } catch (error) {
            console.error("AI Analysis Error:", error);
            resultContainer.innerHTML = `<p>Sorry, the AI analysis could not be generated at this time.</p>`;
        } finally {
            button.disabled = false;
        }
    });
});

// --- AI Chatbot Logic ---
async function initializeChat() {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are a professional and helpful real estate investment advisor for Anand Real Estate. Your goal is to assist users by providing insightful information about properties in Haryana and Gujarat based on the context provided on the website. Be encouraging and informative.",
        },
    });
}

function appendMessage(sender: string, messageHtml: string) {
    if (!chatbotMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `message-${sender}`);
    const p = document.createElement('p');
    p.innerHTML = messageHtml;
    messageDiv.appendChild(p);
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

chatbotToggle?.addEventListener('click', () => {
    chatbotWindow?.classList.toggle('open');
    chatbotToggle?.classList.toggle('open');
    if (chatbotWindow) {
        chatbotWindow.setAttribute('aria-hidden', String(!chatbotWindow.classList.contains('open')));
    }
});

chatbotForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!chatbotInput) return;

    const userInput = chatbotInput.value.trim();
    if (!userInput) return;

    appendMessage('user', userInput);
    chatbotInput.value = '';
    
    appendMessage('ai', '<span></span><span></span><span></span>');
    const loadingMessage = chatbotMessages?.lastElementChild;

    try {
        if(!chat) await initializeChat();
        const response = await chat.sendMessage({ message: userInput });
        const formattedResponse = marked.parse(response.text);
        const p = loadingMessage?.querySelector('p');
        if (p) p.innerHTML = formattedResponse;
    } catch (error) {
        console.error("Chatbot Error:", error);
        const p = loadingMessage?.querySelector('p');
        if (p) p.innerHTML = 'Sorry, I encountered an error. Please try again.';
    }
});


// --- Event Listeners ---
menuToggle?.addEventListener('click', toggleMenu);
closeMenu?.addEventListener('click', () => {
    showRegion('home');
    updateMap('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toggleMenu();
});
overlayMenu?.addEventListener('click', (event) => {
    if (event.target === overlayMenu) { toggleMenu(); }
});
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const region = link.getAttribute('data-region');
        if (region) {
            showRegion(region);
            updateMap(region);
        }
        toggleMenu();
        setTimeout(() => {
            propertiesDisplaySection?.scrollIntoView({ behavior: 'smooth' });
        }, 550);
    });
});

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        renderLightboxContent(index);
        showLightbox();
    });
});
lightboxClose?.addEventListener('click', hideLightbox);
lightboxNext?.addEventListener('click', showNext);
lightboxPrev?.addEventListener('click', showPrev);
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox(); });
document.addEventListener('keydown', (e) => {
    if (lightbox?.classList.contains('active')) {
        if (e.key === 'Escape') hideLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    }
});

// Dholera Promotion Event Listeners
countdownTimer?.addEventListener('click', () => {
    if (dholeraPopupOverlay) {
        dholeraPopupOverlay.classList.add('show');
        body.classList.add('menu-open');
    }
});
closePopupButton?.addEventListener('click', hideDholeraPopup);
popupLearnMoreButton?.addEventListener('click', (e) => {
    e.preventDefault();
    hideDholeraPopup();
    showRegion('dholera');
    updateMap('dholera');
    setTimeout(() => {
        propertiesDisplaySection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
});
dholeraPopupOverlay?.addEventListener('click', (e) => {
    if (e.target === dholeraPopupOverlay) {
        hideDholeraPopup();
    }
});


window.addEventListener('scroll', () => {
    if (header && heroTitle && headerLogoName) {
        const heroTitleBottom = heroTitle.getBoundingClientRect().bottom;
        const headerHeight = header.offsetHeight;
        headerLogoName.classList.toggle('logo-name--royal', heroTitleBottom < headerHeight);
    }
    
    if (header && backToTopButton) {
        const show = window.scrollY > 50;
        header.classList.toggle('header-scrolled', show);
        backToTopButton.classList.toggle('show', show);
    }
});

backToTopButton?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Initial Page Load Setup ---
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const hour = new Date().getHours();
        const autoTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
        applyTheme(autoTheme);
    }
    const homeRegion = document.getElementById('home-content');
    if (homeRegion) {
        homeRegion.style.display = 'block';
        homeRegion.classList.add('region-active');
    }
    updateMap('home');
    initializeChat().catch(console.error);
    generateAndDisplayRegionArticles().catch(console.error);
    showDholeraPopup();
    updateCountdown(); // Initial call to avoid 1s delay
    adjustHeaderPosition();
});

window.addEventListener('resize', adjustHeaderPosition);

window.addEventListener('load', () => {
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});