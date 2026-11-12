import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { createImageUploadBody } from '../src/lib/image-upload.ts';

// Exercise the installed SDK's multipart encoder without loading native modules in Node.
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(
  new URL('../node_modules/expo/src/winter/fetch/convertFormData.ts', import.meta.url),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const sdk: {
  exports: {
    convertFormDataAsync?: (body: unknown, boundary: string) => Promise<{ body: Uint8Array }>;
  };
} = { exports: {} };
new Function('require', 'exports', compiled)((name: string) => {
  assert.equal(name, '../../utils/blobUtils');
  return { blobToArrayBufferAsync: (blob: Blob) => blob.arrayBuffer() };
}, sdk.exports);
const encode = sdk.exports.convertFormDataAsync!;

test('SDK 58 rejects legacy URI upload parts', async () => {
  const legacy = {
    entries: () => [['file', { uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg' }]],
  };
  await assert.rejects(encode(legacy, 'boundary'), /Unsupported FormDataPart/);
});
test('upload body preserves file bytes, MIME type and filename for the SDK encoder', async () => {
  const image = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' });
  const body = createImageUploadBody(image, 'avatar.png');
  const result = await encode(body, 'boundary');
  const encoded = new TextDecoder().decode(result.body);
  assert.match(encoded, /name="file"; filename="avatar.png"/);
  assert.match(encoded, /content-type: image\/png/);
  assert.ok(result.body.includes(137));
  assert.equal(body.getAll('file').length, 1);
});
test('SDK encoder accepts Expo File objects via their bytes method', async () => {
  const file = {
    name: 'native.jpg',
    type: 'image/jpeg',
    bytes: async () => new Uint8Array([255, 216, 255]),
  };
  const result = await encode({ entries: () => [['file', file]] }, 'boundary');
  assert.ok(result.body.includes(255));
  assert.match(new TextDecoder().decode(result.body), /filename="native.jpg"/);
});
test('upload body rejects files over the backend 5 MiB limit', () => {
  assert.throws(
    () => createImageUploadBody(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)]), 'large.png'),
    /photoInvalid/,
  );
});
