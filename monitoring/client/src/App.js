import React, { Fragment } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';

const App = () => {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<Home />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  )
}

export default App;
