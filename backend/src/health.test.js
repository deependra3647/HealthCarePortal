const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('./app');

describe('Health endpoint', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });
});
