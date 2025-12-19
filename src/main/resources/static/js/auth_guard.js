// Auth Guard - Include in all protected pages
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('wb_user');
    if (!user) {
        // If not logged in, redirect to login
        window.location.href = 'login.html';
    } else {
        // If logged in, update UI with username if element exists
        const userDisplay = document.getElementById('user-display-name');
        if (userDisplay) {
            const userData = JSON.parse(user);
            userDisplay.textContent = `Bienvenido, ${userData.username}`;
        }
    }
});

function logout() {
    localStorage.removeItem('wb_user');
    window.location.href = 'login.html';
}
