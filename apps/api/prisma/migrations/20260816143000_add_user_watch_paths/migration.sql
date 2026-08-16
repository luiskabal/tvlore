CREATE TABLE "user_watch_paths" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_watch_paths_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_watch_path_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "path_id" UUID NOT NULL,
    "media_type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "poster_path" TEXT,
    "year" INTEGER,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_watch_path_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_watch_path_items_media_type_check" CHECK ("media_type" IN ('movie', 'show')),
    CONSTRAINT "user_watch_path_items_provider_check" CHECK ("provider" = 'tmdb'),
    CONSTRAINT "user_watch_path_items_position_check" CHECK ("position" > 0),
    CONSTRAINT "user_watch_path_items_year_check" CHECK ("year" IS NULL OR ("year" >= 1870 AND "year" <= 2100))
);

CREATE INDEX "user_watch_paths_user_id_created_at_idx" ON "user_watch_paths"("user_id", "created_at");

CREATE UNIQUE INDEX "user_watch_path_items_path_id_position_key" ON "user_watch_path_items"("path_id", "position");

CREATE UNIQUE INDEX "user_watch_path_items_path_id_media_type_provider_provider_id_key" ON "user_watch_path_items"("path_id", "media_type", "provider", "provider_id");

CREATE INDEX "user_watch_path_items_path_id_idx" ON "user_watch_path_items"("path_id");

ALTER TABLE "user_watch_paths" ADD CONSTRAINT "user_watch_paths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_watch_path_items" ADD CONSTRAINT "user_watch_path_items_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "user_watch_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
