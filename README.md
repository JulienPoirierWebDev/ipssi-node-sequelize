# ipssi-node-sequelize

API Node.js avec Express, Sequelize, authentification JWT et gestion de deux ressources principales :

- `Character`
- `User`

Le projet permet de :

- creer, lire, modifier et supprimer des personnages
- inscrire et connecter des utilisateurs
- proteger certaines routes avec un token JWT
- peupler la table `Characters` avec des seeders Sequelize

## Stack

- Node.js
- Express
- Sequelize
- MySQL en environnement `DEV`
- PostgreSQL en environnement `PROD`
- JWT
- bcrypt
- cookie-parser
- sequelize-cli

## Structure du projet

```text
.
├── config/
│   └── config.js
├── seeders/
│   └── 20260317120000-create-characters.js
├── src/
│   ├── controllers/
│   │   ├── characterController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── isAdmin.js
│   │   └── verifyTokenJwt.js
│   ├── models/
│   │   ├── characterModel.js
│   │   └── userModel.js
│   ├── routers/
│   │   ├── characterRouter.js
│   │   └── userRouter.js
│   ├── db.js
│   └── server.js
└── .sequelizerc
```

## Installation

Installer les dependances :

```bash
npm install
```

Lancer le serveur en developpement :

```bash
npm run dev
```

## Variables d'environnement

Exemple de fichier `.env` :

```env
PORT=3000
DB_DEV="mysql://root@localhost:3306/sequelize_characters"
DB_PROD="postgresql://user:password@host:5432/database"
ENV="DEV"
SALT=10
JWT_SECRET="Ceci est un secret"
```

### Signification

- `PORT` : port du serveur Express
- `DB_DEV` : URL de connexion MySQL utilisee en developpement
- `DB_PROD` : URL de connexion PostgreSQL utilisee en production
- `ENV` : `DEV` pour MySQL local, autre valeur pour utiliser la config production
- `SALT` : nombre de tours pour le hash bcrypt
- `JWT_SECRET` : secret utilise pour signer et verifier les tokens JWT

## Base de donnees

La connexion est geree dans [src/db.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/db.js).

Le projet choisit automatiquement le dialecte Sequelize selon `ENV` :

- `DEV` -> MySQL
- autre valeur -> PostgreSQL

Au demarrage, l'application :

- se connecte a la base
- appelle `sequelize.sync()`

Cela permet de creer ou synchroniser les tables a partir des modeles.

## Modeles

### Character

Defini dans [src/models/characterModel.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/models/characterModel.js).

Champs principaux :

- `id` : entier auto-incremente
- `name` : string, unique, obligatoire
- `description` : string, obligatoire
- `createdAt`
- `updatedAt`

### User

Defini dans [src/models/userModel.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/models/userModel.js).

Champs principaux :

- `id` : entier auto-incremente
- `email` : string, unique, obligatoire, format email
- `passwordHash` : string, obligatoire
- `username` : string, obligatoire
- `role` : enum `user` ou `admin`, valeur par defaut `user`
- `createdAt`
- `updatedAt`

## Fonctionnement du serveur

Le point d'entree est [src/server.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/server.js).

Middlewares globaux actuellement utilises :

- `express.json()`
- `express.urlencoded({ extended: true })`
- `cookieParser()`
- un middleware de log simple

Routes principales montees :

- `/characters`
- `/users`
- `/protected`

## API Characters

Routes definies dans [src/routers/characterRouter.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/routers/characterRouter.js).

### `POST /characters`

Cree un personnage.

Exemple de body :

```json
{
  "name": "Mario",
  "description": "Un plombier courageux"
}
```

### `GET /characters`

Retourne tous les personnages.

### `GET /characters/:id`

Retourne un personnage par son identifiant.

### `PATCH /characters/:id`

Met a jour la description d'un personnage.

Exemple de body :

```json
{
  "description": "Nouvelle description"
}
```

### `DELETE /characters/:id`

Supprime un personnage par son identifiant.

La logique associee se trouve dans [src/controllers/characterController.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/controllers/characterController.js).

## API Users

Routes definies dans [src/routers/userRouter.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/routers/userRouter.js).

