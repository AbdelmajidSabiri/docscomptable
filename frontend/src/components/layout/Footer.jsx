const Footer = () => {
    const year = new Date().getFullYear();
    
    return (
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {year} DocsCompta. All rights reserved.</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;