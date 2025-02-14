import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import api from '../../api/axios';

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kode, setKode] = useState('');
  const [name, setNama] = useState('');
  const [telp, setTelp] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setIsUpdateMode(true);
      fetchDataCustomer(id);
    }
  }, [id]);

  const fetchDataCustomer = async (customerID: string) => {
    try {
      const response = await api.get(`/api/customer/${customerID}`);
      const customereData = response.data;
      setKode(customereData.kode);
      setNama(customereData.name);
      setTelp(customereData.telp);
    } catch (error) {
      Swal.fire(
        'Error',
        (error as any).response?.data?.message ||
          'Failed to fetch customer data',
        'error',
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.post(`/api/customer`, {
        kode,
        name,
        telp,
      });
      Swal.fire('Success!', 'Customer created successfully', 'success');
      navigate('/data/customer');
    } catch (error) {
      setLoading(false);
      Swal.fire(
        'Error',
        (error as any).response?.data?.message ||
          'An error occurred. Please try again.',
        'error',
      );
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/api/customer/${id}`, {
        kode,
        name,
        telp,
      });
      Swal.fire('Success!', 'Customer updated successfully', 'success');
      navigate('/data/customer');
    } catch (error) {
      setLoading(false);
      Swal.fire(
        'Error',
        (error as any).response?.data?.message ||
          'An error occurred. Please try again.',
        'error',
      );
    }
  };

  return (
    <>
      <Breadcrumb pageName="Customer" />

      <div>
        <div className="flex flex-col gap-9">
          {/* <!-- Customer Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                {isUpdateMode ? 'Edit Customer' : 'Tambah Customer'}
              </h3>
            </div>
            <form onSubmit={isUpdateMode ? handleUpdate : handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Kode
                  </label>
                  <input
                    type="text"
                    id="kode"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="Masukkan kode customer"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Nama
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama customer"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Telepon
                  </label>
                  <input
                    type="number"
                    id="telp"
                    value={telp}
                    onChange={(e) => setTelp(e.target.value)}
                    placeholder="Masukkan nomor telepon"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

                <button
                  className={`w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  value={loading ? 'Loading...' : ''}
                  disabled={loading}
                >
                  {isUpdateMode ? 'Ubah Customer' : 'Simpan Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerForm;
