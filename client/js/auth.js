// client/js/auth.js

// ================= LOGIN =================

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const errorDiv =
        document.getElementById("errorMessage") ||
        document.getElementById("error");

    if (errorDiv) errorDiv.textContent = "";

    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.role === "customer") {

                window.location.href = "tickets.html";

            } else {

                window.location.href = "dashboard.html";

            }

        } else {

            if (errorDiv)
                errorDiv.textContent = data.message;

        }

    } catch (err) {

        console.log(err);

        if (errorDiv)
            errorDiv.textContent = "Errore di connessione";

    }

});

// ================= AUTH =================

function getCurrentUser() {

    const user = localStorage.getItem("user");

    if (!user) return null;

    return JSON.parse(user);

}

async function requireAuth() {

    const user = getCurrentUser();

    if (!user) {

        window.location.href = "login.html";

        return null;

    }

    return user;

}

function logout() {

    localStorage.removeItem("user");

    window.location.href = "login.html";

}