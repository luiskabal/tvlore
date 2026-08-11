-- CreateTable
CREATE TABLE "episode_watches" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "episode_id" UUID NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "episode_watches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_watches" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movie_watches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "episode_watches_user_id_episode_id_key" ON "episode_watches"("user_id", "episode_id");

-- CreateIndex
CREATE INDEX "episode_watches_episode_id_idx" ON "episode_watches"("episode_id");

-- CreateIndex
CREATE INDEX "episode_watches_user_id_idx" ON "episode_watches"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "movie_watches_user_id_movie_id_key" ON "movie_watches"("user_id", "movie_id");

-- CreateIndex
CREATE INDEX "movie_watches_movie_id_idx" ON "movie_watches"("movie_id");

-- CreateIndex
CREATE INDEX "movie_watches_user_id_idx" ON "movie_watches"("user_id");

-- AddForeignKey
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_watches" ADD CONSTRAINT "episode_watches_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_watches" ADD CONSTRAINT "movie_watches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_watches" ADD CONSTRAINT "movie_watches_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
