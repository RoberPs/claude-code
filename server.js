const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PORT = 3000;
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'kohi-dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

const db = new Database(path.join(__dirname, 'kohi.db'));
db.pragma('journal_mode = WAL');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Sentencias preparadas ---
const findByEmail = db.prepare('SELECT * FROM waitlist WHERE email = ?');
const findById = db.prepare('SELECT name, email, position FROM waitlist WHERE id = ?');
const nextPosition = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 AS pos FROM waitlist');
const insertUser = db.prepare(
  'INSERT INTO waitlist (name, email, password_hash, position) VALUES (?, ?, ?, ?)'
);
const countAll = db.prepare('SELECT COUNT(*) AS total FROM waitlist');

// Posición y alta en una sola transacción: evita que dos registros
// simultáneos calculen el mismo MAX(position)+1.
const registerUser = db.transaction((name, email, passwordHash) => {
  const position = nextPosition.get().pos;
  const info = insertUser.run(name, email, passwordHash, position);
  return { id: info.lastInsertRowid, position };
});

const normalizeEmail = (email) => String(email).trim().toLowerCase();

// --- Middleware JWT ---
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// --- POST /api/register ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  const missing = ['name', 'email', 'password'].filter(
    (field) => !req.body || !req.body[field] || !String(req.body[field]).trim()
  );
  if (missing.length) {
    return res.status(400).json({
      error: `Campos obligatorios faltantes: ${missing.join(', ')}`,
    });
  }

  const cleanEmail = normalizeEmail(email);

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { position } = registerUser(String(name).trim(), cleanEmail, passwordHash);

    return res.status(201).json({
      success: true,
      message: '¡Bienvenido a la lista de espera de Kōhi!',
      email: cleanEmail,
      position,
      total: countAll.get().total,
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    console.error('[register]', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- POST /api/login ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes: email, password' });
  }

  try {
    const user = findByEmail.get(normalizeEmail(email));
    // Mismo mensaje para usuario inexistente y password incorrecto:
    // no revelamos qué emails están registrados.
    if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({ success: true, token, expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- GET /api/me ---
app.get('/api/me', requireAuth, (req, res) => {
  const user = findById.get(req.user.id);
  if (!user) {
    return res.status(401).json({ error: 'El usuario ya no existe' });
  }

  return res.json({
    name: user.name,
    email: user.email,
    position: user.position,
    total: countAll.get().total,
  });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint no encontrado' }));

// Body JSON malformado: responder en JSON, no con el HTML de error de Express.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
  }
  console.error('[error]', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Kōhi escuchando en http://localhost:${PORT}`);
});
