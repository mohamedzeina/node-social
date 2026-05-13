/**
 * Database seed script.
 *
 * WIPES users + posts and re-populates with 6 test accounts, a handful
 * of authentic-looking posts, and randomly distributed likes.
 *
 * Run from the Backend/ directory:
 *
 *   node seed.js
 *
 * Env vars are loaded from `nodemon.json` if present (matching the rest
 * of this project), otherwise from `process.env` directly.
 *
 * Test accounts:
 *   email:    test@test.com, test2@test.com, … test6@test.com
 *   password: password123
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/user');
const Post = require('./models/post');

// --------------------------------------------------------------------
// Env loading — read nodemon.json if it exists (project convention)
// --------------------------------------------------------------------

const nodemonPath = path.join(__dirname, 'nodemon.json');
if (fs.existsSync(nodemonPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(nodemonPath, 'utf8'));
    Object.assign(process.env, config.env || {});
  } catch (err) {
    console.warn('Could not parse nodemon.json:', err.message);
  }
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Add it to nodemon.json or export it.');
  process.exit(1);
}

// --------------------------------------------------------------------
// Seed data
// --------------------------------------------------------------------

const PASSWORD = 'password123';

// Stable avatar head-shots from i.pravatar.cc (free, no auth).
// Using `?img=N` returns the same image every time; the path is also
// safe to pass through `?img=` query string when accessed via fetch.
const avatar = (n) => `https://i.pravatar.cc/300?img=${n}`;

const USERS = [
  { email: 'test@test.com',  name: 'Maya Rodriguez', status: 'Coffee, code, long walks ☕',          avatarUrl: avatar(47) },
  { email: 'test2@test.com', name: 'James Chen',     status: 'Photographer & part-time wanderer',   avatarUrl: avatar(13) },
  { email: 'test3@test.com', name: 'Aisha Patel',    status: 'Reading, writing, watching the weather', avatarUrl: avatar(32) },
  { email: 'test4@test.com', name: 'Oliver Bennett', status: 'Builds small things that compound',   avatarUrl: avatar(8)  },
  { email: 'test5@test.com', name: 'Sofia Hassan',   status: 'Books, basil, brutalist buildings',   avatarUrl: avatar(44) },
  { email: 'test6@test.com', name: 'Noah Williams',  status: 'Currently learning to bake bread',    avatarUrl: avatar(60) },
];

// Stable, varied images via picsum.photos seeded URLs
const img = (seed) => `https://picsum.photos/seed/${seed}/1200/800`;

// `author` is an index into USERS above; `likers` is an array of indices
const POSTS = [
  {
    author: 0,
    title: 'Morning ritual',
    content:
      'There is something about the first ten minutes of the day with a coffee and a notebook. ' +
      'No phone, no inbox. Just a pen and the noise of the kettle. I think it is the one habit ' +
      'I will keep no matter where I move to next.',
    image: img('coffee-cup'),
    likers: [1, 2, 3, 5],
  },
  {
    author: 1,
    title: 'Walked seventeen miles today',
    content:
      'Caught the early train out to the coast and just kept going. Found a tiny harbour with two ' +
      'fishing boats and an old man selling crab rolls from a fold-out table. He said he had been ' +
      'doing it for forty years. Best lunch of the year.',
    image: img('harbour'),
    likers: [0, 2, 3, 4, 5],
  },
  {
    author: 2,
    title: 'Started a new book — “Piranesi”',
    content:
      'Three chapters in and I am already turning back to re-read pages. The way the narrator ' +
      'describes the halls is hypnotic. Has anyone else read this? Would love recommendations ' +
      'that have a similar feel.',
    image: img('library-1'),
    likers: [0, 4, 5],
  },
  {
    author: 3,
    title: 'Small things compound',
    content:
      'I shipped a tiny improvement to my side project today. Eight lines of code. But it made the ' +
      'feature feel ten times faster. Most of the gains in software (and life) come from a thousand ' +
      'eight-line wins, not one heroic rewrite.',
    image: img('workbench'),
    likers: [0, 1, 4],
  },
  {
    author: 4,
    title: 'The basil survived',
    content:
      'After three failed attempts, I finally have a basil plant that is actually thriving. The ' +
      'secret turned out to be: stop overwatering, move it next to the window, and talk to it ' +
      'occasionally (I am only half-joking).',
    image: img('basil-plant'),
    likers: [0, 1, 2, 3, 5],
  },
  {
    author: 5,
    title: 'First loaf — not bad?',
    content:
      'Made my first sourdough today. The crust is darker than I planned and the crumb is denser ' +
      'than the videos promised, but it tastes like real bread and it is mine. Going to try again ' +
      'on Sunday with a longer cold proof.',
    image: img('sourdough'),
    likers: [0, 2, 3, 4],
  },
  {
    author: 0,
    title: 'Tried a new espresso bar',
    content:
      'Tiny place near the canal. Three seats, one barista, no menu — you just tell them how strong ' +
      'and how much milk. Mine was perfect. I think I will end up here every weekend.',
    image: img('espresso-bar'),
    likers: [1, 4],
  },
  {
    author: 1,
    title: 'Light at 5pm in late October',
    content:
      'The angle is so low and warm right now that everything looks like a film still. I have been ' +
      'walking home the long way just to chase it for twenty minutes a day. Highly recommend.',
    image: img('autumn-light'),
    likers: [0, 2, 3, 4, 5],
  },
  {
    author: 2,
    title: 'On rereading',
    content:
      'I used to feel guilty for rereading books when there are so many unread ones on my shelf. ' +
      'I have stopped. A good book read twice is worth more than two okay books read once.',
    image: img('open-book'),
    likers: [0, 4, 5],
  },
  {
    author: 4,
    title: 'A building I cannot stop thinking about',
    content:
      'Walked past this concrete library again today. It looks brutal from across the street, but ' +
      'inside it is all warm wood and soft light. A reminder that buildings (and people) are ' +
      'rarely what they look like at first.',
    image: img('brutalist'),
    likers: [1, 2, 3],
  },
];

// --------------------------------------------------------------------
// Run
// --------------------------------------------------------------------

async function run() {
  const hostHint = process.env.MONGODB_URI.split('@').pop().split('/')[0];
  console.log(`\n→ Connecting to MongoDB at ${hostHint} …`);
  await mongoose.connect(process.env.MONGODB_URI);

  console.log('→ Wiping users + posts collections …');
  await Promise.all([User.deleteMany({}), Post.deleteMany({})]);

  console.log('→ Creating users …');
  const hashedPassword = await bcrypt.hash(PASSWORD, 12);
  const userDocs = await User.insertMany(
    USERS.map((u) => ({
      email: u.email,
      name: u.name,
      status: u.status,
      avatarUrl: u.avatarUrl,
      password: hashedPassword,
      posts: [],
    }))
  );
  console.log(`  ✓ ${userDocs.length} users created`);

  console.log('→ Creating posts + likes …');
  for (const p of POSTS) {
    const creator = userDocs[p.author];
    const likers = (p.likers || [])
      .filter((idx) => idx !== p.author) // don't self-like
      .map((idx) => userDocs[idx]._id);

    const post = await Post.create({
      title: p.title,
      content: p.content,
      imageUrl: p.image,
      creator: creator._id,
      likes: likers,
    });

    creator.posts.push(post._id);
    await creator.save();
  }
  console.log(`  ✓ ${POSTS.length} posts created`);

  const totalLikes = POSTS.reduce(
    (sum, p) => sum + (p.likers || []).filter((i) => i !== p.author).length,
    0
  );
  console.log(`  ✓ ${totalLikes} likes distributed\n`);

  console.log('Done. Test accounts:');
  USERS.forEach((u) =>
    console.log(`  ${u.email.padEnd(20)} → ${u.name}`)
  );
  console.log(`\nPassword for every account: ${PASSWORD}\n`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
