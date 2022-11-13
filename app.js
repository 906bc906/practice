const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017/");
const database = client.db("testDB");
const user = database.collection('User');
const article = database.collection('Article');
const following = database.collection('Following');

const MAXUSER = 500;
const FOLLOWS = 49;
const FOLLOWSTEP = 10;
const ARTICLES = 10;


async function cleanDB(){
  console.time('CLEAN DB');
  await user.deleteMany({});
  await article.deleteMany({});
  await following.deleteMany({});
  await following.dropIndexes();
  await following.createIndex({from: 1});
  await following.createIndex({to: 1});
  await article.dropIndexes();
  await article.createIndex({author: 1})
  console.timeEnd('CLEAN DB');
}

async function createAllUsers(){
  const proms = [];
  console.time("CREATE ALL USER");
  for (let i=0; i<MAXUSER; i++) {
    proms.push(
      user.insertOne({
        _id: i,
        nickname: i.toString()
      })
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
        following.insertOne({
          from: i,
          to: idx
        })
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
        article.insertOne({
          author: i,
          title: j.toString(),
          body: "12345678890"
        })
      )
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
    const aggCursor = following.aggregate([
      {$match: { to: idx }},
      {$count: "followers"}
    ]);
    proms.push(
      aggCursor.forEach(rec => rec)
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
    const aggCursor = following.aggregate([
      {$match: { from: idx }},
      {$count: "following"}
    ]);
    proms.push(
      aggCursor.forEach(rec => rec)
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
    const aggCursor = article.aggregate([
      {$match: { author: idx }},
      {$count: "articles"}
    ]);
    proms.push(
      aggCursor.forEach(rec => rec)
    );
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
  client.close();
})();
