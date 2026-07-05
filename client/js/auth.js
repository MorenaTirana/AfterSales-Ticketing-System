// client/js/auth.js

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage') || document.getElementById('error');
    
    if (errorDiv) errorDiv.textContent = '';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect basato sul ruolo
            if (['aftersales', 'admin'].includes(data.user.ruolo)) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'tickets.html';
            }
        } else {
            if (errorDiv) errorDiv.textContent = data.error || 'Credenziali non valide';
        }
        
    } catch (error) {
        console.error('Errore login:', error);
        if (errorDiv) errorDiv.textContent = 'Errore di connessione al server';
    }
});

// Register form handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        nome: document.getElementById('nome').value,
        cognome: document.getElementById('cognome').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    const errorDiv = document.getElementById('errorMessage') || document.getElementById('error');
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Registrazione completata! Effettua il login.');
            window.location.href = 'login.html';
        } else {
            if (errorDiv) errorDiv.textContent = result.error || 'Errore nella registrazione';
        }
        
    } catch (error) {
        console.error('Errore registrazione:', error);
        if (errorDiv) errorDiv.textContent = 'Errore di connessione al server';
    }
});

// Verifica autenticazione
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
    return null;
}

// Richiede autenticazione
async function requireAuth() {
    const user = await checkAuth();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Logout
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Errore logout:', error);
    }
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Get current user from localStorage
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}
