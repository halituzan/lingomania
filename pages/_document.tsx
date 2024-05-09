// ** React Import

// ** Next Import
import Document, { Head, Html, Main, NextScript } from "next/document";

class CustomDocument extends Document {
  render() {
    return (
      <Html lang='tr'>
        <Head>
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/images/apple-touch-icon.png'
          />
          <link rel='shortcut icon' href='/images/favicon.ico' />
          <title>Clean Setup - Next.JS</title>
        </Head>
        <body>
          <Main />
          <NextScript />
          
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
