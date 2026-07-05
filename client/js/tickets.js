// client/js/tickets.js
let currentUser = null;
let allTickets = [];

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await requireAuth();
    if (!currentUser) return;
    
    setupUI();
    loadTickets();
    loadStats();
    
    // Event listeners per i filtri
    document.getElementById('filterStato').addEventListener('change', applyFilters);
    document.getElementById('filterTipo').addEventListener('change', applyFilters);
    document.getElementById('filterPriorita').addEventListener('change', applyFilters);
    document.getElementById('filterTecnico')?.addEventListener('change', applyFilters);
});

function setupUI() {
    // Mostra info utente
    document.getElementById('userInfo').innerHTML = `
        <span class="user-badge">
            <i class="fas fa-user"></i> ${currentUser.nome} ${currentUser.cognome}
            <span class="role-badge role-${currentUser.role}">${currentUser.ruolo}</span>
        </span>
    `;
    
    // Mostra link dashboard per staff
    if (['aftersales', 'admin'].includes(currentUser.ruolo)) {
        document.getElementById('dashboardLink').innerHTML = 
            '<a href="dashboard.html"><i class="fas fa-chart-bar"></i> Dashboard</a>';
        
        // Mostra filtro tecnici
        document.getElementById('filterTecnicoGroup').style.display = 'block';
        loadTechnicians();
    }
}

async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        if (!response.ok) throw new Error('Errore nel caricamento');
        
        allTickets = await response.json();
        renderTickets(allTickets);
        
    } catch (error) {
        console.error('Errore caricamento ticket:', error);
        document.getElementById('ticketList').innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-error">
                    <i class="fas fa-exclamation-circle"></i> Errore nel caricamento dei ticket
                </td>
            </tr>
        `;
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/dashboard/my-stats');
        if (!response.ok) return;
        
        const data = await response.json();
        const stats = data.stats;
        
        document.getElementById('statAperti').textContent = stats.aperti || 0;
        document.getElementById('statInLavorazione').textContent = 
            (stats.totale - stats.aperti - stats.risolti) || 0;
        document.getElementById('statRisolti').textContent = stats.risolti || 0;
        document.getElementById('statChiusi').textContent = stats.chiusi || stats.risolti || 0;
        
    } catch (error) {
        console.error('Errore caricamento statistiche:', error);
    }
}

async function loadTechnicians() {
    try {
        const response = await fetch('/api/assignments/technicians');
        if (!response.ok) return;
        
        const technicians = await response.json();
        const select = document.getElementById('filterTecnico');
        
        technicians.forEach(tech => {
            const option = document.createElement('option');
            option.value = tech.id;
            option.textContent = `${tech.nome} ${tech.cognome} (${tech.ticket_assegnati || 0})`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Errore caricamento tecnici:', error);
    }
}

function renderTickets(tickets) {
    const tbody = document.getElementById('ticketList');
    document.getElementById('ticketCount').textContent = `${tickets.length} ticket`;
    
    if (tickets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <i class="fas fa-inbox"></i> Nessun ticket trovato
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = tickets.map(t => `
        <tr class="ticket-row priority-${t.priorita}" onclick="window.location.href='ticket-detail.html?id=${t.id}'">
            <td><strong>${t.codice}</strong></td>
            <td class="ticket-title">${escapeHtml(t.titolo)}</td>
            <td>
                <span class="badge badge-type-${t.tipo}">
                    ${t.tipo === 'warranty' ? '🛡️ WIR' : '⚙️ SPR'}
                </span>
            </td>
            <td><span class="badge badge-stato-${t.stato}">${formatStato(t.stato)}</span></td>
            <td><span class="badge badge-priorita-${t.priorita}">${formatPriorita(t.priorita)}</span></td>
            <td>${t.cliente_nome ? `${t.cliente_nome} ${t.cliente_cognome}` : '-'}</td>
            <td>${t.tecnico_nome ? `${t.tecnico_nome} ${t.tecnico_cognome}` : '<span class="text-muted">Non assegnato</span>'}</td>
            <td>${formatDate(t.created_at)}</td>
            <td>
                <a href="ticket-detail.html?id=${t.id}" class="btn btn-sm btn-primary" onclick="event.stopPropagation()">
                    <i class="fas fa-eye"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

function applyFilters() {
    const stato = document.getElementById('filterStato').value;
    const tipo = document.getElementById('filterTipo').value;
    const priorita = document.getElementById('filterPriorita').value;
    const tecnico = document.getElementById('filterTecnico')?.value;
    
    let filtered = [...allTickets];
    
    if (stato) {
        filtered = filtered.filter(t => t.stato === stato);
    }
    if (tipo) {
        filtered = filtered.filter(t => t.tipo === tipo);
    }
    if (priorita) {
        filtered = filtered.filter(t => t.priorita === priorita);
    }
    if (tecnico) {
        filtered = filtered.filter(t => t.tecnico_id == tecnico);
    }
    
    renderTickets(filtered);
}

function resetFilters() {
    document.getElementById('filterStato').value = '';
    document.getElementById('filterTipo').value = '';
    document.getElementById('filterPriorita').value = '';
    if (document.getElementById('filterTecnico')) {
        document.getElementById('filterTecnico').value = '';
    }
    renderTickets(allTickets);
}

// Utility functions
function formatStato(stato) {
    const map = {
        'aperto': 'Aperto',
        'in_analisi': 'In Analisi',
        'in_attesa_ricambi': 'Attesa Ricambi',
        'in_attesa_cliente': 'Attesa Cliente',
        'intervento_programmato': 'Intervento',
        'risolto': 'Risolto',
        'chiuso': 'Chiuso'
    };
    return map[stato] || stato;
}

function formatPriorita(priorita) {
    const map = {
        'critica': '🔴 Critica',
        'alta': '🟠 Alta',
        'media': '🟡 Media',
        'bassa': '🟢 Bassa'
    };
    return map[priorita] || priorita;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
