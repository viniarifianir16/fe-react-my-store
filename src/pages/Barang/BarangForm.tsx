import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import api from '../../api/axios';

const BarangForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setIsUpdateMode(true);
      fetchDataBarang(id);
    }
  }, [id]);

  const fetchDataBarang = async (barangID: string) => {
    try {
      const response = await api.get(`/api/barang/${barangID}`);
      const barangeData = response.data;
      setKode(barangeData.kode);
      setNama(barangeData.nama);
      setHarga(barangeData.harga);
    } catch (error) {
      Swal.fire(
        'Error',
        (error as any).response?.data?.message || 'Failed to fetch barang data',
        'error',
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.post(`/api/barang`, {
        kode,
        nama,
        harga,
      });
      Swal.fire('Success!', 'Barang created successfully', 'success');
      navigate('/data/barang');
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
      await api.put(`/api/barang/${id}`, {
        kode,
        nama,
        harga,
      });
      Swal.fire('Success!', 'Barang updated successfully', 'success');
      navigate('/data/barang');
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
      <Breadcrumb pageName="Barang" />

      <div>
        <div className="flex flex-col gap-9">
          {/* <!-- Barang Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                {isUpdateMode ? 'Edit Barang' : 'Tambah Barang'}
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
                    placeholder="Masukkan kode barang"
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
                    id="nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama barang"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Harga
                  </label>
                  <input
                    type="number"
                    id="harga"
                    value={harga.toLocaleString()}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="Masukkan nama barang"
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
                  {isUpdateMode ? 'Ubah Barang' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarangForm;
