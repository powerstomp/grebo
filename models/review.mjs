import { pool } from '../database.mjs'

class Review {
	constructor({ id, cardID, userID, grade, time }) {
		this.id = id;
		this.cardID = cardID;
		this.userID = userID;
		this.grade = grade;
		this.time = time;
	}

	static async create(cardID, userID, grade) {
		if (!cardID || !userID || !grade) {
			throw new Error('cardId, userID, and grade are required.');
		}

		const result = await pool.query(
			'INSERT INTO reviews(CardID, UserID, Grade) VALUES($1, $2, $3) RETURNING *',
			[cardID, userID, grade],
		);
		return new Review(result.rows[0]);
	}

	static async getReviewsByUserToday(userID) {
		const result = await pool.query(
			`SELECT * FROM REVIEWS WHERE UserID = $1 AND time >= NOW() - INTERVAL '1 day'`,
			[userID],
		);
		return result.rows.map((row) => new Review(row));
	}

	static async getReviewCountByUserToday(userID) {
		const result = await pool.query(
			`SELECT COUNT(*) AS ReviewCount FROM REVIEWS
			WHERE UserID = $1 AND time >= NOW() - INTERVAL '1 day'`,
			[userID]
		);
		return result.rows[0].reviewCount ?? 0;
	}

	static async getTopMostReviewsToday(count) {
		const result = await pool.query(
			`SELECT UserID, COUNT(*) AS ReviewCount FROM REVIEWS
			WHERE time >= NOW() - INTERVAL '1 day'
			GROUP BY UserID ORDER BY ReviewCount DESC LIMIT $1;
			`, [count]
		);
		return result.rows;
	}
};

export { Review };
