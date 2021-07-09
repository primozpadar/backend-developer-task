import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialData1625799231890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create users
    await queryRunner.query(`
    insert into "user" ("id", "name", "username", "password") values (1, 'celtra', 'celtrauser1', '$argon2i$v=19$m=4096,t=3,p=1$TzMLIJnjxm5c+adWR9jRuw$cPdxreBGfPhpavbwR+J5lgY+mtpQDKA3pOnM4Nk+3oA');
    insert into "user" ("id", "name", "username", "password") values (2, 'celtra', 'celtrauser2', '$argon2i$v=19$m=4096,t=3,p=1$fXwnGQR+IKqeKQ8mpr7zlQ$6OXX7GsJoHTVOCIRlKHazSCmFapi3hko7Jzf1gdXAkU');
    insert into "user" ("id", "name", "username", "password") values (3, 'celtra', 'celtrauser3', '$argon2i$v=19$m=4096,t=3,p=1$igb7nLDkDVIiwY8HP0G3YQ$B+e/rjy6DWI8HyWxKvTPS1Ga19t/3lrEi8Cn7Re+YoE');
    `);

    // create folders
    await queryRunner.query(`
    insert into "folder" ("id", "name", "userId") values (1, 'Clusiaceae', 2);
    insert into "folder" ("id", "name", "userId") values (2, 'Asteraceae', 1);
    insert into "folder" ("id", "name", "userId") values (3, 'Myrtaceae', 1);
    insert into "folder" ("id", "name", "userId") values (4, 'Poaceae', 1);
    insert into "folder" ("id", "name", "userId") values (5, 'Loasaceae', 2);
    insert into "folder" ("id", "name", "userId") values (6, 'Caryophyllaceae', 3);
    insert into "folder" ("id", "name", "userId") values (7, 'Scrophulariaceae', 3);
    insert into "folder" ("id", "name", "userId") values (8, 'Cactaceae', 3);
    insert into "folder" ("id", "name", "userId") values (9, 'Euphorbiaceae', 2);
    insert into "folder" ("id", "name", "userId") values (10, 'Crassulaceae', 3);
    insert into "folder" ("id", "name", "userId") values (11, 'Asclepiadaceae', 1);
    insert into "folder" ("id", "name", "userId") values (12, 'Malvaceae', 2);
    insert into "folder" ("id", "name", "userId") values (13, 'Myristicaceae', 3);
    insert into "folder" ("id", "name", "userId") values (14, 'Asteraceae', 3);
    insert into "folder" ("id", "name", "userId") values (15, 'Asteraceae', 3);
    insert into "folder" ("id", "name", "userId") values (16, 'Combretaceae', 3);
    insert into "folder" ("id", "name", "userId") values (17, 'Rubiaceae', 1);
    insert into "folder" ("id", "name", "userId") values (18, 'Chenopodiaceae', 2);
    insert into "folder" ("id", "name", "userId") values (19, 'Asteraceae', 2);
    insert into "folder" ("id", "name", "userId") values (20, 'Polytrichaceae', 3);
    `);

    // create notes
    await queryRunner.query(`
    -- NOTE LIST
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (1, 'LIST', 'primis', true, 6, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (2, 'LIST', 'abcid', true, 1, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (3, 'LIST', 'sit', true, 1, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (4, 'LIST', 'hac habitasse', true, 18, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (5, 'LIST', 'luctus', false, 14, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (6, 'LIST', 'risus', true, 12, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (7, 'LIST', 'mattis', false, 15, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (8, 'LIST', 'massa', true, 3, 1);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (9, 'LIST', 'ipsum praesent', false, 16, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (10, 'LIST', 'placerat', true, 19, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (11, 'LIST', 'aliquam', true, 2, 1);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (12, 'LIST', 'pellentesque volutpat', false, 5, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (13, 'LIST', 'rhoncus aliquet', false, 7, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (14, 'LIST', 'congue elementum', false, 7, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (15, 'LIST', 'nunc', false, 14, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (16, 'LIST', 'convallis', true, 16, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (17, 'LIST', 'molestie', true, 1, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (18, 'LIST', 'proin', true, 1, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (19, 'LIST', 'accumsan', false, 2, 1);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (20, 'LIST', 'integer', true, 13, 3);

    -- NOTE CONTENT LIST
    insert into "note_content_list" ("id", "noteId", "items") values (1, 1, '{"in", "tempor", "turpis", "nec", "euismod", "scelerisque", "quam", "turpis", "adipiscing",  "lorem", "vitae", "mattis", "nibh", "ligula", "nec", "sem", "duis", "aliquam"}');
    insert into "note_content_list" ("id", "noteId", "items") values (2, 2, '{"in", "tempor", "turpis", "nec", "euismod"}');
    insert into "note_content_list" ("id", "noteId", "items") values (3, 3, '{"ne tempor turpisc", "euismod", "scelerisque", "quam", "turpis", "adipiscing"}');
    insert into "note_content_list" ("id", "noteId", "items") values (4, 4, '{"quam", "nulla", "adipiscing",  "lorem", "vitae", "mattis", "nibh", "ligula", "nec"}');
    insert into "note_content_list" ("id", "noteId", "items") values (5, 5, '{"quam", "turpis", "adipiscing"}');
    insert into "note_content_list" ("id", "noteId", "items") values (6, 6, '{"lorem", "vitae", "mattis", "nibh", "ligula", "nec", "sem", "duis", "aliquam"}');
    insert into "note_content_list" ("id", "noteId", "items") values (7, 7, '{"turpis", "nec"}');
    insert into "note_content_list" ("id", "noteId", "items") values (8, 8, '{"nibh", "ligula", "nec"}');
    insert into "note_content_list" ("id", "noteId", "items") values (9, 9, '{"quis", "tortor", "in", "nulla", "ultrices", "odid"}');
    insert into "note_content_list" ("id", "noteId", "items") values (10, 10, '{"quis", "tortor", "ligula", "nulla"}');
    insert into "note_content_list" ("id", "noteId", "items") values (11, 11, '{"lorem", "vitae", "mattis", "nibh", "ligula", "nec"}');
    insert into "note_content_list" ("id", "noteId", "items") values (12, 12, '{"tortor", "euismod"}');
    insert into "note_content_list" ("id", "noteId", "items") values (13, 13, '{"tortor", "euismod"}');
    insert into "note_content_list" ("id", "noteId", "items") values (14, 14, '{"nulla", "euismod"}');
    insert into "note_content_list" ("id", "noteId", "items") values (15, 15, '{"tortor", "euismod"}');
    insert into "note_content_list" ("id", "noteId", "items") values (16, 16, '{"tortor", "in"}');
    insert into "note_content_list" ("id", "noteId", "items") values (17, 17, '{"tortor", "in"}');
    insert into "note_content_list" ("id", "noteId", "items") values (18, 18, '{"nulla", "ultrices", "odid"}');
    insert into "note_content_list" ("id", "noteId", "items") values (19, 19, '{}');
    insert into "note_content_list" ("id", "noteId", "items") values (20, 20, '{}');

    -- NOTE TEXT
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (21, 'TEXT', 'leo', false, 7, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (22, 'TEXT', 'etiam', true, 6, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (23, 'TEXT', 'erat tortor', true, 1, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (24, 'TEXT', 'imperdiet', false, 13, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (25, 'TEXT', 'tristique', false, 15, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (26, 'TEXT', 'posuere', false, 10, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (27, 'TEXT', 'amet turpis', true, 7, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (28, 'TEXT', 'elit sodales', false, 15, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (29, 'TEXT', 'pede morbi', true, 10, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (30, 'TEXT', 'imperdiet', true, 20, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (31, 'TEXT', 'ut', true, 3, 1);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (32, 'TEXT', 'euhlv', true, 19, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (33, 'TEXT', 'tellus', false, 15, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (34, 'TEXT', 'lacus', false, 11, 1);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (35, 'TEXT', 'nisl', true, 5, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (36, 'TEXT', 'posuere', true, 18, 2);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (37, 'TEXT', 'in sagittis', false, 8, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (38, 'TEXT', 'a odio', false, 4, 1);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (39, 'TEXT', 'mauris eget', false, 14, 3);
    insert into "note" ("id", "type", "heading", "isShared", "folderId", "userId") values (40, 'TEXT', 'ipsum', true, 12, 2);

    -- NOTE CONTENT TEXT
    insert into "note_content_text" ("id", "noteId", "body") values (1, 11, 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec pharetra, magna vestibulum aliquet ultrices, erat tortor sollicitudin mi, sit amet lobortis sapien sapien non mi. Integer ac neque. Duis bibendum. Morbi non quam nec dui luctus rutrum. Nulla tellus. In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus.');
    insert into "note_content_text" ("id", "noteId", "body") values (2, 12, 'Nulla neque libero, convallis eget, eleifend luctus, ultricies eu, nibh. Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.');
    insert into "note_content_text" ("id", "noteId", "body") values (3, 13, 'Vivamus tortor.');
    insert into "note_content_text" ("id", "noteId", "body") values (4, 14, 'Donec dapibus. Duis at velit eu est congue elementum. In hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo. Aliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis. Sed ante. Vivamus tortor.');
    insert into "note_content_text" ("id", "noteId", "body") values (5, 15, 'Maecenas rhoncus aliquam lacus. Morbi quis tortor id nulla ultrices aliquet. Maecenas leo odio, condimentum id, luctus nec, molestie sed, justo. Pellentesque viverra pede ac diam.');
    insert into "note_content_text" ("id", "noteId", "body") values (6, 16, 'Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus. Phasellus in felis. Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo.');
    insert into "note_content_text" ("id", "noteId", "body") values (7, 17, 'Morbi non quam nec dui luctus rutrum. Nulla tellus. In sagittis dui vel nisl. Duis ac nibh. Fusce lacus purus, aliquet at, feugiat non, pretium quis, lectus. Suspendisse potenti. In eleifend quam a odio. In hac habitasse platea dictumst.');
    insert into "note_content_text" ("id", "noteId", "body") values (8, 18, 'Aliquam erat volutpat. In congue. Etiam justo. Etiam pretium iaculis justo.');
    insert into "note_content_text" ("id", "noteId", "body") values (9, 19, 'Suspendisse potenti. Cras in purus eu magna vulputate luctus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus vestibulum sagittis sapien. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem. Praesent id massa id nisl venenatis lacinia. Aenean sit amet justo.');
    insert into "note_content_text" ("id", "noteId", "body") values (10, 20, 'Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo.');
    insert into "note_content_text" ("id", "noteId", "body") values (11, 21, 'In hac habitasse platea dictumst. Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat. Curabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.');
    insert into "note_content_text" ("id", "noteId", "body") values (12, 22, 'Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo.');
    insert into "note_content_text" ("id", "noteId", "body") values (13, 23, 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est.');
    insert into "note_content_text" ("id", "noteId", "body") values (14, 24, 'Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.');
    insert into "note_content_text" ("id", "noteId", "body") values (15, 25, 'Ut tellus. Nulla ut erat id mauris vulputate elementum.');
    insert into "note_content_text" ("id", "noteId", "body") values (16, 26, 'Vivamus metus arcu, adipiscing molestie, hendrerit at, vulputate vitae, nisl.');
    insert into "note_content_text" ("id", "noteId", "body") values (17, 27, 'Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.');
    insert into "note_content_text" ("id", "noteId", "body") values (18, 28, 'Donec semper sapien a libero. Nam dui. Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo.');
    insert into "note_content_text" ("id", "noteId", "body") values (19, 29, 'Sed accumsan felis. Ut at dolor quis odio consequat varius. Integer ac leo.');
    insert into "note_content_text" ("id", "noteId", "body") values (20, 30, 'Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis. Fusce posuere felis sed lacus. Morbi sem mauris, laoreet ut, rhoncus aliquet, pulvinar sed, nisl. Nunc rhoncus dui vel sem. Sed sagittis. Nam congue, risus semper porta volutpat, quam pede lobortis ligula, sit amet eleifend pede libero quis orci. Nullam molestie nibh in lectus.');
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
