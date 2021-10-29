"use strict";
require('dotenv').config()
const battles = require('./auto-gather');
const chalk = require('chalk');

const sleepingTimeInMinutes = process.env.MINUTES_GATHER_INTERVAL || 30;
const sleepingTime = sleepingTimeInMinutes * 60000;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async () => {
	try {
		const accountusers = process.env.ACCOUNT?.split(',');
		const accounts = accountusers;
		console.log(' Loaded ' + chalk.yellow(accounts.length) + ' Accounts')
		console.log(' Accounts: ' + chalk.greenBright(accounts))
    
    while (true) {
    	for (let i = 0; i < accounts.length; i++) {
			process.env['ACCOUNT'] = accountusers[i];
			console.log('Gathering battles of: '+chalk.green(accountusers[i]))
			await battles.battlesList(accountusers[i]).then(x=>{return x}).catch(() => console.log('Unable to gather data for local.'));
			await sleep(process.env.SLEEP)
		}
	console.log('Waiting for the next gather in', sleepingTime / 1000 / 60, ' minutes at ', new Date(Date.now() + sleepingTime).toLocaleString());
	await sleep(sleepingTime);
    }
	
	} catch (e) {
    console.log(' Routine error at: ', new Date().toLocaleString(), e)
  }

})();
