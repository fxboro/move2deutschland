import test from 'node:test';
import assert from 'node:assert';
import path from 'path';

// ---------------------------------------------------------
// 1. Define Mocks for Firebase Admin and Firestore
// ---------------------------------------------------------
interface WriteOp {
  collection: string;
  data: any;
}

interface UpdateOp {
  collection: string;
  docId: string;
  data: any;
}

const mockWrites: WriteOp[] = [];
const mockUpdates: UpdateOp[] = [];
const mockClaims: Record<string, any> = {};
let mockUsersInCollection: any[] = [];

const mockDb = {
  batch: () => {
    return {
      set: (ref: any, data: any) => {
        mockWrites.push({ collection: ref._collectionPath, data });
      },
      update: (ref: any, data: any) => {
        mockUpdates.push({ collection: ref._collectionPath, docId: ref._docId, data });
      },
      commit: async () => {
        return Promise.resolve();
      }
    };
  },
  collection: (collectionPath: string) => {
    return {
      doc: (docId?: string) => {
        const id = docId || 'mock-doc-id-' + Math.random().toString(36).substr(2, 9);
        return {
          id,
          _collectionPath: collectionPath,
          _docId: id,
          set: async (data: any) => {
            mockWrites.push({ collection: collectionPath, data });
            return Promise.resolve();
          }
        };
      },
      where: (field: string, op: string, val: any) => {
        // Return a mock query builder that filters our mock users list
        let currentList = [...mockUsersInCollection];
        const builder = {
          where: (f: string, o: string, v: any) => {
            if (f === 'createdAt') {
              // Assume filtering by yesterday is already applied/handled
            } else if (f === 'emailVerified') {
              currentList = currentList.filter(u => u.emailVerified === v);
            } else if (f === 'nudgeSent') {
              currentList = currentList.filter(u => u.nudgeSent === v);
            }
            return builder;
          },
          get: async () => {
            return {
              empty: currentList.length === 0,
              size: currentList.length,
              docs: currentList.map(u => ({
                id: u.uid,
                ref: {
                  _collectionPath: collectionPath,
                  _docId: u.uid
                },
                data: () => u
              }))
            };
          }
        };
        return builder.where(field, op, val);
      }
    };
  }
};

const mockAdmin = {
  initializeApp: () => {},
  firestore: Object.assign(() => mockDb, {
    FieldValue: {
      serverTimestamp: () => 'mock-server-timestamp'
    }
  }),
  auth: () => {
    return {
      setCustomUserClaims: async (uid: string, claims: any) => {
        mockClaims[uid] = claims;
        return Promise.resolve();
      }
    };
  }
};

// ---------------------------------------------------------
// 2. Define Mocks for Firebase Functions
// ---------------------------------------------------------
const mockFunctions = {
  auth: {
    user: () => ({
      onCreate: (handler: any) => handler
    })
  },
  pubsub: {
    schedule: () => ({
      onRun: (handler: any) => handler
    })
  },
  firestore: {
    document: () => ({
      onUpdate: (handler: any) => handler,
      onCreate: (handler: any) => handler
    })
  }
};

// ---------------------------------------------------------
// 3. Inject Mocks into Node's Module Cache
// ---------------------------------------------------------
const adminPath = require.resolve('firebase-admin');
const functionsPath = require.resolve('firebase-functions');

require.cache[adminPath] = {
  id: adminPath,
  filename: adminPath,
  loaded: true,
  exports: mockAdmin,
  children: [],
  paths: []
} as any;

require.cache[functionsPath] = {
  id: functionsPath,
  filename: functionsPath,
  loaded: true,
  exports: mockFunctions,
  children: [],
  paths: []
} as any;

// ---------------------------------------------------------
// 4. Import Cloud Functions under test
// ---------------------------------------------------------
// Note: We use relative require here to load functions index
const indexExports = require('./src/index');
const onUserSignup = indexExports.onUserSignup;
const sendVerificationNudge = indexExports.sendVerificationNudge;

// Helper to reset mock tracking arrays between tests
function resetMocks() {
  mockWrites.length = 0;
  mockUpdates.length = 0;
  Object.keys(mockClaims).forEach(k => delete mockClaims[k]);
  mockUsersInCollection = [];
}

// ---------------------------------------------------------
// 5. Test Suites
// ---------------------------------------------------------

