import React, { Component } from 'react';
import header from './assets/header.svg';
import benny from './assets/benny-and-food.svg';
import foodfriendLogo from './assets/foodfriend-type-logo.svg';
import bottomElipse from './assets/bottom-elipse.svg';
import banner from './assets/banner.svg';

class AboutUs extends Component {
  render() {
    const {media} = this.props;
    const styles = getStyles(media);
    return (
      <div style={styles.comingSoonPage}>
        <div style={styles.headerAndBennyContainer}>
          <div style={styles.header} />
          <img src={benny} style={styles.benny} alt={'benny-with-food'}/>
        </div>
        <div style={styles.logoContainer}>
          <div style={styles.line} />
          <img src={foodfriendLogo} style={styles.foodfriendLogo} alt={'foodfriend-logo'}/>
        </div>
        <div style={styles.elipseContainer}>
          <img src={bottomElipse} style={styles.elipse} alt={'bottom-elipse'}/>
          <div style={styles.orangeFiller} />
        </div>
      </div>
    );
  }
}

const getStyles = (media) => {
  const {windowHeight, normalizer, device} = media;
  let styles = {
    comingSoonPage: {
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      postion: 'relative',
    },
    headerAndBennyContainer: {
      display: 'flex',
      width: '100%',
      postion: 'relative',
      flexDirection: 'column',
    },
    header: {
      width: '100%',
      height: windowHeight / 2,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundImage: `url(${header})`,
      postion: 'absolute',
    },
    benny: {
      postion: 'absolute',
      height: undefined,
      aspectRatio: 604 / 418,
      alignSelf: 'center',
    },
    logoContainer: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // line: {
    //   borderBottomStyle: 'solid',
    //   borderWidth: .5,
    //   width: '100%',
    //   color: '#555555',
    //   postion: 'absolute',
    //   // alignSelf: 'center',
    // },
    foodfriendLogo: {
      postion: 'absolute',
      backgroundColor: '#ffffff',
      padding: 40 * normalizer,
      width: 200,
      height: undefined,
      // aspectRatio: width / height,
      aspectRatio: 201 / 37,
    },
    elipseContainer: {
      marginTop: 45 * normalizer,
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
      postion: 'absolute',
      bottom: 0,
      flex: '1 1 auto',
    },
    elipse: {
      width: '100%',
      postion: 'relative',
      bottom: 0,
      height: undefined,
      aspectRatio: 1440 / 193,
    },
    orangeFiller: {
      marginTop: -2,
      height: '100%',
      width: '100%',
      flex: '1 1 auto',
      backgroundColor: '#ffe3b8',
      position: 'relative',
    },
  };
  if (device === 'mobile') {
    styles.benny.width = 300;
    styles.benny.marginTop = - windowHeight/4.5;
  } else if (device === 'tablet') {
    styles.benny.width = 400;
    styles.benny.marginTop = - windowHeight/3;
  } else {
    styles.benny.width = 550;
    styles.benny.marginTop = - windowHeight/2.2;
    styles.foodfriendLogo.width = 300 * normalizer;
  }
  return styles;
}

export default AboutUs;
