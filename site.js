// Bordoglass - Professional Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initProductFiltering();
    initContactForm();
    initScrollEffects();
    initAnimations();
});

// Navigation Functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Animate hamburger bars
            const bars = hamburger.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (hamburger.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
                } else {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
            });
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                
                // Reset hamburger bars
                const bars = hamburger.querySelectorAll('.bar');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            }
        });
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80; // Account for fixed header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    updateActiveNavigation();
    window.addEventListener('scroll', updateActiveNavigation);
}

function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;
        
        if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Product Filtering Functionality
function initProductFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productCategories = document.querySelectorAll('.product-category');

    if (categoryButtons.length === 0) return; // Not on products page

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide categories with animation
            productCategories.forEach(category => {
                const categoryType = category.getAttribute('data-category');
                
                if (targetCategory === 'all' || targetCategory === categoryType) {
                    category.style.display = 'block';
                    // Animate in
                    setTimeout(() => {
                        category.style.opacity = '1';
                        category.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    // Animate out
                    category.style.opacity = '0';
                    category.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        category.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Initialize with all products visible
    const allButton = document.querySelector('.category-btn[data-category="all"]');
    if (allButton && !allButton.classList.contains('active')) {
        allButton.click();
    }
}

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) return; // Not on contact page

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formFields = this.querySelectorAll('input, textarea');
        const submitButton = this.querySelector('button[type="submit"]');
        
        // Validate form
        let isValid = true;
        formFields.forEach(field => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#dc3545';
                setTimeout(() => {
                    field.style.borderColor = '';
                }, 3000);
            }
        });

        if (!isValid) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Simulate form submission
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            // Reset form
            this.reset();
            submitButton.textContent = 'Send Message';
            submitButton.disabled = false;
            
            showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        }, 2000);
    });

    // Real-time validation
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.hasAttribute('required') && this.value.trim()) {
                this.style.borderColor = '#28a745';
            } else if (this.hasAttribute('required')) {
                this.style.borderColor = '';
            }
        });

        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#dc3545';
            }
        });
    });
}

// Scroll Effects
function initScrollEffects() {
    // Header background on scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = 'var(--accent-color)';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    const heroGlassPanel = document.querySelector('.hero-glass-panel');
    
    if (hero && heroGlassPanel) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            
            if (scrolled < hero.offsetHeight) {
                heroGlassPanel.style.transform = `perspective(500px) rotateY(15deg) translateY(${scrolled * parallaxSpeed}px)`;
            }
        });
    }
}

// Animation Effects
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger animation for grid items
                if (entry.target.classList.contains('features-grid') || 
                    entry.target.classList.contains('products-grid') ||
                    entry.target.classList.contains('values-grid')) {
                    
                    const items = entry.target.children;
                    Array.from(items).forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .value-card, .spec-card, .cert-item, .features-grid, .products-grid, .values-grid');
    animatedElements.forEach(el => {
        // Set initial state
        if (!el.classList.contains('features-grid') && 
            !el.classList.contains('products-grid') && 
            !el.classList.contains('values-grid')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        observer.observe(el);
    });

    // Counter animation for statistics
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        counterObserver.observe(stat);
    });
}

// Counter animation function
function animateCounter(element) {
    const target = element.textContent;
    const numericValue = parseInt(target.replace(/\D/g, ''));
    const suffix = target.replace(/[\d]/g, '');
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, duration / steps);
}

// Utility Functions

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-hover);
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
        ${type === 'error' ? 'background-color: #f8d7da; color: #721c24; border: 1px solid #f1b0b7;' : ''}
        ${type === 'info' ? 'background-color: #d1ecf1; color: #0c5460; border: 1px solid #b8daff;' : ''}
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);

    // Manual close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });

    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 1rem;
        opacity: 0.7;
    `;
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced scroll performance
let ticking = false;

function updateScrollElements() {
    // Update any scroll-dependent elements here
    ticking = false;
}

function requestScrollUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateScrollElements);
        ticking = true;
    }
}

// Color swatch interactions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('color-swatch')) {
        const colorName = e.target.getAttribute('title');
        if (colorName) {
            showNotification(`Selected color: ${colorName}`, 'info');
        }
    }
});

// Product card interactions
document.addEventListener('click', function(e) {
    const productCard = e.target.closest('.product-card');
    if (productCard && e.target.classList.contains('btn')) {
        const productName = productCard.querySelector('h3').textContent;
        showNotification(`More information about ${productName} coming soon!`, 'info');
    }
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            
            // Reset hamburger bars
            const bars = hamburger.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });
        }
    }
});

// Touch gesture support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
});

function handleSwipeGesture() {
    const swipeThreshold = 100;
    const swipeDistance = touchEndX - touchStartX;
    
    // Only handle swipes on product categories or image galleries
    const isOnProductsPage = document.querySelector('.products-section');
    
    if (Math.abs(swipeDistance) > swipeThreshold && isOnProductsPage) {
        const categoryButtons = document.querySelectorAll('.category-btn');
        const activeButton = document.querySelector('.category-btn.active');
        const activeIndex = Array.from(categoryButtons).indexOf(activeButton);
        
        if (swipeDistance > 0 && activeIndex > 0) {
            // Swipe right - previous category
            categoryButtons[activeIndex - 1].click();
        } else if (swipeDistance < 0 && activeIndex < categoryButtons.length - 1) {
            // Swipe left - next category
            categoryButtons[activeIndex + 1].click();
        }
    }
}

// Load optimization
window.addEventListener('load', function() {
    // Remove loading states
    document.body.classList.add('loaded');
    
    // Initialize lazy loading for images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error reports to analytics service
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}