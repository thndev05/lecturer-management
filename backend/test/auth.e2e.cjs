const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ConfigService } = require('@nestjs/config');
const { JwtService } = require('@nestjs/jwt');
const { AuthService } = require('../dist/auth/auth.service');

const values = {
  ADMIN_EMAIL: ' Admin@Example.com ',
  ADMIN_PASSWORD: 'test-only-password',
  ADMIN_FULLNAME: 'Admin',
  JWT_SECRET: 'test-secret-with-more-than-32-characters',
};
const jwt = new JwtService({ secret: values.JWT_SECRET, signOptions: { expiresIn: '1h' } });
test('env credentials validate at startup without exposing values', () => {
  for (const override of [
    { ADMIN_EMAIL: '' },
    { ADMIN_PASSWORD: '' },
    { ADMIN_PASSWORD: 'short' },
    { ADMIN_PASSWORD: 'á'.repeat(37) },
    { ADMIN_FULLNAME: '' },
  ]) {
    assert.throws(() => new AuthService(new ConfigService({ ...values, ...override }), jwt));
  }
});
test('single env admin authenticates; changed credentials invalidate prior tokens', async () => {
  const auth = new AuthService(new ConfigService(values), jwt);
  const login = await auth.login({ Email: 'admin@example.com', Password: values.ADMIN_PASSWORD });
  const claims = await jwt.verifyAsync(login.accessToken);
  assert.deepEqual(auth.profile(claims.sub), {
    _id: 'admin',
    Fullname: 'Admin',
    Email: 'admin@example.com',
  });
  for (const override of [
    { ADMIN_EMAIL: 'new@example.com' },
    { ADMIN_PASSWORD: 'another-test-password' },
  ]) {
    const changed = new AuthService(new ConfigService({ ...values, ...override }), jwt);
    assert.throws(() => changed.profile(claims.sub));
  }
  await assert.rejects(auth.login({ Email: 'admin@example.com', Password: 'wrong' }));
  await assert.rejects(auth.login({ Email: 'other@example.com', Password: values.ADMIN_PASSWORD }));
  assert.throws(() => auth.profile('old-mongo-id'));
});
