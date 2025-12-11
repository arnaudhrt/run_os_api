import { db } from "@/shared/database/database";
import { CreateSongModel, SongModel } from "./song.model";

export class SongData {
  public static async getAllSongs(): Promise<SongModel[]> {
    const query = "SELECT * FROM songs ORDER BY created_at ASC";
    const result = await db.query(query);
    return result.rows;
  }

  public static async getSongById(id: string): Promise<SongModel | null> {
    const result = await db.query("SELECT * FROM songs WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  public static async createSong(data: CreateSongModel): Promise<string> {
    const { name, artist, midi_file, cover_image, difficulty, player_id } = data;

    const result = await db.query(
      `INSERT INTO songs (name, artist, cover_image, difficulty, midi_file, player_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
      [name, artist, cover_image, difficulty, midi_file, player_id]
    );

    return result.rows[0].id;
  }
}
