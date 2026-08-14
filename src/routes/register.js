const { isValidEmail } = require('../validators/email');

/**
 * Handler del endpoint POST /register.
 *
 * Valida los campos obligatorios y da de alta al usuario. El correo de
 * verificación se envía a la dirección recibida, así que un email con
 * formato incorrecto deja la cuenta inaccesible.
 */
function registerHandler(req, res) {
  const { email, password } = req.body || {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'El formato del email no es válido' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  const user = createUser({ email: email.trim().toLowerCase(), password });
  sendVerificationEmail(user.email);

  return res.status(201).json({ id: user.id, email: user.email });
}

module.exports = { registerHandler };
