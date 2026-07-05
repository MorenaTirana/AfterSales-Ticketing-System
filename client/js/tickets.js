const table = document.getElementById("ticketTable");

let tickets = [];

loadTickets();

async function loadTickets() {

    try {

        const response = await fetch("http://localhost:3001/api/tickets");

        tickets = await response.json();

        drawTable(tickets);

    }

    catch (err) {

        console.error(err);

        alert("Errore caricamento ticket");

    }

}

function drawTable(data){

    table.innerHTML="";

    data.forEach(ticket=>{

        let priorityColor="secondary";

        if(ticket.priorita==="alta")
            priorityColor="danger";

        if(ticket.priorita==="media")
            priorityColor="warning";

        if(ticket.priorita==="bassa")
            priorityColor="success";

        let stateColor="secondary";

        if(ticket.stato==="aperto")
            stateColor="primary";

        if(ticket.stato==="risolto")
            stateColor="success";

        if(ticket.stato==="chiuso")
            stateColor="dark";

        table.innerHTML+=`

        <tr>

            <td>${ticket.id}</td>

            <td>${ticket.codice}</td>

            <td>${ticket.titolo}</td>

            <td>${ticket.nome} ${ticket.cognome}</td>

            <td>${ticket.modello ?? "-"}</td>

            <td>${ticket.tipo}</td>

            <td>

                <span class="badge bg-${priorityColor}">

                    ${ticket.priorita}

                </span>

            </td>

            <td>

                <span class="badge bg-${stateColor}">

                    ${ticket.stato}

                </span>

            </td>

            <td>

                ${new Date(ticket.created_at).toLocaleDateString()}

            </td>

            <td>

                <button
                    class="btn btn-warning btn-sm"
                    onclick="editTicket(${ticket.id})">

                    Modifica

                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteTicket(${ticket.id})">

                    Elimina

                </button>

            </td>

        </tr>

        `;

    });

}

async function deleteTicket(id){

    if(!confirm("Eliminare il ticket?"))
        return;

    await fetch(

        `http://localhost:3001/api/tickets/${id}`,

        {

            method:"DELETE"

        }

    );

    loadTickets();

}

function editTicket(id){

    alert("Modifica ticket "+id);

}

document
.getElementById("search")
.addEventListener("keyup",function(){

    const text=this.value.toLowerCase();

    const filtered=tickets.filter(t=>{

        return (

            t.codice.toLowerCase().includes(text)

            ||

            t.titolo.toLowerCase().includes(text)

            ||

            t.nome.toLowerCase().includes(text)

            ||

            t.cognome.toLowerCase().includes(text)

        );

    });

    drawTable(filtered);

});