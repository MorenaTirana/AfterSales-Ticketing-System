// server/controllers/ticketController.js

const db = require('../db');

// Genera codice ticket univoco
const generateTicketCode = async (tipo) => {
    const prefix = tipo === 'warranty' ? 'WIR' : 'SPR';
    const year = new Date().getFullYear();
    
    const [rows] = await db.execute(
        `SELECT codice FROM tickets 
         WHERE codice LIKE ? 
         ORDER BY id DESC LIMIT 1`,
        [`${prefix}-${year}-%`]
    );
    
    let nextNumber = 1;
    if (rows.length > 0) {
        const lastCode = rows[0].codice;
        const lastNumber = parseInt(lastCode.split('-')[2]);
        nextNumber = lastNumber + 1;
    }
    
    return `${prefix}-${year}-${String(nextNumber).padStart(3, '0')}`;
};

// GET /api/tickets - Lista ticket (filtrata per ruolo)
const getTickets = async (req, res) => {
    try {
        const user = req.session.user;
        const { stato, priorita, tipo, tecnico_id, cliente_id } = req.query;
        
        let query = `
            SELECT t.*,
                   u.nome AS cliente_nome,
                   u.cognome AS cliente_cognome,
                   u.email AS cliente_email,
                   b.modello AS boat_modello,
                   b.matricola AS boat_matricola,
                   tech.id AS tecnico_id,
                   tech.nome AS tecnico_nome,
                   tech.cognome AS tecnico_cognome
            FROM tickets t
            LEFT JOIN users u ON t.cliente_id = u.id
            LEFT JOIN boats b ON t.boat_id = b.id
            LEFT JOIN assignments a ON t.id = a.ticket_id AND a.attiva = TRUE
            LEFT JOIN users tech ON a.tecnico_id = tech.id
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtro per ruolo
        if (user.ruolo === 'cliente') {
            query += ' AND t.cliente_id = ?';
            params.push(user.id);
        } else if (user.ruolo === 'tecnico') {
            query += ' AND a.tecnico_id = ?';
            params.push(user.id);
        }
        
        // Filtri opzionali
        if (stato) {
            query += ' AND t.stato = ?';
            params.push(stato);
        }
        
        if (priorita) {
            query += ' AND t.priorita = ?';
            params.push(priorita);
        }
        
        if (tipo) {
            query += ' AND t.tipo = ?';
            params.push(tipo);
        }
        
        if (tecnico_id && user.ruolo !== 'tecnico') {
            query += ' AND a.tecnico_id = ?';
            params.push(tecnico_id);
        }
        
        if (cliente_id && user.ruolo !== 'cliente') {
            query += ' AND t.cliente_id = ?';
            params.push(cliente_id);
        }
        
        query += ' ORDER BY t.created_at DESC';
        
        const [tickets] = await db.execute(query, params);
        res.json(tickets);
        
    } catch (error) {
        console.error('Errore getTickets:', error);
        res.status(500).json({ error: 'Errore nel recupero dei ticket' });
    }
};

// GET /api/tickets/:id - Dettaglio singolo ticket
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.session.user;
        
        const [tickets] = await db.execute(`
            SELECT t.*,
                   u.nome AS cliente_nome,
                   u.cognome AS cliente_cognome,
                   u.email AS cliente_email,
                   b.modello AS boat_modello,
                   b.matricola AS boat_matricola,
                   b.anno_costruzione AS boat_anno,
                   b.dealer AS boat_dealer,
                   b.location AS boat_location
            FROM tickets t
            LEFT JOIN users u ON t.cliente_id = u.id
            LEFT JOIN boats b ON t.boat_id = b.id
            WHERE t.id = ?
        `, [id]);
        
        if (tickets.length === 0) {
            return res.status(404).json({ error: 'Ticket non trovato' });
        }
        
        const ticket = tickets[0];
        
        // Verifica accesso
        if (user.ruolo === 'cliente' && ticket.cliente_id !== user.id) {
            return res.status(403).json({ error: 'Accesso negato' });
        }
        
        // Per tecnici, verifica che sia assegnato a loro
        if (user.ruolo === 'tecnico') {
            const [assignments] = await db.execute(
                'SELECT id FROM assignments WHERE ticket_id = ? AND tecnico_id = ? AND attiva = TRUE',
                [id, user.id]
            );
            if (assignments.length === 0) {
                return res.status(403).json({ error: 'Accesso negato' });
            }
        }
        
        // Carica dettagli specifici per tipo
        if (ticket.tipo === 'warranty') {
            const [details] = await db.execute(
                'SELECT * FROM warranty_details WHERE ticket_id = ?',
                [id]
            );
            ticket.warranty_details = details[0] || null;
        } else {
            const [details] = await db.execute(
                'SELECT * FROM spare_parts_details WHERE ticket_id = ?',
                [id]
            );
            ticket.spare_parts_details = details[0] || null;
        }
        
        // Carica assegnazione attiva
        const [assignments] = await db.execute(`
            SELECT a.*, 
                   u.nome AS tecnico_nome, 
                   u.cognome AS tecnico_cognome,
                   u.email AS tecnico_email,
                   assigner.nome AS assigned_by_nome,
                   assigner.cognome AS assigned_by_cognome
            FROM assignments a
            JOIN users u ON a.tecnico_id = u.id
            JOIN users assigner ON a.assigned_by = assigner.id
            WHERE a.ticket_id = ? AND a.attiva = TRUE
        `, [id]);
        
        ticket.assignment = assignments[0] || null;
        
        res.json(ticket);
        
    } catch (error) {
        console.error('Errore getTicketById:', error);
        res.status(500).json({ error: 'Errore nel recupero del ticket' });
    }
};

// POST /api/tickets - Crea nuovo ticket
const createTicket = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const user = req.session.user;
        const {
            titolo,
            descrizione,
            tipo,
            priorita = 'media',
            boat_id,
            // Campi warranty
            damaged_part,
            damage_type,
            causa,
            // Campi spare parts
            article_code,
            article_description,
            quantity
        } = req.body;
        
        // Validazione base
        if (!titolo || !descrizione || !tipo) {
            return res.status(400).json({
                error: 'Titolo, descrizione e tipo sono obbligatori'
            });
        }
        
        if (!['warranty', 'spare_parts'].includes(tipo)) {
            return res.status(400).json({
                error: 'Tipo ticket non valido'
            });
        }
        
        // Verifica boat_id se fornito
        if (boat_id) {
            const [boats] = await connection.execute(
                'SELECT id FROM boats WHERE id = ? AND cliente_id = ?',
                [boat_id, user.id]
            );
            if (boats.length === 0 && user.ruolo === 'cliente') {
                return res.status(400).json({
                    error: 'Barca non trovata o non di proprietà'
                });
            }
        }
        
        const codice = await generateTicketCode(tipo);
        
        // Inserisci ticket principale
        const [result] = await connection.execute(`
            INSERT INTO tickets (codice, titolo, descrizione, tipo, priorita, cliente_id, boat_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [codice, titolo, descrizione, tipo, priorita, user.id, boat_id || null]);
        
        const ticketId = result.insertId;
        
        // Inserisci dettagli specifici
        if (tipo === 'warranty') {
            await connection.execute(`
                INSERT INTO warranty_details (ticket_id, damaged_part, damage_type, causa)
                VALUES (?, ?, ?, ?)
            `, [ticketId, damaged_part || null, damage_type || null, causa || null]);
        } else {
            await connection.execute(`
                INSERT INTO spare_parts_details (ticket_id, article_code, article_description, quantity)
                VALUES (?, ?, ?, ?)
            `, [ticketId, article_code || null, article_description || null, quantity || 1]);
        }
        
        // Registra nello storico
        await connection.execute(`
            INSERT INTO status_history (ticket_id, old_status, new_status, changed_by, nota)
            VALUES (?, NULL, 'aperto', ?, 'Ticket creato')
        `, [ticketId, user.id]);
        
        await connection.commit();
        
        res.status(201).json({
            message: 'Ticket creato con successo',
            ticketId,
            codice
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Errore createTicket:', error);
        res.status(500).json({ error: 'Errore nella creazione del ticket' });
    } finally {
        connection.release();
    }
};

// PUT /api/tickets/:id - Aggiorna ticket
const updateTicket = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const user = req.session.user;
        
        // Verifica esistenza
        const [tickets] = await connection.execute(
            'SELECT tipo, stato, cliente_id FROM tickets WHERE id = ?',
            [id]
        );
        
        if (tickets.length === 0) {
            return res.status(404).json({ error: 'Ticket non trovato' });
        }
        
        const ticket = tickets[0];
        
        // Cliente può modificare solo i propri ticket aperti
        if (user.ruolo === 'cliente') {
            if (ticket.cliente_id !== user.id) {
                return res.status(403).json({ error: 'Non autorizzato' });
            }
            if (ticket.stato !== 'aperto') {
                return res.status(400).json({
                    error: 'Puoi modificare solo ticket aperti'
                });
            }
        }
        
        const { titolo, descrizione, priorita } = req.body;
        
        // Aggiorna campi base
        const updates = [];
        const params = [];
        
        if (titolo) {
            updates.push('titolo = ?');
            params.push(titolo);
        }
        if (descrizione) {
            updates.push('descrizione = ?');
            params.push(descrizione);
        }
        if (priorita && user.ruolo !== 'cliente') {
            updates.push('priorita = ?');
            params.push(priorita);
        }
        
        if (updates.length > 0) {
            params.push(id);
            await connection.execute(
                `UPDATE tickets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                params
            );
        }
        
        // Aggiorna dettagli specifici (solo staff)
        if (user.ruolo !== 'cliente') {
            if (ticket.tipo === 'warranty') {
                const { damaged_part, damage_type, causa, responsabilita, soluzione, costo_stimato } = req.body;
                
                await connection.execute(`
                    UPDATE warranty_details
                    SET damaged_part = COALESCE(?, damaged_part),
                        damage_type = COALESCE(?, damage_type),
                        causa = COALESCE(?, causa),
                        responsabilita = COALESCE(?, responsabilita),
                        soluzione = COALESCE(?, soluzione),
                        costo_stimato = COALESCE(?, costo_stimato),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = ?
                `, [damaged_part, damage_type, causa, responsabilita, soluzione, costo_stimato, id]);
            } else {
                const { article_code, article_description, quantity, costo_unitario, costo_totale, lead_time_days, fornitore } = req.body;
                
                await connection.execute(`
                    UPDATE spare_parts_details
                    SET article_code = COALESCE(?, article_code),
                        article_description = COALESCE(?, article_description),
                        quantity = COALESCE(?, quantity),
                        costo_unitario = COALESCE(?, costo_unitario),
                        costo_totale = COALESCE(?, costo_totale),
                        lead_time_days = COALESCE(?, lead_time_days),
                        fornitore = COALESCE(?, fornitore),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = ?
                `, [article_code, article_description, quantity, costo_unitario, costo_totale, lead_time_days, fornitore, id]);
            }
        }
        
        await connection.commit();
        res.json({ message: 'Ticket aggiornato con successo' });
        
    } catch (error) {
        await connection.rollback();
        console.error('Errore updateTicket:', error);
        res.status(500).json({ error: 'Errore nell\'aggiornamento del ticket' });
    } finally {
        connection.release();
    }
};

// PATCH /api/tickets/:id/status - Aggiorna stato ticket
const updateTicketStatus = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        const { stato, nota } = req.body;
        const user = req.session.user;
        
        const validStates = [
            'aperto', 'in_analisi', 'in_attesa_ricambi', 
            'in_attesa_cliente', 'intervento_programmato', 
            'risolto', 'chiuso'
        ];
        
        if (!validStates.includes(stato)) {
            return res.status(400).json({ error: 'Stato non valido' });
        }
        
        // Verifica esistenza e stato attuale
        const [tickets] = await connection.execute(
            'SELECT stato, cliente_id FROM tickets WHERE id = ?',
            [id]
        );
        
        if (tickets.length === 0) {
            return res.status(404).json({ error: 'Ticket non trovato' });
        }
        
        const oldStatus = tickets[0].stato;
        
        // Verifica già nello stesso stato
        if (oldStatus === stato) {
            return res.status(400).json({ error: 'Il ticket è già in questo stato' });
        }
        
        // Solo staff può cambiare stato (eccetto chiusura da parte del cliente)
        if (user.ruolo === 'cliente') {
            if (stato !== 'chiuso' || tickets[0].cliente_id !== user.id) {
                return res.status(403).json({ error: 'Non autorizzato a cambiare stato' });
            }
            // Cliente può chiudere solo se risolto
            if (oldStatus !== 'risolto') {
                return res.status(400).json({ 
                    error: 'Puoi chiudere solo ticket già risolti' 
                });
            }
        }
        
        // Aggiorna stato
        const updateFields = ['stato = ?', 'updated_at = CURRENT_TIMESTAMP'];
        const updateParams = [stato];
        
        if (stato === 'chiuso') {
            updateFields.push('closed_at = CURRENT_TIMESTAMP');
        }
        
        await connection.execute(
            `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`,
            [...updateParams, id]
        );
        
        // Registra nello storico
        await connection.execute(`
            INSERT INTO status_history (ticket_id, old_status, new_status, changed_by, nota)
            VALUES (?, ?, ?, ?, ?)
        `, [id, oldStatus, stato, user.id, nota || null]);
        
        await connection.commit();
        
        res.json({ 
            message: 'Stato aggiornato con successo', 
            oldStatus, 
            newStatus: stato 
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Errore updateTicketStatus:', error);
        res.status(500).json({ error: 'Errore nell\'aggiornamento dello stato' });
    } finally {
        connection.release();
    }
};

// DELETE /api/tickets/:id - Elimina ticket (solo admin)
const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.session.user;
        
        if (user.ruolo !== 'admin') {
            return res.status(403).json({ error: 'Solo gli admin possono eliminare ticket' });
        }
        
        const [result] = await db.execute('DELETE FROM tickets WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket non trovato' });
        }
        
        res.json({ message: 'Ticket eliminato con successo' });
        
    } catch (error) {
        console.error('Errore deleteTicket:', error);
        res.status(500).json({ error: 'Errore nell\'eliminazione del ticket' });
    }
};

// GET /api/tickets/:id/history - Storico stati ticket
const getTicketHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [history] = await db.execute(`
            SELECT sh.*, 
                   u.nome, 
                   u.cognome,
                   u.ruolo
            FROM status_history sh
            JOIN users u ON sh.changed_by = u.id
            WHERE sh.ticket_id = ?
            ORDER BY sh.created_at DESC
        `, [id]);
        
        res.json(history);
        
    } catch (error) {
        console.error('Errore getTicketHistory:', error);
        res.status(500).json({ error: 'Errore nel recupero dello storico' });
    }
};

// GET /api/boats - Lista barche dell'utente
const getUserBoats = async (req, res) => {
    try {
        const user = req.session.user;
        
        let query = 'SELECT * FROM boats';
        const params = [];
        
        if (user.ruolo === 'cliente') {
            query += ' WHERE cliente_id = ?';
            params.push(user.id);
        }
        
        query += ' ORDER BY modello, matricola';
        
        const [boats] = await db.execute(query, params);
        res.json(boats);
        
    } catch (error) {
        console.error('Errore getUserBoats:', error);
        res.status(500).json({ error: 'Errore nel recupero delle barche' });
    }
};

module.exports = {
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    updateTicketStatus,
    deleteTicket,
    getTicketHistory,
    getUserBoats
};
