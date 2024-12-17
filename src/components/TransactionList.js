import React from "react"
import { Button, Table, Space, Tag, Popconfirm } from "antd"
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from "dayjs";

export default function TransactionList(props) {
  const columns = [
    { 
      title: "วันที่-เวลา", 
      dataIndex: "action_datetime", 
      key: "action_datetime",
      render: (text) => dayjs(text).format("DD/MM/YYYY - HH:mm")
    },
    { 
      title: "ประเภท", 
      dataIndex: "type", 
      key: "type", 
      render: (text) => (
        <Tag color={text === "income" ? 'green' : 'red'}>
          {text === "income" ? "รายรับ" : "รายจ่าย"}
        </Tag>
      ) 
    },
    { 
      title: "จำนวนเงิน", 
      dataIndex: "amount", 
      key: "amount",
      render: (text) => `${text.toLocaleString()} บาท`
    },
    { 
      title: "รายละเอียด", 
      dataIndex: "note", 
      key: "note",
      render: (text, record) => (
        <input 
          value={text || ''} 
          onChange={(e) => props.onNoteChanged(record.id, e.target.value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: "จัดการ", 
      key: "action", 
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => props.onEdit(record)}
          />
          <Popconfirm
            title="ลบรายการ"
            description="คุณต้องการลบรายการนี้ใช่หรือไม่?"
            onConfirm={() => props.onRowDeleted(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button 
              danger 
              type="primary" 
              shape="circle" 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={props.data}
      pagination={{ pageSize: 5 }}
    />
  );
}