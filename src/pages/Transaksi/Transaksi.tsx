import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useState, useEffect, Key } from 'react';
import { IoIosAdd } from 'react-icons/io';
import Swal from 'sweetalert2';
import api from '../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerPopup from '../../components/Popup/CustomerPopup';
import BarangPopup from '../../components/Popup/BarangPopup';

interface BarangList {
  id: string | number;
  kode: string;
  nama: string;
  harga: number;
  qty: number;
  diskon_pct: number;
  diskon_nilai: number;
  harga_diskon: number;
  total: number;
}

const Transaksi = ({ transaksi }: { transaksi: BarangList[] }) => {
  const [data, setData] = useState<BarangList[]>(transaksi || []);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [kode_transaksi, setKodeTransaksi] = useState('');
  const [tgl, setTgl] = useState('');
  const [nama, setNama] = useState('');
  const [kodeCustomer, setKodeCustomer] = useState('');
  const [name, setName] = useState('');
  const [telp, setTelp] = useState('');
  const [ongkir, setOngkir] = useState('');
  const [diskon, setDiskon] = useState('');

  const [isPopupCustomerOpen, setIsPopupCustomerOpen] = useState(false);
  const [isPopupBarangOpen, setIsPopupBarangOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [barangList, setBarangList] = useState<Array<BarangList>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    kode: string;
    name: string;
    telp: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
    fetchDataLastSalesID();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`/api/barang`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSelectCustomer = (customer: {
    id: number;
    kode: string;
    name: string;
    telp: string;
  }) => {
    setKodeCustomer(customer.kode);
    setName(customer.name);
    setTelp(customer.telp);
    setSelectedCustomer(customer);
    setIsPopupCustomerOpen(false);
  };

  const handleSelectBarang = (barang: {
    id: number;
    kode: string;
    nama: string;
    harga: string;
  }) => {
    setBarangList((prevList) => [
      ...prevList,
      {
        ...barang,
        harga: Number(barang.harga),
        qty: 0,
        diskon_pct: 0,
        diskon_nilai: 0,
        harga_diskon: 0,
        total: 0,
      },
    ]);
    setIsPopupBarangOpen(false);
  };

  const handleChangeDiskon = (index: number, value: number) => {
    setBarangList((prev) =>
      prev.map((barang, i) =>
        i === index
          ? {
              ...barang,
              diskon_pct: value,
              diskon_nilai: (barang.harga * value) / 100,
              harga_diskon: barang.harga - (barang.harga * value) / 100,
              total: barang.qty * (barang.harga - (barang.harga * value) / 100),
            }
          : barang,
      ),
    );
  };

  const handleChangeQty = (index: number, value: number) => {
    setBarangList((prev) =>
      prev.map((barang, i) =>
        i === index
          ? {
              ...barang,
              qty: value,
              total: value * barang.harga_diskon,
            }
          : barang,
      ),
    );
  };

  const subtotal = barangList.reduce((sum, barang) => sum + barang.total, 0);
  const total_bayar = subtotal - Number(diskon) + Number(ongkir);

  const fetchDataLastSalesID = async () => {
    try {
      const response = await api.get(`/api/sales/last-sales-id`);
      return response.data.lastSalesID;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const lastId = await fetchDataLastSalesID();
      const newId = lastId + Number(1);

      const date = new Date();
      const yearMonth = date.toISOString().slice(0, 7).replace('-', '');
      const formattedNewId = String(newId).padStart(4, '0');

      const salesKode = {
        kode: `${yearMonth}-${formattedNewId}`,
      };

      if (!barangList.length) {
        console.error('BarangList kosong, tidak bisa menyimpan sales_det');
        throw new Error('Tidak ada barang yang dipilih untuk transaksi');
      }

      const salesData = {
        kode: salesKode.kode,
        tgl: new Date().toISOString(),
        cust_id: selectedCustomer ? selectedCustomer.id : null,
        subtotal: subtotal,
        diskon: diskon,
        ongkir: ongkir,
        total_bayar: total_bayar,
      };

      const salesResponse = await api.post('/api/sales', salesData);

      const sales_id = salesResponse.data.id;
      if (!sales_id) {
        console.error(
          'Gagal mendapatkan sales_id dari response:',
          salesResponse.data,
        );
        throw new Error('Gagal menyimpan transaksi, sales_id tidak ditemukan.');
      }

      const salesDetails = barangList.map((barang) => ({
        sales_id: sales_id,
        barang_id: barang.id,
        harga_bandrol: barang.harga,
        qty: barang.qty,
        diskon_pct: barang.diskon_pct,
        diskon_nilai: barang.diskon_nilai,
        harga_diskon: barang.harga_diskon,
        total: barang.total,
      }));

      for (const detail of salesDetails) {
        await api.post('/api/sales-det', detail);
      }
      setBarangList([]);
      setSelectedCustomer(null);
      setOngkir('');
      setDiskon('');
      setTgl('');
      setKodeCustomer('');
      setNama('');
      setTelp('');
      Swal.fire('Success!', 'Transaksi created successfully', 'success');
      navigate('/laporan');
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
        kode_transaksi,
        nama,
      });
      Swal.fire('Success!', 'Transaksi updated successfully', 'success');
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

  const handleDeleteBarang = (index: number) => {
    setBarangList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <Breadcrumb pageName={isUpdateMode ? 'Edit Transaksi' : 'Transaksi'} />

      <div className="flex flex-col gap-10">
        <form onSubmit={isUpdateMode ? handleUpdate : handleSubmit}>
          {/* Form Transaksi */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Transaksi
              </h3>
            </div>
            <div className="p-6.5">
              {isUpdateMode ? (
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    No Transaksi
                  </label>
                  <input
                    type="text"
                    id="kode"
                    value={kode_transaksi}
                    onChange={(e) => setKodeTransaksi(e.target.value)}
                    placeholder="Masukkan kode barang"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                    disabled
                  />
                </div>
              ) : (
                ''
              )}
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Tanggal
                </label>
                <input
                  type="date"
                  id="tgl"
                  value={tgl}
                  onChange={(e) => setTgl(e.target.value)}
                  placeholder="Masukkan nama barang"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Kode Customer
                </label>
                <input
                  type="text"
                  id="kode"
                  value={kodeCustomer}
                  onChange={(e) => setKodeCustomer(e.target.value)}
                  onClick={() => setIsPopupCustomerOpen(true)}
                  placeholder="Klik untuk memilih kode customer"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                  readOnly
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
                  disabled
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
                  disabled
                />
              </div>

              {isPopupCustomerOpen && (
                <CustomerPopup
                  onSelect={handleSelectCustomer}
                  onClose={() => setIsPopupCustomerOpen(false)}
                />
              )}
            </div>
          </div>
          {/* Form Transaksi */}

          {/* Tabel Barang */}
          <div className="rounded-sm mt-6 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-black dark:text-white">
                  Barang
                </h3>
                <button
                  onClick={() => setIsPopupBarangOpen(true)}
                  className="inline-flex items-center gap-2.5 rounded-md bg-primary py-2 px-4 text-sm text-center font-medium text-white hover:bg-opacity-90"
                >
                  <IoIosAdd />
                  Tambah Barang
                </button>
              </div>
            </div>

            {isPopupBarangOpen && (
              <BarangPopup
                onSelect={handleSelectBarang}
                onClose={() => setIsPopupBarangOpen(false)}
              />
            )}

            {/* <form onSubmit={isUpdateMode ? handleUpdate : handleSubmit}> */}
            <div className="p-6.5">
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari Barang..."
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
                      <th
                        className="min-w-20 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        No
                      </th>
                      <th
                        className="min-w-22 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        Kode
                      </th>
                      <th
                        className="min-w-40 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        Nama Barang
                      </th>
                      <th
                        className="min-w-30 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        Qty
                      </th>
                      <th
                        className="min-w-40 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        Harga Bandrol
                      </th>
                      <th
                        className="min-w-70 py-4 px-4 col-span-2 font-medium text-black dark:text-white text-center"
                        colSpan={2}
                      >
                        Diskon
                      </th>
                      <th
                        className="min-w-40 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        Harga Diskon
                      </th>
                      <th
                        className="min-w-40 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        Total
                      </th>
                      <th
                        className="min-w-25 py-4 px-4 font-medium text-black dark:text-white"
                        rowSpan={2}
                      >
                        Aksi
                      </th>
                    </tr>
                    <tr>
                      <th className="min-w-35 py-4 px-4 font-medium text-black dark:text-white">
                        Persen
                      </th>
                      <th className="min-w-35 py-4 px-4 font-medium text-black dark:text-white">
                        Rp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {barangList.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                          {index + 1}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.kode}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.nama}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            <input
                              type="number"
                              id="qty"
                              value={isNaN(item.qty) ? '' : item.qty}
                              onChange={(e) =>
                                handleChangeQty(index, parseInt(e.target.value))
                              }
                              placeholder="Masukkan kuantitas"
                              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              required
                            />
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.harga.toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <div className="flex items-center">
                            <div className="text-black dark:text-white">
                              <input
                                type="number"
                                id="diskon_pct"
                                value={
                                  isNaN(item.diskon_pct) ? '' : item.diskon_pct
                                }
                                onChange={(e) =>
                                  handleChangeDiskon(
                                    index,
                                    parseFloat(e.target.value),
                                  )
                                }
                                placeholder="Masukkan diskon"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                required
                              />
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.diskon_nilai.toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.diskon_nilai.toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {item.total.toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              className="hover:text-primary"
                              onClick={() => handleDeleteBarang(index)}
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
            </div>
          </div>
          {/* Tabel Barang */}

          {/* Form Transaksi */}
          <div className="rounded-sm mt-6 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Total</h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Sub Total
                </label>
                <input
                  type="text"
                  id="kode"
                  value={subtotal.toLocaleString()}
                  onChange={(e) => setKodeTransaksi(e.target.value)}
                  placeholder="Sub Total"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                  disabled
                />
              </div>
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Diskon
                </label>
                <input
                  type="number"
                  id="diskon"
                  value={diskon}
                  onChange={(e) => setDiskon(e.target.value)}
                  placeholder="Masukkan diskon"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Ongkir
                </label>
                <input
                  type="number"
                  id="ongkir"
                  value={ongkir}
                  onChange={(e) => setOngkir(e.target.value)}
                  placeholder="Masukkan ongkir"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">
                  Total Bayar
                </label>
                <input
                  type="text"
                  id="name"
                  value={total_bayar.toLocaleString()}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Total Bayar"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                  disabled
                />
              </div>
            </div>
          </div>
          {/* Form Transaksi */}

          <button
            className={`w-full mt-6 cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            value={loading ? 'Loading...' : ''}
            disabled={loading}
          >
            {isUpdateMode ? 'Update Transaksi' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Transaksi;
