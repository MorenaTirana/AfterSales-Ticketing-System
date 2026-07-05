const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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

            alert("LOGIN OK");

            localStorage.setItem("user", JSON.stringify(data.user));

            alert(localStorage.getItem("user"));

            window.location.href = "dashboard.html";

        } else {

            document.getElementById("errore").innerText = data.message;

        }

    } catch (err) {

        document.getElementById("errore").innerText =
            "Errore di connessione al server";

        console.error(err);

    }

});
