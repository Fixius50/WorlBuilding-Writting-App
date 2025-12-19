document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias UI ---
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const btnShowRegister = document.getElementById('btn-show-register');
    const btnShowLogin = document.getElementById('btn-show-login');
    const toggleText = document.getElementById('toggle-text');
    const toggleBackText = document.getElementById('toggle-back-text');

    // --- Alternar Formularios ---
    const showRegister = () => {
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
        toggleText.classList.add('hidden');
        toggleBackText.classList.remove('hidden');
    };

    const showLogin = () => {
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        toggleBackText.classList.add('hidden');
        toggleText.classList.remove('hidden');
    };

    if (btnShowRegister) btnShowRegister.addEventListener('click', showRegister);
    if (btnShowLogin) btnShowLogin.addEventListener('click', showLogin);

    // --- Lógica de Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('wb_user', JSON.stringify({
                            username: data.username,
                            loginTime: new Date().toISOString()
                        }));
                        window.location.href = 'dashboard.html';
                    } else {
                        alert('Error: ' + (data.error || 'Credenciales inválidas'));
                    }
                })
                .catch(err => {
                    console.error('Login error:', err);
                    alert('Error conectando con el servidor');
                });
        });
    }

    // --- Lógica de Registro ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('¡Bóveda creada! Ahora puedes iniciar sesión.');
                        showLogin();
                        // Autocompletar login con el nuevo usuario
                        document.getElementById('login-username').value = username;
                        document.getElementById('login-password').value = '';
                    } else {
                        alert('Error en registro: ' + (data.error || 'Inténtalo de nuevo'));
                    }
                })
                .catch(err => {
                    console.error('Register error:', err);
                    alert('Error conectando con el servidor');
                });
        });
    }
});
