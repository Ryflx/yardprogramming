// DOM elements
const filterTabs = document.querySelectorAll('.tab-btn');
const workoutGrid = document.getElementById('workoutGrid');

// Filter functionality
filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        filterTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        const filter = tab.getAttribute('data-filter');
        renderFromData(currentData, filter);
    });
});

let currentData = { crossfit: [], engine: [] };

function createWorkoutCard(item, category) {
    const card = document.createElement('div');
    card.className = `workout-card ${category}`;
    card.setAttribute('data-category', category);
    
    let contentHtml = '';
    
    if (category === 'crossfit') {
        // CrossFit workout structure
        if (item.warmup) {
            contentHtml += '<div class="workout-title">WARM UP</div>';
            contentHtml += '<div class="workout-details">';
            item.warmup.forEach(line => {
                contentHtml += `<p>${line}</p>`;
            });
            contentHtml += '</div>';
        }
        
        if (item.strength) {
            contentHtml += '<div class="workout-title">STRENGTH</div>';
            contentHtml += '<div class="workout-details">';
            item.strength.forEach(line => {
                contentHtml += `<p><strong>${line}</strong></p>`;
            });
            contentHtml += '</div>';
        }
        
        if (item.practice) {
            contentHtml += '<div class="workout-title">PRACTICE</div>';
            contentHtml += '<div class="workout-details">';
            item.practice.forEach(line => {
                contentHtml += `<p>${line}</p>`;
            });
            contentHtml += '</div>';
        }
        
        if (item.wod) {
            contentHtml += '<div class="workout-title">WOD</div>';
            contentHtml += '<div class="workout-details">';
            item.wod.forEach(line => {
                if (line.includes('Time cap:') || line.includes('time cap:')) {
                    contentHtml += `<p class="time-cap">${line}</p>`;
                } else {
                    contentHtml += `<p><strong>${line}</strong></p>`;
                }
            });
            contentHtml += '</div>';
        }
    } else {
        // Engine workout structure
        if (item.workout) {
            contentHtml += '<div class="workout-title">WORKOUT</div>';
            contentHtml += '<div class="workout-details">';
            item.workout.forEach(line => {
                contentHtml += `<p><strong>${line}</strong></p>`;
            });
            contentHtml += '</div>';
        }
    }
    
    card.innerHTML = `
        <div class="workout-header">
            <h3>${item.title}</h3>
            <span class="workout-type ${category === 'crossfit' ? 'crossfit-badge' : 'engine-badge'}">${category === 'crossfit' ? 'CrossFit' : 'Engine'}</span>
        </div>
        <div class="workout-content">${contentHtml}</div>
    `;
    return card;
}

function renderFromData(data, filter = 'all') {
    if (!workoutGrid) return;
    workoutGrid.innerHTML = '';

    const addItems = (items, category) => {
        items.forEach((item, index) => {
            const card = createWorkoutCard(item, category);
            card.style.animationDelay = `${index * 0.05}s`;
            workoutGrid.appendChild(card);
        });
    };

    if (filter === 'all' || filter === 'crossfit') addItems(data.crossfit, 'crossfit');
    if (filter === 'all' || filter === 'engine') addItems(data.engine, 'engine');
}

async function loadWorkouts() {
    try {
        const res = await fetch('workouts.json');
        if (!res.ok) throw new Error('Failed to load workouts.json');
        currentData = await res.json();
        renderFromData(currentData, 'all');
    } catch (e) {
        console.error('Failed to load workouts.json', e);
        // Show error message to user
        if (workoutGrid) {
            workoutGrid.innerHTML = '<div class="error-message">Failed to load workouts. Please check that workouts.json is available.</div>';
        }
    }
}



// Smooth scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add scroll to top button (optional enhancement)
const scrollButton = document.createElement('button');
scrollButton.innerHTML = '↑';
scrollButton.className = 'scroll-to-top';
scrollButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #000 0%, #333 100%);
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: none;
    z-index: 1000;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
`;

scrollButton.addEventListener('click', scrollToTop);
document.body.appendChild(scrollButton);

// Show/hide scroll button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollButton.style.display = 'block';
    } else {
        scrollButton.style.display = 'none';
    }
});

// Add hover effect to scroll button
scrollButton.addEventListener('mouseenter', () => {
    scrollButton.style.transform = 'scale(1.1)';
});

scrollButton.addEventListener('mouseleave', () => {
    scrollButton.style.transform = 'scale(1)';
});

// Performance optimization: Debounce scroll events
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

// Apply debouncing to scroll events
const debouncedScroll = debounce(() => {
    if (window.pageYOffset > 300) {
        scrollButton.style.display = 'block';
    } else {
        scrollButton.style.display = 'none';
    }
}, 100);

window.removeEventListener('scroll', () => {}); // Remove previous listener
window.addEventListener('scroll', debouncedScroll);

// Add smooth transitions to workout content
document.querySelectorAll('.workout-content').forEach(content => {
    content.style.transition = 'all 0.3s ease';
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set initial filter to show all workouts
    const allTab = document.querySelector('[data-filter="all"]');
    if (allTab) {
        allTab.click();
    }
    loadWorkouts();
});
