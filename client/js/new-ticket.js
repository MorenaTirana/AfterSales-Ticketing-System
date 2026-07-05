// client/js/new-ticket.js
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await requireAuth();
    if (!currentUser) return;
    
    setupUI();
    loadBoats();
    setupFormHandlers();
});

function setupUI() {
    // Dashboard link per staff
    if (['aftersales', 'admin'].includes(currentUser.ruolo)) {
        document.getElementById('dashboardLink').innerHTML = 
            '<a href="dashboard.html"><i class="fas fa-chart-bar"></i> Dashboard</a>';
    }
}

async function loadBoats() {
    try {
        const response = await fetch('/api/tickets/boats');
        if (!response.ok) return;
        
        const boats = await response.json();
        const select = document.getElementById('boat_id');
        
        boats.forEach(boat => {
            const option = document.createElement('option');
            option.value = boat.id;
            option.textContent = `${boat.modello} - ${boat.matricola} (${boat.anno_costruzione})`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Errore caricamento barche:', error);
    }
}

function setupFormHandlers() {
    // Toggle campi specifici per tipo
    document.querySelectorAll('input[name="tipo"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const warrantyFields = document.getElementById('warrantyFields');
            const sparePartsFields = document.getElementById('sparePartsFields');
            
            if (e.target.value === 'warranty') {
                warrantyFields.style.display = 'block';
                sparePartsFields.style.display = 'none';
            } else {
                warrantyFields.style.display = 'none';
                sparePartsFields.style.display = 'block';
            }
        });
    });
    
    // Submit form
    document.getElementById('ticketForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createTicket();
    });
}

async function createTicket() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
    
    if (!tipo) {
        errorDiv.textContent = 'Seleziona il tipo di ticket';
        return;
    }
    
    const data = {
        tipo,
        titolo: document.getElementById('titolo').value.trim(),
        descrizione: document.getElementById('descrizione').value.trim(),
        priorita: document.getElementById('priorita').value,
        boat_id: document.getElementById('boat_id').value || null
    };
    
    // Aggiungi campi specifici
    if (tipo === 'warranty') {
        data.damaged_part = document.getElementById('damaged_part').value.trim();
        data.damage_type = document.getElementById('damage_type').value.trim();
        data.causa = document.getElementById('causa').value.trim();
    } else {
        data.article_code = document.getElementById('article_code').value.trim();
        data.article_description = document.getElementById('article_description').value.trim();
        data.quantity = parseInt(document.getElementById('quantity').value) || 1;
    }
    
    try {
        const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            successDiv.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Ticket <strong>${result.codice}</strong> creato con successo!
                <br>Reindirizzamento...
            `;
            
            setTimeout(() => {
                window.location.href = `ticket-detail.html?id=${result.ticketId}`;
            }, 1500);
            
        } else {
            errorDiv.textContent = result.error || 'Errore nella creazione del ticket';
        }
        
    } catch (error) {
        console.error('Errore:', error);
        errorDiv.textContent = 'Errore di connessione al server';
    }
}
