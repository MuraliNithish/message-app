import React from 'react';

interface Item {
  url: string;
  name: string;
  image: string;
}

const items: Item[] = [
  { url: '', name: 'Overview', image: '/assets/view.svg' },
  { url: '', name: 'Field Officer', image: '/assets/fs.svg' },
  { url: '', name: 'Farmer', image: '/assets/farmer.svg' },
  { url: '', name: 'Staff Management', image: '/assets/staff.svg' },
  { url: '', name: 'Reports', image: '/assets/report.svg' },
  { url: '', name: 'Crop Management', image: '/assets/crop.svg' },
  { url: '', name: 'Location Management', image: '/assets/loc.svg' },
  { url: '', name: 'Regulation', image: '/assets/reg.svg' },
  { url: '', name: 'Survey', image: '/assets/survey.svg' },
  { url: '', name: 'Message System', image: '/assets/msg.svg' }
];

const Sidebar: React.FC = () => {
  return (
    <div className="fixed top-28 left-0 bg-[#f6f6f8]  space-y-2 mt-5 z-40">
      {items.map(item => (
        <div key={item.name} className={`flex items-center text-gray-700 py-2 px-4 font-sans ${item.name === 'Message System' ? 'bg-green-600 text-white w-60 h-10' : ''}`}>
          <img
            className="w-5 h-5 mr-2"
            src={item.image}
            alt=""
          />
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
