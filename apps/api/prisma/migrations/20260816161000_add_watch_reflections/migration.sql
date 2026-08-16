CREATE TABLE "show_reflections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "show_id" UUID NOT NULL,
  "reaction" TEXT NOT NULL,
  "favorite_character" TEXT,
  "comment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "show_reflections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "movie_reflections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "movie_id" UUID NOT NULL,
  "reaction" TEXT NOT NULL,
  "favorite_character" TEXT,
  "comment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "movie_reflections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "episode_reflections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "episode_id" UUID NOT NULL,
  "reaction" TEXT NOT NULL,
  "favorite_character" TEXT,
  "comment" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "episode_reflections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "show_reflections_user_id_show_id_key" ON "show_reflections"("user_id", "show_id");
CREATE INDEX "show_reflections_show_id_idx" ON "show_reflections"("show_id");
CREATE INDEX "show_reflections_user_id_idx" ON "show_reflections"("user_id");

CREATE UNIQUE INDEX "movie_reflections_user_id_movie_id_key" ON "movie_reflections"("user_id", "movie_id");
CREATE INDEX "movie_reflections_movie_id_idx" ON "movie_reflections"("movie_id");
CREATE INDEX "movie_reflections_user_id_idx" ON "movie_reflections"("user_id");

CREATE UNIQUE INDEX "episode_reflections_user_id_episode_id_key" ON "episode_reflections"("user_id", "episode_id");
CREATE INDEX "episode_reflections_episode_id_idx" ON "episode_reflections"("episode_id");
CREATE INDEX "episode_reflections_user_id_idx" ON "episode_reflections"("user_id");

ALTER TABLE "show_reflections"
  ADD CONSTRAINT "show_reflections_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "show_reflections"
  ADD CONSTRAINT "show_reflections_show_id_fkey"
  FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "movie_reflections"
  ADD CONSTRAINT "movie_reflections_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "movie_reflections"
  ADD CONSTRAINT "movie_reflections_movie_id_fkey"
  FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "episode_reflections"
  ADD CONSTRAINT "episode_reflections_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "episode_reflections"
  ADD CONSTRAINT "episode_reflections_episode_id_fkey"
  FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
