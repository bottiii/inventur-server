require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// MySQL Verbindung konfigurieren
const connection = mysql.createPool({
    host: "db5016985737.hosting-data.io",
    user: "dbu2322921",
    password: "Uffing11!!",
    database: "dbs13687621",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(cors());
app.use(express.json());

// Alle Produkte abrufen
app.get('/api/products', (req, res) => {
    connection.getConnection((err, conn) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        conn.query(
            'SELECT id, name, category, ve, quantity, price, total, user_id, created_at FROM products',
            (error, results) => {
                conn.release();
                if (error) {
                    res.status(500).json({ error: error.message });
                    return;
                }
                res.json(results);
            }
        );
    });
});

// Neues Produkt erstellen
app.post('/api/products', (req, res) => {
    const { name, category, ve, quantity, price, user_id } = req.body;
    const total = price * quantity;

    const product = {
        name,
        category,
        ve,
        quantity,
        price,
        total,
        user_id,
        created_at: new Date()
    };

    connection.query('INSERT INTO products SET ?', product, (error) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.status(201).json({ message: 'Produkt erstellt' });
    });
});

// Produkt aktualisieren
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, ve, quantity, price, user_id } = req.body;
    const total = price * quantity;

    const product = {
        name,
        category,
        ve,
        quantity,
        price,
        total,
        user_id
    };

    connection.query(
        'UPDATE products SET ? WHERE id = ?',
        [product, id],
        (error) => {
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json({ message: 'Produkt aktualisiert' });
        }
    );
});

// Produkt löschen
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM products WHERE id = ?', id, (error) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ message: 'Produkt gelöscht' });
    });
});

// Test-Endpunkt für Datenbankverbindung
app.get('/api/test', (req, res) => {
    connection.getConnection((err, conn) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            res.status(500).json({ 
                error: err.message,
                connected: false 
            });
            return;
        }

        conn.query('SELECT COUNT(*) as count FROM products', (error, results) => {
            // Verbindung zurück in den Pool geben
            conn.release();
            
            if (error) {
                console.error('Products table error:', error);
                res.status(500).json({ 
                    error: error.message,
                    connected: false 
                });
                return;
            }
            
            res.json({ 
                connected: true,
                productCount: results[0].count,
                message: 'Datenbankverbindung erfolgreich' 
            });
        });
    });
});

// Server starten
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
}); 