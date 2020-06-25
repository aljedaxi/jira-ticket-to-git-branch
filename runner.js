'use strict';
const { main } = require('./brancher');
const yaml = require('js-yaml');
const fs = require('fs');
const { join, prepend, split, map, head, prop, find, ifElse, compose} = require('ramda');

const isRight = either => either.isRight();
const prep = p => compose(
	join(' '),
	prepend(p),
	split(' ')
);

const proFile = './profiles.yaml';
//TODO
const profileSelector = head;
const defaultExists = find(prop('default'));
const getDefault = defaultExists;

const readFile = path =>
	new Promise((resolve, reject) =>
		fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data))
	);

const selectProfile = profiles =>
	profiles.length === 1   ? head(profiles)
: defaultExists(profiles) ? getDefault(profiles)
:                           profileSelector(profiles);

const getProfiles = proFile =>
	readFile(proFile)
		.then(yaml.safeLoad)
		.then(selectProfile)
		.catch(console.error);

getProfiles(proFile)
	.then(main)
	.then(
		ifElse(
			isRight, 
			map(console.log),
			compose(console.error, prep('Error:'), prop('value'))
		)
	)
	.then(process.exit)
	;
