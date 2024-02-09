import { UserCard } from './usercard.mjs'

class Session {
	constructor({ userID }) {
		this.userID = userID;
		this.currentCard = null;
		this.score = {
			pass: 0, fail: 0,
			get retention() { return this.pass / (this.pass + this.fail); }
		};
	}

	async nextCard() {
		let card = await UserCard.getNextDueCard(this.userID);
		if (!card)
			return null;

		return this.currentCard = card;
	}

	async grade(grade) {
		let usercard = await UserCard.getOrCreateByID(this.userID, this.currentCard.id)
		if (!usercard)
			throw new Error(`Usercard not found: ${this.userID, this.currentCard.id}`);

		const result = await usercard.reviewCard(grade);

		if (result)
			this.score.pass++;
		else
			this.score.fail++;

		return result;
	}
};

export { Session };
