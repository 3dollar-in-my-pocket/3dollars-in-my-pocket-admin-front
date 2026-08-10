import {useEffect, useMemo, useState} from "react";
import {useLocation} from "react-router-dom";
import {MenuGroup, MenuItem} from "@/constants/menu";

const STORAGE_KEY = "admin.recentMenuPaths";
const MAX_RECENT = 6;

const readPaths = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
};

const writePaths = (paths: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch {
    // 저장 실패는 무시 (사파리 프라이빗 모드 등)
  }
};

/**
 * 최근 방문한 메뉴를 LocalStorage에 기록하고, 접근 가능한 메뉴 항목으로 되돌려줍니다.
 * @param groups 역할 필터링이 끝난 메뉴 그룹 목록
 */
const useRecentMenus = (groups: MenuGroup[]): MenuItem[] => {
  const location = useLocation();
  const [paths, setPaths] = useState<string[]>(() => readPaths());

  const allItems = useMemo(() => groups.flatMap(group => group.items), [groups]);

  useEffect(() => {
    // 메뉴에 등록된 경로만 기록 (상세 페이지 등은 제외)
    if (!allItems.some(item => item.path === location.pathname)) {
      return;
    }

    setPaths(prev => {
      const next = [location.pathname, ...prev.filter(p => p !== location.pathname)].slice(0, MAX_RECENT);
      if (next.length === prev.length && next.every((p, i) => p === prev[i])) {
        return prev;
      }
      writePaths(next);
      return next;
    });
  }, [location.pathname, allItems]);

  return useMemo(
    () => paths.map(path => allItems.find(item => item.path === path)).filter((item): item is MenuItem => !!item),
    [paths, allItems]
  );
};

export default useRecentMenus;
