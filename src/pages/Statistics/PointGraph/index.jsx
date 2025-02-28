import React, { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Card, ModeButton, ButtonWrapper, Title, TitleWrapper } from './style';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import accessibility from 'highcharts/modules/accessibility';
import useSWR from 'swr';
import fetcher from 'utils/fetcher';
import { STAT_PREFIX_URL } from 'utils/constants';
import Tab from 'components/Tab';

accessibility(Highcharts);

/**
 * 사용자별 포인트 현황 그래프
 */
function PointGraph() {
  const modeList = [
    { key: 'daily', name: '일간' },
    { key: 'weekly', name: '주간' },
    { key: 'total', name: '전체' },
  ];
  const { data: statData } = useSWR(`${STAT_PREFIX_URL}/graph/point`, fetcher);
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({});
  const [mode, setMode] = useState(modeList[0].key);

  useEffect(() => {
    if (isEmpty(statData)) return;
    setSeries([
      {
        name: 'Point',
        data: statData.map((item) => item[`${mode}EarningPoint`] || 0),
        color: '#546ffa',
      },
      ,
    ]);
  }, [statData, mode]);

  useEffect(() => {
    if (isEmpty(series) || isEmpty(statData)) return;
    // "이름 이모지" 형식으로 카테고리 지정
    const users = statData.map((item) => `${item.notionId} ${item.emoji}`);
    setOptions({
      credits: {
        enabled: false, // 로고 비활성화
      },
      legend: {
        enabled: false,
      },
      chart: {
        type: 'column',
      },
      title: {
        text: '',
        align: 'left',
      },
      xAxis: {
        categories: users,
        labels: {
          formatter: function () {
            // 이모지만 라벨로 보여줌. 문자열을 공백 기준으로 스플릿 해서 맨 뒤 원소를 가져온다.
            return this.value.toString().split(' ').slice(-1)[0];
          },
          style: {
            fontSize: '17px', // 폰트 크기 설정
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        },
        minTickInterval: 1, // 최소 간격
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b> ',
        pointFormat: '<b>{point.y}</b> <b style="color:{series.color};">P</b>',
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: false, // 마우스 오버 시 효과 제거
            },
          },
        },
      },
      series: series,
    });
  }, [series, statData]);

  return (
    <Card>
      <TitleWrapper>
        <Title>포인트 현황</Title>
        <Tab>
          {modeList.map((m) => (
            <div
              className={`tab-item ${m.key === mode ? 'selected' : ''}`}
              key={m.key}
              onClick={() => {
                setMode(m.key);
              }}
            >
              {m.name}
            </div>
          ))}
        </Tab>
      </TitleWrapper>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
}

export default PointGraph;
