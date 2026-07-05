// client/js/dashboard.js
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await requireAuth();
    if (!currentUser) return;
    
    // Verifica accesso
    if (!['aftersales', 'admin'].includes(currentUser.ruolo)) {
        alert('Accesso non autorizzato');
        window.location.href = 'tickets.html';
        return;
    }
    
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const [statsResponse, activityResponse] = await Promise.all([
            fetch('/api/dashboard/stats'),
            fetch('/api/dashboard/recent-activity')
        ]);
        
        if (!statsResponse.ok || !activityResponse.ok) {
            throw new Error('Errore nel caricamento dei dati');
        }
        
        const stats = await statsResponse.json();
        const activity = await activityResponse.json();
        
        renderKPIs(stats);
        renderCharts(stats);
        renderRecentActivity(activity);
        
    } catch (error) {
        console.error('Errore caricamento dashboard:', error);
        alert('Errore nel caricamento della dashboard');
    }
}

function renderKPIs(stats) {
    document.getElementById('kpiAperti').textContent = stats.openClosed?.aperti || 0;
    document.getElementById('kpiChiusi').textContent = stats.openClosed?.chiusi || 0;
    document.getElementById('kpiTempoMedio').textContent = 
        stats.avgClosureTime?.tempo_medio_giorni || '-';
    document.getElementById('kpiUrgenti').textContent = stats.urgentUnassigned || 0;
}

function renderCharts(stats) {
    // Chart Stato
    if (stats.byStatus && stats.byStatus.length > 0) {
        new Chart(document.getElementById('chartStato'), {
            type: 'doughnut',
            data: {
                labels: stats.byStatus.map(s => formatStato(s.stato)),
                datasets: [{
                    data: stats.byStatus.map(s => s.totale),
                    backgroundColor: [
                        '#3b82f6', '#f59e0b', '#ef4444', 
                        '#8b5cf6', '#06b6d4', '#10b981', '#6b7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Chart Priorità
    if (stats.byPriority && stats.byPriority.length > 0) {
        new Chart(document.getElementById('chartPriorita'), {
            type: 'bar',
            data: {
                labels: stats.byPriority.map(p => formatPriorita(p.priorita)),
                datasets: [{
                    label: 'Ticket',
                    data: stats.byPriority.map(p => p.totale),
                    backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#22c55e']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    // Chart Tecnici
    if (stats.byTechnician && stats.byTechnician.length > 0) {
        new Chart(document.getElementById('chartTecnici'), {
            type: 'bar',
            data: {
                labels: stats.byTechnician.map(t => `${t.nome} ${t.cognome}`),
                datasets: [{
                    label: 'Ticket Assegnati',
                    data: stats.byTechnician.map(t => t.totale),
                    backgroundColor: '#1e3a5f'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Chart Damaged Parts
    if (stats.damagedParts && stats.damagedParts.length > 0) {
        new Chart(document.getElementById('chartDamaged'), {
            type: 'bar',
            data: {
                labels: stats.damagedParts.map(d => d.damaged_part),
                datasets: [{
                    label: 'Occorrenze',
                    data: stats.damagedParts.map(d => d.occorrenze),
                    backgroundColor: '#dc2626'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Chart Responsabilità
    if (stats.responsibilities && stats.responsibilities.length > 0) {
        new Chart(document.getElementById('chartResponsabilities'), {
            type: 'pie',
            data: {
                labels: stats.responsibilities.map(r => r.responsabilita || 'Non definita'),
                datasets: [{
                    data: stats.responsibilities.map(r => r.totale),
                    backgroundColor: [
                        '#ef4444', '#f59e0b', '#10b981', 
                        '#3b82f6', '#8b5cf6', '#ec4899'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Chart Dealer
    if (stats.byDealer && stats.byDealer.length > 0) {
        new Chart(document.getElementById('chartDealer'), {
            type: 'bar',
            data: {
                labels: stats.byDealer.map(d => d.dealer),
                datasets: [{
                    label: 'Ticket',
                    data: stats.byDealer.map(d => d.totale_ticket),
                    backgroundColor: '#0891b2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Chart Mensile
    if (stats.byMonth && stats.byMonth.length > 0) {
        new Chart(document.getElementById('chartMensile'), {
            type: 'line',
            data: {
                labels: stats.byMonth.map(m => m.mese),
                datasets: [
                    {
                        label: 'Totale',
                        data: stats.byMonth.map(m => m.totale),
                        borderColor: '#1e3a5f',
                        backgroundColor: 'rgba(30, 58, 95, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Garanzia',
                        data: stats.byMonth.map(m => m.warranty),
                        borderColor: '#10b981',
                        tension: 0.3
                    },
                    {
                        label: 'Ricambi',
                        data: stats.byMonth.map(m => m.spare_parts),
                        borderColor: '#f59e0b',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function renderRecentActivity(activity) {
    // Ticket recenti
    const recentTicketsDiv = document.getElementById('recentTickets');
    if (activity.recentTickets && activity.recentTickets.length > 0) {
        recentTicketsDiv.innerHTML = activity.recentTickets.map(t => `
            <a href="ticket-detail.html?id=${t.id}" class="recent-item">
                <div class="recent-icon">
                    ${t.tipo === 'warranty' ? '🛡️' : '⚙️'}
                </div>
                <div class="recent-content">
                    <div class="recent-title">${t.codice} - ${escapeHtml(t.titolo)}</div>
                    <div class="recent-meta">
                        ${t.cliente_nome} ${t.cliente_cognome} • ${formatDateTime(t.created_at)}
                    </div>
                </div>
                <span class="badge badge-stato-${t.stato}">${formatStato(t.stato)}</span>
            </a>
        `).join('');
    } else {
        recentTicketsDiv.innerHTML = '<p class="no-data">Nessun ticket recente</p>';
    }
    
    // Attività recente
    const recentActivityDiv = document.getElementById('recentActivity');
    if (activity.statusChanges && activity.statusChanges.length > 0) {
        recentActivityDiv.innerHTML = activity.statusChanges.slice(0, 10).map(s => `
            <div class="recent-item">
                <div class="recent-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="recent-content">
                    <div class="recent-title">
                        <a href="ticket-detail.html?id=${s.ticket_id}">${s.ticket_codice}</a>
                        ${s.old_status ? `<span class="badge badge-stato-${s.old_status}">${formatStato(s.old_status)}</span> →` : ''}
                        <span class="badge badge-stato-${s.new_status}">${formatStato(s.new_status)}</span>
                    </div>
                    <div class="recent-meta">
                        ${s.nome} ${s.cognome} • ${formatDateTime(s.created_at)}
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        recentActivityDiv.innerHTML = '<p class="no-data">Nessuna attività recente</p>';
    }
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
        'critica': 'Critica',
        'alta': 'Alta',
        'media': 'Media',
        'bassa': 'Bassa'
    };
    return map[priorita] || priorita;
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
