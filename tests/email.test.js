const test = require('node:test');
const assert = require('node:assert');

const { isValidEmail } = require('../src/validators/email');

const VALID_EMAILS = [
  ['usuario@dominio.com', 'caso base'],
  ['nombre.apellido@sub.dominio.co.uk', 'subdominios y TLD compuesto'],
  ['usuario+etiqueta@dominio.com', 'plus addressing'],
  ['usuario_1-2@dominio-con-guion.com', 'guiones y guiones bajos'],
  ['USUARIO@DOMINIO.COM', 'mayúsculas'],
];

const INVALID_EMAILS = [
  ['usuario@.com', 'la primera etiqueta del dominio está vacía'],
  ['usuario@com.', 'el TLD está vacío'],
  ['usuario@dominio..com', 'dos puntos consecutivos'],
  ['@dominio.com', 'falta la parte local'],
  ['usuario@', 'falta el dominio'],
  ['usuario@dominio', 'sin TLD'],
  ['usuario @dominio.com', 'espacio en la parte local'],
  ['usuario@@dominio.com', 'doble arroba'],
  ['.usuario@dominio.com', 'la parte local empieza por punto'],
];

test('acepta direcciones con formato correcto', async (t) => {
  for (const [email, motivo] of VALID_EMAILS) {
    await t.test(`${email} (${motivo})`, () => {
      assert.strictEqual(isValidEmail(email), true);
    });
  }
});

test('rechaza direcciones con formato incorrecto', async (t) => {
  for (const [email, motivo] of INVALID_EMAILS) {
    await t.test(`${email} (${motivo})`, () => {
      assert.strictEqual(isValidEmail(email), false);
    });
  }
});

test('rechaza valores que no son cadenas', () => {
  assert.strictEqual(isValidEmail(null), false);
  assert.strictEqual(isValidEmail(undefined), false);
  assert.strictEqual(isValidEmail(42), false);
  assert.strictEqual(isValidEmail(''), false);
});
