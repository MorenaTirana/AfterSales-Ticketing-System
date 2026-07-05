// client/js/ticket-detail.js
let currentUser = null;
let ticketId = null;
let currentTicket = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await requireAuth();
    if (!currentUser) return;
    
    const params = new URLSearchParams(window.location.search);
    ticketId = params.get('id');
    
    if (!ticketId) {
        window.location.href = 'tickets.html';
        return;
    }
    
    setupUI();
    await loadTicket();
    await loadComments();
    await loadAttachments();
    await loadHistory();
    
    setupEventHandlers();
});

function setupUI() {
    if (['aftersales', 'admin'].includes(currentUser.role)) {
        document.getElementById('dashboardLink').innerHTML = 
            '<a href="dashboard.html"><i class="fas fa-chart-bar"></i> Dashboard</a>';
    }
}

async function loadTicket() {
    try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                alert('Ticket non trovato');
                window.location.href = 'tickets.html';
                return;
            }
            throw new Error('Errore nel caricamento');
        }
        
        currentTicket = await response.json();
        renderTicketHeader();
        renderTicketInfo();
        setupStaffActions();
        
    } catch (error) {
        console.error('Errore caricamento ticket:', error);
        document.getElementById('ticketHeader').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i> Errore nel caricamento del ticket
            </div>
        `;
    }
}

function renderTicketHeader() {
    const t = currentTicket;
    document.getElementById('ticketHeader').innerHTML = `
        <div class="ticket-header-content">
            <div class="ticket-header-main">
                <span class="ticket-code">${t.codice}</span>
                <h2 class="ticket-title">${escapeHtml(t.titolo)}</h2>
                <div class="ticket-badges">
                    <span class="badge badge-type-${t.tipo}">
                        ${t.tipo === 'warranty' ? '🛡️ Garanzia' : '⚙️ Ricambi'}
                    </span>
                    <span class="badge badge-stato-${t.stato}">${formatStato(t.stato)}</span>
                    <span class="badge badge-priorita-${t.priorita}">${formatPriorita(t.priorita)}</span>
                </div>
            </div>
            <div class="ticket-header-meta">
                <div class="meta-item">
                    <i class="fas fa-user"></i>
                    <span>${t.cliente_nome} ${t.cliente_cognome}</span>
                </div>
                ${t.boat_modello ? `
                <div class="meta-item">
                    <i class="fas fa-ship"></i>
                    <span>${t.boat_modello} - ${t.boat_matricola}</span>
                </div>
                ` : ''}
                ${t.assignment ? `
                <div class="meta-item">
                    <i class="fas fa-user-cog"></i>
                    <span>Tecnico: ${t.assignment.tecnico_nome} ${t.assignment.tecnico_cognome}</span>
                </div>
                ` : ''}
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Creato: ${formatDateTime(t.created_at)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderTicketInfo() {
    const t = currentTicket;
    let detailsHtml = '';
    
    if (t.tipo === 'warranty' && t.warranty_details) {
        const wd = t.warranty_details;
        detailsHtml = `
            <div class="detail-section">
                <h4><i class="fas fa-shield-alt"></i> Dettagli Garanzia</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Parte Danneggiata</label>
                        <span>${wd.damaged_part || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tipo Danno</label>
                        <span>${wd.damage_type || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Causa</label>
                        <span>${wd.causa || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Responsabilità</label>
                        <span class="badge">${wd.responsabilita || 'Da definire'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Soluzione</label>
                        <span>${wd.soluzione || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Costo Stimato</label>
                        <span>${wd.costo_stimato ? `€ ${wd.costo_stimato}` : '-'}</span>
                    </div>
                </div>
            </div>
        `;
    } else if (t.tipo === 'spare_parts' && t.spare_parts_details) {
        const sp = t.spare_parts_details;
        detailsHtml = `
            <div class="detail-section">
                <h4><i class="fas fa-cogs"></i> Dettagli Ricambi</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Codice Articolo</label>
                        <span>${sp.article_code || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Quantità</label>
                        <span>${sp.quantity || 1}</span>
                    </div>
                    <div class="detail-item full-width">
                        <label>Descrizione</label>
                        <span>${sp.article_description || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Costo Unitario</label>
                        <span>${sp.costo_unitario ? `€ ${sp.costo_unitario}` : '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Lead Time</label>
                        <span>${sp.lead_time_days ? `${sp.lead_time_days} giorni` : '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Fornitore</label>
                        <span>${sp.fornitore || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('ticketInfo').innerHTML = `
        <div class="detail-section">
            <h4><i class="fas fa-align-left"></i> Descrizione</h4>
            <p class="description-text">${escapeHtml(t.descrizione)}</p>
        </div>
        ${detailsHtml}
    `;
}

async function setupStaffActions() {
    const isStaff = ['aftersales', 'admin', 'tecnico'].includes(currentUser.ruolo);
    const canAssign = ['aftersales', 'admin'].includes(currentUser.ruolo);
    
    if (isStaff) {
        document.getElementById('staffActions').style.display = 'block';
        document.getElementById('visibilityToggle').style.display = 'block';
        
        // Imposta stato corrente nel select
        document.getElementById('newStatus').value = currentTicket.stato;
        
        if (canAssign) {
            await loadTechnicians();
        } else {
            document.getElementById('assignSection').style.display = 'none';
        }
    }
    
    // Disabilita azioni se ticket chiuso
    if (currentTicket.stato === 'chiuso') {
        document.querySelectorAll('#staffActions button').forEach(btn => {
            btn.disabled = true;
        });
        document.getElementById('commentForm').style.display = 'none';
        document.getElementById('uploadForm').style.display = 'none';
    }
}

async function loadTechnicians() {
    try {
        const response = await fetch('/api/assignments/technicians');
        if (!response.ok) return;
        
        const technicians = await response.json();
        const select = document.getElementById('technicianSelect');
        
        technicians.forEach(tech => {
            const option = document.createElement('option');
            option.value = tech.id;
            option.textContent = `${tech.nome} ${tech.cognome} (${tech.ticket_aperti || 0} aperti)`;
            if (currentTicket.assignment && currentTicket.assignment.tecnico_id === tech.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Errore caricamento tecnici:', error);
    }
}

async function loadComments() {
    try {
        const response = await fetch(`/api/comments/ticket/${ticketId}`);
        if (!response.ok) return;
        
        const comments = await response.json();
        document.getElementById('commentCount').textContent = comments.length;
        
        if (comments.length === 0) {
            document.getElementById('commentsList').innerHTML = `
                <p class="no-data"><i class="fas fa-comment-slash"></i> Nessun commento</p>
            `;
            return;
        }
        
        document.getElementById('commentsList').innerHTML = comments.map(c => `
            <div class="comment ${c.visibilita === 'interno' ? 'comment-interno' : ''}">
                <div class="comment-header">
                    <div class="comment-author">
                        <i class="fas fa-user-circle"></i>
                        <strong>${c.nome} ${c.cognome}</strong>
                        <span class="role-badge role-${c.ruolo}">${c.ruolo}</span>
                        ${c.visibilita === 'interno' ? '<span class="badge badge-interno"><i class="fas fa-lock"></i> Interno</span>' : ''}
                    </div>
                    <span class="comment-date">${formatDateTime(c.created_at)}</span>
                </div>
                <div class="comment-body">${escapeHtml(c.testo)}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Errore caricamento commenti:', error);
    }
}

async function loadAttachments() {
    try {
        const response = await fetch(`/api/attachments/ticket/${ticketId}`);
        if (!response.ok) return;
        
        const attachments = await response.json();
        
        if (attachments.length === 0) {
            document.getElementById('attachmentsList').innerHTML = `
                <p class="no-data"><i class="fas fa-paperclip"></i> Nessun allegato</p>
            `;
            return;
        }
        
        document.getElementById('attachmentsList').innerHTML = attachments.map(a => `
            <div class="attachment-item">
                <div class="attachment-icon">
                    ${getFileIcon(a.tipo_file)}
                </div>
                <div class="attachment-info">
                    <a href="${a.percorso}" target="_blank" class="attachment-name">${escapeHtml(a.nome_originale)}</a>
                    <span class="attachment-meta">${formatFileSize(a.dimensione_bytes)} • ${a.nome} ${a.cognome}</span>
                </div>
                <a href="/api/attachments/${a.id}/download" class="btn btn-sm btn-secondary">
                    <i class="fas fa-download"></i>
                </a>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Errore caricamento allegati:', error);
    }
}

async function loadHistory() {
    try {
        const response = await fetch(`/api/tickets/${ticketId}/history`);
        if (!response.ok) return;
        
        const history = await response.json();
        
        if (history.length === 0) {
            document.getElementById('historyList').innerHTML = `
                <p class="no-data">Nessuna attività</p>
            `;
            return;
        }
        
        document.getElementById('historyList').innerHTML = history.map(h => `
            <div class="history-item">
                <div class="history-icon">
                    <i class="fas fa-circle"></i>
                </div>
                <div class="history-content">
                    <div class="history-action">
                        ${h.old_status ? 
                            `<span class="badge badge-stato-${h.old_status}">${formatStato(h.old_status)}</span>
                             <i class="fas fa-arrow-right"></i>` : ''}
                        <span class="badge badge-stato-${h.new_status}">${formatStato(h.new_status)}</span>
                    </div>
                    <div class="history-meta">
                        ${h.nome} ${h.cognome} • ${formatDateTime(h.created_at)}
                    </div>
                    ${h.nota ? `<div class="history-note">${escapeHtml(h.nota)}</div>` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Errore caricamento storico:', error);
    }
}

function setupEventHandlers() {
    // Form commento
    document.getElementById('commentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addComment();
    });
    
    // Upload file
    document.getElementById('fileInput').addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            await uploadFile(e.target.files[0]);
        }
    });
}

