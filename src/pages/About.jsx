import "./About.css";

function About() {
  return (
    <div className="container about-page">
      <h1 className="about-title">About Us</h1>

      <p className="about-intro">
        Welcome to our store. We bring you a curated selection of smartphones,
        laptops, audio gear, and accessories at fair prices.
      </p>

      <div className="about-grid">
        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            Make quality tech products easy to find, compare, and buy — with a
            simple, fast shopping experience.
          </p>
        </div>

        <div className="about-card">
          <h2>What We Offer</h2>
          <p>
            Products across many categories, with clear pricing and detailed
            product pages to help you choose.
          </p>
        </div>

        <div className="about-card">
          <h2>Why Choose Us</h2>
          <p>
            A simple checkout, a wishlist to save items for later, and full
            order history — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
