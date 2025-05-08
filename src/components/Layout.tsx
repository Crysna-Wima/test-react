import React from 'react';
import { Layout as AntLayout, Menu, theme } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, PlusOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Areas</Link>,
    },
    {
      key: '/add',
      icon: <PlusOutlined />,
      label: <Link to="/add">Add Area</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginRight: '30px' }}>
          Area Management
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div
          style={{
            padding: 24,
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            marginTop: 16,
          }}
        >
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Area Management System ©{new Date().getFullYear()}
      </Footer>
    </AntLayout>
  );
};

export default Layout;