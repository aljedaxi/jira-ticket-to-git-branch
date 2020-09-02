const {
	split, join
} = require('ramda');
const {
	pipe
} = require('sanctuary');
const splitDoThingRejoin = on => thing => pipe([split(on), thing, join(on)]);

module.exports = {
	splitDoThingRejoin,
};
