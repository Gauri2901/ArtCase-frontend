import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Place <ScrollToTop /> as the first child inside your <BrowserRouter>
 * (or inside your root layout component).
 *
 * This guarantees every route change — gallery clicks, recommendations,
 * back/forward navigation — always opens at the very top of the page.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;