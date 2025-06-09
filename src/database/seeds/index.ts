import { DataSource } from 'typeorm';
import { SwingInfo } from '../../entities/swing-info.entity';
import { swingInfoSeed } from './swing-info.seed';

const dataSource = new DataSource({
  type: 'sqlite',
  database: 'swing.db',
  entities: [SwingInfo],
  synchronize: true,
});

const runSeed = async () => {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    await swingInfoSeed(dataSource);
    console.log('Seed completed successfully');

    await dataSource.destroy();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error during seed:', error);
    await dataSource.destroy();
  }
};

runSeed(); 