test('onUserSignup - Normal User Signup behavior', async () => {
  resetMocks();
  
  const mockUser = {
    uid: 'student-uid-123',
    email: 'student@example.com',
    displayName: 'Adebayo Smith'
  };

  // Run the onCreate trigger
  await onUserSignup(mockUser);

  // 1. Verify custom claims (should NOT be admin)
  assert.strictEqual(mockClaims[mockUser.uid], undefined, 'Normal user should not be assigned admin claims');

  // 2. Verify Welcome Email was queued
  const welcomeEmail = mockWrites.find(w => w.collection === 'mail' && w.data.to === mockUser.email);
  assert.ok(welcomeEmail, 'Welcome email should be written to mail collection');
  assert.match(welcomeEmail.data.message.subject, /Welcome/, 'Email subject should contain Welcome');
  assert.match(welcomeEmail.data.message.html, /Adebayo Smith/, 'Email body should address user by display name');

  // 3. Check what link is sent in the Welcome Email
  const emailHtml = welcomeEmail.data.message.html;
  assert.match(emailHtml, /https:\/\/move2deutschland\.com\/dashboard/, 'Welcome email should link to dashboard URL');
  
  // NOTE: Verify if it sends a Firebase email verification link
  const hasAuthActionLink = emailHtml.includes('__/auth/action') || emailHtml.includes('mode=verifyEmail');
  assert.strictEqual(hasAuthActionLink, false, 'Welcome email links to a static dashboard page, NOT an actual Firebase Auth verification link');

  // 4. Verify Admin Alert was queued
  const adminAlert = mockWrites.find(w => w.collection === 'mail' && w.data.to === 'chimadayo43@gmail.com');
  assert.ok(adminAlert, 'Admin alert email should be written to mail collection');
  assert.match(adminAlert.data.message.subject, /🚨 New Lead/, 'Admin alert subject should start with New Lead');

  // 5. Verify if a document was created in the "users" Firestore collection on signup
  const userDocWrite = mockWrites.find(w => w.collection === 'users');
  assert.ok(userDocWrite, 'Cloud function should write to the users collection on signup');
  assert.strictEqual(userDocWrite.data.email, mockUser.email);
  assert.strictEqual(userDocWrite.data.emailVerified, false);
  assert.strictEqual(userDocWrite.data.nudgeSent, false);
  assert.strictEqual(userDocWrite.data.profile.name, mockUser.displayName);
  assert.strictEqual(userDocWrite.data.profile.status, 'pending');
});

test('onUserSignup - Admin Email Whitelist Signups get Admin Custom Claims', async () => {
  resetMocks();

  const mockAdminUser = {
    uid: 'admin-uid-456',
    email: 'chimadayo43@gmail.com',
    displayName: 'Admin User'
  };

  await onUserSignup(mockAdminUser);

  // Verify custom claims (should be admin)
  assert.deepStrictEqual(mockClaims[mockAdminUser.uid], { admin: true }, 'Admin user should be assigned admin claim');
});

test('sendVerificationNudge - Behavior when no user documents exist vs when they do', async () => {
  resetMocks();

  // Scenario A: No user documents exist in Firestore (current signup behavior)
  // Run the scheduler trigger
  let nudgeLogs: string[] = [];
  const originalLog = console.log;
  console.log = (msg: string) => nudgeLogs.push(msg);

  try {
    await sendVerificationNudge({});
    assert.ok(nudgeLogs.includes('No users to nudge today.'), 'Nudge should output "No users to nudge today." if no users exist in Firestore collection');
  } finally {
    console.log = originalLog;
  }

  // Scenario B: User document exists but they are verified
  resetMocks();
  mockUsersInCollection.push({
    uid: 'verified-user',
    email: 'verified@example.com',
    emailVerified: true,
    nudgeSent: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
  });

  nudgeLogs = [];
  console.log = (msg: string) => nudgeLogs.push(msg);
  try {
    await sendVerificationNudge({});
    assert.ok(nudgeLogs.includes('No users to nudge today.'), 'Nudge should skip verified users');
  } finally {
    console.log = originalLog;
  }

  // Scenario C: User document exists, is unverified and hasn't been nudged yet
  resetMocks();
  mockUsersInCollection.push({
    uid: 'unverified-user',
    email: 'unverified@example.com',
    emailVerified: false,
    nudgeSent: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
    profile: { name: 'Unverified Student' }
  });

  nudgeLogs = [];
  console.log = (msg: string) => nudgeLogs.push(msg);
  try {
    await sendVerificationNudge({});
    
    // Check if nudge email was queued in mail collection
    const nudgeMail = mockWrites.find(w => w.collection === 'mail' && w.data.to === 'unverified@example.com');
    assert.ok(nudgeMail, 'Nudge email should be queued to mail collection');
    assert.match(nudgeMail.data.message.subject, /Your German education is waiting/, 'Nudge subject should match design');

    // Check if user nudgeSent was updated
    const userUpdate = mockUpdates.find(u => u.collection === 'users' && u.docId === 'unverified-user');
    assert.ok(userUpdate, 'User document should be updated');
    assert.strictEqual(userUpdate.data.nudgeSent, true, 'nudgeSent should be updated to true');
  } finally {
    console.log = originalLog;
  }
});
