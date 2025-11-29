// Importer les dépendances
const http = require('http');
const { Pool } = require('pg');

// Définir les variables de configuration
const config = {
  user: 'votre_utilisateur',
  host: 'votre_hôte',
  database: 'votre_base_de_données',
  password: 'votre_mot_de_passe',
  port: 5432,
};

// Créer un pool de connexions à la base de données
const pool = new Pool(config);

// Définir une variable globale de requête
let query = 'SELECT * FROM votre_table';

// Créer un serveur HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/requete' && req.method === 'GET') {
    // Exécuter la requête
    pool.query(query, (err, result) => {
      if (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erreur lors de l\'exécution de la requête');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
      }
    });
  } else if (req.url === '/requete' && req.method === 'PUT') {
                                       

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        query = data.query;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Variable de requête modifiée');
      } catch (err) {
        console.error(err);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Erreur lors de la modification de la variable de requête');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page non trouvée');
  }
});

// Démarrer le serveur
const port = 3000;
server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});