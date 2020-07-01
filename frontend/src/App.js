import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';

class App extends Component {
  // state = {
  //   data: null,
  // };
  // componentDidMount() {
  //   this.callBackendAPI()
  //     .then((res) => this.setState({ data: res }))
  //     .catch((err) => console.log(err));
  // }
  // callBackendAPI = async () => {
  //   const response = await fetch('/nutrients');
  //   const body = await response.json();
  //   console.log(body);

  //   if (response.status !== 200) {
  //     throw Error(body.message);
  //   }
  //   return body;
  // };
  render() {
    return (
      <Router>
        <Route
          exact
          path="/passwordreset/:id/:token"
          render={() => {
            window.location = 'foodfriend://updatepassword/:id/:token';
          }}
        />
      </Router>
    );
  }
}

export default App;
