import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConfigProvider } from 'antd';
import AreaList from './components/AreaList';
import AreaForm from './components/AreaForm';
import Layout from './components/Layout';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<AreaList />} />
              <Route path="/add" element={<AreaForm />} />
              <Route path="/edit/:id" element={<AreaForm />} />
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;