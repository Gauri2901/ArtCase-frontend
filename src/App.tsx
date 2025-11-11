import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />  {/*'index' means this is the default child route for the path "/" */}
        <Route path="gallery" element={<Gallery />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}

export default App;