import React from "react";import Document, { Html, Main, NextScript } from 'next/document';

function MyDocument() {
  return (
    <Html>
      <Head>
        {/* Add your custom head elements here, e.g.: */}
        {/* <meta name="description" content="My awesome site" /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default MyDocument;
