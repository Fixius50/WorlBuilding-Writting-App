document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Basic "Local" Auth - Simulating a real login
            const usernameInput = form.querySelector('input[type="text"]');
            const passwordInput = form.querySelector('input[type="password"]');

            const username = usernameInput ? usernameInput.value : 'admin';

            if (username) {
                // Save session to localStorage
                const user = {
                    username: username,
                    token: 'mock-jwt-token-' + Date.now(),
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('wb_user', JSON.stringify(user));

                // Show specific feedback (optional) or just redirect
                console.log('Login successful, saving session...');

                // Delay slightly for effect
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            }
        });
    }
});
