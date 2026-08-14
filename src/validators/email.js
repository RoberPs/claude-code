/**
 * Validación de direcciones de correo electrónico.
 *
 * Este módulo lo comparten el formulario de registro del cliente y la
 * capa de validación del servidor, de modo que ambos apliquen la misma
 * regla.
 */

// Límites de la RFC 5321.
const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;
const MAX_LABEL_LENGTH = 63;

// Parte local: caracteres permitidos en grupos separados por un único
// punto, lo que descarta puntos al principio, al final o consecutivos.
const LOCAL_PART = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

// Etiqueta de dominio: alfanumérica, con guiones solo en interior.
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

// Dominio de primer nivel: al menos dos letras, sin dígitos ni guiones.
const TOP_LEVEL_DOMAIN = /^[A-Za-z]{2,}$/;

/**
 * Indica si una cadena es una dirección de email con formato válido.
 *
 * @param {unknown} email Valor introducido por el usuario.
 * @returns {boolean} true si el formato es válido.
 */
function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const candidate = email.trim();

  if (candidate.length === 0 || candidate.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  // Exactamente una arroba: descarta `usuario@@dominio.com` y `usuario`.
  const parts = candidate.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  if (localPart.length > MAX_LOCAL_LENGTH || !LOCAL_PART.test(localPart)) {
    return false;
  }

  // Un dominio necesita al menos una etiqueta y un TLD: `usuario@dominio`
  // no es válido en este contexto.
  const labels = domain.split('.');
  if (labels.length < 2) {
    return false;
  }

  // Cada etiqueta debe ser no vacía. Este era el fallo original: `.com`
  // produce una etiqueta vacía y aun así pasaba la validación.
  const labelsAreValid = labels.every(
    (label) => label.length > 0 && label.length <= MAX_LABEL_LENGTH && DOMAIN_LABEL.test(label)
  );
  if (!labelsAreValid) {
    return false;
  }

  return TOP_LEVEL_DOMAIN.test(labels[labels.length - 1]);
}

module.exports = { isValidEmail };
