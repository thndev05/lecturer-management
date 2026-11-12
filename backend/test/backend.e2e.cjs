const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { getConnectionToken, getModelToken } = require('@nestjs/mongoose');

test('Auth, protected lecturer CRUD, unique indexes, export and upload validation', async () => {
  const db = `qlhocphan_test_${randomUUID().replaceAll('-', '')}`;
  // Never use the application's Atlas database or credentials for tests.
  process.env.MONGODB_URI = `mongodb://127.0.0.1:27017/${db}`;
  process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
  process.env.CLOUDINARY_FOLDER = 'QLHocPhan';
  const { AppModule } = require('../dist/app.module');
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  try {
    await app.listen(0, '127.0.0.1');
    const base = `${await app.getUrl()}/api`;
    async function request(path, method = 'GET', body, token) {
      const response = await fetch(base + path, { method, headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, data: await response.json() };
    }
    const account = { Fullname: 'Quản trị viên', Email: 'Admin@Example.com', Password: 'Test-password-123', ConfirmPassword: 'Test-password-123' };
    assert.equal((await request('/auth/register', 'POST', { ...account, ConfirmPassword: 'wrong' })).status, 400);
    const registered = await request('/auth/register', 'POST', account);
    assert.equal(registered.status, 201);
    assert.equal(registered.data.Email, 'admin@example.com');
    assert.equal(JSON.stringify(registered.data).includes('Password'), false);
    assert.equal((await request('/auth/register', 'POST', { ...account, Email: 'admin@example.com' })).status, 409);
    const registrationRace = await Promise.all([1, 2].map(() => request('/auth/register', 'POST', { ...account, Email: 'race@example.com' })));
    assert.deepEqual(registrationRace.map(r => r.status).sort(), [201, 409]);
    assert.equal((await request('/auth/login', 'POST', { Email: account.Email, Password: 'wrong' })).status, 401);
    const login = await request('/auth/login', 'POST', { Email: ' ADMIN@example.com ', Password: account.Password });
    assert.equal(login.status, 200);
    const token = login.data.accessToken;
    assert.ok(token);
    assert.equal((await request('/auth/me', 'GET', undefined, token)).data.Email, 'admin@example.com');
    assert.equal((await request('/giang-vien')).status, 401);
    assert.equal((await request('/giang-vien', 'GET', undefined, 'invalid')).status, 401);
    const { JwtService } = require('@nestjs/jwt');
    const expired = await app.get(JwtService).signAsync({ sub: registered.data._id }, { expiresIn: -1 });
    assert.equal((await request('/giang-vien', 'GET', undefined, expired)).status, 401);
    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
    const openapi = SwaggerModule.createDocument(app, new DocumentBuilder().addBearerAuth().build());
    for (const path of ['/api/auth/register', '/api/auth/login', '/api/auth/me', '/api/giang-vien', '/api/giang-vien/export', '/api/giang-vien/{IDGV}', '/api/uploads/image']) {
      assert.ok(openapi.paths[path], `Swagger missing ${path}`);
    }
    const lecturer = { IDGV: 'GV001', Fullname: 'Nguyễn Văn A', Image: 'https://res.cloudinary.com/demo/image/upload/v1/QLHocPhan/test.png', SumClass: 2 };
    assert.equal((await request('/giang-vien', 'POST', { ...lecturer, SumClass: -1 }, token)).status, 400);
    assert.equal((await request('/giang-vien', 'POST', { ...lecturer, role: 'admin' }, token)).status, 400);
    const race = await Promise.all([request('/giang-vien', 'POST', lecturer, token), request('/giang-vien', 'POST', lecturer, token)]);
    assert.deepEqual(race.map(r => r.status).sort(), [201, 409]);
    const stored = await app.get(getModelToken('GiangVien')).findOne().lean();
    assert.deepEqual(Object.keys(stored).sort(), ['_id', 'IDGV', 'Fullname', 'Image', 'SumClass'].sort());
    assert.equal((await request('/giang-vien', 'GET', undefined, token)).data.length, 1);
    assert.equal((await request('/giang-vien/GV001', 'GET', undefined, token)).data.IDGV, 'GV001');
    assert.equal((await request('/giang-vien/GV001', 'PATCH', { SumClass: 5 }, token)).data.SumClass, 5);
    assert.equal((await request('/giang-vien/GV001', 'PATCH', { Fullname: null }, token)).status, 400);
    assert.equal((await request('/giang-vien', 'POST', { ...lecturer, IDGV: 'GV002', Fullname: 'Trần Thị B' }, token)).status, 201);
    for (const term of ['gv001', ' GV001 ', 'NGUYỄN']) {
      const found = await request('/giang-vien?search=' + encodeURIComponent(term), 'GET', undefined, token);
      assert.equal(found.status, 200);
      assert.deepEqual(found.data.map(row => row.IDGV), ['GV001']);
    }
    assert.equal((await request('/giang-vien?search=GV00', 'GET', undefined, token)).data.length, 2);
    assert.equal((await request('/giang-vien?search=%20%20', 'GET', undefined, token)).data.length, 2);
    for (const term of ['.*', '[', 'không tồn tại']) {
      assert.deepEqual((await request('/giang-vien?search=' + encodeURIComponent(term), 'GET', undefined, token)).data, []);
    }
    assert.equal((await request('/giang-vien?search=' + 'a'.repeat(121), 'GET', undefined, token)).status, 400);
    assert.equal((await request('/giang-vien?search=a&search=b', 'GET', undefined, token)).status, 400);
    assert.equal((await request('/giang-vien/GV002', 'PATCH', { IDGV: 'GV001' }, token)).status, 409);
    const exported = await request('/giang-vien/export', 'GET', undefined, token);
    assert.equal(exported.status, 200);
    assert.deepEqual(Object.keys(exported.data[0]).sort(), ['IDGV', 'Fullname', 'Image', 'SumClass'].sort());
    const missingFile = await fetch(base + '/uploads/image', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    assert.equal(missingFile.status, 400);
    const form = new FormData();
    form.append('file', new Blob(['not an image'], { type: 'image/png' }), 'fake.png');
    const fake = await fetch(base + '/uploads/image', { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } });
    assert.equal(fake.status, 400);
    const cloudinary = require('cloudinary').v2;
    const originalUpload = cloudinary.uploader.upload_stream;
    const { Writable } = require('node:stream');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    async function upload(buffer) {
      const body = new FormData();
      body.append('file', new Blob([buffer], { type: 'image/png' }), 'image.png');
      return fetch(base + '/uploads/image', { method: 'POST', body, headers: { Authorization: `Bearer ${token}` } });
    }
    try {
      cloudinary.uploader.upload_stream = (options, callback) => new Writable({
        write(chunk, encoding, done) { done(); },
        final(done) { assert.equal(options.folder, 'QLHocPhan'); callback(null, { secure_url: lecturer.Image }); done(); },
      });
      const uploaded = await upload(png);
      assert.equal(uploaded.status, 201);
      assert.deepEqual(await uploaded.json(), { Image: lecturer.Image });
      cloudinary.uploader.upload_stream = (options, callback) => new Writable({
        write(chunk, encoding, done) { done(); },
        final(done) { callback(new Error('simulated cloud failure')); done(); },
      });
      assert.equal((await upload(png)).status, 503);
      assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status, 413);
    } finally { cloudinary.uploader.upload_stream = originalUpload; }
    for (const code of ['GV001', 'GV002']) assert.equal((await request(`/giang-vien/${code}`, 'DELETE', undefined, token)).status, 200);
    assert.equal((await request('/giang-vien/GV001', 'GET', undefined, token)).status, 404);
    const user = await app.get(getModelToken('QuanTriVien')).findOne().select('+PasswordHash');
    assert.notEqual(user.PasswordHash, account.Password);
    assert.equal(user.toObject().ConfirmPassword, undefined);
    await app.get(getModelToken('QuanTriVien')).deleteOne({ _id: user._id });
    assert.equal((await request('/auth/me', 'GET', undefined, token)).status, 401);
  } finally {
    const connection = app.get(getConnectionToken());
    assert.equal(connection.name, db);
    await connection.dropDatabase();
    await app.close();
  }
});
