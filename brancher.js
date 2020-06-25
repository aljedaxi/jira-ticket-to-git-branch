const Parser = require('rss-parser');

const prompts = require('prompts');
const fetch = require('isomorphic-unfetch');
const { prop, head, map, compose, join, without, tail, slice, split, } = require('ramda');
const { Left, Right } = require('funfix');

// TODO REMOVE ME, I'M FOR TESTING
//function -> x -> x
const tee = f => s => {
	f(s);
	return s;
};

const trace = tee(console.log);
const coolTrace = c => s => {console.log(); return s;};

const parser = new Parser();

const text = r => r.text();
const spaceToHyphen = s => s.split(' ').join('-');
const deSquare = compose(join(''), without(['[', ']']));

const selectTicket = titles =>
	prompts({
		type: 'select',
		name: 'ticket',
		message: 'What is this branch for?',
		choices: titles.map(title => ({ title, value: title })),
	});

const newMode = s => {
	const sa = s.split(' ');
	const getDescription = compose(spaceToHyphen, join(' '), tail);
	const getTicket = compose(deSquare, head);
	return {
		ticket: getTicket(sa),
		description: getDescription(sa),
	};
};

const MAX_DESCRIPTION_LENGTH = 55;
const delimiter = '-';
const shorten = compose(
	join(delimiter),
	slice(0, -2),
	split(delimiter),
	slice(0, MAX_DESCRIPTION_LENGTH),
);

const branchName = ({ticket, description}) => 
	description.length > MAX_DESCRIPTION_LENGTH
		? `"${ticket}-${shorten(description)}"`
		: `"${ticket}-${description}"`
		;

const formatAsGitCommand = ({ ticket, description }) => [
	'git checkout develop',
	'git pull remote develop',
	`git checkout -b ${branchName({ticket, description})}`,
].join('\n');

const safeProp = p => o => p in o ? Right(o[p]) : Left('No tickets found');

//{string, string, string} -> Either<String, String>
const main = ({ token, username, url }) => {
	const authstring = ({ username, token }) =>
		Buffer.from(`${username}:${token}`).toString('base64');

	const headers = {
		Authorization: `Basic ${authstring({ username, token })}`,
		'Content-Type': 'application/json',
	};

	return fetch(url, { headers })
		.then(text)
		.then(data => parser.parseString(data))
		.then(prop('items'))
		.then(map(prop('title')))
		.then(selectTicket)
		.then(safeProp('ticket'))
		.then(map(newMode))
		.then(map(formatAsGitCommand))
		;
};

module.exports = {main};
