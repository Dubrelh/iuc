// api/actualiter.js

const { Client } = require('pg');

// ------------------------------------------------------------------
// 🔑 Configuration de la Connexion PostgreSQL (Client DB)
// ------------------------------------------------------------------
const dbConfig = {
    // Vercel lira SUPABASE_POSTGRES_URI depuis ses variables d'environnement
    connectionString: process.env.SUPABASE_POSTGRES_URI, 
    
    // Crucial pour Supabase : Ignorer le rejet des certificats SSL
    ssl: {
        rejectUnauthorized: false,
    },
    
    // Forcer l'IPv4 pour résoudre l'erreur ENETUNREACH
    family: 4, 
};

/**
 * Exécute une requête SQL avec le client pg.
 * @param {string} sqlQuery - La requête SQL à exécuter.
 * @param {Array} params - Les paramètres pour sécuriser la requête.
 */
async function executeQuery(sqlQuery, params = []) {
    const client = new Client(dbConfig); 
    try {
        await client.connect(); 
        const result = await client.query(sqlQuery, params);
        return result;
    } catch (err) {
        console.error("Erreur de base de données:", err.message);
        throw new Error(`DB Error: ${err.message}`);
    } finally {
        // ESSENTIEL pour Serverless: fermer la connexion après chaque requête.
        if (client) {
            await client.end(); 
        }
    }
}

/**
 * Fonction Serverless principale (exportée par Vercel)
 * @param {object} req - Objet requête HTTP
 * @param {object} res - Objet réponse HTTP
 */
module.exports = async (req, res) => {
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Configuration des Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gestion des requêtes OPTIONS (Pré-vol CORS)
    if (req.method === 'OPTIONS') {
        res.status(204).end(); // Utilisez res.status().end() pour Vercel
        return;
    }

    try {
        let result;

        switch (req.method) {
            case 'GET': {
                // ------------------ READ (Récupérer) ------------------
                const id = url.searchParams.get('id');
                let sql = 'SELECT id, titre, description, photo, date_pub FROM actualiter';
                let params = [];
                
                if (id) {
                    sql += ' WHERE id = $1';
                    params.push(id);
                } else {
                    sql += ' ORDER BY date_pub DESC';
                }
                
                result = await executeQuery(sql, params);
                
                res.status(200).json(result.rows); // Utilisation de res.status().json() pour Vercel
                break;
            }

            case 'POST': {
                // ------------------ CREATE (Créer) ------------------
                const body = req.body; // Vercel parse souvent le body automatiquement
                const { titre, description, photo } = body || {};
                
                if (!titre || !description) {
                    res.status(400); throw new Error('Titre et description sont requis.');
                }

                const sqlCreate = `
                    INSERT INTO actualiter (titre, description, photo)
                    VALUES ($1, $2, $3)
                    RETURNING id, titre, date_pub;
                `;
                result = await executeQuery(sqlCreate, [titre, description, photo || null]); 

                res.status(201).json({ 
                    message: 'Actualité créée avec succès.', 
                    actualite: result.rows[0] 
                });
                break;
            }
            
            case 'DELETE': {
                // ------------------ DELETE (Supprimer) ------------------
                const deleteId = url.searchParams.get('id'); 
                if (!deleteId) {
                    res.status(400); throw new Error('ID manquant pour la suppression.');
                }
                
                const sqlDelete = 'DELETE FROM actualiter WHERE id = $1 RETURNING id;';
                result = await executeQuery(sqlDelete, [deleteId]);

                if (result.rowCount === 0) {
                    res.status(404).json({ message: `Actualité avec ID ${deleteId} non trouvée.` });
                } else {
                    res.status(200).json({ message: `Actualité supprimée.`, deletedId: result.rows[0].id });
                }
                break;
            }

            default:
                res.status(405).json({ message: `Méthode ${req.method} non supportée.` });
        }

    } catch (err) {
        // Gestion des erreurs
        const statusCode = res.statusCode && res.statusCode < 500 ? res.statusCode : 500;
        res.status(statusCode).json({ 
            error: 'Erreur Serveur Interne', 
            details: err.message
        });
    }
};