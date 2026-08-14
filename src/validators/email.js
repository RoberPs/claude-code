/**
 * Validación de direcciones de correo electrónico.
 *
 * Este módulo lo comparten el formulario de registro del cliente y la
 * capa de validación del servidor, de modo que ambos apliquen la misma
 * regla.
 */

// Exige algo antes de la arroba, algo después y un punto en alguna parte.
const EMAIL_PATTERN = /.+@.+\..+/;

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

  return EMAIL_PATTERN.test(email.trim());
}

module.exports = { isValidEmail };
