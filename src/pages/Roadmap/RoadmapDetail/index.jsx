import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { ROADMAP_PREFIX_URL, USER_PREFIX_URL } from 'utils/constants';
import fetcher from 'utils/fetcher';
import {
  TopWrapper,
  TitleDiv,
  Container,
  ProgressBarWrapper,
  WeekWrapper,
  Week,
  ContentDiv,
  ProblemList,
} from './style';
import ProgressBar from 'components/ProgressBar';
import { isEmpty } from 'lodash';
import ProblemCard from './ProblemCard';
import { deleteRoadmap } from 'api/roadmap';
import { toast } from 'react-toastify';
import CreateRoadmapPopup from '../CreateRoadmapPopup';
import Skeleton from 'react-loading-skeleton';
import PageTitle from 'components/PageTitle';
import BackButton from 'components/BackButton';

/**
 * 로드맵 상세 페이지
 */
function RoadmapDetail() {
  const navigate = useNavigate();

  const { id } = useParams();

  const { data: roadmapInfo } = useSWR(
    `${ROADMAP_PREFIX_URL}/search/?roadmapId=${id}`,
    fetcher,
  );

  const { mutate: mutateRoadmapList } = useSWR(
    `${ROADMAP_PREFIX_URL}/search/all`,
    fetcher,
  );

  // 선택된 주차
  const [curWeek, setCurWeek] = useState(0);
  // 몆주차 까지 있는지 정보 TODO: 추후 api 수정 필요
  const [weekInfo, setWeekInfo] = useState([]);
  const { data: allProblems } = useSWR(
    `${ROADMAP_PREFIX_URL}/problem/search/all?roadmapId=${id}`,
    fetcher,
  );
  useEffect(() => {
    if (!allProblems) return;
    const weeks = [...new Set(allProblems.map((item) => item.week))].sort(
      (a, b) => a - b,
    );
    if (!isEmpty(weeks)) {
      setCurWeek(weeks[0]);
    }
    setWeekInfo(weeks);
  }, [allProblems]);

  // 해당 주차의 문제 목록
  const { data: problemList } = useSWR(
    curWeek !== 0
      ? `${ROADMAP_PREFIX_URL}/problem/search/weekly?roadmapId=${id}&week=${curWeek}`
      : null,
    fetcher,
  );

  // 사용자별 진행도 TODO: api 수정 필요
  const { data: loginUser } = useSWR(
    `${USER_PREFIX_URL}/auth/parse/boj`,
    fetcher,
  );
  const { data: progressInfo } = useSWR(
    loginUser
      ? `${ROADMAP_PREFIX_URL}/progress/user?bojHandle=${loginUser.claim}`
      : null,
    fetcher,
  );
  const [percentage, setPercentage] = useState(0);
  useEffect(() => {
    if (!progressInfo) return;
    const idx = progressInfo.findIndex(
      (item) => item.roadmapId === roadmapInfo?.id,
    );
    if (idx == -1) return;
    setPercentage(progressInfo[idx].progress);
  }, [progressInfo]);

  // 수정 삭제 버튼 보이기 여부
  const [hovering, setHovering] = useState(false);
  // 로드맵 삭제
  const deleteRoadmapProc = useCallback(() => {
    const isAgree = confirm('로드맵을 삭제하시겠습니까?');
    if (!isAgree) return;
    deleteRoadmap(id)
      .then(() => {
        toast.success('로드맵이 삭제되었습니다.');
        mutateRoadmapList();
        navigate('/roadmap');
      })
      .catch((e) => {
        conosle.error(e);
      });
  }, []);

  // 로드맵 수정
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  return (
    <Container>
      <BackButton
        text="목록으로"
        onClick={() => {
          navigate(-1);
        }}
      />
      <TopWrapper>
        <TitleDiv
          onMouseOver={() => setHovering(true)}
          onMouseOut={() => setHovering(false)}
        >
          {roadmapInfo ? (
            <PageTitle title={roadmapInfo.name} />
          ) : (
            <Skeleton height={25} width={200} />
          )}
          {hovering && (
            <div>
              <span
                onClick={() => {
                  setShowUpdatePopup(true);
                }}
              >
                수정
              </span>
              <span onClick={deleteRoadmapProc}>삭제</span>
            </div>
          )}
        </TitleDiv>
        <button
          onClick={() => {
            navigate(`/roadmap/problem/${id}`);
          }}
        >
          로드맵 편집
        </button>
      </TopWrapper>
      <ProgressBarWrapper>
        {percentage !== 0 && <ProgressBar percentage={percentage} />}
      </ProgressBarWrapper>
      <ContentDiv>
        <WeekWrapper>
          {weekInfo.map(
            (week) => (
              <Week
                key={week}
                selected={week === curWeek}
                onClick={() => {
                  setCurWeek(week);
                }}
              >
                {week}주
              </Week>
            ),
            [],
          )}
        </WeekWrapper>
        {problemList && (
          <ProblemList>
            {problemList.map((problem) => (
              <ProblemCard key={problem.problemId} problemInfo={problem} />
            ))}
          </ProblemList>
        )}
      </ContentDiv>
      {roadmapInfo && (
        <CreateRoadmapPopup
          show={showUpdatePopup}
          onClose={() => {
            setShowUpdatePopup(false);
          }}
          roadmapInfo={roadmapInfo}
        />
      )}
    </Container>
  );
}

export default RoadmapDetail;
