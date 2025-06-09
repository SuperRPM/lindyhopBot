import { DataSource } from 'typeorm';
import { SwingInfo } from '../../entities/swing-info.entity';

export const swingInfoSeed = async (dataSource: DataSource) => {
  const swingInfoRepository = dataSource.getRepository(SwingInfo);

  const sampleData = [
    {
      teacher: "",
      dj: "꼬냥이",
      startTime: new Date("2025-06-08T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing"
    },
    {
      place: "Happy Hall",
      startTime: new Date("2025-06-13T19:00:00"),
      club: "Neo Swing"
    },
    {
      dj: "쓴귤",
      startTime: new Date("2025-06-15T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing"
    },
    {
      startTime: new Date("2025-06-20T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing"
    },
    {
      startTime: new Date("2025-06-27T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing"
    },
    {
      dj: "케이",
      startTime: new Date("2025-06-29T19:00:00"),
      place: "Happy Hall",
      club: "Neo Swing"
    },
    

  ];

  for (const data of sampleData) {
    const swingInfo = swingInfoRepository.create(data);
    await swingInfoRepository.save(swingInfo);
  }
}; 