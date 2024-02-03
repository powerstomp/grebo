import { UserCard } from './usercard.mjs'

class Session {
	constructor({ userID }) {
		this.userID = userID;
		this.currentCard = null;
		this.score = { pass: 0, fail: 0 };
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

		return await usercard.reviewCard(grade);
	}
};
