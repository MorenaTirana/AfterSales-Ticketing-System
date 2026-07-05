
-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users
(nome, cognome, email, password_hash, role, telefono)
VALUES

('Admin','Sessa',
'admin@sessamarine.com',
'admin123',
'admin',
'+39 035000000'),

('Francesco','Pinetti',
'francesco@sessamarine.com',
'password',
'aftersales',
'+39 035111111'),

('Maria','Gaudi',
'maria@sessamarine.com',
'password',
'technician',
'+39 035222222'),

('Morena','Tira',
'morena@sessamarine.com',
'password',
'aftersales',
'+39 035333333'),

('Mario','Rossi',
'mario@email.com',
'password',
'customer',
'+39 333111111'),

('Luca','Verdi',
'luca@email.com',
'password',
'customer',
'+39 333222222');
-- ============================================================
-- DEALERS
-- ============================================================

INSERT INTO dealers
(
ragione_sociale,
referente,
email,
telefono,
indirizzo,
citta,
nazione
)

VALUES

(
'Sessa France',
'Sylvain Martin',
'contact@sessafrance.fr',
'+33 123456789',
'23 Route de Valbonne',
'Le Cannet',
'France'
),

(
'Sessa Croatia',
'Lukas Novak',
'info@sessacroatia.hr',
'+385123456',
'Sukosan Marina',
'Sukosan',
'Croatia'
),

(
'Sessa Germany',
'Patrick Muller',
'patrick@sessagermany.de',
'+49 1234567',
'Hamburg Port',
'Hamburg',
'Germany'
);
-- ============================================================
-- BOATS
-- ============================================================

INSERT INTO boats
(
modello,
matricola,
anno_costruzione,
cliente_id,
dealer_id,
note,
current_location,
ormeggio
)

VALUES

(
'KL27',
'KL27-001',
2023,
5,
1,
'Nuova consegna',
'Le Cannet',
'Porto A'
),

(
'C48',
'C48-010',
2024,
6,
2,
'Garanzia attiva',
'Sukosan',
'Molo 4'
);

-- ============================================================
-- TICKETS
-- ============================================================

INSERT INTO tickets
(
codice,
titolo,
descrizione,
tipo,
stato,
priorita,
cliente_id,
boat_id,
dealer_id
)

VALUES

(
'TK0001',
'Rumore passerella',
'Il cliente segnala un rumore durante apertura passerella.',
'warranty',
'aperto',
'alta',
5,
1,
1
),

(
'TK0002',
'Sostituzione pompa AC',
'Richiesta pompa aria condizionata.',
'spare_parts',
'in_attesa_ricambi',
'media',
6,
2,
1
),

(
'TK0003',
'Infiltrazione acqua',
'Entrata acqua dalla finestra laterale.',
'warranty',
'in_analisi',
'critica',
5,
1,
2
),

(
'TK0004',
'Volante rovinato',
'Richiesto volante nuovo.',
'spare_parts',
'chiuso',
'bassa',
6,
2,
1
),

(
'TK0005',
'Vetro laterale rotto',
'Sostituzione vetro murata.',
'warranty',
'risolto',
'alta',
5,
1,
2
);