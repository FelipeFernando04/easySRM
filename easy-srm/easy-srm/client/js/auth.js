document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    if (sessionStorage.getItem('user')) {
        window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMsg');

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = 'Credenciais inválidas';
                errorMsg.classList.remove('hidden');
            }
        } catch (err) {
            errorMsg.textContent = 'Erro de conexão';
            errorMsg.classList.remove('hidden');
        }
    });
});