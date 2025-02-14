import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { IoIosAdd } from 'react-icons/io';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

interface Customer {
  id: string | number;
  kode: string;
  name: string;
  telp: string | number;
}

const Customer = ({ customer }: { customer: Customer[] }) => {
  const [data, setData] = useState<Customer[]>(customer || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`/api/customer`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async (id: string | number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/customer/${id}`);
        setData(data.filter((item) => item.id !== id));
        Swal.fire('Deleted!', 'Customer has been deleted.', 'success');
      } catch (error) {
        Swal.fire(
          'Error',
          (error as any).response?.data?.message || 'Failed to delete customer',
          'error',
        );
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter data
  const filteredData = data.filter((item) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <>
      <Breadcrumb pageName="Customer" />

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Data Customer
            </h4>
            <Link
              to="/data/customer-form"
              className="inline-flex items-center gap-2.5 rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              <IoIosAdd />
              Tambah Customer
            </Link>
          </div>

          {/* Search Bar */}
          <div className="my-4">
            <input
              type="text"
              placeholder="Cari Customer..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white"
            />
          </div>

          {/* Table */}
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[60px] py-4 px-4 font-medium text-black dark:text-white">
                    No
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Kode
                  </th>
                  <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                    Nama
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Telepon
                  </th>
                  <th className="min-w-[100] py-4 px-4 font-medium text-black dark:text-white">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.kode}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.name}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.telp}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        <Link
                          to={`/data/customer-form/${item.id}`}
                          className="hover:text-primary"
                        >
                          <FaRegEdit />
                        </Link>
                        <button
                          className="hover:text-primary"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaRegTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-end gap-5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-md bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400 disabled:opacity-50 dark:bg-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Previous
            </button>
            <span className="text-sm  text-black dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="rounded-md bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400 disabled:opacity-50 dark:bg-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Customer;
