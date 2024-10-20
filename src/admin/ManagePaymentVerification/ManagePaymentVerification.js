import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Menu, Table, Popconfirm, message, Modal, Select, Button, Input, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { ShoppingCartOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import './ManagePaymentVerification.css'; // CSS สำหรับการจัดรูปแบบ

const { Header, Content, Footer } = Layout;
const { Option } = Select;
const { Search } = Input;

const ManagePaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('รอการตรวจสอบ');
  const [orderDetail, setOrderDetail] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/billing');
        setPayments(response.data.dataBilling);
      } catch (error) {
        console.error('Error fetching payments:', error);
        message.error('ไม่สามารถดึงข้อมูลการชำระเงินได้');
      }
    };
    fetchPayments();
  }, []);

  const handleDelete = (key) => {
    const newPayments = payments.filter(payment => payment.key !== key);
    setPayments(newPayments);
    message.success('ลบการแจ้งชำระเงินเรียบร้อยแล้ว');
  };

  const showSlipModal = (payment) => {
    setSelectedSlip(payment.img_bill);
    setEditingPayment(payment);
    setIsModalVisible(true);
    setSelectedStatus(payment.status);
    setOrderDetail(payment.orderDetail || []);
  };

  const handleConfirm = async () => {
    try {
      await axios.put(`http://localhost:3000/api/billing/${editingPayment.order_id}`, {
        status: selectedStatus
      });
      const updatedPayments = payments.map(payment => {
        if (payment.key === editingPayment.key) {
          return { ...payment, status: selectedStatus };
        }
        return payment;
      });
      setPayments(updatedPayments);
      message.success('อัปเดตสถานะการชำระเงินเรียบร้อยแล้ว');
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      message.error('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const handleEditCancel = () => {
    setIsModalVisible(false);
    setSelectedSlip(null);
    setEditingPayment(null);
    setSelectedStatus('รอการตรวจสอบ');
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Promotion',
      dataIndex: 'promotion_id',
      key: 'promotion_id',
    },
    {
      title: 'จำนวน',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'ราคารวม',
      dataIndex: 'total_price',
      key: 'total_price',
    },
    {
      title: 'สลิป',
      key: 'img_bill',
      render: (text, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showSlipModal(record)}
        />
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (text, record) => (
        <div>
          <Popconfirm
            title="คุณต้องการลบการแจ้งชำระเงินนี้หรือไม่?"
            onConfirm={() => handleDelete(record.key)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button type="link" style={{ marginLeft: '8px' }}>ลบ</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <Header className="header">
        <div className="menu-left">
          <Menu mode="horizontal" defaultSelectedKeys={['1']} className="menu-left">
            <Menu.Item key="1"><Link to="/Home">E-commerce</Link></Menu.Item>
          </Menu>
        </div>

        <div className="menu-center">
          <Menu mode="horizontal" className="menu-center">
            <Menu.Item><Link to="/admin/ManageProducts">จัดการสินค้า</Link></Menu.Item>
            <Menu.Item><Link to="/admin/ManageUsers">จัดการผู้ใช้งาน</Link></Menu.Item>
            <Menu.Item><Link to="/admin/ManagePromotion">จัดการโปรโมชั่น</Link></Menu.Item>
            <Menu.Item><Link to="/admin/ManagePaymentVerification">ตรวจสอบแจ้งชำระเงิน</Link></Menu.Item>
          </Menu>
        </div>

        <div className="menu-right">
          <Search placeholder="Search products" style={{ width: 200 }} />
          <ShoppingCartOutlined style={{ fontSize: '24px', color: 'black' }} />
          <UserOutlined style={{ fontSize: '24px', color: 'black', cursor: 'pointer' }} />
        </div>
      </Header>
      <Row justify="center">
        <Col span={20}>
          <Content style={{ padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>ตรวจสอบแจ้งชำระเงิน</h1>
            <Table columns={columns} dataSource={payments} pagination={false} />
          </Content>
        </Col>
      </Row>
      <Modal
        title="ตรวจสอบการชำระเงิน"
        visible={isModalVisible}
        onCancel={handleEditCancel}
        footer={null}
      >
        <img src={selectedSlip} alt="img_bill" style={{ width: '100%', height: 'auto', marginBottom: '16px' }} />
        
        {/* แสดงรายละเอียดใต้รูปภาพสลิป */}
        {orderDetail.length > 0 ? (
          <div>
            <h3>รายละเอียดการสั่งซื้อ</h3>
            {orderDetail.map((item, index) => (
              <div key={index}>
                <p><strong>รหัสสินค้า:</strong> {item.product_id}</p>
                <p><strong>จำนวน:</strong> {item.quantity}</p>
                <p><strong>ราคา:</strong> {item.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>ไม่พบข้อมูลรายการสั่งซื้อ</p>
        )}

        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          <Option value="ยืนยัน">ยืนยัน</Option>
          <Option value="ไม่ถูกต้อง">ไม่ถูกต้อง</Option>
          <Option value="รอการตรวจสอบ">รอการตรวจสอบ</Option>
        </Select>
        <Button type="primary" onClick={handleConfirm} style={{ marginRight: '8px' }}>ยืนยัน</Button>
        <Button type="default" onClick={handleEditCancel}>ยกเลิก</Button>
      </Modal>
      <Footer className="footer">
        <div className="footer-divider"></div>
        <div className="footer-section">
          <h2>เกี่ยวกับเรา</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="footer-section">
          <ul className="footer-menu">
            <li><Link to="/menu1">เมนู 1</Link></li>
            <li><Link to="/menu2">เมนู 2</Link></li>
            <li><Link to="/menu3">เมนู 3</Link></li>
            <li><Link to="/menu4">เมนู 4</Link></li>
            <li><Link to="/menu5">เมนู 5</Link></li>
            <li><Link to="/menu6">เมนู 6</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h2>ติดต่อเรา</h2>
          <p>โทร: 012-345-6789</p>
          <p>อีเมล: info@example.com</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default ManagePaymentVerification;
