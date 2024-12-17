import './App.css';
import TransactionList from "./components/TransactionList"
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Divider, Modal, Form, Input, Select } from 'antd';
import AddItem from './components/AddItem';
import { Spin, Typography } from 'antd';
import axios from 'axios'

const URL_TXACTIONS = '/api/txactions'

function FinanceScreen() {
  const [summaryAmount, setSummaryAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form] = Form.useForm();

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(URL_TXACTIONS, {
        params: {
          sort: ['createdAt:desc'], // เรียงตามวันที่สร้างจากใหม่ไปเก่า
          populate: '*' // ดึงข้อมูลทั้งหมด
        }
      });

      const formattedData = response.data.data.map(item => {
        const { id, attributes } = item;
        return {
          id,
          key: id,
          type: attributes.type,
          amount: attributes.amount,
          note: attributes.note || '',
          action_datetime: attributes.action_datetime
        };
      });

      console.log("Formatted Data:", formattedData); // ดูข้อมูลที่จะเซ็ตให้ state
      setTransactionData(formattedData);
    } catch (err) {
      console.log("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (item) => {
    try {
      setIsLoading(true)
      const params = { 
        ...item, 
        note: item.note || '',
        action_datetime: dayjs().format() // แปลงเป็น ISO string
      }
      const response = await axios.post(URL_TXACTIONS, { data: params })
      const { id, attributes } = response.data.data
      const newTransaction = {
        id,
        key: id,
        type: attributes.type,
        amount: attributes.amount,
        note: attributes.note || '',
        action_datetime: attributes.action_datetime
      };
      setTransactionData(prevData => [newTransaction, ...prevData]);
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (record) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      type: record.type,
      amount: record.amount,
      note: record.note
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);
      
      const response = await axios.put(`${URL_TXACTIONS}/${editingTransaction.id}`, {
        data: {
          ...values,
          action_datetime: editingTransaction.action_datetime
        }
      });

      // อัพเดทข้อมูลในตารางทันทีโดยไม่ต้อง fetch ใหม่
      setTransactionData(prevData => 
        prevData.map(item => {
          if (item.id === editingTransaction.id) {
            return {
              ...item,
              ...values
            };
          }
          return item;
        })
      );

      setEditingTransaction(null);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteChanged = async (id, note) => {
    try {
      await axios.put(`${URL_TXACTIONS}/${id}`, {
        data: { note }
      });
      
      setTransactionData(prevData =>
        prevData.map(transaction => {
          if (transaction.id === id) {
            return { ...transaction, note };
          }
          return transaction;
        })
      );
    } catch (err) {
      console.log(err);
    }
  }

  const handleRowDeleted = async (id) => {
    try {
      setIsLoading(true)
      await axios.delete(`${URL_TXACTIONS}/${id}`)
      setTransactionData(prevData => prevData.filter(item => item.id !== id));
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setSummaryAmount(transactionData.reduce(
      (sum, transaction) => (
        transaction.type === "income" ? sum + transaction.amount : sum - transaction.amount
      ), 0)
    )
  }, [transactionData])

  return (
    <div className="App">
      <header className="App-header">
        <Spin spinning={isLoading}>
          <Typography.Title>
            จำนวนเงินปัจจุบัน {summaryAmount} บาท
          </Typography.Title>

          <AddItem onItemAdded={handleAddItem} />
          <Divider>บันทึก รายรับ - รายจ่าย</Divider>
          <TransactionList
            data={transactionData}
            onNoteChanged={handleNoteChanged}
            onRowDeleted={handleRowDeleted}
            onEdit={handleEdit} />

          <Modal
            title="แก้ไขรายการ"
            open={!!editingTransaction}
            onOk={handleEditSubmit}
            onCancel={() => setEditingTransaction(null)}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="type"
                label="ประเภท"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="income">รายรับ</Select.Option>
                  <Select.Option value="expense">รายจ่าย</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="amount"
                label="จำนวนเงิน"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="note"
                label="รายละเอียด"
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </Spin>
      </header>
    </div>
  );
}

export default FinanceScreen;