-- ============================================================
-- SESSA AFTER SALES MANAGEMENT SYSTEM
-- schema.sql
-- ============================================================

DROP DATABASE IF EXISTS sessa_aftersales;
CREATE DATABASE sessa_aftersales
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sessa_aftersales;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'customer',
        'aftersales',
        'technician',
        'admin') 
        NOT NULL DEFAULT 'customer',
    
    telefono VARCHAR(30),
    ultimo_login TIMESTAMP NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- ============================================================
-- DEALERS
-- ============================================================
CREATE TABLE dealers (
     id INT AUTO_INCREMENT PRIMARY KEY,

    ragione_sociale VARCHAR(150) NOT NULL,
    UNIQUE(ragione_sociale),
    referente VARCHAR(150),
    email VARCHAR(255),
    UNIQUE(email),
    telefono VARCHAR(30),
    indirizzo TEXT,
    citta VARCHAR(100),

    nazione VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_dealers_name (ragione_sociale),
    INDEX idx_dealers_email(email),
    INDEX idx_dealers_country (nazione)
);

-- ============================================================
-- BOATS
-- ============================================================
CREATE TABLE boats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modello VARCHAR(100) NOT NULL,
    matricola VARCHAR(50) NOT NULL UNIQUE,
    anno_costruzione YEAR NOT NULL,
    serial_engine VARCHAR(100),

    cliente_id INT NOT NULL,
    dealer_id INT,
    note TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    current_location VARCHAR(200),
    ormeggio VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_boat_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

        FOREIGN KEY (dealer_id)
        REFERENCES dealers(id)
        ON DELETE SET NULL,

    INDEX idx_boats_cliente (cliente_id),
    INDEX idx_boats_dealer (dealer_id),
    INDEX idx_boats_matricola (matricola)
);

-- ============================================================
-- TICKETS
-- ============================================================
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codice VARCHAR(30) NOT NULL UNIQUE,
    titolo VARCHAR(200) NOT NULL,
    descrizione TEXT NOT NULL,
    dealer_id INT,

    tipo ENUM('warranty','spare_parts') NOT NULL,

    stato ENUM(
        'aperto',
        'in_analisi',
        'in_attesa_ricambi',
        'in_attesa_cliente',
        'intervento_programmato',
        'risolto',
        'chiuso'
    ) NOT NULL DEFAULT 'aperto',

    priorita ENUM(
        'bassa',
        'media',
        'alta',
        'critica'
    ) NOT NULL DEFAULT 'media',

    cliente_id INT NOT NULL,
    boat_id INT NULL,
    
    shipping_address TEXT,
    shipping_contact VARCHAR(150),
    shipping_phone VARCHAR(30),

    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    
    assigned_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,

    CONSTRAINT fk_ticket_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ticket_boat
        FOREIGN KEY (boat_id)
        REFERENCES boats(id)
        ON DELETE SET NULL,
        
        FOREIGN KEY (dealer_id)
        REFERENCES dealers(id)
        ON DELETE SET NULL,

    INDEX idx_tickets_cliente (cliente_id),
    INDEX idx_tickets_boat (boat_id),
    INDEX idx_tickets_stato (stato),
    INDEX idx_tickets_priorita (priorita),
    INDEX idx_tickets_tipo (tipo)
);

-- ============================================================
-- WARRANTY DETAILS
-- ============================================================
CREATE TABLE warranty_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    damaged_part VARCHAR(150),
    damage_type VARCHAR(150),
    causa TEXT,
    responsabilita ENUM(
        'produzione',
        'fornitore',
        'trasporto',
        'installazione',
        'cliente',
        'da_definire'
    ) DEFAULT 'da_definire',
    soluzione TEXT,
    costo_stimato DECIMAL(10,2),
    
    approved_by INT,
    approved_at TIMESTAMP,
    approved_note TEXT,
    approved BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    FOREIGN KEY (approved_by)
         REFERENCES users(id)
         ON DELETE SET NULL
);

-- ============================================================
-- SPARE PARTS DETAILS
-- ============================================================
CREATE TABLE spare_parts_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    article_code VARCHAR(50),
    article_description VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    costo_unitario DECIMAL(10,2),
    costo_totale DECIMAL(10,2),
    lead_time_days INT,
    fornitore VARCHAR(150),
    
    delivery_date DATE,
    received_date DATE,

    tracking_number VARCHAR(100),
    supplier_order VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE
);

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    assigned_by INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE ticket_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    testo TEXT NOT NULL,
    visibility ENUM(
        'public',
        'internal'
    )
        NOT NULL DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    nome_originale VARCHAR(255),
    nome_file VARCHAR(255),
    percorso VARCHAR(500),
    tipo_file VARCHAR(100),
    descrizione TEXT,

    mime_type VARCHAR(100),

    dimensione_bytes BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- STATUS HISTORY
-- ============================================================
CREATE TABLE status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    nota TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_status_ticket(ticket_id),

    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    percorso VARCHAR(500),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categoria VARCHAR(100),

    FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    FOREIGN KEY (uploaded_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- ============================================================
-- TRASFERTE
-- ============================================================
CREATE TABLE transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    luogo VARCHAR(200),
    data_intervento DATE,
    ora_inizio TIME,
    ora_fine TIME,

    stato ENUM(
        'programmata',
        'in_corso',
        'completata',
        'annullata'
    ) DEFAULT 'programmata',
    note TEXT,
    
    completed_at TIMESTAMP NULL,

    FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    FOREIGN KEY (tecnico_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);