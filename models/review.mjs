import { pool } from '../database.mjs'


class Review {
	constructor({ id, cardID, userID, grade, time }) {
		this.id = id;
		this.cardID = cardID;
		this.userID = userID;
		this.grade = grade;
		this.time = time;
	}

	static async fromRow(row) {
		return new Review({
			id: row.id,
			cardID: row.cardid,
			userID: row.userid,
			grade: row.grade,
			time: row.time
		});
	}

	static async create(cardID, userID, grade) {
		if (!cardID || !userID || !grade) {
			throw new Error('cardId, userID, and grade are required.');
		}

		const result = await pool.query(
			'INSERT INTO REVIEWS(CardID, UserID, Grade) VALUES($1, $2, $3) RETURNING *',
			[cardID, userID, grade],
		);

		return this.fromRow(result.rows[0]);
	}

	static async getReviewsByUserToday(userID) {
		const result = await pool.query(
			`SELECT * FROM REVIEWS WHERE UserID = $1 AND time >= DATE(NOW())`,
			[userID],
		);
		return result.rows.map((row) => this.fromRow(row));
	}

	static async getReviewCountByUserToday(userID) {
		const result = await pool.query(
			`SELECT COUNT(*) AS ReviewCount FROM REVIEWS
			WHERE UserID = $1 AND time >= DATE(NOW())`,
			[userID]
		);
		return result.rows[0].reviewcount ?? 0;
	}

	static async getUserStreak(userID) {
		const result = await pool.query(
			`WITH USERREVIEWS AS (
				SELECT DISTINCT DATE(Time) AS Date
				FROM REVIEWS
				WHERE UserID = $1
			), STREAKGROUPS AS (
				SELECT Date,
					Date - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY Date)) AS StreakGroup
				FROM USERREVIEWS
			)
			SELECT COUNT(*) AS Streak
			FROM STREAKGROUPS
			WHERE StreakGroup = (SELECT StreakGroup FROM STREAKGROUPS ORDER BY Date DESC LIMIT 1);`,
			[userID]
		);
		return result.rows[0].streak ?? 0;
	}

	static async getTopMostReviewsToday(count) {
		const result = await pool.query(
			`SELECT UserID, COUNT(*) AS ReviewCount FROM REVIEWS
			WHERE time >= DATE(NOW())
			GROUP BY UserID ORDER BY ReviewCount DESC LIMIT $1;
			`, [count]
		);
		return result.rows;
	}
};

export { Review };
