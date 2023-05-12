/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { Form, Button, Input, Select } from 'antd';
import { MdArrowBackIos } from 'react-icons/md';
import Moment from 'moment';
import './NewBet.scss';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table/Table';
import { createBet, getBetType, openNotification } from '../../api/request';
import GlassLayout from '../../components/Layout/GlassLayout';
import io from 'socket.io-client';
import userContext from '../../context/userContext';

const NewBets = () => {
  const token = localStorage.getItem('socketToken');
  const { data } = useContext(userContext);
  console.log(data);
  const socket = io(
    `https://1a77-2405-8d40-4d00-937f-d567-4275-a572-35c2.ngrok-free.app?token=${token}`,
    { autoConnect: false },
  );
  const date = new Date();
  const nav = useNavigate();
  const formatDate = Moment(date).format('MMMM Do YYYY');
  const timeFormat = Moment(date).format('LTS');

  const [dataTable, setDataTabble] = useState([]);
  const [betTypeOptions, setBetTypeOptions] = useState([]);
  const [winAmount, setWinAmount] = useState();
  const [remainingBetAmount, setRemainingBetAmount] = useState();
  const [isBetLimit, setIsBetLimit] = useState(false);
  //------------
  const [betAmount, setBetAmount] = useState(0);
  const [betNumber, setBetNumber] = useState();
  const [formData, setFormData] = useState();
  //-------------
  const [betnumberRestrictionInput, setBetnumberRestrictionInput] = useState();
  const [limitbet, setLimitBet] = useState([]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Type',
        accessor: 'bet_type',
      },
      {
        Header: 'Number',
        accessor: 'bet_num', // accessor is the "key" in the data
      },
      {
        Header: 'Amount',
        accessor: 'bet_amt',
      },
      {
        Header: 'Win Amount',
        accessor: 'win_amt', // accessor is the "key" in the data
      },

      {
        Header: 'Action',
        accessor: 'action',
      },
    ],
    [],
  );
  const submitHandler = (value) => {
    let new_bet_number;
    new_bet_number = value.bet_num.toString();
    if (
      value.bet_num < 10 &&
      winAmount.bet_type === betTypeOptions[0].bet_type
    ) {
      new_bet_number = '0' + value.bet_num.toString();
    }
    if (
      value.bet_num < 10 &&
      winAmount.bet_type === betTypeOptions[1].bet_type
    ) {
      console.log('check');
      new_bet_number = '00' + value.bet_num.toString();
    }
    if (
      value.bet_num >= 10 &&
      value.bet_num < 100 &&
      winAmount.bet_type === betTypeOptions[1].bet_type
    ) {
      new_bet_number = '0' + value.bet_num.toString();
    }
    if (
      value.bet_num < 10 &&
      winAmount.bet_type === betTypeOptions[3].bet_type
    ) {
      new_bet_number = '000' + value.bet_num.toString();
    }
    if (
      value.bet_num >= 10 &&
      value.bet_num < 100 &&
      winAmount.bet_type === betTypeOptions[3].bet_type
    ) {
      new_bet_number = '00' + value.bet_num.toString();
    }
    if (
      value.bet_num >= 100 &&
      value.bet_num < 1000 &&
      winAmount.bet_type === betTypeOptions[4].bet_type
    ) {
      new_bet_number = '0' + value.bet_num.toString();
    }

    // console.log(new_bet_number);
    console.log(winAmount);
    const newdata = {
      id: Math.floor(Math.random() * 1000000),
      bet_amt: +value.bet_amt,
      bet_num: new_bet_number,
      bet_type: winAmount.bet_type,
      win_amt: winAmount.win_amt * value.bet_amt,
    };
    console.log(newdata);
    if (dataTable) {
      let test = dataTable;
      for (let x = 0; x <= test.length - 1; x++) {
        if (
          test[x].bet_num === newdata.bet_num &&
          test[x].bet_type === newdata.bet_type
        ) {
          test[x].bet_amt =
            parseInt(test[x].bet_amt) + parseInt(newdata.bet_amt);
          test[x].win_amt =
            parseInt(test[x].bet_amt) * parseInt(winAmount.win_amt);
          setDataTabble([...test]);
          return 0;
        }
      }
    }

    setDataTabble([...dataTable, newdata]);
  };

  const deleteHandler = (id) => {
    setDataTabble((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    console.log(dataTable);
  }, [dataTable]);

  const newDatable = React.useMemo(() => {
    const reconstructedList = dataTable.map((item) => {
      return {
        bet_amt: item.bet_amt,
        bet_num: item.bet_num,
        win_amt: item.win_amt,
        bet_type: item.bet_type,
        action: <button onClick={() => deleteHandler(item.id)}>delete</button>,
      };
    });
    return { data: reconstructedList };
  }, [dataTable]);

  const onTypeChange = (value) => {
    console.log(betTypeOptions);
    switch (value) {
      case betTypeOptions[0].bet_type:
        setBetnumberRestrictionInput(2);
        setWinAmount((prev) => {
          return {
            ...prev,
            bet_type: value,
            win_amt: betTypeOptions[0].win_multiplier,
            amt_const: betTypeOptions[0].amt_const,
          };
        });
        break;
      case betTypeOptions[1].bet_type:
        setBetnumberRestrictionInput(3);
        setWinAmount((prev) => {
          return {
            ...prev,
            bet_type: value,
            win_amt: betTypeOptions[1].win_multiplier,
            amt_const: betTypeOptions[1].amt_const,
          };
        });
        break;
      case betTypeOptions[2].bet_type:
        setBetnumberRestrictionInput(4);
        setWinAmount((prev) => {
          return {
            ...prev,
            bet_type: value,
            win_amt: betTypeOptions[3].win_multiplier,
            amt_const: betTypeOptions[3].amt_const,
          };
        });
        break;

      default:
        break;
    }
  };

  const validateMinimumAmount = (_, value, callback) => {
    if (value && value < 10) {
      callback('The minimum amount is 10.');
    } else {
      callback();
    }
  };

  const placeBetHandler = () => {
    console.log(dataTable);
    createBet(dataTable, betPlacedCallback);
  };

  const callback = async (res) => {
    console.log(res);
    const { data } = await res;
    setBetTypeOptions(data.betTypes);
  };

  const betPlacedCallback = async (res) => {
    console.log(res);
    const { status } = res;
    if (status === 201 || status === 200) {
      setDataTabble([]);
    }
    if (status === 400) {
      console.log('check');
      if (dataTable) {
        let test = dataTable;

        for (let value in limitbet) {
          let bet = value.split(':');

          for (let x = 0; x <= test.length - 1; x++) {
            if (
              test[x].bet_amt > limitbet[value].remaining_const &&
              test[x].bet_type === bet[0] &&
              test[x].bet_num === bet[1]
            ) {
              test.splice(x, 1);

              setDataTabble([...test]);
            }
          }
        }
      }
    }
  };

  const checklimit = (limitcheck) => {
    console.log(limitcheck);
    // console.log(limitbet);
    // console.log(winAmount);
    // console.log(betNumber);
    const newdata = `${winAmount?.bet_type}:${betNumber}`;
    console.log(newdata);
    console.log(limitbet);
    setIsBetLimit(limitbet[newdata]?.remaining_const < limitcheck);
    if (limitbet[newdata]?.remaining_const < limitcheck) {
      console.log(limitbet[newdata]?.remaining_const);
      setRemainingBetAmount(limitbet[newdata]?.remaining_const.toString());
    } else {
      setRemainingBetAmount('');
    }
    // socket.emit('watchlist:get', limitcheck);
  };

  useEffect(() => {
    getBetType(callback);
    socket.connect();
    socket.emit('watchlist:get', '');
  }, []);

  useEffect(() => {
    // console.log(limitbet);
    socket.connect();
    socket.on('watchlist:update', (data) => {
      // console.log('🚀 ~ file: NewBet.jsx:253 ~ socket.on ~ data:', data);
      setLimitBet(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [limitbet]);

  useEffect(() => {
    if (dataTable) {
      let test = dataTable;

      for (let value in limitbet) {
        let bet = value.split(':');

        for (let x = 0; x <= test.length - 1; x++) {
          if (
            test[x].bet_amt > limitbet[value].remaining_const &&
            test[x].bet_type === bet[0] &&
            test[x].bet_num === bet[1]
          ) {
            const title = `Bet Type: ${bet[0]}`;
            const message = `Bet Number: ${bet[1]} exceeded the remaining limit  `;
            openNotification(title, message);
            test.splice(x, 1);

            setDataTabble([...test]);
          }
        }
      }
    }
  }, [limitbet]);

  useEffect(() => {
    checklimit(betNumber);
  }, [betNumber, winAmount]);

  return (
    <GlassLayout>
      <div
        style={{ textAlign: 'left', marginLeft: '1rem' }}
        onClick={() => nav('/dashboard')}
      >
        <MdArrowBackIos size={25} />
      </div>
      <div className='newBet'>
        <h1 className='text-center'>New Bet</h1>
        <div className='mt-5'>
          <h6>{formatDate}</h6>
          <h6>{timeFormat}</h6>
        </div>
        <div className='container'>
          <Form
            className='betForm'
            onFinish={submitHandler}
            autoComplete='off'
            layout='vertical'
          >
            <Form.Item
              value={betNumber}
              className='form-group-custom'
              label='Bet Number'
              name='bet_num'
              rules={[
                {
                  required: true,
                  message: 'Please input your bet Number!',
                },
                {
                  max: betnumberRestrictionInput,
                  message: `Please enter bet number less or equal to ${betnumberRestrictionInput}`,
                },
              ]}
            >
              <Input
                value={betNumber}
                onChange={(e) => {
                  setBetNumber(e.target.value);
                }}
              />
            </Form.Item>

            <Form.Item
              name='bet_type'
              label='Bet Type'
              rules={[
                { required: true, message: 'Please select your bet type!' },
              ]}
            >
              <Select onChange={onTypeChange} allowClear>
                {betTypeOptions ? (
                  betTypeOptions.map((item) => (
                    <Select.Option key={item._id} value={item.bet_type}>
                      {item.type}
                    </Select.Option>
                  ))
                ) : (
                  <></>
                )}
                <Select.Option value='cut_off'>
                  Current Day Cut-off
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={`Bet Amount (remaining: ${
                remainingBetAmount
                  ? remainingBetAmount
                  : winAmount?.amt_const ?? 0
              })`}
              name='bet_amt'
              rules={[
                {
                  required: true,
                  message: 'Please input your bet Amount!',
                },
                {
                  validator: validateMinimumAmount,
                },
              ]}
            >
              <Input
                value={betAmount}
                disabled={winAmount && betNumber ? false : true}
                type='number'
                onChange={(e) => {
                  setBetAmount(e.target.value);
                  checklimit(e.target.value);
                }}
              />
            </Form.Item>

            <Button
              className='w-100'
              type='primary'
              htmlType='submit'
              disabled={isBetLimit}
            >
              SUBMIT
            </Button>
          </Form>

          <div style={{ height: '200px', overflowY: 'scroll' }}>
            <Table dataTable={newDatable} columns={columns} />
          </div>
        </div>
        <div className='mt-5 w-100 container'>
          <Button
            disabled={!dataTable.length > 0 ? true : false}
            className='w-100'
            onClick={placeBetHandler}
          >
            PLACE BET
          </Button>
        </div>
      </div>
    </GlassLayout>
  );
};

export default NewBets;
