const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test',
  password: 'admin',
  port: 5432,
})

const MAXUSER = 500;
const FOLLOWS = 49;
const FOLLOWSTEP = 10;
const ARTICLES = 10;


async function cleanDB(){
  console.time('CLEAN DB');
  await pool.query('DROP TABLE IF EXISTS UserAccount');
  await pool.query('DROP TABLE IF EXISTS Following');
  await pool.query('DROP TABLE IF EXISTS Article');
  await pool.query('CREATE TABLE UserAccount (\
    nickname CHAR(7) NOT NULL,\
    PRIMARY KEY (nickname)\
    )');
  await pool.query('CREATE TABLE Following(\
    idfrom CHAR(7) NOT NULL,\
    idto CHAR(7) NOT NULL\
    )');
  await pool.query('CREATE TABLE Article(\
    author CHAR(7) NOT NULL,\
    title VARCHAR(255) NOT NULL,\
    body TEXT NOT NULL\
    )');
  await pool.query('CREATE INDEX following_idx ON Following (idfrom)');
  await pool.query('CREATE INDEX follower_idx ON Following (idto)');
  await pool.query('CREATE INDEX article_author ON Article (author)');
  console.timeEnd('CLEAN DB');
}

async function createAllUsers(){
  const proms = [];
  console.time("CREATE ALL USER");
  for (let i=0; i<MAXUSER; i++) {
    // should avoid pool.query, but just used for convenience
    // https://node-postgres.com/features/transactions
    proms.push(
      pool.query('INSERT INTO UserAccount(nickname) VALUES ($1)', [i.toString()])
    )
  }
  await Promise.all(proms);
  console.timeEnd("CREATE ALL USER");
}

async function followUsers(){
  const proms = [];
  console.time("FOLLOW USER");
  for (let i=0; i<MAXUSER; i++){
    for (let j=1; j<=FOLLOWS; j++) {
      const idx = rerangeIndex(i + j*FOLLOWSTEP);
      proms.push(
        pool.query('INSERT INTO Following(idfrom, idto) VALUES ($1, $2)', [i.toString(), idx.toString()])
      );
    }
  }
  await Promise.all(proms);
  console.timeEnd("FOLLOW USER");
}

function rerangeIndex(index) {
  return index % MAXUSER;
}

async function writeArticle() {
  const proms = [];
  console.time("WRITE ARTICLE");
  for (let i=0; i<MAXUSER; i++) {
    for (let j=0; j<ARTICLES; j++) {
      proms.push(
        pool.query(
          'INSERT INTO Article(author, title, body) VALUES ($1, $2, $3)',
          [i.toString(), j.toString(), "12345678890"]
        )
      );
    }
  }
  await Promise.all(proms);
  console.timeEnd("WRITE ARTICLE");
}

async function getFollowers(iteration) {
  const proms = [];
  console.time('FOLLOWERS')
  for (let i=0; i<iteration; i++) {
    const idx = Math.floor((Math.random()*MAXUSER));
    proms.push(
      pool.query('SELECT COUNT(*) FROM following WHERE idfrom = $1', [idx.toString()])
    );
  }
  await Promise.all(proms);
  console.timeEnd('FOLLOWERS');
}

async function getFollowings(iteration) {
  const proms = [];
  console.time('FOLLOWING')
  for (let i=0; i<iteration; i++) {
    const idx = Math.floor((Math.random()*MAXUSER));
    proms.push(
      pool.query('SELECT COUNT(*) FROM following WHERE idto = $1', [idx.toString()])
    );
  }
  await Promise.all(proms);
  console.timeEnd('FOLLOWING');
}



async function getArticles(iteration) {
  const proms = [];
  console.time('GET ARTICLES');
  for (let i=0; i<iteration; i++){
    const idx = Math.floor((Math.random()*MAXUSER));
    proms.push(
      pool.query('SELECT COUNT(*) FROM article WHERE author = $1', [idx.toString()])
    )
  }
  await Promise.all(proms);
  console.timeEnd('GET ARTICLES');
}


(async () => {
  await cleanDB();
  await createAllUsers();
  await followUsers();
  await writeArticle();
  await getFollowers(10*MAXUSER);
  await getFollowings(10*MAXUSER);
  await getArticles(10*MAXUSER);
  pool.end();
})();
