import { DataSource } from 'typeorm';
import { SwingInfo } from '../../entities/swing-info.entity';

export const swingInfoSeed = async (dataSource: DataSource) => {
  const swingInfoRepository = dataSource.getRepository(SwingInfo);

  // 기존 데이터 삭제
  console.log('Clearing existing swing info data...');
  await swingInfoRepository.clear();
  console.log('Existing data cleared');

  const sampleData = [
    {
      teacher: "",
      dj: "프리",
      startTime: new Date("2025-07-06T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "1 주차"
    },
    {
      place: "Happy Hall",
      startTime: new Date("2025-07-11T19:00:00"),
      club: "Neo Swing",
      generation: 134,
      etc: "네오스윙정모"
    },
    {
      startTime: new Date("2025-07-13T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "휴강"
    },
    {
      startTime: new Date("2025-07-18T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "네오스윙정모"
    },
    {
      startTime: new Date("2025-07-20T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "2 주차"
    },
    {
      startTime: new Date("2025-07-25T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "네오스윙정모"
    },
    {
      dj: "",
      startTime: new Date("2025-07-27T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "3 주차"
    },
    {
      startTime: new Date("2025-08-01T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "네오스윙정모"
    },
    {
      startTime: new Date("2025-08-03T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "4 주차"
    },
    {
      startTime: new Date("2025-08-08T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "네오스윙정모"
    },
    {
      startTime: new Date("2025-08-10T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "5 주차"
    },
    {
      startTime: new Date("2025-08-15T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "네오스윙정모"
    },
    {
      startTime: new Date("2025-08-17T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "6 주차"
    },
    {
      startTime: new Date("2025-08-22T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "네오스윙정모"
    },
    {
      startTime: new Date("2025-08-24T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing",
      generation: 134,
      etc: "134기 졸업공연"
    }
  ];

  console.log(`Inserting ${sampleData.length} new records...`);
  for (const data of sampleData) {
    const swingInfo = swingInfoRepository.create(data);
    await swingInfoRepository.save(swingInfo);
  }
  console.log('Seed data inserted successfully');
}; 