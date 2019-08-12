import React from 'react';

import Main from './main';

export default function App() {
  return (
    <>
      <Main />
      <div id="logging">
        <form
          action="https://docs.google.com/forms/d/e/1FAIpQLSfD_EjfFdGAEzCWO9TWN_jGvuaS79lPaYk3Hdzgz4VHnFTjew/formResponse"
          target="frame"
          method="POST"
          id="logging-form"
        >
          <textarea
            style={{ visibility: 'hidden' }}
            id="logging-data"
            name="entry.82571575"
          />
        </form>
        <iframe id="frame" name="frame" style={{ visibility: 'hidden' }} />
      </div>
    </>
  );
}
