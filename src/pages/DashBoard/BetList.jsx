import React, { useEffect, useState } from 'react';
import './BetList.scss';
import Table from '../../components/Table/Table';
import { getBetList } from '../../api/request';

import TableThreeModal from '../../components/BetList/TableThreeModal';
import { Button, DatePicker } from 'antd';
import usePagination from '../../hooks/usePagination';
import TabletwoModal from '../../components/BetList/TabletwoModal';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const BetList = () => {
  dayjs.extend(customParseFormat);

  const nav = useNavigate();
  const [dataTable, setDataTabble] = useState([]);
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [trans_no, setTrans_no] = useState('');
  const [isTable2Open, setIsTable2Open] = useState(false);
  const [isTablethreeOpen, setIsTablethreeOpen] = useState(false);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Username',
        accessor: 'username', // accessor is the "key" in the data
      },
      {
        Header: 'Last Name',
        accessor: 'last_name', // accessor is the "key" in the data
      },
      {
        Header: 'First Name',
        accessor: 'first_name',
      },

      {
        Header: 'Total Bet Amount',
        accessor: 'total_bet_amt',
      },
      {
        Header: 'Action',
        accessor: 'action',
      },
    ],
    [],
  );

  const actionHandler = (id) => {
    setIsTable2Open(true);
    setUsername(id);
  };

  const actionHandlertwo = (trans_no) => {
    setIsTable2Open(false);
    setIsTablethreeOpen(true);
    setTrans_no(trans_no);
  };

  const dateFormat = 'YYYY-MM-DD';
  const currentDate = moment().format(dateFormat);

  const params = '1';

  const dateparams = `&createdAt=${currentDate}`;
  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    onChangeDate,
    callbackresponse,
  } = usePagination(params, dataTable, getBetList, null, dateparams);

  const handleColumnClick = (row) => {
    setData(row.original);
  };
  useEffect(() => {
    const { data } = callbackresponse;
    const reconstructedList = data?.map((data) => {
      return {
        first_name: data?.first_name,
        last_name: data?.first_name,
        total_bet_amt: data?.total_bet_amt,
        username: data?.user?.username,
        action: (
          <div className='text-center'>
            {' '}
            <Button onClick={() => actionHandler(data?.user?._id)}>
              View{' '}
            </Button>
          </div>
        ),
      };
    });
    const newdata = { ...callbackresponse, data: reconstructedList };
    setDataTabble(newdata);
  }, [callbackresponse]);
  useEffect(() => {
    console.log('c');
  }, []);
  return (
    <div className='betlistcontainer'>
      <div>
        {isTable2Open && (
          <TabletwoModal
            isTable2Open={isTable2Open}
            setIsTable2Open={setIsTable2Open}
            username={username}
            actionHandlertwo={actionHandlertwo}
            actioncall={getBetList}
            data={data}
            handleColumnClick={handleColumnClick}
          />
        )}
        {isTablethreeOpen && (
          <TableThreeModal
            actioncall={getBetList}
            isTablethreeOpen={isTablethreeOpen}
            setIsTablethreeOpen={setIsTablethreeOpen}
            setIsTable2Open={setIsTable2Open}
            trans_no={trans_no}
            data={data}
          />
        )}
        <h6 onClick={() => nav('/dashboard')}>Back</h6>
        <h1 className='text-center'>Transaction List</h1>
        <div>
          <h5 style={{ letterSpacing: '0.8px' }}>Filter:</h5>
          <DatePicker
            onChange={onChangeDate}
            defaultValue={dayjs(currentDate, dateFormat)}
            format={dateFormat}
          />
        </div>
        <Table
          dataTable={dataTable}
          columns={columns}
          onNext={onNext}
          onPrevious={onPrevious}
          onFirst={onFirst}
          onLast={onLast}
          isloading={isloading}
          handleColumnClick={handleColumnClick}
        />
      </div>
    </div>
  );
};

export default BetList;
