
  function isValidEmail(email: any) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function generateToken(length = 32) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  function generateShortCode(length = 6) {
    return Math.random().toString(36).substring(2, 2 + length);
  }
  
  function isValidUrl(str: any) {
    try {
      new URL(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  export { isValidEmail, generateToken ,generateShortCode,isValidUrl};