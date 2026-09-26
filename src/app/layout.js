
import Header from '@/components/Header';
import './globals.css';
import Footer from '@/components/Footer';


export const metadata = {
  title: 'PDF2JPG Pro',
  description: 'Convert PDF files to JPG images easily',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen flex flex-col justify-between">
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}