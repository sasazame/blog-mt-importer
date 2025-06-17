import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSummaryAndStars1734345600000 implements MigrationInterface {
  name = 'AddSummaryAndStars1734345600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'blog_posts',
      new TableColumn({
        name: 'summary',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'blog_posts',
      new TableColumn({
        name: 'recommendationStars',
        type: 'int',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('blog_posts', 'recommendationStars');
    await queryRunner.dropColumn('blog_posts', 'summary');
  }
}