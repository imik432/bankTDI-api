require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json()); // Middleware pour parser le JSON

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

// Route pour récupérer tous les comptes
app.get('/getAllAccounts', (req, res) => {
    db.query('SELECT * FROM Account', (err, results) => {
        if (err) {
            res.status(500).json({ error: "Erreur lors de la récupération des comptes" });
        } else {
            res.json(results);
        }
    });
});

// Route pour récupérer un compte spécifique par numéro
app.get('/getAccount/:numero', (req, res) => {
    const numero = req.params.numero;
    db.query('SELECT * FROM Account WHERE numero = ?', [numero], (err, results) => {
        if (err) {
            res.status(500).json({ error: "Erreur lors de la récupération du compte" });
        } else {
            res.json(results.length > 0 ? results[0] : null);
        }
    });
});

// Route pour ajouter un compte
app.post('/addAccount', (req, res) => {
    const { numero, account_type, balance, currency, image } = req.body;
    db.query('INSERT INTO Account (numero, account_type, balance, currency, image) VALUES (?, ?, ?, ?, ?)',
        [numero, account_type, balance, currency, image], (err, results) => {
            if (err) {
                res.status(500).json({ error: "Erreur lors de l'ajout du compte" });
            } else {
                res.json({ message: "Compte ajouté avec succès", numero });
            }
        });
});

// Route pour mettre à jour un compte
app.put('/updateAccount/:numero', (req, res) => {
    const numero = req.params.numero;
    const { account_type, balance, currency, image } = req.body;
    db.query('UPDATE Account SET account_type = ?, balance = ?, currency = ?, image = ? WHERE numero = ?',
        [account_type, balance, currency, image, numero], (err, results) => {
            if (err) {
                res.status(500).json({ error: "Erreur lors de la mise à jour du compte" });
            } else if (results.affectedRows === 0) {
                res.status(404).json({ error: "Compte non trouvé" });
            } else {
                res.json({ message: "Compte mis à jour avec succès", numero });
            }
        });
});

// Route pour fermer un compte (supprimer par numéro)
app.delete('/closeAccount/:numero', (req, res) => {
    const numero = req.params.numero;
    db.query('DELETE FROM Account WHERE numero = ?', [numero], (err, results) => {
        if (err) {
            res.status(500).json({ error: "Erreur lors de la suppression du compte" });
        } else {
            res.json({ message: `Opération réussie, compte ${numero} fermé` });
        }
    });
});

// Lancer le serveur
app.listen(port, () => {
    // console.log(`Serveur en écoute sur http://localhost:${port}`);
});
// Pour écouter sur toutes les adresses
app.listen(port, '192.168.68.50', () => {
    console.log(`Serveur en écoute sur http://192.168.68.50:${port}`);
});