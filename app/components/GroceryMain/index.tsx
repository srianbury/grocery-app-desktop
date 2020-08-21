import React, { useState, useEffect, useContext } from 'react';
import { AuthenticationContext } from '../Authentication';
import * as CONSTANTS from '../../constants';
import Spinner from '../Spinner';
import Error from '../Error';

const LENGTH_OF_UPC_CODE = 12;

const AppContainer = ({ children }) => (
  <div className="container">
    <div className="row">
      <div className="col-lg-10 offset-lg-1">{children}</div>
    </div>
  </div>
);

function App(): JSX.Element {
  const { user } = useContext(AuthenticationContext);
  const [state, setState] = useState({
    list: [],
    loading: true,
    error: null,
  });
  const [inputState, setInputState] = useState({
    input: '',
    error: null,
    loading: false,
  });

  async function read() {
    try {
      const response = await fetch(`${CONSTANTS.API_URL}/list`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.token,
        },
      });
      const result = await response.json();
      setState((prev) => ({
        ...prev,
        list: result.list,
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        error: 'Unable to load data! :(',
      }));
    } finally {
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }

  useEffect(() => {
    read();
  }, []);

  function handleRetry() {
    setState((prev) => ({
      ...prev,
      error: null,
      loading: true,
    }));
    // this was performing too quickly and I wanted to give the feel/visualization that
    // something was actually happending
    setTimeout(() => {
      read();
    }, 500)
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setInputState((prev) => ({
      ...prev,
      input: value,
    }));
    if (value.length === LENGTH_OF_UPC_CODE) {
      // need to pass in the value otherwise this function is called before the state is updated
      // and then we would've sent the wrong barcode
      handleAdd(value);
    }
  }

  async function handleAdd(upcCode) {
    setInputState(prev => ({
      ...prev,
      loading: true
    }))
    const response = await fetch(`${CONSTANTS.API_URL}/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token,
      },
      body: JSON.stringify({ upcCode }),
    });
    const result = await response.json();
    if (response.status === 200) {
      setState((prev) => ({
        ...prev,
        list: [result.item, ...prev.list],
      }));
      setInputState((prev) => ({
        ...prev,
        input: '',
        loading: false
      }));
    } else {
      setInputState((prev) => ({
        ...prev,
        error: result.message,
        input: '',
        loading: false
      }));
    }
  }

  async function handleRemoveItem(id, cb) {
    try {
      const response = await fetch(`${CONSTANTS.API_URL}/list/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user.token,
        },
      });
      await response.json();
      if (response.status !== 200) {
        throw Error('Unhandled Exception');
      }
      setState((prev) => ({
        ...prev,
        list: prev.list.filter((item) => item._id !== id),
      }));
    } catch (e) {
      cb();
    }
  }

  async function handleRemoveAll() {
    const response = await fetch(`${CONSTANTS.API_URL}/list`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token,
      },
    });
    if (response.status !== 200) {
      throw Error('Unhandled Exception');
    }
    setState((prev) => ({
      ...prev,
      list: [],
    }));
  }

  if (state.error) {
    return (
      <div>
        <Error message={state.error} />
        <div className='d-flex justify-content-center mt-2 mb-2'>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={handleRetry}
        >
          Retry
        </button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return(
      <div className="d-flex justify-content-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <h3>Grocery List</h3>
      <InputContainer {...inputState} handleInputChange={handleInputChange} />
      <ListView
        list={state.list}
        handleRemoveItem={handleRemoveItem}
        handleRemoveAll={handleRemoveAll}
      />
    </div>
  );
}

const InputContainer = ({ error, loading, input, handleInputChange }) => {
  if (loading) {
    return <div className='d-flex justify-content-center mt-2 mb-2'>
      <Spinner />
    </div>;
  }

  return (
    <div className="form-group">
      {error && <Error message={error} />}
      <label htmlFor="upcCode">UPC Code</label>
      <input
        autoFocus
        type="text"
        className="form-control form-control-lg"
        value={input}
        onChange={handleInputChange}
        placeholder="UPC Code"
      />
    </div>
  );
};

const ListView = ({ list, handleRemoveItem, handleRemoveAll }) => (
  <div>
    {list.length === 0 && <div>Your list is empty!</div>}
    <div className="card">
      <ul className="list-group list-group-flush">
        {list.map((item) => (
          <ListItemContainer
            key={item._id}
            id={item._id}
            name={item.name}
            handleRemoveItem={handleRemoveItem}
          />
        ))}
      </ul>
    </div>
    {list.length > 0 && <ClearList handleRemoveAll={handleRemoveAll} />}
  </div>
);

const ClearList = ({ handleRemoveAll }) => (
  <div className="d-flex justify-content-end mt-2">
    <button
      type="button"
      className="btn btn-sm btn-danger"
      onClick={handleRemoveAll}
    >
      Clear All
    </button>
  </div>
);

const ListItemContainer = ({ id, name, handleRemoveItem }) => {
  const [deleting, setDeleting] = useState(false);
  function handleRemove() {
    setDeleting(true);
    handleRemoveItem(id, () => setDeleting(false));
  }
  if (deleting) {
    return (
      <li className="list-group-item">
        <Spinner />
      </li>
    );
  }
  return <ListItemView id={id} name={name} handleRemoveItem={handleRemove} />;
};

const ListItemView = ({ id, name, handleRemoveItem }) => (
  <li className="list-group-item">
    <div className="d-flex justify-content-between">
      <div>{name}</div>
      <div className="d-flex align-items-center">
        <button
          type="button"
          className="btn btn-sm btn-danger"
          onClick={() => handleRemoveItem(id)}
        >
          <i className="far fa-trash-alt" />
        </button>
      </div>
    </div>
  </li>
);

export default () => (
  <AppContainer>
    <App />
  </AppContainer>
);
