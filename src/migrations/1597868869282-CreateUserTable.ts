import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateUserTable1597868869282 implements MigrationInterface {
	
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(new Table({
			name: 'users',
			columns: [
				{
					name: 'id',
					type: 'uuid',
					isPrimary: true,
					generationStrategy: 'uuid',
					default: 'uuid_generate_v4()',
				},
				{
					name: 'username',
					type: 'varchar',
					isUnique: true,
				},
				{
					name: 'location',
					type: 'geography',
					spatialFeatureType: 'Point',
					srid: 4326 
				}
			]
		}));
	}
	
	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('users');
	}
	
}
