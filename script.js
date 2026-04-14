// Initial dataset tailored to Instagram realistic features
const initialFeatures = [
    { id: '1', title: 'Native iPad Application', votes: 2154000, status: 'Planned' },
    { id: '2', title: 'Reverse Chronological Feed toggle', votes: 1243500, status: 'Planned' },
    { id: '3', title: 'Chronological Stories', votes: 890000, status: 'In Progress' },
    { id: '4', title: 'Edit stories after posting', votes: 670000, status: 'Under Review' },
    { id: '5', title: 'Hide typing indicator in DMs', votes: 420000, status: 'Under Review' }
];

// State Management
let features = [];
let upvotedIds = []; // Track user's permanent votes

// DOM Elements
const featureListEl = document.getElementById('feature-list');
const addFeatureForm = document.getElementById('add-feature-form');
const newFeatureInput = document.getElementById('new-feature-input');

// Initialize the App
function init() {
    loadFeatures();
    
    // Auth display logic toggle
    const isAuth = localStorage.getItem('metaAuth') === 'true';
    const ctaSection = document.getElementById('login-cta-section');
    const boardContent = document.getElementById('board-content');
    
    if (isAuth) {
        ctaSection.style.display = 'none';
        boardContent.style.display = 'flex'; // It's flex in CSS inline, keep logic matching
        document.getElementById('logout-btn').style.display = 'inline-block';
        renderFeatures();
    } else {
        ctaSection.style.display = 'block';
        boardContent.style.display = 'none';
        
        // We do not render feature list for unAuth users, 
        // but we DO need to bind the tracker for the static CTA wrapper!
        setupMouseTracking();
    }
    
    setupEventListeners();
}

// Load from LocalStorage or use defaults
function loadFeatures() {
    const saved = localStorage.getItem('featureVotesData');
    if (saved) {
        features = JSON.parse(saved);
    } else {
        features = [...initialFeatures];
        saveFeatures();
    }
    
    // Load tracking array
    const savedVotes = localStorage.getItem('upvotedFeaturesTracker');
    if (savedVotes) {
        upvotedIds = JSON.parse(savedVotes);
    }
}

// Save to LocalStorage
function saveFeatures() {
    localStorage.setItem('featureVotesData', JSON.stringify(features));
    localStorage.setItem('upvotedFeaturesTracker', JSON.stringify(upvotedIds));
}

// Convert numbers like 1200000 to "1.2M" or 800000 to "800K"
function formatVotes(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// Update global stats
function updateGlobalCounter() {
    const totalVotes = features.reduce((sum, f) => sum + f.votes, 0);
    const counterEl = document.querySelector('.global-counter');
    if (counterEl) {
        counterEl.innerHTML = `🎉 Over ${formatVotes(totalVotes)} People Voted`;
    }
}

// Render list dynamically based on vote count
function renderFeatures() {
    // Sort features by votes (descending)
    features.sort((a, b) => b.votes - a.votes);
    
    // Update global sum
    updateGlobalCounter();
    
    // Clear list
    featureListEl.innerHTML = '';
    
    // Create elements
    features.forEach(feature => {
        const li = document.createElement('li');
        
        const isVoted = upvotedIds.includes(feature.id);
        const userVotedClass = isVoted ? 'user-voted' : ''; // Removed vote-locked logic
        
        li.className = `feature-item`;
        li.setAttribute('data-id', feature.id); // Add id to li for full-card click
        
        // Add delete button if it's a newly added feature (status logic)
        const deleteHtml = feature.status === 'Under Consideration' 
            ? `<button class="delete-btn" data-id="${feature.id}">×</button>` 
            : '';
        
        li.innerHTML = `
            ${deleteHtml}
            <div class="feature-info">
                <span class="feature-title">${escapeHTML(feature.title)}</span>
                <span class="feature-status">${feature.status}</span>
            </div>
            <div class="vote-control ${userVotedClass}">
                <svg class="vote-arrow" viewBox="0 0 24 24">
                    <path d="M18 15l-6-6-6 6"/>
                </svg>
                <span class="vote-count">${formatVotes(feature.votes)}</span>
            </div>
        `;
        
        featureListEl.appendChild(li);
    });
    
    setupMouseTracking(); // Bind mouse spotlight effect to new list items
}

function setupMouseTracking() {
    const cards = document.querySelectorAll('.feature-item, .hover-circle-wrapper');
    cards.forEach(card => {
        card.style.cursor = 'pointer'; // Make it look clickable
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Handle all events
function setupEventListeners() {
    // Form submission
    addFeatureForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = newFeatureInput.value.trim();
        if (title) {
            addNewFeature(title);
            newFeatureInput.value = '';
        }
    });

    // Logout and Reset System
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('metaAuth');
        localStorage.removeItem('featureVotesData'); // Hard reset board state back to defaults
        localStorage.removeItem('upvotedFeaturesTracker');
        window.location.reload();
    });

    // Event delegation for upvote clicks AND delete clicks
    featureListEl.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.stopPropagation(); // prevent upvote handler
            const featureId = deleteBtn.getAttribute('data-id');
            deleteFeature(featureId);
            return;
        }
        
        // Full card clicking support
        const card = e.target.closest('.feature-item');
        if (card) {
            const featureId = card.getAttribute('data-id');
            handleUpvote(featureId);
        }
    });
}

// Upvote logic (now cancellable)
function handleUpvote(featureId) {
    // Auth Guard
    const isAuth = localStorage.getItem('metaAuth') === 'true';
    if (!isAuth) {
        alert("Login with Meta is strictly mandatory to cast your vote.");
        window.location.href = 'login.html';
        return;
    }

    const index = features.findIndex(f => f.id === featureId);
    if (index !== -1) {
        if (upvotedIds.includes(featureId)) {
            // Cancel the upvote
            features[index].votes--;
            upvotedIds = upvotedIds.filter(id => id !== featureId);
        } else {
            // Cast new upvote
            features[index].votes++;
            upvotedIds.push(featureId);
        }
        saveFeatures();
        renderFeatures();
    }
}

// Delete logic
function deleteFeature(featureId) {
    features = features.filter(f => f.id !== featureId);
    upvotedIds = upvotedIds.filter(id => id !== featureId);
    saveFeatures();
    renderFeatures();
}

// Add new feature logic
function addNewFeature(title) {
    // Adding a new feature strictly requires Auth too
    const isAuth = localStorage.getItem('metaAuth') === 'true';
    if (!isAuth) {
        alert("Login with Meta is strictly mandatory to suggest features.");
        window.location.href = 'login.html';
        return;
    }

    const newFeature = {
        id: Date.now().toString(), // Generate unique ID
        title: title,
        votes: 1, // Start with 1 vote automatically
        status: 'Under Consideration' // Updated from "Under Review" to "Under Consideration" per user
    };
    
    // Automatically count it as upvoted by the submitter
    upvotedIds.push(newFeature.id);
    
    features.push(newFeature);
    saveFeatures();
    renderFeatures();
}

// Helper to prevent XSS simple script injections
function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