### `POST /users/register`

Inscrit un utilisateur.

Exemple de body :

```json
{
  "email": "mario@nintendo.com",
  "password": "secret123",
  "username": "Mario"
}
```

Au moment de l'inscription :

- le mot de passe est hashe avec `bcrypt`
- l'utilisateur est cree avec `passwordHash`

### `POST /users/signin`

Connecte un utilisateur.

Exemple de body :

```json
{
  "email": "mario@nintendo.com",
  "password": "secret123"
}
```

Si l'authentification reussit :

- un token JWT est genere
- le token contient `exp`, `role` et `id`
- un cookie `access_token` est egalement ecrit

La logique associee se trouve dans [src/controllers/userController.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/controllers/userController.js).

## Authentification et autorisation

### Verification JWT

Le middleware [src/middlewares/verifyTokenJwt.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/verifyTokenJwt.js) :

- lit le header `Authorization`
- attend un format `Bearer <token>`
- verifie le token avec `JWT_SECRET`
- place le payload dans `req.user`

Exemple de header :

```http
Authorization: Bearer <token>
```

### Verification du role admin

Le middleware [src/middlewares/isAdmin.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/isAdmin.js) :

- verifie que `req.user.role === 'admin'`

### Route protegee

La route suivante est disponible :

```http
GET /protected
```

Elle utilise :

- `verifyTokenJwt`
- `isAdmin`

Cela signifie qu'il faut :

- etre authentifie
- posseder le role `admin`

## Seeders Sequelize

La configuration Sequelize CLI a ete ajoutee avec :

- [/.sequelizerc](/home/jupo/Documents/dev/formateur/node-api-sequelize/.sequelizerc)
- [config/config.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/config/config.js)

Cette configuration :

- charge les variables d'environnement avec `dotenv`
- pointe vers le dossier `seeders`
- reutilise `DB_DEV` ou `DB_PROD`
- applique la configuration SSL en PostgreSQL

### Seeder de personnages

Seeder disponible :

- [seeders/20260317120000-create-characters.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/seeders/20260317120000-create-characters.js)

Ce seeder :

- isole les personnages a creer dans un tableau `charactersToCreate`
- boucle sur ce tableau pour construire les donnees a inserer
- ajoute `createdAt` et `updatedAt`
- insere les donnees dans la table `Characters`

### Commandes utiles

Lancer un seeder :

```bash
npx sequelize-cli db:seed --seed 20260317120000-create-characters.js --env development
```

Lancer tous les seeders :

```bash
npx sequelize-cli db:seed:all --env development
```

Annuler tous les seeders :

```bash
npx sequelize-cli db:seed:undo:all --env development
```

## Exemples de test rapide

### Creer un personnage

```bash
curl -X POST http://localhost:3000/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Link",
    "description": "Le heros d Hyrule"
  }'
```

### Recuperer tous les personnages

```bash
curl http://localhost:3000/characters
```

### Inscrire un utilisateur

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "link@hyrule.com",
    "password": "secret123",
    "username": "Link"
  }'
```

### Connecter un utilisateur

```bash
curl -X POST http://localhost:3000/users/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "link@hyrule.com",
    "password": "secret123"
  }'
```

## Points d'attention

- `sequelize.sync()` cree/synchronise les tables a chaque demarrage
- la route `DELETE /users/:id` est declaree mais pas encore implementee
- `verifyTokenJwt` lit le token depuis le header `Authorization`, pas depuis le cookie
- pour executer les commandes Sequelize CLI, il faut disposer de `node` et `npx` sur la machine

## Fichiers importants

- [src/server.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/server.js)
- [src/db.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/db.js)
- [src/controllers/characterController.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/controllers/characterController.js)
- [src/controllers/userController.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/controllers/userController.js)
- [src/middlewares/verifyTokenJwt.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/verifyTokenJwt.js)
- [src/middlewares/isAdmin.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/isAdmin.js)
- [src/models/characterModel.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/models/characterModel.js)
- [src/models/userModel.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/models/userModel.js)
- [seeders/20260317120000-create-characters.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/seeders/20260317120000-create-characters.js)
