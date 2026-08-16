CREATE TABLE "episode_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "episode_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episode_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "episode_preferences_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE UNIQUE INDEX "episode_preferences_user_id_episode_id_key" ON "episode_preferences"("user_id", "episode_id");

CREATE INDEX "episode_preferences_episode_id_idx" ON "episode_preferences"("episode_id");

CREATE INDEX "episode_preferences_user_id_idx" ON "episode_preferences"("user_id");

ALTER TABLE "episode_preferences" ADD CONSTRAINT "episode_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "episode_preferences" ADD CONSTRAINT "episode_preferences_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
