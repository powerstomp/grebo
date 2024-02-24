import { pool } from '../database.mjs'
import { Card } from './card.mjs'
import { Review } from './review.mjs'

class UserCard {
	constructor({ userID, cardID, due, streak }) {
		this.userID = userID;
		this.cardID = cardID;
		this.due = due;
		this.streak = streak;
	}

	static async fromRow(row) {
		return new UserCard({
			userID: row.userid,
			cardID: row.cardid,
			due: row.due,
			streak: row.streak
		});
	}


	static async getByID(userID, cardID) {
		const result = await pool.query(
			'SELECT * FROM USER_CARDS WHERE UserID = $1 AND CardID = $2',
			[userID, cardID]);
		return result.rowCount === 0 ? null : this.fromRow(result.rows[0]);
	}

	static async create(userID, cardID) {
		const result = await pool.query(
			`INSERT INTO USER_CARDS (UserID, CardID)
             VALUES ($1, $2)
             ON CONFLICT (userid, cardid) DO NOTHING
             RETURNING *`, [userID, cardID]
		)
		return result.rowCount === 0 ? null : this.fromRow(result.rows[0]);
	}

	static async getOrCreateByID(userID, cardID) {
		return await this.getByID(userID, cardID) ?? await this.create(userID, cardID);
	}

	static async getNextDueCard(userID) {
		const result = await pool.query(
			`SELECT c.* FROM CARDS c
			LEFT JOIN USER_CARDS uc ON c.ID = uc.CardID AND uc.UserID = $1
			WHERE uc.Due IS NULL OR uc.Due <= NOW()
			ORDER BY uc.due ASC, RANDOM() LIMIT 1`,
			[userID],
		);

		return result.rowCount === 0 ? null : Card.fromRow(result.rows[0]);
	}

	async reviewCard(grade) {
		if (grade === 'Pass') {
			this.streak++;
			this.due = new Date(Date.now() + 2 ** this.streak * 24 * 60 * 60 * 1000)
		} else if (grade === 'Fail') {
			this.streak = 0;
			this.due = new Date(Date.now() + 24 * 60 * 60 * 1000);
		} else
			throw new Error(`Invalid grade: ${grade}`);

		const result = await pool.query(
			`UPDATE USER_CARDS
			SET Due = $3, Streak = $4
			WHERE UserID = $1 AND CardID = $2
			RETURNING *`,
			[this.userID, this.cardID, this.due, this.streak]);
		if (result.rowCount === 0)
			throw new Error('Failed to update card scheduling information.');
		const review = await Review.create(this.cardID, this.userID, grade);
		if (!review)
			throw new Error('!review');

		Object.assign(this, UserCard.fromRow(result.rows[0]));
		return grade === 'Pass';
	}
};

export { UserCard };
