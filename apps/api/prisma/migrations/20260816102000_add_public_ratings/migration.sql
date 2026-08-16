ALTER TABLE "shows" ADD COLUMN "public_rating" DOUBLE PRECISION;
ALTER TABLE "movies" ADD COLUMN "public_rating" DOUBLE PRECISION;

ALTER TABLE "shows"
  ADD CONSTRAINT "shows_public_rating_check"
  CHECK ("public_rating" IS NULL OR ("public_rating" >= 0 AND "public_rating" <= 10));

ALTER TABLE "movies"
  ADD CONSTRAINT "movies_public_rating_check"
  CHECK ("public_rating" IS NULL OR ("public_rating" >= 0 AND "public_rating" <= 10));
