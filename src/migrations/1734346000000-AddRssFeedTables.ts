import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddRssFeedTables1734346000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create rss_feeds table
    await queryRunner.createTable(
      new Table({
        name: 'rss_feeds',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'url',
            type: 'varchar',
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'category',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'mapping',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'lastSyncAt',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'importedCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastError',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create rss_import_logs table
    await queryRunner.createTable(
      new Table({
        name: 'rss_import_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'feedId',
            type: 'int',
          },
          {
            name: 'guid',
            type: 'varchar',
          },
          {
            name: 'title',
            type: 'text',
          },
          {
            name: 'publishedAt',
            type: 'datetime',
          },
          {
            name: 'blogPostId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'importedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['feedId'],
            referencedTableName: 'rss_feeds',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['blogPostId'],
            referencedTableName: 'blog_posts',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create unique index for feed + guid
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_FEED_GUID" ON "rss_import_logs" ("feedId", "guid")'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rss_import_logs');
    await queryRunner.dropTable('rss_feeds');
  }
}