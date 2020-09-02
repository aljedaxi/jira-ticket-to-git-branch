'use strict';
const { main } = require('./brancher');
const yaml = require('js-yaml');
const fs = require('fs');
const { join, prepend, split, map, head, prop, find} = require('ramda');
const { either, compose} = require('sanctuary');
const { splitDoThingRejoin } = require('./util');
const Parser = require('rss-parser');
const parser = new Parser();

const prep = p => splitDoThingRejoin (' ') (prepend (p));
const text = r => r.text();

const proFile = './profiles.yaml';
const findDefault = find(prop('default'));
const doThing = firstTryFn => secondTryFn => x => firstTryFn(x) ?? secondTryFn(x);
const profileSelector = doThing (findDefault) (head);

const readFile = path => new Promise(
	(resolve, reject) => fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data))
);

const getProfiles = profilePath =>
	readFile(profilePath)
		.then(yaml.safeLoad)
		.then(profileSelector)
		.catch(console.error);

const headers = ({username, token}) => ({
	Authorization: `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
	'Content-Type': 'application/json',
});

const getTickets = profile => fetch(profile.url, {headers: headers(profile)})
	.then(text)
	.then(data => parser.parseString(data))
	.then(tickets => ({tickets, profile}))
	;

const log = either (compose (console.error) (prep('Error:'))) (console.log)

getProfiles(proFile)
	.then(getTickets)
	.then(main)
	.then(log)
	.then(process.exit)
	;

module.exports = {
	selectProfile: profileSelector, 
	doThing
};
