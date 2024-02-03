import { pool } from '../database.mjs'
import { Card } from './card.mjs'

class UserCard {
	constructor({ userID, cardID, due, streak }) {
		this.userID = userID;
		this.cardID = cardID;
		this.due = due;
		this.streak = streak;
	}

	static async getByID(userID, cardID) {
		const result = await pool.query(
			'SELECT * FROM USER_CARDS WHERE UserID = $1 AND CardID = $2',
			[userID, cardID]);
		return result.rowCount === 0 ? null : new UserCard(result.rows[0]);
	}

	static async create(userID, cardID) {
		const result = await pool.query(
			`INSERT INTO USER_CARDS (UserID, CardID)
             VALUES ($1, $2)
             ON CONFLICT (userid, cardid) DO NOTHING
             RETURNING *`, [userID, cardID]
		)
		return result.rowCount === 0 ? null : new UserCard(result.rows[0]);
	}

	static async getOrCreateByID(userID, cardID) {
		return await getByID(userID, cardID) ?? await create(userID, cardID);
	}

	static async getNextDueCard(userID) {
		const result = await pool.query(
			`SELECT c.* FROM CARDS c
			JOIN USER_CARDS uc ON c.CardID = uc.CardID AND uc.UserID = $1
			WHERE uc.Due IS NULL OR uc.Due <= NOW()
			ORDER BY uc.due ASC, RANDOM() LIMIT 1`,
			[userID],
		);

		return result.rowCount === 0 ? null : new Card(result);
	}

	async reviewCard(grade) {
		if (grade === 'Pass') {
			this.streak++;
			this.due = new Date(Date.now() + 2 ** newStreak * 24 * 60 * 60 * 1000)
		} else if (grade === 'Fail') {
			this.streak = 0;
			this.due = new Date();
		} else
			throw new Error(`Invalid grade: ${grade}`);

		const result = await pool.query(
			`UPDATE USER_CARDS
			SET Due = $3, Streak = $4
			WHERE UserID = $1 AND CardID = $2
			RETURNING 1`,
			[this.userID, this.cardID, this.due, this.streak]);
		if (result.rowCount === 0)
			throw new Error('Failed to write card review to database.');

		return grade === 'Pass';
	}
};

export { UserCard };
