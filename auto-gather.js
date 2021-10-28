require('dotenv').config()
const {readFile,writeFile} = require('jsonfile');

let pc = 0;
const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

function uniqueListByKey(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}

async function getBattleHistory(player = '') {
  const battleHistory = await require('async-get-json')(`https://game-api.splinterlands.io/battle/history?player=${player}`)
    .then(b=>b.battles)
    .catch((error) => {
      console.log('There has been a problem with your fetch operation:', error);
      return [];
    });
  require('readline').clearLine(process.stdout,0)
  require('readline').cursorTo(process.stdout,0);
  process.stdout.write(`battle-data: ${pc+++' '+player}`);
  return battleHistory;
}

const extractGeneralInfo = (x) => {
    return {
        mana_cap: x.mana_cap ? x.mana_cap : '',
        ruleset: x.ruleset ? x.ruleset : '',
    }
}

const extractMonster = (team) => {
    const monster1 = team.monsters[0];
    const monster2 = team.monsters[1];
    const monster3 = team.monsters[2];
    const monster4 = team.monsters[3];
    const monster5 = team.monsters[4];
    const monster6 = team.monsters[5];

    return {
        summoner_id: team.summoner.card_detail_id,
        monster_1_id: monster1 ? monster1.card_detail_id : '',
        monster_2_id: monster2 ? monster2.card_detail_id : '',
        monster_3_id: monster3 ? monster3.card_detail_id : '',
        monster_4_id: monster4 ? monster4.card_detail_id : '',
        monster_5_id: monster5 ? monster5.card_detail_id : '',
        monster_6_id: monster6 ? monster6.card_detail_id : '',
    }
}

let battlesList = [];
let promises = [];
const battles = async (player) =>  await getBattleHistory(player)
.then(u => u.map(x => { 
return [x.player_1, x.player_2] 
}).reduce((acc, val) => acc.concat(val), []).filter(distinct))
.then(ul => ul.map(user => {
    promises.push(
      getBattleHistory(user)
      .then(battles => battles.map(
        battle => {
          const details = JSON.parse(battle.details);
          if (details.type != 'Surrender') {
            if (battle.winner && battle.winner == battle.player_1) {
              const monstersDetails = extractMonster(details.team1)
              const info = extractGeneralInfo(battle)
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_1,
               verdict: (battle.winner && battle.winner == battle.player_1)?'w':(winner == 'DRAW')? 'd' :'l',
              }
            } else if (battle.winner && battle.winner == battle.player_2) {
              const monstersDetails = extractMonster(details.team2)
              const info = extractGeneralInfo(battle)
              return {
                ...monstersDetails,
                ...info,
                battle_queue_id: battle.battle_queue_id_2,
                verdict: (battle.winner && battle.winner == battle.player_2)?'w':(winner == 'DRAW')? 'd' :'l',
              }
            }
			
          }
        })
      )
      .then(x => battlesList = [...battlesList, ...x])
    )
  }))
  .then(() => { return Promise.all(promises) })
  .then(() => { return new Promise((res,rej) => {
				 
	  let bb1 = battlesList.length,bb2=bb1;
    readFile(`./data/newHistory.json`,(err, data) => {
      if (err) {
        console.log(`Error reading file from disk: ${err}`); rej(err)
      } else {
		data1 = data;
        battlesList = data1 ? [...battlesList, ...data1] : battlesList;
      }
      console.log('battles',bb3=battlesList.length-bb2);
      battlesList = uniqueListByKey(battlesList.filter(x => x != undefined), "battle_queue_id")
	    console.log('battles',bb4=battlesList.length-bb3,' added')
	    console.log('total battle',battlesList.length+bb4);
      writeFile(`./data/newHistory.json`, battlesList, function (err) {
        if (err) {
          console.log(err,'a'); rej(err);
        }
         battlesList = [],
         promises = [];
		 data1 = [];
      });
      res(battlesList,data,promises)
    });
  }) }) 

module.exports.battlesList = battles;
