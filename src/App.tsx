import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignUp from './pages/Authentication/SignUp';
import ECommerce from './pages/Dashboard/ECommerce';
import Settings from './pages/Settings';
import DefaultLayout from './layout/DefaultLayout';
import Barang from './pages/Barang/Barang';
import BarangForm from './pages/Barang/BarangForm';
import Customer from './pages/Customer/Customer';
import CustomerForm from './pages/Customer/CustomerForm';
import Transaksi from './pages/Transaksi/Transaksi';
import Laporan from './pages/Laporan/Laporan';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="Sign In | My Store" />
              {/* <SignIn /> */}
              <ECommerce />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <PageTitle title="Sign Up | My Store" />
              <SignUp />
            </>
          }
        />

        <Route
          path="/dashboard"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Dashboard | My Store" />
              <ECommerce />
              {/* </AuthGuard> */}
            </>
          }
        />

        <Route
          path="/data/barang"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Barang | My Store" />
              <Barang barang={[]} />
              {/* </AuthGuard> */}
            </>
          }
        />
        <Route
          path="/data/barang-form"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Barang | My Store" />
              <BarangForm />
              {/* </AuthGuard> */}
            </>
          }
        />
        <Route
          path="/data/barang-form/:id"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Barang | My Store" />
              <BarangForm />
              {/* </AuthGuard> */}
            </>
          }
        />

        <Route
          path="/data/customer"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Customer | My Store" />
              <Customer customer={[]} />
              {/* </AuthGuard> */}
            </>
          }
        />
        <Route
          path="/data/customer-form"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Customer | My Store" />
              <CustomerForm />
              {/* </AuthGuard> */}
            </>
          }
        />
        <Route
          path="/data/customer-form/:id"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Customer | My Store" />
              <CustomerForm />
              {/* </AuthGuard> */}
            </>
          }
        />

        <Route
          path="/data/customer-form"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Customer | My Store" />
              <CustomerForm />
              {/* </AuthGuard> */}
            </>
          }
        />
        <Route
          path="/data/customer-form/:id"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Customer | My Store" />
              <CustomerForm />
              {/* </AuthGuard> */}
            </>
          }
        />

        <Route
          path="/transaksi"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Transaksi | My Store" />
              <Transaksi transaksi={[]} />
              {/* </AuthGuard> */}
            </>
          }
        />
        <Route
          path="/transasksi-form"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Transaksi | My Store" />
              <CustomerForm />
              {/* </AuthGuard> */}
            </>
          }
        />
        <Route
          path="/transaksi-form/:id"
          element={
            <>
              {/* <AuthGuard> */}
              <PageTitle title="Transaksi | My Store" />
              <CustomerForm />
              {/* </AuthGuard> */}
            </>
          }
        />

        <Route
          path="/laporan"
          element={
            <>
              <PageTitle title="Laporan | My Store" />
              <Laporan sales={[]} />
            </>
          }
        />

        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | My Store" />
              <Settings />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
