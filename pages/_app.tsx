import { poppins } from "@/app/Assets/Fonts/localFonts.helper";
import AuthLayout from "@/app/AuthLayout";
import "@/app/Configs/i18n";
import i18n from "@/app/Configs/i18n";
import "@/app/globals.css";
import Layout from "@/app/Layout";
import store from "@/lib/store";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { inter, roboto_mono, nato } from "@/app/Assets/Fonts/nextFont.helper"; //* Örnek Next Font Kullanımı
import { Toaster } from "react-hot-toast";
export default function App({ Component, pageProps }: AppProps) {
  const authLayout = Component.displayName === "auth";
  // * Layout Sistemini Ayırmak İstiyorsanız Componentlerinize displayName Gönderin
  // * Örnek kullanım için pages/login.tsx bakın.
  const router = useRouter();
  const { locale } = router;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    i18n.initLanguage();
    setLoading(false);
  }, [locale]);

  if (loading) {
    return;
  }
  return (
    <Provider store={store}>
      <main className={poppins.className}>
        {!authLayout ? (
          <Layout>
            <Component {...pageProps} />
            <Toaster position='top-center' reverseOrder={false} />
          </Layout>
        ) : (
          <AuthLayout>
            <Component {...pageProps} />
            <Toaster position='top-center' reverseOrder={false} />
          </AuthLayout>
        )}
      </main>
    </Provider>
  );
}
