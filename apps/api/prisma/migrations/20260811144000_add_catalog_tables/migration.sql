-- CreateTable
CREATE TABLE "shows" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "overview" TEXT NOT NULL,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "first_air_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "overview" TEXT NOT NULL,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "release_date" DATE,
    "runtime_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_identifiers" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_identifiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_identifiers_entity_type_provider_provider_id_key" ON "external_identifiers"("entity_type", "provider", "provider_id");

-- CreateIndex
CREATE INDEX "external_identifiers_entity_type_entity_id_idx" ON "external_identifiers"("entity_type", "entity_id");
