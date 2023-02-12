import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'cf/styles/conversational-form.css';

import { Inter } from '@next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function App({ Component, pageProps }: AppProps) {

  return <>
    <main className={`${inter.variable} font-sans`}></main>
    <Component {...pageProps} />
  </>
}
