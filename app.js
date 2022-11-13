const neo4j = require('neo4j-driver');
const neo4jDriver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic("neo4j", "admin")
)

const MAXUSER = 500;
const FOLLOWS = 49;
const FOLLOWSTEP = 10;
const ARTICLES = 10;


async function cleanDB(){
  const session = neo4jDriver.session();
  console.time('CLEAN DB');
  await session.run('MATCH (n)\
  DETACH DELETE n');
  console.timeEnd('CLEAN DB');
}

async function createAllUsers(){
  const proms = [];
  console.time("CREATE ALL USER");
  for (let i=0; i<MAXUSER; i++) {
    const session = neo4jDriver.session();
    
    proms.push(session
      .run('CREATE (:User $props)', {
        props: {
          nickname: i.toString()
        }
      }).then(()=>session.close()))
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
      const session = neo4jDriver.session();
      proms.push(session
        .run('MATCH(user:User {nickname: $userProps.nickname}) \
        MATCH(target:User {nickname: $targetProps.nickname}) \
        CREATE (user)-[:Follows]->(target)', {
          userProps: {
            nickname: i.toString()
          },
          targetProps: {
            nickname: idx.toString()
          }
        }).then(()=>session.close()));
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
      const session = neo4jDriver.session();
      proms.push(session
        .run('MATCH(user:User {nickname: $userProps.nickname})\
        CREATE (user)-[:Writes]->(:Article {title: $article.title, body: $article.body})', {
          userProps: {
            nickname: i.toString()
          },
          article: {
            title: j.toString(),
            body: "12345678890"
          }
        }
      ));
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
    const session = neo4jDriver.session();

    proms.push(session.run(
      'MATCH(user:User {nickname: $userProps.nickname})<-[r:Follows]-(:User)\
      RETURN COUNT(r)', {
        userProps: {
          nickname: idx.toString()
        }
      }
    ).then(()=>session.close()));
    
    //   .then((res) => {res.records.forEach(record => {
    //   console.log(record.get('COUNT(r)').toNumber());
    // });session.close()}))
    
  }
  await Promise.all(proms);
  console.timeEnd('FOLLOWERS');
}

async function getFollowings(iteration) {
  const proms = [];
  console.time('FOLLOWING')
  for (let i=0; i<iteration; i++) {
    const idx = Math.floor((Math.random()*MAXUSER));
    const session = neo4jDriver.session();

    proms.push(session.run(
      'MATCH(user:User {nickname: $userProps.nickname})-[r:Follows]->(:User)\
      RETURN COUNT(r)', {
        userProps: {
          nickname: idx.toString()
        }
      }
    ).then(()=>session.close()));
  }
  await Promise.all(proms);
  console.timeEnd('FOLLOWING');
}

async function getArticles(iteration) {
  const proms = [];
  console.time('GET ARTICLES');
  for (let i=0; i<iteration; i++){
    const idx = Math.floor((Math.random()*MAXUSER));
    const session = neo4jDriver.session();

    proms.push(session
      .run('MATCH(:User {nickname: $userProps.nickname})-[r:Writes]->(:Article)\
      RETURN COUNT(r)', {
        userProps: {
          nickname: idx.toString()
        }
      }).then(()=>session.close()));
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
  neo4jDriver.close();
})();
