import {useMemo} from "react";
import {MenuGroup, menuGroups} from "@/constants/menu";
import {useAuthStore} from "@/state/authStore";
import {filterMenuItemsByRole} from "@/utils/roleUtils";

/**
 * 현재 관리자의 역할에 따라 접근 가능한 메뉴 그룹만 반환합니다.
 * 항목이 하나도 없는 그룹은 제외됩니다.
 */
const useMenuGroups = (): MenuGroup[] => {
  const role = useAuthStore((state) => state.admin?.role);

  return useMemo<MenuGroup[]>(() => {
    if (!role) {
      // 역할 정보가 없으면 모든 메뉴 숨김
      return [];
    }

    return menuGroups
      .map(group => ({...group, items: filterMenuItemsByRole(group.items, role)}))
      .filter(group => group.items.length > 0);
  }, [role]);
};

export default useMenuGroups;
