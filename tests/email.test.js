const test = require('node:test');
const assert = require('node:assert');

const { isValidEmail } = require('../src/validators/email');

test('acepta direcciones con formato correcto', () => {
  assert.strictEqual(isValidEmail('usuario@dominio.com'), true);
  assert.strictEqual(isValidEmail('nombre.apellido@sub.dominio.co.uk'), true);
});

test('rechaza valores que no son cadenas', () => {
  assert.strictEqual(isValidEmail(null), false);
  assert.strictEqual(isValidEmail(42), false);
});
