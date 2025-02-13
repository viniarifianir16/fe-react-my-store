import React, { useEffect, useState } from 'react';
import api, { getCsrfToken } from '../../api/axios';

interface Customer {
  id: number;
  kode: string;
  name: string;
  telp: string;
}

interface CustomerPopupProps {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

const CustomerPopup: React.FC<CustomerPopupProps> = ({ onSelect, onClose }) => {
  const [data, setData] = useState<Customer[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await getCsrfToken();
      const response = await api.get(`/api/customer`, {
        headers: {
          'X-XSRF-TOKEN': token,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="fixed z-9999 inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg w-1/2">
        <h2 className="text-lg font-bold mb-4">Pilih Customer</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Kode</th>
              <th className="border border-gray-300 p-2">Nama</th>
              <th className="border border-gray-300 p-2">Telepon</th>
              <th className="border border-gray-300 p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((data) => (
              <tr key={data.id} className="text-center">
                <td className="border border-gray-300 p-2">{data.kode}</td>
                <td className="border border-gray-300 p-2">{data.name}</td>
                <td className="border border-gray-300 p-2">{data.telp}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    onClick={() => onSelect(data)}
                  >
                    Pilih
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default CustomerPopup;
