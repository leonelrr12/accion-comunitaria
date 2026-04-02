-- DropIndex
DROP INDEX "communities_id_key";

-- DropIndex
DROP INDEX "corregimientos_id_key";

-- DropIndex
DROP INDEX "districts_id_key";

-- DropIndex
DROP INDEX "provinces_id_key";

-- AlterTable
CREATE SEQUENCE communities_id_seq;
ALTER TABLE "communities" ALTER COLUMN "id" SET DEFAULT nextval('communities_id_seq');
ALTER SEQUENCE communities_id_seq OWNED BY "communities"."id";

-- AlterTable
CREATE SEQUENCE corregimientos_id_seq;
ALTER TABLE "corregimientos" ALTER COLUMN "id" SET DEFAULT nextval('corregimientos_id_seq');
ALTER SEQUENCE corregimientos_id_seq OWNED BY "corregimientos"."id";

-- AlterTable
CREATE SEQUENCE districts_id_seq;
ALTER TABLE "districts" ALTER COLUMN "id" SET DEFAULT nextval('districts_id_seq');
ALTER SEQUENCE districts_id_seq OWNED BY "districts"."id";

-- AlterTable
CREATE SEQUENCE provinces_id_seq;
ALTER TABLE "provinces" ALTER COLUMN "id" SET DEFAULT nextval('provinces_id_seq');
ALTER SEQUENCE provinces_id_seq OWNED BY "provinces"."id";
