// http://grail.sourceforge.net/demo/yahtzee/rules.html

function sum(arr) {
	return arr.reduce((a, b) => a + b, 0);
}

function sumIf(n) {
	return dice => sum(dice.filter(v => v == n));
}

function histogram(dice) {
	return [1,2,3,4,5,6].map(n => dice.filter(d => d == n).length);
}

function straight(n) {
	return dice => {
		let run = 0;
		for (const v of histogram(dice))
			if (v == 0) run = 0;
			else if (++run >= n) return true;
		return false
	};
}

function ofAKind(n) {
	return dice => Math.max(...histogram(dice)) >= n;
}

function always() { return true; }
function constant(n) { return () => n; }

export const upperSectionNames = {
	1: 'ones',
	2: 'twos',
	3: 'threes',
	4: 'fours',
	5: 'fives',
	6: 'sixes'
};

export const isYahtzee = ofAKind(5);

export const upperSection = [
	{
		id: 'ones',
		name: '⚀ Ones',
		score: sumIf(1),
		condition: always,
		description: 'Score one point for each one you roll'
	}, {
		id: 'twos',
		name: '⚁ Twos',
		score: sumIf(2),
		condition: always,
		description: 'Score two points for each two you roll'
	}, {
		id: 'threes',
		name: '⚂ Threes',
		score: sumIf(3),
		condition: always,
		description: 'Score three points for each three you roll'
	}, {
		id: 'fours',
		name: '⚃ Fours',
		score: sumIf(4),
		condition: always,
		description: 'Score four points for each four you roll'
	}, {
		id: 'fives',
		name: '⚄ Fives',
		score: sumIf(5),
		condition: always,
		description: 'Score five points for each five you roll'
	}, {
		id: 'sixes',
		name: '⚅ Sixes',
		score: sumIf(6),
		condition: always,
		description: 'Score six points for each six you roll'
	}
];

export const lowerSection = [
	{
		id: '4-straight',
		name: 'Low straight',
		score: constant(30),
		condition: straight(4),
		description: 'Any run of four consecutive numbers, eg, 2, 3, 4, 5'
	}, {
		id: '5-straight',
		name: 'High straight',
		score: constant(40),
		condition: straight(5),
		description: 'Any run of five consecutive numbers, eg, 2, 3, 4, 5, 6'
	}, {
		id: 'full-house',
		name: 'Full house',
		score: constant(25),
		condition: dice => !histogram(histogram(dice))[0], // trust me
		description: 'Two of one number and three of another'
	}, {
		id: '3-same',
		name: 'Three of a kind',
		score: sum,
		condition: ofAKind(3),
		description: 'Roll three of any number'
	}, {
		id: '4-same',
		name: 'Four of a kind',
		score: sum,
		condition: ofAKind(4),
		description: 'Roll four of any number'
	}, {
		id: 'yahtzee',
		name: 'Yahtzee',
		score: constant(50),
		condition: isYahtzee,
		description: 'Roll five of any number'
	}, {
		id: 'chance',
		name: 'Chance',
		score: sum,
		condition: always,
		description: 'Score the sum of all your dice'
	}
];

export const bothSections = [ ...upperSection, ...lowerSection ];
