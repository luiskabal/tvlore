-- CreateTable
CREATE TABLE "show_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "show_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "show_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "show_preferences_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

-- CreateTable
CREATE TABLE "movie_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movie_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "movie_preferences_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

-- CreateIndex
CREATE UNIQUE INDEX "show_preferences_user_id_show_id_key" ON "show_preferences"("user_id", "show_id");

-- CreateIndex
CREATE INDEX "show_preferences_show_id_idx" ON "show_preferences"("show_id");

-- CreateIndex
CREATE INDEX "show_preferences_user_id_idx" ON "show_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "movie_preferences_user_id_movie_id_key" ON "movie_preferences"("user_id", "movie_id");

-- CreateIndex
CREATE INDEX "movie_preferences_movie_id_idx" ON "movie_preferences"("movie_id");

-- CreateIndex
CREATE INDEX "movie_preferences_user_id_idx" ON "movie_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "show_preferences" ADD CONSTRAINT "show_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_preferences" ADD CONSTRAINT "show_preferences_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_preferences" ADD CONSTRAINT "movie_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_preferences" ADD CONSTRAINT "movie_preferences_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
