import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Value,
  LogWrapper,
  Log,
  LogMsg,
  TextWrapper,
  Date,
  TotalWarning,
  Warning,
  NoLog,
} from './style';
import { LOG_PREFIX_URL, WARNING_PAEG_SIZE } from 'utils/constants';
import useSWRInfinite from 'swr/infinite';
import fetcher from 'utils/fetcher';
import { useParams } from 'react-router-dom';
import useIntersect from 'hooks/useIntersect';

/**
 * 마이페이지 경고 현황 카드
 */
function WarningLog({ totalWarning }) {
  const [isEndPage, setIsEndPage] = useState(false);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const { bojHandle } = useParams();

  const getKey = useCallback(
    (page, previousPageData) => {
      if (previousPageData && !previousPageData.length) return null; // 끝에 도달
      return `${LOG_PREFIX_URL}/warning/user/page?bojHandle=${bojHandle}&page=${page}&size=${WARNING_PAEG_SIZE}`; // SWR 키
    },
    [bojHandle],
  );

  const {
    data: warningLogs,
    size,
    setSize,
    isLoading,
  } = useSWRInfinite(getKey, fetcher, { revalidateFirstPage: false });

  // 페이지 끝인지, 로딩 중인지 판별하는 변수 설정
  useEffect(() => {
    if (!warningLogs) return;
    const isLoadingMore =
      isLoading ||
      (size > 0 && warningLogs && typeof warningLogs[size - 1] === 'undefined');
    const isReachingEnd =
      warningLogs?.[0]?.length === 0 ||
      (warningLogs &&
        warningLogs[warningLogs.length - 1]?.length < WARNING_PAEG_SIZE);
    setIsLoadingLog(isLoadingMore);
    setIsEndPage(isReachingEnd);
  }, [warningLogs, size]);

  const changePage = () => {
    if (!isLoadingLog && !isEndPage) {
      setSize((prev) => prev + 1);
    }
  };
  const bottomRef = useIntersect(changePage);

  if (!warningLogs) return null;

  return (
    <div>
      <TotalWarning>
        <Warning />
        {totalWarning}
      </TotalWarning>
      <LogWrapper>
        {warningLogs[0].length === 0 && <NoLog>로그가 없습니다.</NoLog>}
        {warningLogs.map((logs) =>
          logs.map((log) => (
            <Log state={log.state} key={log.id}>
              <TextWrapper>
                <Date>{dayjs(log.createdDate).format('M월 D일')}</Date>
                <LogMsg>{log.description}</LogMsg>
              </TextWrapper>
              <Value plus={log.changedValue >= 0}>
                {log.changedValue >= 0 ? '+ ' : '- '}
                {Math.abs(log.changedValue)}
              </Value>
            </Log>
          )),
        )}
        <Log ref={bottomRef} />
      </LogWrapper>
    </div>
  );
}

export default WarningLog;
