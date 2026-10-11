import clsx from "clsx";
import Loading from "@/components/common/Loading";

interface PageLoadingProps {
  /** 상단바 없이 화면 전체를 쓰는 상태(로그인 확인 전 등)면 true */
  fullHeight?: boolean;
}

/** 페이지 단위 로딩. 모바일에서도 보이는 화면의 가운데에 오도록 세로 중앙 정렬합니다. */
const PageLoading = ({fullHeight = false}: PageLoadingProps) => (
  <div className={clsx("page-loading", {"page-loading--full": fullHeight})}>
    <Loading/>
  </div>
);

export default PageLoading;
