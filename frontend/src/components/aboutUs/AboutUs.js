import React, { Component } from 'react';
import { Logo } from '../common/logo/Logo';
import './AboutUs.css';

class AboutUs extends Component {
  render() {
    return (
      <div className="AboutUsPage">
        <div className="ContentContainer">
          <div className="LogoContainer">
            <Logo />
          </div>
          <div className="ComingSoonText">...coming soon!</div>
        </div>
      </div>
    );
  }
}

export default AboutUs;