async function addComment() {
    const textarea = document.getElementById('commentText');
    const testo = textarea.value.trim();
    const interno = document.getElementById('commentInterno')?.checked;
    
    if (!testo) return;
    
    try {
        const response = await fetch(`/api/comments/ticket/${ticketId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                testo,
                visibilita: interno ? 'interno' : 'pubblico'
            })
        });
        
        if (response.ok) {
            textarea.value = '';
            if (document.getElementById('commentInterno')) {
                document.getElementById('commentInterno').checked = false;
            }
            await loadComments();
        } else {
            const error = await response.json();
            alert(error.error || 'Errore nell\'invio del commento');
        }
        
    } catch (error) {
        console.error('Errore invio commento:', error);
        alert('Errore di connessione');
    }
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`/api/attachments/ticket/${ticketId}`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            document.getElementById('fileInput').value = '';
            await loadAttachments();
        } else {
            const error = await response.json();
            alert(error.error || 'Errore nel caricamento del file');
        }
        
    } catch (error) {
        console.error('Errore upload:', error);
        alert('Errore di connessione');
    }
}

async function updateStatus() {
    const newStatus = document.getElementById('newStatus').value;
    
    if (!newStatus || newStatus === currentTicket.stato) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stato: newStatus })
        });
        
        if (response.ok) {
            await loadTicket();
            await loadHistory();
            alert('Stato aggiornato con successo');
        } else {
            const error = await response.json();
            alert(error.error || 'Errore nell\'aggiornamento dello stato');
        }
        
    } catch (error) {
        console.error('Errore aggiornamento stato:', error);
        alert('Errore di connessione');
    }
}

async function assignTechnician() {
    const tecnicoId = document.getElementById('technicianSelect').value;
    
    if (!tecnicoId) {
        alert('Seleziona un tecnico');
        return;
    }
    
    try {
        const response = await fetch(`/api/assignments/ticket/${ticketId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tecnico_id: tecnicoId })
        });
        
        if (response.ok) {
            await loadTicket();
            await loadHistory();
            alert('Tecnico assegnato con successo');
        } else {
            const error = await response.json();
            alert(error.error || 'Errore nell\'assegnazione');
        }
        
    } catch (error) {
        console.error('Errore assegnazione:', error);
        alert('Errore di connessione');
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
        'critica': '🔴 Critica',
        'alta': '🟠 Alta',
        'media': '🟡 Media',
        'bassa': '🟢 Bassa'
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

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(mimeType) {
    if (!mimeType) return '<i class="fas fa-file"></i>';
    if (mimeType.startsWith('image/')) return '<i class="fas fa-file-image"></i>';
    if (mimeType.includes('pdf')) return '<i class="fas fa-file-pdf"></i>';
    if (mimeType.includes('word')) return '<i class="fas fa-file-word"></i>';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '<i class="fas fa-file-excel"></i>';
    return '<i class="fas fa-file"></i>';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
