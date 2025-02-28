import styled from '@emotion/styled';
import { CommonCard } from 'style/commonStyle';

export const Card = styled(CommonCard)`
  flex: 0 0 auto;
  padding: 20px 20px 20px 20px;
`;

export const ProblemTitle = styled.div`
  font-weight: bold;
  font-size: 1rem;
  & p {
    display: inline;
    margin-left: 5px;
  }
`;

export const ProblemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SolvedWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
`;

export const TagWrapper = styled.div`
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  border-radius: 50px;
  font-weight: normal;
  padding: 5px 8px;
  font-size: 0.8rem;
  border: none;
  background-color: var(--color-button-gray);
  margin: 0px 5px 5px 0px;
`;

export const ProblemNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: var(--color-text-gray);
  font-size: 0.95rem;
  > div {
    margin-bottom: 4px;
  }
`;
