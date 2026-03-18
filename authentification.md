# Memo: mettre en place l'authentification et l'autorisation

Ce projet a deja une bonne base pour faire de l'authentification avec JWT et de l'autorisation avec les roles.

L'idee est d'avancer en 2 etapes :

1. commencer avec un JWT simple envoye dans la reponse puis renvoye par le client dans le header `Authorization`
2. renforcer ensuite la securite en stockant le token dans un cookie `HttpOnly`

## 1. Bien distinguer authentification et autorisation

### Authentification

L'authentification sert a repondre a la question :

`Qui est cet utilisateur ?`

Dans ce projet, elle se fait en 2 temps :

- `POST /users/register` pour creer un utilisateur
- `POST /users/signin` pour verifier son email et son mot de passe, puis emettre un JWT

### Autorisation

L'autorisation sert a repondre a la question :

`Est-ce que cet utilisateur a le droit d'acceder a cette ressource ?`

Dans ce projet, elle repose surtout sur `role` :

- `user`
- `admin`

Le middleware [src/middlewares/isAdmin.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/isAdmin.js) illustre deja cette logique.

## 2. Etat actuel du projet

Le projet contient deja les briques principales :

- hash du mot de passe avec `bcrypt` dans [src/controllers/userController.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/controllers/userController.js)
- creation d'un JWT au `signin`
- middleware de verification dans [src/middlewares/verifyTokenJwt.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/verifyTokenJwt.js)
- middleware d'autorisation admin dans [src/middlewares/isAdmin.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/isAdmin.js)
- `cookie-parser` deja installe et branche dans [src/server.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/server.js)

Important : au final, le `signin` fait soit :

- il renvoie `token` dans le JSON
- il pose aussi `access_token` dans un cookie

Vous devez choisir la méthode que vous retenez.

## 3. Etape 1: JWT simple dans le header Authorization

### Objectif

Faire une version simple a comprendre :

1. l'utilisateur se connecte
2. le serveur renvoie un JWT
3. le client stocke ce JWT
4. le client l'envoie sur les routes protegees avec :

```http
Authorization: Bearer <token>
```

### Flux recommande

#### A. Inscription

Route :

`POST /users/register`

Traitement :

- lire `email`, `password`, `username`
- verifier si l'utilisateur existe deja
- hasher le mot de passe avec `bcrypt`
- enregistrer `passwordHash` en base

Le projet fait deja presque tout cela.

Point d'attention Sequelize :

dans `findOne`, il faut normalement utiliser :

```js
await User.findOne({ where: { email } });
```

et non :

```js
await User.findOne({ email });
```

### B. Connexion

Route :

`POST /users/signin`

Traitement :

- retrouver l'utilisateur par email
- comparer le mot de passe avec `bcrypt.compare`
- si c'est bon, signer un JWT avec `jsonwebtoken`

Exemple de payload utile :

```js
{
  id: userExist.id,
  role: userExist.role
}
```

L'expiration peut etre geree dans les options :

```js
jwt.sign(
  { id: userExist.id, role: userExist.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

Cette forme est souvent plus lisible que de mettre `exp` a la main dans le payload.

### C. Proteger une route

Le middleware [src/middlewares/verifyTokenJwt.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/verifyTokenJwt.js) fait deja l'essentiel :

- lire le token dans `Authorization`
- verifier la signature avec `JWT_SECRET`
- injecter le payload dans `req.user`

Ensuite, l'autorisation se fait avec [src/middlewares/isAdmin.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/isAdmin.js) :

- si `req.user.role === 'admin'`, on laisse passer
- sinon on bloque

Exemple deja present :

`GET /protected`

avec :

- `verifyTokenJwt`
- `isAdmin`

### D. Ce que le client doit faire

Dans cette premiere version, le frontend ou Postman doit renvoyer le token dans les headers :

```http
Authorization: Bearer eyJ...
```

### E. Limites de cette version

Cette approche est tres bien pour debuter, mais elle a une faiblesse :

- si le token est stocke dans `localStorage` ou `sessionStorage`, il peut etre plus facilement expose en cas de faille XSS

Elle reste tres utile pour apprendre, debugger, et comprendre le cycle JWT.

## 4. Etape 2: ajouter le cookie pour plus de securite

### Objectif

Au lieu de confier le stockage du token au frontend, on demande au serveur de le poser dans un cookie `HttpOnly`.

Avantage principal :

- le JavaScript du navigateur ne peut pas lire le cookie

Cela reduit l'impact d'une faille XSS sur le token.

### A. Ce que le projet fait deja

Dans [src/controllers/userController.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/controllers/userController.js), le `signin` pose deja :

```js
response.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.ENV === 'PROD',
  sameSite: process.env.ENV === 'PROD' ? 'none' : 'lax',
  maxAge: 60 * 60 * 1000,
  path: '/',
});
```

C'est une bonne base.

### B. Ce qu'il faut changer dans le middleware JWT

Si on veut passer a une vraie strategie "cookie d'abord", le middleware de verification doit pouvoir lire le token :

- soit dans `Authorization`
- soit dans `req.cookies.access_token`

Strategie recommandee :

1. garder la lecture du header pour les tests et Postman
2. ajouter un fallback sur le cookie

Pseudo-code :

```js
const header = req.headers.authorization;
const tokenFromHeader = header?.startsWith('Bearer ')
  ? header.split(' ')[1]
  : null;

