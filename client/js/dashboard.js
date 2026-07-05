const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}

document.getElementById("welcome").innerText =
    "Benvenuto " + user.nome + " " + user.cognome;

document.getElementById("role").innerText =
    "Ruolo: " + user.role;

// ===============================
// Logout
// ===============================

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("user");

    window.location.href = "login.html";

});

// ===============================
// Dashboard
// ===============================

loadDashboard();

async function loadDashboard() {

    try {

        const response = await fetch("http://localhost:3001/api/tickets");

        const tickets = await response.json();

        // -----------------------------
        // Contatori
        // -----------------------------

        document.getElementById("ticketOpen").innerText =
            tickets.filter(t => t.stato === "aperto").length;

        document.getElementById("ticketClosed").innerText =
            tickets.filter(t => t.stato === "chiuso").length;

        // Per ora usiamo i dati disponibili
        document.getElementById("dealerCount").innerText = "2";

        document.getElementById("customerCount").innerText = "2";

        // -----------------------------
        // Ultimi Ticket
        // -----------------------------

        const table = document.getElementById("lastTickets");

        table.innerHTML = "";

        tickets.slice(0,5).forEach(ticket => {

            table.innerHTML += `

                <tr>

                    <td>${ticket.codice}</td>

                    <td>${ticket.nome} ${ticket.cognome}</td>

                    <td>${ticket.titolo}</td>

                    <td>${ticket.stato}</td>

                </tr>

            `;

        });

    }

    catch(err){

        console.error(err);

    }

}