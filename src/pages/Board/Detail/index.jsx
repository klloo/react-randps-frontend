import React, { useCallback, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Title,
  Toolbar,
  Writer,
  CreateDate,
  Button,
  WriteInfo,
  Content,
  CommentWrapper,
  ProblemWrapper,
} from './style';
import CommentComponent from './CommentComponent';
import { Link, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { useNavigate } from 'react-router-dom';
import { deletePost } from 'api/board';
import { toast } from 'react-toastify';
import Write from '../Write';
import { writeType } from 'utils/board';
import { CommonProfileImage } from 'style/commonStyle';
import BoardProblemCard from '../BoardProblemCard';
import { getProblemInfo } from 'api/problem';
import { isEmpty } from 'lodash';
import useSWR from 'swr';
import { BRD_PREFIX_URL, USER_PREFIX_URL } from 'utils/constants';
import fetcher from 'utils/fetcher';
import BackButton from 'components/BackButton';
import PageTitle from 'components/PageTitle';
import Skeleton from 'react-loading-skeleton';

/**
 * 게시판 글 상세 컴포넌트
 */
function Detail() {
  const { id } = useParams();
  const { data: loginUser } = useSWR(
    `${USER_PREFIX_URL}/auth/parse/boj`,
    fetcher,
  );
  const { data: post, mutate: mutatePost } = useSWR(
    `${BRD_PREFIX_URL}/detail?boardId=${id}`,
    fetcher,
  );
  const navigate = useNavigate();
  const [writeMode, setWriteMode] = useState(false);
  const [problemInfo, setProblemInfo] = useState(false);
  const [hasProblem, setHasProblem] = useState(false);

  // 게시글에 문제 정보 있으면 가져오기
  useEffect(() => {
    if (!post) return;
    if (isEmpty(post)) {
      navigate('/board');
      return;
    }
    if (post.problemId) {
      getProblemInfo({ problemId: post.problemId.toString() })
        .then((res) => {
          if (res.status == 200) {
            if (res.data) {
              const { data } = res;
              setProblemInfo(data);
            }
          } else {
            toast.error('존재하지 않는 문제 입니다.');
            setProblemInfo({});
          }
        })
        .catch((e) => {
          toast.error('존재하지 않는 문제 입니다.');
          setProblemInfo({});
        });
    }
  }, [post]);

  useEffect(() => {
    setHasProblem(!isEmpty(problemInfo));
  }, [problemInfo]);

  // 글 삭제
  const onClickDeletePost = useCallback(() => {
    deletePost({ boardId: id })
      .then(() => {
        toast.success('글을 삭제했습니다.');
        navigate('/board');
      })
      .catch((e) => {
        toast.error('글을 삭제하지 못하였습니다.');
      });
  }, [id]);

  const closeWriteMode = useCallback(() => {
    mutatePost();
    setWriteMode(false);
  }, []);

  if (post && writeMode) {
    return (
      <Write
        mode={writeType.EDIT}
        type={post.type}
        closeWriteMode={closeWriteMode}
        post={post}
      />
    );
  }

  return (
    <>
      <div>
        <Title>
          <BackButton
            text="목록으로"
            onClick={() => {
              navigate(-1);
            }}
          />
          {post ? (
            <PageTitle title={post.title} />
          ) : (
            <Skeleton width="30%" height={30} />
          )}
        </Title>
        <Toolbar>
          <WriteInfo>
            <Link to={post ? `/my-page/${post.bojHandle}` : ''}>
              <Writer>
                {post ? (
                  <>
                    <CommonProfileImage
                      width={17}
                      height={17}
                      src={post.profileImg}
                    />
                    <div>
                      {post.notionId} {post.emoji}
                    </div>
                  </>
                ) : (
                  <>
                    <Skeleton circle width={17} height={17} />
                    <Skeleton width={50} />
                  </>
                )}
              </Writer>
            </Link>
            {post ? (
              <CreateDate>
                {dayjs(post.createdDate).format('YYYY. MM. DD. HH:mm')}
              </CreateDate>
            ) : (
              <Skeleton width={120} />
            )}
          </WriteInfo>
          <WriteInfo>
            {post && loginUser && loginUser.claim == post.bojHandle && (
              <>
                <Button
                  onClick={() => {
                    setWriteMode(true);
                  }}
                >
                  수정
                </Button>
                <Button onClick={onClickDeletePost}>삭제</Button>
              </>
            )}
          </WriteInfo>
        </Toolbar>
        {hasProblem && (
          <ProblemWrapper>
            <BoardProblemCard problem={problemInfo} />
          </ProblemWrapper>
        )}
        {post ? (
          <Content data-color-mode="light">
            <MDEditor.Markdown
              style={{
                padding: 10,
                backgroundColor: 'transparent',
              }}
              source={post.content}
              autoFocus={false}
            />
          </Content>
        ) : (
          <Content data-color-mode="light">
            <Skeleton width="100%" count={7} />
          </Content>
        )}

        <CommentWrapper>
          <CommentComponent boardId={id} />
        </CommentWrapper>
      </div>
    </>
  );
}

export default Detail;
