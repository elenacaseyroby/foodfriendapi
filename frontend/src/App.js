import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import AboutUs from './components/AboutUs';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: 0,
      device: '',
      normalizer: 1,
    };
    this.updateDimensions = this.updateDimensions.bind(this);
    this.calculateNormalizerCoeffient = this.calculateNormalizerCoeffient.bind(this);
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
  calculateNormalizerCoeffient = (currentWindowWidth) => {
    const defaultDevelopmentWindowWidth = 1280;
    const normalizer = currentWindowWidth / defaultDevelopmentWindowWidth;
    return normalizer;
  }
  updateDimensions = () => {
    let windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    let device = 'mobile';
    if (windowWidth > 400) {
      device = 'tablet';
    }
    if (windowWidth > 900) {
      device = 'desktop';
    }
    const normalizer = this.calculateNormalizerCoeffient(windowWidth);
    this.setState({ 
      windowWidth: windowWidth, 
      device: device,
      normalizer: normalizer,
     });
  }
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
    const {windowWidth, device, normalizer} = this.state;
    const media = {};
    media.windowWidth = windowWidth;
    media.device = device;
    media.normalizer = normalizer;
    return (
      <Router>
        <Route exact path="/" media={media} component={AboutUs} />
        <Route exact path="/about"  media={media} component={AboutUs} />
        {/*mobile password reset route:*/}
        <Route
          exact
          path="/passwordreset/:id/:token"
          render={({ match }) => {
            let { id, token } = match.params;
            window.location = `foodfriend://updatepassword/${id}/${token}`;
            return;
          }}
        />
      </Router>
    );
  }
}

export default App;
