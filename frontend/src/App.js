import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    data: null,
  };
  componentDidMount() {
    this.callBackendAPI()
      .then((res) => this.setState({ data: res }))
      .catch((err) => console.log(err));
  }
  callBackendAPI = async () => {
    const response = await fetch('/nutrients');
    const body = await response.json();
    console.log(body);

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };
  render() {
    return (
      <div className="App">
        <p className="App-intro">hi</p>
      </div>
    );
  }
}

export default App;
