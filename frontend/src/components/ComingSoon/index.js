import React, { Component } from 'react';
import header from './assets/header.svg';
import benny from './assets/benny-and-food.svg';
import foodfriendLogo from './assets/foodfriend-type-logo.svg';
import banner from './assets/banner.svg';

class AboutUs extends Component {
  render() {
    const {media} = this.props;
    const styles = getStyles(media);
    return (
      <div style={styles.comingSoonPage}>
        <div style={styles.headerContainer}>
          <img src={header} style={styles.headerImg} alt={'header'}/>
          <div style={styles.headerColorBlock}/>
          <img src={benny} style={styles.benny} alt={'benny'}/>
        </div>
        <div style={styles.logoContainer}>
          <img src={foodfriendLogo} style={styles.logo} alt={'logo'} />
          <div style={styles.line} />
        </div>
        <div style={styles.bannerContainer}>
          <img src={banner} style={styles.banner} alt={'banner'} />
          <div style={styles.bannerTextContainer}>
            <div style={styles.h1} >Coming Soon</div>
            <div style={styles.h2} >contactmyfoodfriend@gmail.com</div>
          </div>
        </div>
      </div>
    );
  }
}

const getStyles = (media) => {
  const {windowHeight, windowWidth, normalizer, device} = media;
  let styles = {
    comingSoonPage: {
      width: windowWidth,
      minHeight: windowWidth / 3,
      height: windowHeight,
    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: windowWidth,  
      overflow: 'hidden',
      position: 'relative',
      // weird fix: for some reason this div has larger height than the sum of its children.
      maxHeight: windowHeight / 1.7,
    },
    headerImg: {
      width: 1440,
      position: 'relative',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 0,
    },
    benny: {
      position: 'absolute',
      alignSelf: 'center',
      marginTop: windowHeight / 10,
      zIndex: 2,
    },
    logoContainer: {
      display: 'flex',
      marginTop: windowHeight / 90,
      marginBottom: windowHeight / 8,
      position: 'relative',
      flexDirection: 'column',
      justifyContent: 'center',
      zIndex: 1,
    },
    line: {
      borderBottom: '0.01em solid #555555',
    },
    logo: {
      alignSelf: 'center', 
      padding: '2%',
      position: 'absolute',
      zIndex: 1,
      backgroundColor: '#ffffff',
    },
    bannerContainer: {
      display: 'flex',
      marginTop: '2em',
      width: '100%',
      flexDirection: 'column',
    },
    banner: {
      alignSelf: 'center',
      position: 'relative',
      zIndex: 0,
    },
    bannerTextContainer: {
      display: 'flex',
      position: 'absolute',
      zIndex: 1,
      marginTop: '.25em',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      flexDirection: 'column',
    },
    h1: {
      fontFamily: 'Cabin-Regular',
      color: '#555555',
    },
    h2: {
      fontFamily: 'Cabin-Regular',
      color: '#555555',
    },

  };
  // hide color block header by default
  styles.headerColorBlock = {
    height: 0,
    width: 0,
  };
  let bennyWidth = 400;
  if  (device === 'mobile') {
    bennyWidth = windowWidth - 10;
    styles.benny = {
      alignSelf: 'center',
      zIndex: 1,
      marginTop: - normalizer * 600,
    };
    // hide header image on mobile
    styles.headerImg = {
      height: 0,
      width: 0,
    };
    styles.headerColorBlock = {
      width: '100%',
      height: 1200 * normalizer,
      backgroundColor: '#ffd99f',
      zIndex: 0,
    };
    styles.logoContainer.marginTop = windowHeight / 20;
    styles.logoContainer.marginBottom = windowHeight / 10;
  } else if (device === 'tablet') {
    styles.logoContainer.marginTop = windowHeight / 90;
    styles.logoContainer.marginBottom = windowHeight / 10;
  } else if (device === 'desktop') {
    styles.logoContainer.marginTop = windowHeight / 90;
    styles.logoContainer.marginBottom = windowHeight / 9;
  } else if (windowWidth > 1440) {
    bennyWidth = 400 * normalizer;
  }
  styles.benny.width = bennyWidth;
  styles.logo.width = bennyWidth / 3;
  styles.banner.width = bennyWidth;
  styles.bannerTextContainer.width = bennyWidth;
  styles.h1.fontSize = bennyWidth / 20;
  styles.h2.fontSize = bennyWidth / 30;
  // make sure "FoodFriend" is not cut off when window height is reduced.
  if (styles.logoContainer.marginTop < 20) {
    styles.logoContainer.marginTop = 20;
  }

  return styles;
}

export default AboutUs;
