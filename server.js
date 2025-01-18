require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// MySQL Pool konfigurieren
const pool = mysql.createPool({
    host: "db5016985737.hosting-data.io",
    user: "dbu2322921",
    password: "Maximilian21!!",
    database: "dbs13687621",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
        rejectUnauthorized: false
    },
    connectTimeout: 60000,
    multipleStatements: true,
    debug: true
}).promise();  // Wichtig: Promise-Wrapper für den Pool

// Middleware
app.use(cors());
app.use(express.json());

// Funktion zum Testen der Datenbankverbindung
async function testConnection() {
    try {
        console.log('Versuche Verbindung herzustellen...');
        const connection = await pool.getConnection();
        console.log('Verbindung hergestellt');
        
        // Einfache Test-Query
        const [result] = await connection.query('SELECT 1');
        console.log('Query erfolgreich:', result);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('Detaillierter Verbindungsfehler:', error);
        // Stack Trace ausgeben
        console.error(error.stack);
        return false;
    }
}

// Test-Endpunkt mit Verbindungstest
app.get('/api/test', async (req, res) => {
    try {
        const isConnected = await testConnection();
        if (!isConnected) {
            res.status(500).json({ 
                error: "Database connection failed",
                connected: false 
            });
            return;
        }

        const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
        res.json({ 
            connected: true,
            productCount: rows[0].count,
            message: 'Datenbankverbindung erfolgreich' 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: error.message,
            connected: false 
        });
    }
});

// Alle Produkte abrufen
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, category, ve, quantity, price, total, user_id, created_at FROM products'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neues Produkt erstellen
app.post('/api/products', async (req, res) => {
    try {
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

        await pool.query('INSERT INTO products SET ?', [product]);
        res.status(201).json({ message: 'Produkt erstellt' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Produkt aktualisieren
app.put('/api/products/:id', async (req, res) => {
    try {
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

        await pool.query('UPDATE products SET ? WHERE id = ?', [product, id]);
        res.json({ message: 'Produkt aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Produkt löschen
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Produkt gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Server starten
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
    console.log(`Server läuft auf Port ${PORT}`);
    const isConnected = await testConnection();
    console.log(`Datenbankverbindung: ${isConnected ? 'erfolgreich' : 'fehlgeschlagen'}`);
}); 