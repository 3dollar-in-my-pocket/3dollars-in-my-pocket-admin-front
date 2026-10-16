import React, {useEffect, useState} from "react";
import storeCategoryApi from "@/api/storeCategoryApi";
import GroupedStatistics, {StatisticsGroup} from "./GroupedStatistics";

interface StoreByCategoryStatisticsProps {
  statisticsType: string;
  startDate: string;
  endDate: string;
  onFetch?: () => void;
}

/** 가게 카테고리(groupId=categoryId)별 통계 */
const StoreByCategoryStatistics: React.FC<StoreByCategoryStatisticsProps> = (props) => {
  const [categories, setCategories] = useState<StatisticsGroup[]>([]);

  useEffect(() => {
    const fetchStoreCategories = async () => {
      try {
        const response = await storeCategoryApi.getAllStoreCategories();
        if (response?.ok && response?.data?.contents) {
          setCategories(response.data.contents.map(c => ({id: c.categoryId, name: c.name})));
        }
      } catch (error) {
        console.error("카테고리 조회 실패:", error);
      }
    };
    fetchStoreCategories();
  }, []);

  return <GroupedStatistics {...props} groups={categories} groupLabel="가게 카테고리" unitLabel="가게 수"/>;
};

export default StoreByCategoryStatistics;
