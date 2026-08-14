-- CreateTable
CREATE TABLE "show_watchlist_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "show_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "show_watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_watchlist_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movie_watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "show_watchlist_items_user_id_show_id_key" ON "show_watchlist_items"("user_id", "show_id");

-- CreateIndex
CREATE INDEX "show_watchlist_items_show_id_idx" ON "show_watchlist_items"("show_id");

-- CreateIndex
CREATE INDEX "show_watchlist_items_user_id_idx" ON "show_watchlist_items"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "movie_watchlist_items_user_id_movie_id_key" ON "movie_watchlist_items"("user_id", "movie_id");

-- CreateIndex
CREATE INDEX "movie_watchlist_items_movie_id_idx" ON "movie_watchlist_items"("movie_id");

-- CreateIndex
CREATE INDEX "movie_watchlist_items_user_id_idx" ON "movie_watchlist_items"("user_id");

-- AddForeignKey
ALTER TABLE "show_watchlist_items" ADD CONSTRAINT "show_watchlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_watchlist_items" ADD CONSTRAINT "show_watchlist_items_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_watchlist_items" ADD CONSTRAINT "movie_watchlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_watchlist_items" ADD CONSTRAINT "movie_watchlist_items_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
