const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'fintrust-super-secret-key-123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// --- DATABASE INITIALIZATION ---
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )`);

    // Transactions table
    db.run(`CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account TEXT,
        description TEXT,
        amount REAL,
        date TEXT
    )`);

    // Seed Users
    db.run(`INSERT INTO users (username, password, role) VALUES ('guest', 'guest', 'user')`);
    db.run(`INSERT INTO users (username, password, role) VALUES ('admin', 'plmewyghbnejs', 'admin')`);

    // Seed Transactions - Guest
    const guestTransactions = [
        ['guest', 'SuperMart Retail Purchase', -45.50, '2026-03-01'],
        ['guest', 'BrewHouse Coffee Payment', -5.25, '2026-03-02'],
        ['guest', 'StreamFlix Monthly Subscription', -15.99, '2026-03-05']
    ];
    guestTransactions.forEach(t => {
        db.run(`INSERT INTO transactions (account, description, amount, date) VALUES (?, ?, ?, ?)`, t);
    });

    // Seed Transactions - Admin
    const adminTransactions = [
        ['admin', 'Cloud Infrastructure Payment', -12500.00, '2026-03-01'],
        ['admin', 'External Security Assessment', -5000.00, '2026-03-04'],
        ['admin', 'Confidential Internal Transfer', 25000.00, '2026-03-08'],
        ['admin', 'Mobile Administration System Maintenance (Ref: /admin/vital)', -1200.00, '2026-03-09']
    ];
    adminTransactions.forEach(t => {
        db.run(`INSERT INTO transactions (account, description, amount, date) VALUES (?, ?, ?, ?)`, t);
    });
});

// --- AUTHENTICATION LOGIC ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (row) {
            req.session.user = { id: row.id, username: row.username, role: row.role };
            res.json({ success: true, redirect: '/dashboard' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// --- TRANSACTION API (VULNERABILITY: HPP) ---
app.get('/transactions', (req, res, next) => {
    // If there's no account query, we want to serve the HTML page from the router
    if (!req.query.account) {
        return next();
    }

    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized Access to Secure Ledger' });

    let account = req.query.account;

    // VULNERABILITY: HTTP Parameter Pollution (HPP)
    if (Array.isArray(account)) {
        account = account[account.length - 1];
    }

    // Serve Designed Ledger Page or JSON data
    // Improved check: If it's a fetch/XHR or explicitly asking for JSON, return JSON.
    const isFetch = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'));

    db.all(`SELECT * FROM transactions WHERE account = ?`, [account], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal Cryptographic Database Error' });

        const responseData = {
            status: "SUCCESS",
            ledger_info: {
                account_ref: account.toUpperCase(),
                integrity_check: "VALID",
                timestamp: new Date().toISOString(),
                server_node: "FIN-NODE-04"
            },
            data: rows.map(r => ({
                id: `TXN-${r.id.toString().padStart(5, '0')}`,
                description: r.description,
                value: r.amount,
                settlement_date: r.date,
                method: "DIGITAL_TRANSFER"
            }))
        };

        if (isFetch) {
            return res.json(responseData);
        }

        // Serve the professional HTML ledger directly from server.js
        // Theme updated to match main FinTrust design
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>FinTrust | Secure Audit Ledger</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body style="position: relative;">
                <div class="scan-line"></div>
                <nav>
                    <div class="container nav-content">
                        <div class="brand">
                            <span>FinTrust</span> <span style="font-weight: 300; opacity: 0.8;">Audit Ledger</span>
                        </div>
                        <div class="terminal-text" style="font-size: 0.8rem; color: var(--text-muted);">NODE_AUTH: 0x4F2A</div>
                    </div>
                </nav>

                <main class="container" style="margin-top: 4rem;">
                    <div class="glass-card">
                        <div class="ledger-header">
                            <div>
                                <h1 style="color: var(--primary); letter-spacing: -0.02em;">LEDGER_${account.toUpperCase()}</h1>
                                <p class="terminal-text" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
                                    SYSTEM_TIMESTAMP: ${responseData.ledger_info.timestamp}
                                </p>
                            </div>
                            <div class="audit-badge">Secured Access</div>
                        </div>

                        <table class="transaction-table" style="margin-top: 2rem;">
                            <thead>
                                <tr>
                                    <th>ID_REF</th>
                                    <th>DESCRIPTION</th>
                                    <th style="text-align: right;">AMOUNT_USD</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${responseData.data.map(tx => `
                                    <tr>
                                        <td><span class="terminal-text" style="font-size: 0.75rem; opacity: 0.6;">${tx.id}</span></td>
                                        <td>
                                            <div style="font-weight: 600;">${tx.description}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">METHOD: ${tx.method}</div>
                                        </td>
                                        <td class="${tx.value < 0 ? 'amount-negative' : 'amount-positive'}" style="text-align: right; font-weight: 700; font-family: monospace;">
                                            ${tx.value < 0 ? '-' : '+'}$${Math.abs(tx.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="text-align: center; margin-top: 3rem; color: var(--text-muted); font-size: 0.8rem;">
                        <p>&copy; 2026 FinTrust Banking Corporation | Internal Audit Tool</p>
                    </div>
                </main>
            </body>
            </html>
        `);
    });
});

// --- ADMIN VITAL PAGE (VULNERABILITY: User-Agent Check) ---
app.get('/admin/vital', (req, res) => {
    const userAgent = req.headers['user-agent'];

    if (userAgent === 'Finmobile1.5') {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>FinTrust | Mobile Admin</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: var(--bg-dark);">
                <div class="scan-line"></div>
                <div class="glass-card" style="text-align: center; border-color: var(--primary); max-width: 500px; width: 90%;">
                    <div style="margin-bottom: 2rem;">
                        <h1 style="color: var(--primary); font-size: 1.8rem; margin-bottom: 0.5rem; letter-spacing: -0.02em;">FinTrust Mobile Administration</h1>
                        <div class="audit-badge" style="display: inline-block;">Authorized Mobile Access</div>
                    </div>
                    
                    <div style="background: rgba(14, 165, 233, 0.05); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                        <p class="terminal-text" style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">DECRYPTION_GATEWAY: SUCCESS</p>
                        <p style="font-weight: 600; color: var(--text-main);">Confidential Access Key Retrieved:</p>
                        <div style="font-size: 1.25rem; font-family: 'JetBrains Mono', monospace; margin-top: 1rem; color: var(--accent); background: #000; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--primary);">
                            flag{UXVlX3NlcmFfU2VyYSA=}
                        </div>
                    </div>

                    <p style="color: var(--text-muted); font-size: 0.75rem;">This session is encrypted and logged for security auditing.</p>
                </div>

                <div style="margin-top: 2rem; color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;">
                    Property of FinTrust Banking Corporation
                </div>
            </body>
            </html>
        `);
    } else {
        res.status(403).send('Access restricted to FinTrust Mobile Application. auth:RmlubW9iaWxlMS41');
    }
});

// --- ROUTING ---
const routes = require('./routes/app');
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FinTrust Bank Server running on http://localhost:${PORT}`);
});
