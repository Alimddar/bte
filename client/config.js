// API Configuration
// Unified configuration for all platforms (mobile + desktop)

// Production/Network API - works for both mobile and desktop
window.API_BASE_URL = 'http://192.168.1.72:5000/api';

// Alternative local development (uncomment for localhost testing):
// window.API_BASE_URL = 'http://localhost:5000/api';

// Auto-detect and fallback configuration
if (!window.API_BASE_URL) {
    // Fallback to localhost if no config is set
    window.API_BASE_URL = 'http://localhost:5000/api';
}

// Global authentication check function
window.isAuthenticated = function() {
    const token = localStorage.getItem('token');
    const isAuth = localStorage.getItem('isAuth');
    return token && isAuth === 'true';
};

// Global function to redirect to login if not authenticated
window.requireAuth = function(redirectUrl = './index.html') {
    if (!window.isAuthenticated()) {
        alert('Zəhmət olmasa əvvəlcə daxil olun');
        window.location.href = redirectUrl;
        return false;
    }
    return true;
};