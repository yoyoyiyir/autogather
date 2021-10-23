require('dotenv').config()
const fetch = require("node-fetch");
const fs = require('fs');

let pc = 0;
distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}
median = arr => {
  mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
function uniqueListByKey(arr, key) {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}

async function getBattleHistory(player = '', data = {}) {
    	battleHistory = await fetch(`https://cache-api.splinterlands.com/battle/history?player=${player}`)
	//const battleHistory = await fetch(`https://api.splinterlands.com/battle/history?player=${player}`)
	//const battleHistory = await fetch(`https://game-api.splinterlands.com/battle/history?player=${player}`)
	//const battleHistory = await fetch(`https://api2.splinterlands.com/battle/history?player=${player}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok '+player);
            }
            return response;
        })
        .then((battleHistory) => {
            return battleHistory.json();
        })
		.then((battleHistory) => {
            return battleHistory.battles;
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
	require('readline').clearLine(process.stdout,0)
	require('readline').cursorTo(process.stdout,0);
	process.stdout.write(`${pc+++' '+player}`);
    return battleHistory;
}

extractGeneralInfo = (x) => {
    return {
        mana_cap: x.mana_cap ? x.mana_cap : '',
        ruleset: x.ruleset ? x.ruleset : '',
    }
}

extractMonster = (team) => {
    monster1 = team.monsters[0];
    monster2 = team.monsters[1];
    monster3 = team.monsters[2];
    monster4 = team.monsters[3];
    monster5 = team.monsters[4];
    monster6 = team.monsters[5];

    return {
        summoner_id: team.summoner.card_detail_id,
        summoner_level: team.summoner.level,
        monster_1_id: monster1 ? monster1.card_detail_id : '',
        monster_2_id: monster2 ? monster2.card_detail_id : '',
        monster_3_id: monster3 ? monster3.card_detail_id : '',
        monster_4_id: monster4 ? monster4.card_detail_id : '',
        monster_5_id: monster5 ? monster5.card_detail_id : '',
        monster_6_id: monster6 ? monster6.card_detail_id : '',
    }
}

battlesList = [];
const battles = (process.env.ACCOUNT.split(',')).map(user =>
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
                        }
                    } else if (battle.winner && battle.winner == battle.player_2) {
                        const monstersDetails = extractMonster(details.team2)
                        const info = extractGeneralInfo(battle)
                        return {
                            ...monstersDetails,
                            ...info,
                            battle_queue_id: battle.battle_queue_id_2,
                        }
                    }
                }

            })
        ).then(x => battlesList = [...battlesList, ...x])
)
		
Promise.all(battles).then(() => {
	let bb1 = battlesList.length,bb2=bb1;
    fs.readFile(`./newHistory.json`, 'utf8', (err, data) => { if (err) { console.log(`Error reading file from disk: ${err}`);// rej(err)
      } else {
        battlesList = data ? [...battlesList, ...JSON.parse(data)] : battlesList;
      }
	  console.log('');
      console.log('battles',bb3=battlesList.length-bb2);
      battlesList = uniqueListByKey(battlesList.filter(x => x != undefined), "battle_queue_id")
	  console.log('battles',bb4=battlesList.length-bb3,' added')
	  console.log(' total battle',battlesList.length+bb4);
      fs.writeFile(`./newHistory.json`, JSON.stringify(battlesList), function (err) { if (err) { console.log(err,'a'); rej(err); }});
    });
})