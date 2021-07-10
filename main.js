import { isYahtzee, bothSections as scoreboardRows } from './scoreboard-rows.js';

const search = new URLSearchParams(window.location.search),
	preDice = search.get('dice');

const checkboxes = [],
	checkboxContainer = document.getElementById('dice');
for (let i = 0; i < 13 * 5 * 3; ++i) {
	const li = child(checkboxContainer, 'li');
	const label = child(li, 'label');
	const checkbox = child(label, 'input');
	child(label, 'display').classList.add('display');
	const value = preDice ? parseInt(preDice[i]) :-~ (Math.random() * 6);
	if (isNaN(value) || value < 1 || value > 6) throw new Error("Bad die: " + value);
	checkbox.setAttribute('type', 'checkbox');
	text(label, value);
	checkbox.value = value;
	li.setAttribute('data-value', value);
	checkbox.addEventListener('change', updateRolls);
	checkboxes.push(checkbox);
	li.setAttribute('title', value);
}

const rolls = [],
	rollContainer = document.getElementById('rolls');
for (let i = 0; i < 13; ++i) {
	const li = child(rollContainer, 'li');
	li.classList.add('after-error');
	li.classList.add('scoreboard-row');
	li.classList.add(`row-${i}`);
	const display = child(li, 'span');
	const row = child(li, 'select');
	const options = scoreboardRows.map(scoreboardRow => {
		const el = child(row, 'option');
		text(el, scoreboardRow.name);
		el.value = scoreboardRow.id;
		return el;
	});
	row.addEventListener('change', updateRolls);
	rolls.push({ li, display, row, options });
}
const errorContainer = child(rollContainer, 'li'),
	bonusContainer = child(rollContainer, 'li'),
	totalContainer = child(rollContainer, 'li');
errorContainer.classList.add('error');

const a = child(child(rollContainer, 'li'), 'a');
text(a, 'Play again with these dice');
a.setAttribute('href', '?dice=' + checkboxes.map(die => die.value).join(''));

updateRolls();

function child(parent, type) {
	const child = document.createElement(type);
	parent.appendChild(child);
	return child;
}
function text(parent, text) {
	parent.appendChild(document.createTextNode(text));
}
function setText(parent, value) {
	parent.innerHTML = '';
	if (value) text(parent, value);
}

function displayDie(parent, n) {
	text(parent, '>⚀⚁⚂⚃⚄⚅'[n]);
}

function getRowById(id) {
	return scoreboardRows.find(r => r.id == id);
}

function getCheckboxContainer(checkbox) {
	return checkbox.parentElement.parentElement;
}

function updateRolls() {
	for (const checkbox of checkboxes) getCheckboxContainer(checkbox).setAttribute('class', 'after-game');
	const { rolls: dice, ...error } = getRolls();
	const errors = new Set(error.error ? [error.error] : []);
	const scoreboard = scoreboardRows.map(row => ({ id: row.id, score: 0 })),
		yahtzee = scoreboard.find(r => r.id == 'yahtzee');
	for (const box of error.checkboxesUsed ?? []) getCheckboxContainer(box).setAttribute('class', 'error');
	const scored = new Set();
	for (let i = 0; i < 13; ++i) {
		const roll = dice[i],
			el = rolls[i];
		if (!roll) {
			el.li.classList.add('after-error');
			continue;
		}
		for (const box of roll.checkboxesUsed) getCheckboxContainer(box).setAttribute('class', `row-${i}`);
		el.li.classList.remove('after-error');
		setText(el.display);
		for (const die of roll.heldDice.sort()) displayDie(el.display, die);
		for (const option of el.options) {
			const row = getRowById(option.value);
			const score = row.condition(roll.heldDice) * row.score(roll.heldDice)
				+ (yahtzee.score && isYahtzee(roll.heldDice)) * 100;
			setText(option, `${row.name} (${scored.has(row.id) ? 'already used' : score})`);
			if (el.row.value == row.id)
				if (scored.has(row.id)) {
					errors.add(`${row.name} has been scored more than once.`);
				} else {
					scored.add(row.id);
					scoreboard.find(r => r.id == row.id).score = score;
				}
		}
	}
	setText(errorContainer, [...errors].join("; "));
	if (errors.size) errorContainer.classList.remove('hidden');
	else errorContainer.classList.add('hidden');
	const upperSectionTotal = scoreboard.slice(0, 6).reduce((a, b) => a + b.score % 100, 0);
	const gotBonus = upperSectionTotal >= 63;
	setText(bonusContainer, gotBonus ? '+35 upper section bonus' : `${63 - upperSectionTotal} short of upper section bonus`);
	setText(totalContainer, `Total: ${scoreboard.reduce((a, b) => a + b.score, 0) + (gotBonus * 35)}`);
}

function getRolls() {
	let i = 0;
	const rolls = [];
	while (true) {
		const roll = getCompleteRoll();
		if (roll.error) return { rolls, ...roll };
		rolls.push(roll);
		if (rolls.length == 13) return { rolls };
	}
	function getCompleteRoll() {
		let unheldSlots = 5;
		const heldDice = [],
			checkboxesUsed = [];
		for (let roll = 0; roll < 3; ++roll)
			for (let j = unheldSlots; j > 0; --j) {
				const checkbox = checkboxes[i++];
				checkboxesUsed.push(checkbox);
				if (checkbox.checked) {
					--unheldSlots;
					heldDice.push(parseInt(checkbox.value, 10));
				}
			}
		if (heldDice.length == 5) return { heldDice, checkboxesUsed };
		return { checkboxesUsed, error: `${unheldSlots} more dice needed` };
	}
}