const token = tokenFromHeader || req.cookies.access_token;
```

Puis :

```js
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = payload;
next();
```

### C. Ce que le client doit faire

Quand le token est en cookie :

- le frontend n'a plus besoin de lire le token
- il doit juste envoyer les requetes avec les credentials

Exemple avec `fetch` :

```js
fetch('http://localhost:3000/protected', {
  method: 'GET',
  credentials: 'include',
});
```

Exemple avec `axios` :

```js
axios.get('http://localhost:3000/protected', {
  withCredentials: true,
});
```

### D. Ce qu'il faut ajouter cote serveur

Si le frontend est sur une autre origine, il faudra en plus configurer correctement CORS pour autoriser :

- l'origine du frontend
- l'envoi des credentials

Sans cela, le navigateur n'enverra pas le cookie.

### E. Pourquoi c'est plus securise

Avec un cookie `HttpOnly` :

- le token n'est pas accessible via `document.cookie`
- on evite de le manipuler a la main dans le code frontend

Attention toutefois :

- les cookies introduisent un sujet CSRF
- il faut donc bien regler `sameSite`
- en production, il faut `secure: true` sur HTTPS

## 5. Strategie pedagogique recommandee pour ce projet

Le plus clair est de presenter les choses dans cet ordre :

### Phase 1

Faire fonctionner uniquement le JWT dans le header :

- `signin` renvoie `{ token }`
- le client le renvoie dans `Authorization`
- `verifyTokenJwt` lit uniquement le header

Cela permet de bien comprendre :

- la creation du token
- sa verification
- le role de `req.user`
- le chainage `verifyTokenJwt -> isAdmin -> controller`

### Phase 2

Une fois la logique comprise, faire evoluer le projet :

- `signin` pose aussi, ou seulement, le cookie `access_token`
- `verifyTokenJwt` sait lire le cookie
- le client envoie les requetes avec credentials

Cette etape montre comment durcir la securite sans changer la logique d'autorisation.

## 6. Recommandations concretes pour ce repo

### A. Corriger la recherche Sequelize

Dans [src/controllers/userController.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/controllers/userController.js), utiliser :

```js
await User.findOne({ where: { email } });
```

pour `register` et `signin`.

### B. Rendre `verifyTokenJwt` plus robuste

Dans [src/middlewares/verifyTokenJwt.js](/home/jupo/Documents/dev/formateur/node-api-sequelize/src/middlewares/verifyTokenJwt.js) :

- verifier que le header existe avant de faire `split`
- ajouter la lecture du cookie
- renvoyer un vrai message `401` ou `403` selon votre convention

### C. Ajouter une route de deconnexion

Il manque une route utile :

`POST /users/logout`

Elle servira surtout dans la version cookie :

```js
response.clearCookie('access_token', { path: '/' });
response.json({ message: 'Deconnexion reussie' });
```

### D. Limiter les informations dans le token

Le JWT doit rester minimal :

- `id`
- `role`

Ne pas y mettre :

- mot de passe
- hash
- informations sensibles

### E. Garder la logique d'autorisation cote serveur

Le frontend peut cacher des boutons, mais la vraie securite doit toujours rester cote API :

- middleware JWT pour identifier l'utilisateur
- middleware de role pour filtrer les acces

## 7. Exemple de chaine complete

### Version 1: JWT simple

1. `POST /users/signin`
2. le serveur renvoie `token`
3. le client stocke le token
4. le client appelle `GET /protected` avec `Authorization: Bearer <token>`
5. `verifyTokenJwt` remplit `req.user`
6. `isAdmin` autorise ou refuse

### Version 2: JWT + cookie

1. `POST /users/signin`
2. le serveur pose `access_token` dans un cookie `HttpOnly`
3. le navigateur stocke automatiquement le cookie
4. le client appelle `GET /protected` avec `credentials: 'include'`
5. `verifyTokenJwt` lit `req.cookies.access_token`
6. `isAdmin` autorise ou refuse

## 8. Conclusion

Pour ce projet, la meilleure approche est :

- commencer par un JWT simple dans le header pour comprendre le mecanisme
- ajouter ensuite le cookie `HttpOnly` pour renforcer la securite

L'authentification sert a identifier l'utilisateur.
L'autorisation sert a verifier ce qu'il a le droit de faire.

Dans ce repo, la base est deja la :

- `register` pour creer le compte
- `signin` pour emettre le token
- `verifyTokenJwt` pour identifier l'utilisateur
- `isAdmin` pour restreindre l'acces selon le role

La prochaine evolution logique serait de rendre `verifyTokenJwt` compatible header + cookie, puis d'ajouter un `logout`.

