export interface DailyStatistic {
  date: string;
  newCount: number;
  totalCount: number;
}

export interface DailyStatisticsResponse {
  ok: boolean;
  data: {
    contents: DailyStatistic[];
  };
}

export interface StatisticsType {
  key: string;
  description: string;
}
