const prompts = require('prompts');
const fetch = require('isomorphic-unfetch');
const { propOr, replace, join, without, slice} = require('ramda');
const { 
	Left, Right, chain, value, pipeK,
	Just, Nothing, pipe, prop, tail,
	maybe, head, splitOn, compose, map,
} = require('sanctuary');
const { splitDoThingRejoin } = require('./util');

const spaceToHyphen = compose (join('-')) (splitOn(' '));
const removeInvalidCharacters = replace(/[:~^\\]+/, '');
const deSquare = compose (join('')) (without(['[', ']']));

const DEFAULT_TICKET = 'XD-33';
const DEFAULT_DESCRIPTION = 'NO-DESCRIPTION-FOUND';
const DEFAULT_LOCAL_BRANCH = 'develop';
const DEFAULT_REMOTE_BRANCH = 'develop';
const DEFAULT_REMOTE_REPO = 'remote';

const MAX_DESCRIPTION_LENGTH = 55;
const shorten = delimiter => pipe([
	slice(0, MAX_DESCRIPTION_LENGTH),
	splitDoThingRejoin (delimiter) (slice(0, -2)),
]);

//string[] -> Either<string, string>
const selectTicket = titles =>
	prompts({
		type: 'select',
		name: 'ticket',
		message: 'What is this branch for?',
		choices: [
			...titles.map(title => ({ title, value: Right(title) })), 
			{ title: 'cancel', value: Left('cancel') }
		]
	});

const branchName = delimiter => ({ ticket, description }) =>
	description.length > MAX_DESCRIPTION_LENGTH
		? `"${ticket}-${shorten(delimiter)(description)}"`
		: `"${ticket}-${description}"`;

const formatAsGitCommand = ({ localDevelopBranch, remoteRepo, remoteDevelopBranch }) => ({ ticket, description }) =>
	`git checkout ${localDevelopBranch ?? DEFAULT_LOCAL_BRANCH}\n` +
	`git pull ${remoteRepo ?? DEFAULT_REMOTE_REPO} ${remoteDevelopBranch ?? DEFAULT_REMOTE_BRANCH}\n` +
	`git checkout -b ${branchName('-')({ ticket, description })}\n`;

const getDescription = pipe([
	splitOn(' '),
	sa => sa[0] === '' ? Nothing : Just (tail (sa)),
	maybe (DEFAULT_DESCRIPTION) (pipe([
		join(' '),
		removeInvalidCharacters, 
		spaceToHyphen
	]))
]);

const getTicketFromTitle = pipe([
	splitOn(' '),
	sa => sa[0] === '' ? Nothing : Just (sa[0]),
	maybe (DEFAULT_TICKET) (deSquare),
]);
const getTicketAndDescription = s => ({ticket: getTicketFromTitle(s), description: getDescription(s)})
//reformat:: GitInfo -> string -> string
const reformat = gitInfo => 
	compose (formatAsGitCommand(gitInfo)) (getTicketAndDescription);

//getTitles:: Maybe 
const getTitles = pipe([prop('items'), map(prop('title'))]);
const getTicket = propOr(Left('expected ticket'), 'ticket');

//GitInfo = {localDevelopBranch: string; remoteRepo: string; remoteDevelopBranch: string};
//{string, string, string} -> Either<String, String>
const main = ({profile, tickets}) =>
	selectTicket (getTitles (tickets))
		.then(getTicket)
		.then(map(reformat(profile)))
		;

module.exports = {
	main,
	getTicket,
	branchName,
	shorten,
	getTitles, getTicketFromTitle, getDescription,
};
