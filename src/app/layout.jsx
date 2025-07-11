import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../app/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}