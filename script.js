// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Smooth Scrolling for Navigation Links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Active Navigation Link Highlighting
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call
});

// Reveal on Scroll Animation
document.addEventListener('DOMContentLoaded', function() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
});

// Header Background on Scroll
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    
    function updateHeaderBackground() {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    }
    
    window.addEventListener('scroll', updateHeaderBackground);
    updateHeaderBackground(); // Initial call
});

// Form Submission Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formInputs = this.querySelectorAll('.form-input');
            const submitButton = document.getElementById('submitBtn');
            
            // Disable form during submission
            formInputs.forEach(input => input.disabled = true);
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            // Prepare data for Google Apps Script
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            try {
                // Try using form data instead of JSON for Google Apps Script
                const formDataToSend = new FormData();
                formDataToSend.append('name', data.name);
                formDataToSend.append('email', data.email);
                formDataToSend.append('message', data.message);
                
                const response = await fetch('https://script.google.com/macros/s/AKfycbxXkQ2A4-NTmFCcE9-2DH18IGpG6Pj45XSdr6swzZmhMWDKmPj4aETo1smPTQ-JzaOk/exec', {
                    method: 'POST',
                    body: formDataToSend
                });
                
                const result = await response.text();
                console.log('Response:', result);
                
                if (response.ok && !result.includes('Script function not found')) {
                    // Show success message
                    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                    
                    // Reset form
                    this.reset();
                } else {
                    // Show error message with more details
                    console.error('Server response:', result);
                    showNotification('Your Google Apps Script needs a doPost function. Please check the console for details.', 'error');
                }
                
            } catch (error) {
                console.error('Error sending form data:', error);
                showNotification('Network error. Please check your internet connection and try again.', 'error');
            }
            
            // Re-enable form
            formInputs.forEach(input => input.disabled = false);
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        });
    }
});

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
        line-height: 1;
    `;
    
    closeButton.addEventListener('click', () => {
        notification.remove();
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add notification animation styles
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .notification-message {
            flex: 1;
        }
    `;
    document.head.appendChild(style);
});



// Performance Optimization - Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
document.addEventListener('DOMContentLoaded', function() {
    const scrollEvents = ['updateActiveLink', 'updateHeaderBackground', 'toggleScrollToTop'];
    
    // Re-bind scroll events with throttling
    window.removeEventListener('scroll', updateActiveLink);
    window.removeEventListener('scroll', updateHeaderBackground);
    window.removeEventListener('scroll', toggleScrollToTop);
    
    // Note: These functions are defined above, throttling them for better performance
    window.addEventListener('scroll', throttle(function() {
        // Update active navigation link
        const scrollPosition = window.scrollY + 100;
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Header background is now handled by theme toggle functionality
        

    }, 16)); // ~60fps
});

// Chatbot Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function() {
            // Check if chatbase is available
            if (window.chatbase) {
                window.chatbase('open');
            } else {
                console.log('Chatbase not loaded yet');
            }
        });
    }
});
