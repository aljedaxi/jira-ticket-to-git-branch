const {
	getTicket, branchName, getTitles,
	getTicketFromTitle, getDescription,
} = require('./brancher');

describe('reformat', () => {
	test('gets the ticket', () => {
		expect(
			getTicketFromTitle('[XM-32] dab on the haters')
		).toStrictEqual(
			'XM-32'
		)
	});
	test('defaults', () => {
		expect(
			getTicketFromTitle('')
		).toStrictEqual(
			'XD-33'
		)
		expect(getDescription('')).toStrictEqual('NO-DESCRIPTION-FOUND');
	});
});

describe('getTicket', () => {
	const withTicket = {ticket: 'x'};
	const withoutTicket = {};
	test('ticket if ticket exists', () => {
		expect(getTicket(withTicket)).toStrictEqual('x')
	});
	// test("Left if ticket doesn't exist", () => {
	// 	expect(getTicket(withoutTicket).isLeft()).toBeTruthy()
	// })
})

describe('branchName', () => {
	const ticket = 'XD-69';
	const shortDescription = 'do something boring';
	const longDescription = 'i carry your heart with me. i carry it in my heart. i am never without it.'
	test('branch names are no longer than 55 + ticketLength characters', () => {
		expect(
			branchName('-')({ticket, description: shortDescription})
		).toStrictEqual(
			'\"XD-69-do something boring\"'
		)
		expect(
			branchName(' ')({ticket, description: longDescription})
		).toStrictEqual(
			'\"XD-69-i carry your heart with me. i carry it in my heart.\"'
		)
	});
});

describe('getTitles', () => {
	const testTickets = {
		  items: [{ creator: 'Graham Neumann', title: '[XM-510] ClauseX: notifications', link: 'https://xmentium.atlassian.net/browse/XM-510', pubDate: 'Tue, 25 Aug 2020 16:53:13 -0600', author: 'Graham Neumann', content: '<style type="text/css">\n\n.tableBorder, .grid\n' }]
	};
	test('returns array of titles', () => {
		expect(
			getTitles(testTickets)
		).toStrictEqual(
			[testTickets.items[0].title]
		)
	});
});
