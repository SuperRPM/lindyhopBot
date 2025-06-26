export class KakaoChatRequestDto {
  intent: {
    id: string;
    name: string;
  };
  userRequest: {
    timezone: string;
    params: {
      ignoreMe: string;
    };
    block: {
      id: string;
      name: string;
    };
    utterance: string;
    lang: string | null;
    user: {
      id: string;
      type: string;
      properties: Record<string, any>;
    };
  };
}

export class VoteDto {
  userId: string;
  venue: string;
  voteDate: Date;
} 