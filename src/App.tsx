import React from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MessageSystem from './components/MessageSystem';

const App: React.FC = () => {
  return (
    <div className='bg-gray-300'>
      <div className="flex h-screen bg-gray-50">
        <div className="flex-grow flex bg-gray-100 flex-col">
          <Navbar />
          <div className='flex mt-[20px] bg-gray-100'>
            <Sidebar/>
            <MessageSystem/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
