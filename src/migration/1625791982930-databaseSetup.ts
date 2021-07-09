import { MigrationInterface, QueryRunner } from 'typeorm';

export class databaseSetup1625791982930 implements MigrationInterface {
  name = 'databaseSetup1625791982930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying(20) NOT NULL, "name" character varying(20) NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))');
    await queryRunner.query("CREATE TYPE \"note_type_enum\" AS ENUM('LIST', 'TEXT')");
    await queryRunner.query('CREATE TABLE "note" ("id" SERIAL NOT NULL, "heading" character varying(50) NOT NULL, "isShared" boolean NOT NULL DEFAULT false, "type" "note_type_enum" NOT NULL, "folderId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TABLE "folder" ("id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_6278a41a706740c94c02e288df8" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TABLE "note_content_list" ("id" SERIAL NOT NULL, "items" text array NOT NULL, "noteId" integer, CONSTRAINT "REL_5295d19e6a90431230704cb814" UNIQUE ("noteId"), CONSTRAINT "PK_e4b24715d0492ddc571b681e062" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TABLE "note_content_text" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "noteId" integer, CONSTRAINT "REL_952ba14b7120b3f8497f9fda1d" UNIQUE ("noteId"), CONSTRAINT "PK_802b9da2576c63e1d1a7858159b" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "note" ADD CONSTRAINT "FK_b6251c885d0798284f754c55d2b" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "note" ADD CONSTRAINT "FK_5b87d9d19127bd5d92026017a7b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "folder" ADD CONSTRAINT "FK_a0ef64d088bc677d66b9231e90b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "note_content_list" ADD CONSTRAINT "FK_5295d19e6a90431230704cb814e" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "note_content_text" ADD CONSTRAINT "FK_952ba14b7120b3f8497f9fda1d9" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "note_content_text" DROP CONSTRAINT "FK_952ba14b7120b3f8497f9fda1d9"');
    await queryRunner.query('ALTER TABLE "note_content_list" DROP CONSTRAINT "FK_5295d19e6a90431230704cb814e"');
    await queryRunner.query('ALTER TABLE "folder" DROP CONSTRAINT "FK_a0ef64d088bc677d66b9231e90b"');
    await queryRunner.query('ALTER TABLE "note" DROP CONSTRAINT "FK_5b87d9d19127bd5d92026017a7b"');
    await queryRunner.query('ALTER TABLE "note" DROP CONSTRAINT "FK_b6251c885d0798284f754c55d2b"');
    await queryRunner.query('DROP TABLE "note_content_text"');
    await queryRunner.query('DROP TABLE "note_content_list"');
    await queryRunner.query('DROP TABLE "folder"');
    await queryRunner.query('DROP TABLE "note"');
    await queryRunner.query('DROP TYPE "note_type_enum"');
    await queryRunner.query('DROP TABLE "user"');
  }
}
