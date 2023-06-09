import React from 'react';
import { useTable } from 'react-table';
import './table.scss';
import { Button, Space, Spin } from 'antd';

import {
  TfiAngleLeft,
  TfiAngleRight,
  TfiAngleDoubleLeft,
  TfiAngleDoubleRight,
} from 'react-icons/tfi';

const Table = ({
  isloading,
  columns,
  dataTable,
  onNext,
  onFirst,
  onPrevious,
  onLast,
  handleColumnClick = undefined,
}) => {
  const { data: rawData, links, currentPage } = dataTable;
  const data = React.useMemo(() => {
    if (!rawData) {
      return [];
    }
    return rawData;
  }, [rawData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <>
      {' '}
      <table {...getTableProps()} className='table-container'>
        <thead>
          {headerGroups.map((headerGroup, id) => (
            <tr key={id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, idx) => (
                <th key={idx} {...column.getHeaderProps()}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {isloading ? (
            <tr className='text-center' style={{ height: '100px' }}>
              <td colSpan={columns.length}>
                <Spin tip='Table is Loading' size='large'>
                  <div className='content' />
                </Spin>
              </td>
            </tr>
          ) : (
            rows.map((row, id) => {
              prepareRow(row);
              return (
                <tr key={id} {...row.getRowProps()}>
                  {row.cells.map((cell, idx) => {
                    return (
                      <td
                        key={idx}
                        {...cell.getCellProps()}
                        style={{
                          padding: '10px',
                          border: 'solid 1px gray',
                          background: 'papayawhip',
                        }}
                        onClick={
                          handleColumnClick &&
                          (() => handleColumnClick(row, cell.column))
                        }
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <Space className='pagination mt-3'>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onFirst}
          disabled={links?.first === null}
        >
          <TfiAngleDoubleLeft size={18} />
        </Button>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onPrevious}
          disabled={links?.previous === null}
        >
          <TfiAngleLeft />
        </Button>
        <p
          style={{
            borderBottom: 'solid 1px gray',
            fontWeight: 'bold',
            alignSelf: 'center',
            margin: '0 0.8rem',
          }}
        >
          {currentPage}
        </p>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onNext}
          disabled={links?.next === null}
        >
          <TfiAngleRight />
        </Button>
        <Button
          className='buton-custom'
          type='primary'
          onClick={onLast}
          disabled={links?.last === null}
        >
          <TfiAngleDoubleRight size={18} />
        </Button>
      </Space>
    </>
  );
};

export default Table;
