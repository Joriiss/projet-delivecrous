# Module 2 : Service Client - DeliveCROUS

API REST pour la gestion des tickets et messages de support client avec authentification JWT, recherche full-text, WebSockets et documentation Swagger.

## 🚀 Fonctionnalités

- **Authentification JWT** : Access tokens et refresh tokens
- **CRUD Tickets** : Création, lecture, mise à jour, suppression de tickets
- **CRUD Messages** : Gestion des messages associés aux tickets
- **Recherche full-text** : Recherche avancée dans les tickets (titre, description, tags)
- **Pagination** : Pagination standardisée sur toutes les listes
- **WebSockets** : Notifications temps réel pour les nouveaux tickets et messages
- **Validation** : Validation des données avec Joi
- **Rate Limiting** : Protection contre les abus
- **Documentation Swagger** : API documentée avec Swagger/OpenAPI
- **Tests** : Suite de tests avec Jest et Supertest

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (local ou distant)
- npm ou yarn

## 🔧 Installation

1. **Cloner le projet** (si applicable) ou naviguer dans le dossier :
```bash
cd service-client
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :
Créez un fichier `.env` à la racine du projet :
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/service-client
JWT_SECRET=jwt-secret-key
JWT_REFRESH_SECRET=jwt-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

4. **Démarrer MongoDB** (si local) :
```bash
# Sur Windows
mongod

# Sur Linux/Mac
sudo systemctl start mongod
```

5. **Lancer l'application** :
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:3000`

6. **Peupler la base de données (optionnel)** :
```bash
# Ajouter des données de test sans supprimer les données existantes
npm run seed

# Supprimer toutes les données existantes et ajouter de nouvelles données
npm run seed:clear
```

Le script de seed crée :
- 5 utilisateurs (1 admin, 1 support, 3 users)
- 8 tickets avec différents statuts et priorités
- 13 messages associés aux tickets

**Comptes de test créés :**
- Admin: `admin@delivecrous.com` / `admin123`
- Support: `support@delivecrous.com` / `support123`
- User 1: `john.doe@example.com` / `user123`
- User 2: `jane.smith@example.com` / `user123`
- User 3: `bob.martin@example.com` / `user123`

## 📚 Documentation API

Une fois l'application démarrée, accédez à la documentation Swagger :
- **URL** : http://localhost:3000/api-docs

## 🔐 Authentification

### Inscription
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "user" // optionnel: user, admin, support
}
```

### Connexion
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Utiliser le token
Ajoutez le header suivant à vos requêtes :
```
Authorization: Bearer <accessToken>
```

### Rafraîchir le token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

## 📝 Endpoints Principaux

### Tickets

#### Lister les tickets
```bash
GET /tickets?page=1&limit=10&status=open&priority=high
Authorization: Bearer <token>
```

#### Créer un ticket
```bash
POST /tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Problème de connexion",
  "description": "Je n'arrive pas à me connecter à mon compte",
  "priority": "high",
  "tags": ["connexion", "urgent"]
}
```

#### Rechercher des tickets
```bash
GET /tickets/search?q=connexion&page=1&limit=10
Authorization: Bearer <token>
```

#### Obtenir un ticket
```bash
GET /tickets/:id
Authorization: Bearer <token>
```

#### Mettre à jour un ticket
```bash
PUT /tickets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress",
  "assignedTo": "<userId>"
}
```

#### Supprimer un ticket
```bash
DELETE /tickets/:id
Authorization: Bearer <token>
```

### Messages

#### Lister les messages d'un ticket
```bash
GET /messages/tickets/:ticketId/messages?page=1&limit=10
Authorization: Bearer <token>
```

#### Créer un message
```bash
POST /messages/tickets/:ticketId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "J'ai résolu le problème, pouvez-vous confirmer ?"
}
```

#### Mettre à jour un message
```bash
PUT /messages/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Message modifié"
}
```

#### Supprimer un message
```bash
DELETE /messages/:id
Authorization: Bearer <token>
```

## 🔌 WebSockets

L'API utilise Socket.io pour les notifications temps réel.

### Connexion
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected');
});
```

### Rejoindre une room de ticket
```javascript
socket.emit('join:ticket', ticketId);
```

### Écouter les événements
```javascript
// Nouveau ticket créé
socket.on('ticket:created', (ticket) => {
  console.log('New ticket:', ticket);
});

// Ticket mis à jour
socket.on('ticket:updated', (ticket) => {
  console.log('Ticket updated:', ticket);
});

// Nouveau message
socket.on('message:created', (message) => {
  console.log('New message:', message);
});
```

## 🧪 Tests

Exécuter les tests :
```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch
```

Les tests couvrent :
- Authentification (register, login, refresh)
- CRUD Tickets
- CRUD Messages
- Validation des données
- Permissions et autorisations

## 🏗️ Architecture

```
service-client/
├── src/
│   ├── models/          # Modèles Mongoose (User, Ticket, Message)
│   ├── routes/          # Définition des routes
│   ├── controllers/     # Logique métier
│   ├── middleware/      # Middlewares (auth, validation, rate limiting)
│   ├── utils/           # Utilitaires (JWT, pagination, search)
│   ├── config/          # Configuration (DB, Swagger)
│   ├── tests/           # Tests Jest
│   └── app.js           # Application Express principale
├── .env                 # Variables d'environnement
├── package.json
└── README.md
```

## 🔒 Sécurité

- **JWT** : Tokens signés pour l'authentification
- **Bcrypt** : Hashage des mots de passe
- **Rate Limiting** : Protection contre les attaques par force brute
  - Auth endpoints : 5 requêtes / 15 minutes
  - Autres endpoints : 100 requêtes / 15 minutes
- **Validation** : Validation stricte des données d'entrée avec Joi
- **CORS** : Configuration CORS pour les requêtes cross-origin

## 📊 Base de données

### Modèles

#### User
- `email` (unique, required)
- `password` (hashé)
- `role` (user, admin, support)

#### Ticket
- `title` (required, max 200 chars)
- `description` (required)
- `status` (open, in-progress, closed)
- `priority` (low, medium, high, urgent)
- `createdBy` (ref User)
- `assignedTo` (ref User, optional)
- `tags` (array)
- **Index text** : title, description, tags (recherche full-text)

#### Message
- `content` (required)
- `ticketId` (ref Ticket)
- `authorId` (ref User)

## 🚦 Rate Limiting

- **Endpoints d'authentification** : 5 requêtes par 15 minutes
- **Autres endpoints** : 100 requêtes par 15 minutes

## 📈 Pagination

Toutes les listes utilisent une pagination standardisée :

```json
{
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5,
  "data": [...]
}
```

## 🔍 Recherche Full-Text

La recherche utilise les index text MongoDB natifs sur les champs :
- `title`
- `description`
- `tags`

Les résultats sont triés par pertinence.

## 🛠️ Technologies

- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Authentification
- **Socket.io** : WebSockets
- **Joi** : Validation
- **Swagger** : Documentation API
- **Jest** : Framework de tests
- **Supertest** : Tests HTTP

## 📝 Notes

- Les mots de passe sont hashés avec bcrypt avant stockage
- Les tokens JWT expirent après 15 minutes (access) et 7 jours (refresh)
- Les tickets peuvent être assignés à un utilisateur (support/admin)
- Les messages sont liés à un ticket et un auteur
- Les notifications WebSocket sont émises pour les événements importants

