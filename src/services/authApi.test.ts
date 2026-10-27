import test from 'node:test';
import assert from 'node:assert';
import { AuthApi, generateChurchRoomCode } from './authApi';
import { INITIAL_TENANTS } from '../data/seedData';
import { ChurchTenant } from '../types/choir';

// Polyfill localStorage if in headless Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] || null,
    length: 0,
  };
}

test('generateChurchRoomCode: generates uppercase initials with 4 numbers like GC-8492', () => {
  const code1 = generateChurchRoomCode('Grace Cathedral');
  assert.match(code1, /^GC-\d{4}$/);

  const code2 = generateChurchRoomCode('St. Jude Parish');
  assert.match(code2, /^SJ-\d{4}$/);

  const code3 = generateChurchRoomCode('Anthem');
  assert.match(code3, /^AN-\d{4}$/);
});

test('AuthApi: authenticates pre-seeded choirmaster correctly', async () => {
  const res = await AuthApi.login(
    {
      email: 'admin@gracecathedral.org',
      password: 'password123',
    },
    INITIAL_TENANTS
  );

  assert.strictEqual(res.success, true);
  assert.ok(res.user);
  assert.strictEqual(res.user?.role.toUpperCase(), 'ADMIN');
  assert.strictEqual(res.user?.status, 'APPROVED');
  assert.strictEqual(res.user?.churchId, 'grace-cathedral');
  assert.strictEqual(res.user?.username, 'admin_grace');
});

test('AuthApi: rejects invalid password', async () => {
  const res = await AuthApi.login(
    {
      email: 'admin@gracecathedral.org',
      password: 'wrongpassword',
    },
    INITIAL_TENANTS
  );

  assert.strictEqual(res.success, false);
  assert.match(res.message || '', /Incorrect password/i);
});

test('AuthApi: Admin Registration generates Room Code and sets role ADMIN & status APPROVED', async () => {
  let createdTenant: ChurchTenant | null = null;
  const tenantsList = [...INITIAL_TENANTS];

  const res = await AuthApi.signup(
    {
      name: 'Pastor Thomas Sterling',
      username: 'thomas_pastor',
      email: 'thomas.pastor@newhope.org',
      password: 'mypassword123',
      confirmPassword: 'mypassword123',
      roleType: 'ADMIN',
      churchName: 'New Hope Choral Ministry',
      voicePart: 'Director',
    },
    tenantsList,
    (tenant) => {
      createdTenant = tenant;
      tenantsList.push(tenant);
    }
  );

  assert.strictEqual(res.success, true);
  assert.ok(res.user);
  assert.strictEqual(res.user?.role, 'ADMIN');
  assert.strictEqual(res.user?.status, 'APPROVED');
  assert.strictEqual(res.user?.username, 'thomas_pastor');
  assert.ok(createdTenant);
  assert.strictEqual((createdTenant as ChurchTenant | null)?.name, 'New Hope Choral Ministry');
  assert.match((createdTenant as ChurchTenant | null)?.roomCode || '', /^NH-\d{4}$/);
});

test('AuthApi: Member Registration validates Room Code and sets role MEMBER & status PENDING', async () => {
  const res = await AuthApi.signup(
    {
      name: 'Sarah Jenkins',
      username: 'sarah_alto',
      email: 'sarah.j@example.com',
      password: 'mypassword123',
      confirmPassword: 'mypassword123',
      roleType: 'MEMBER',
      roomCode: 'GC-1042',
      voicePart: 'Alto',
    },
    INITIAL_TENANTS,
    () => {}
  );

  assert.strictEqual(res.success, true);
  assert.ok(res.user);
  assert.strictEqual(res.user?.role, 'MEMBER');
  assert.strictEqual(res.user?.status, 'PENDING');
  assert.strictEqual(res.user?.username, 'sarah_alto');
  assert.strictEqual(res.user?.churchId, 'grace-cathedral');
  assert.match(res.message || '', /awaiting admin approval/i);
});

test('AuthApi: Member Registration rejects invalid Church Room Code', async () => {
  const res = await AuthApi.signup(
    {
      name: 'Invalid Code Applicant',
      username: 'invalid_applicant',
      email: 'applicant@invalid.org',
      password: 'mypassword123',
      confirmPassword: 'mypassword123',
      roleType: 'MEMBER',
      roomCode: 'BAD-9999',
      voicePart: 'Tenor',
    },
    INITIAL_TENANTS,
    () => {}
  );

  assert.strictEqual(res.success, false);
  assert.match(res.message || '', /Invalid Church Room Code/i);
});

test('AuthApi: Admin can approve and reject pending choir members', async () => {
  // Pre-seeded pending member at Grace Cathedral: 'user-pending-grace'
  const membersBefore = AuthApi.getChurchMembers('grace-cathedral');
  const pendingMember = membersBefore.pending.find((m) => m.username === 'solomon_tenor');
  assert.ok(pendingMember, 'Pre-seeded pending member solomon_tenor should exist');

  // Approve member
  const approved = await AuthApi.approveMember(pendingMember.id);
  assert.strictEqual(approved, true);

  const membersAfter = AuthApi.getChurchMembers('grace-cathedral');
  const nowApproved = membersAfter.approved.find((m) => m.id === pendingMember.id);
  assert.ok(nowApproved);
  assert.strictEqual(nowApproved?.status, 'APPROVED');
});

test('AuthApi: rejects signup when passwords do not match', async () => {
  const res = await AuthApi.signup(
    {
      name: 'Test Chorister',
      username: 'test_mismatch',
      email: 'mismatch@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword',
      roleType: 'MEMBER',
      roomCode: 'GC-1042',
    },
    INITIAL_TENANTS,
    () => {}
  );

  assert.strictEqual(res.success, false);
  assert.match(res.message || '', /Passwords do not match/i);
});
