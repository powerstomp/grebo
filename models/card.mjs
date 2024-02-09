import { pool } from '../database.mjs'

class Card {
	constructor({ id, front, back }) {
		this.id = id;
		this.front = front;
		this.back = back;
	}

	static async fromRow(row) {
		return new Card(row);
	}

	static async create(front, back) {
		if (!front || !back)
			throw new Error("Card has empty side.");
		const result = await pool.query(
			'INSERT INTO CARDS(Front, Back) VALUES ($1, $2) RETURNING *',
			[front, back]);
		return this.fromRow(result.rows[0]);
	}

	static async getByID(id) {
		const result = await pool.query(
			'SELECT * FROM CARDS WHERE id = $1',
			[id]);
		return result.rowCount === 0 ? null : this.fromRow(result.rows[0]);
	}

	static async getAll() {
		const result = await pool.query(
			'SELECT * FROM cards');
		return result.rows.map((row) => this.fromRow(row));
	}

	async update(front, back) {
		if (!front || !back)
			throw new Error('Card has empty side.');
		const result = await pool.query(
			'UPDATE CARDS SET Front = $2, Back = $3 WHERE ID = $1 RETURNING *',
			[this.id, front, back]);
		if (result.rowCount === 0)
			throw new Error(`Card update failed: ${this.id}`);
		Object.assign(this, this.fromRow(result.rows[0]));
	}

	static async delete(id) {
		await pool.query(
			'DELETE FROM cards WHERE id = $1',
			[id]);
	}
};

export { Card };
