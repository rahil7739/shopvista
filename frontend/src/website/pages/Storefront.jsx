import { Link } from "react-router-dom";
import useProducts from "../../shared/products/useProducts";
import "../styles/storefront.css";
import {
  FaArrowRight,
  FaBoxOpen,
  FaChartLine,
  FaCheck,
  FaCreditCard,
  FaQuoteLeft,
  FaShippingFast,
  FaStore,
} from "react-icons/fa";

const benefits = [
  {
    icon: FaStore,
    title: "Your store, your way",
    description: "Build a storefront that feels like your brand, without wrestling with complicated tools.",
  },
  {
    icon: FaCreditCard,
    title: "Checkout made simple",
    description: "Give customers a smooth path from their first click to a confident purchase.",
  },
  {
    icon: FaShippingFast,
    title: "Orders in one place",
    description: "Keep products, orders, and customer details organized as your business grows.",
  },
  {
    icon: FaChartLine,
    title: "Know what’s working",
    description: "See your store’s performance at a glance and make your next move with confidence.",
  },
];

const formatPrice = (price) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(Number(price));

const Storefront = () => {
  const { products, loading, error } = useProducts();
  const publishedProducts = products
    .filter((product) => product.published)
    .sort((left, right) => Number(right.featured) - Number(left.featured));

  return (
  <main className="marketing-site">
    <header className="marketing-header">
      <a className="marketing-brand" href="/" aria-label="Shopvista home">
        <img src="/logo.png" alt="Shopvista" />
      </a>
      <nav className="marketing-nav" aria-label="Main navigation">
        <a href="#benefits">Why Shopvista</a>
        <a href="#collection">Collection</a>
        <a href="#stories">Stories</a>
      </nav>
      <div className="marketing-header-actions">
        <Link className="marketing-login" to="/login">Sign in</Link>
        <Link className="marketing-button small" to="/admin/dashboard">Open dashboard <FaArrowRight /></Link>
      </div>
    </header>

    <section className="marketing-hero">
      <div className="marketing-hero-copy">
        <span className="marketing-kicker"><span /> THE NEW WAY TO SELL ONLINE</span>
        <h1>Good things<br />are <em>worth</em> finding.</h1>
        <p>Thoughtful products for everyday life, from independent makers and small brands we love.</p>
        <div className="marketing-hero-actions">
          <a className="marketing-button" href="#collection">Explore the collection <FaArrowRight /></a>
          <a className="marketing-text-link" href="#benefits">Discover our story</a>
        </div>
        <div className="marketing-proof">
          <div className="proof-avatars" aria-hidden="true"><span>J</span><span>A</span><span>M</span><span>+</span></div>
          <p><strong>Loved by 2,000+</strong><br />curious, conscious customers</p>
        </div>
      </div>

      <div className="marketing-hero-art" aria-label="A curated collection of home and lifestyle products">
        <div className="hero-art-glow" />
        <div className="hero-art-note"><span>THE SLOW<br />LIVING EDIT</span><span className="note-star">✳</span></div>
        <div className="hero-art-sun" />
        <div className="hero-object hero-vase"><span /></div>
        <div className="hero-object hero-book"><span>OBJECTS FOR<br />SLOWER DAYS</span></div>
        <div className="hero-object hero-cup"><span /></div>
        <div className="hero-art-caption"><span>01 / 03</span><span>Small finds, big feeling.</span></div>
      </div>
      <div className="hero-side-label">MADE TO BE KEPT — EST. 2024</div>
    </section>

    <div className="marketing-trust-strip">
      <span>MADE WITH INTENTION</span><i /><span>PACKED WITH CARE</span><i /><span>HERE FOR THE LONG RUN</span><i /><span>GOOD THINGS, ALWAYS</span>
    </div>

    <section className="marketing-collection" id="collection">
      <div className="marketing-section-heading">
        <div><p className="marketing-overline">A FEW OF OUR FAVORITES</p><h2>Everyday, <em>elevated.</em></h2></div>
        <a href="#benefits" className="marketing-text-link">Meet the collection <FaArrowRight /></a>
      </div>
      <div className="product-grid">
        {loading && <p className="storefront-product-message">Finding the good things...</p>}
        {publishedProducts.map((product, index) => (
          <article className="product-card" key={product.id}>
            <div className={`product-art product-art-${product.artStyle || "ceramic"}`}>
              <span className="product-number">{String(index + 1).padStart(2, "0")}</span>
              {product.imageUrl
                ? <img className="storefront-product-image" src={product.imageUrl} alt={product.name} />
                : <div className={`product-shape shape-${product.artStyle || "ceramic"}`} />}
              {product.featured && <span className="product-tag">FEATURED</span>}
            </div>
            <div className="product-details">
              <div><p>{product.category}</p><h3>{product.name}</h3>{product.description && <p className="product-description">{product.description}</p>}</div>
              <strong>{formatPrice(product.price)}</strong>
            </div>
          </article>
        ))}
      </div>
      {error
        ? <p className="storefront-product-error" role="alert">We couldn&apos;t load the collection right now. Please try again soon.</p>
        : !loading && publishedProducts.length === 0
        ? <div className="collection-empty"><FaBoxOpen /><p>Our next good find is on its way.</p></div>
        : !loading && <div className="collection-note"><FaBoxOpen /><span>New things, chosen carefully. <strong>More good finds arriving soon.</strong></span></div>}
    </section>

    <section className="marketing-benefits" id="benefits">
      <div className="benefits-intro">
        <p className="marketing-overline">A LITTLE MORE THOUGHTFUL</p>
        <h2>Better shopping<br />starts <em>with the details.</em></h2>
        <p>We believe the best online shopping feels easy, personal, and just a little bit special. That’s what we’re here for.</p>
        <Link className="marketing-text-link" to="/admin/dashboard">A peek behind the shop <FaArrowRight /></Link>
      </div>
      <div className="benefit-grid">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <article className="benefit-card" key={benefit.title}>
              <span className="benefit-index">0{index + 1}</span>
              <span className="benefit-icon"><Icon /></span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          );
        })}
      </div>
    </section>

    <section className="marketing-story" id="stories">
      <div className="story-art">
        <div className="story-art-shape"><FaStore /></div>
        <span className="story-art-caption">LESS, BUT BETTER.</span>
        <span className="story-art-stamp">GOOD<br />THINGS<br /><i>✳</i></span>
      </div>
      <div className="story-copy">
        <FaQuoteLeft className="quote-icon" />
        <p className="marketing-overline">A NOTE FROM OUR FOUNDER</p>
        <blockquote>“The things we bring into our lives should make us feel something. We made Shopvista to help you find more of those things.”</blockquote>
        <p className="story-signature">With care, <strong>The Shopvista team</strong></p>
        <div className="story-promises"><span><FaCheck /> Carefully chosen</span><span><FaCheck /> Made to last</span><span><FaCheck /> Always a good find</span></div>
      </div>
    </section>

    <section className="marketing-cta">
      <div><p className="marketing-overline">YOUR NEXT FAVORITE IS OUT THERE</p><h2>Make room for <em>good things.</em></h2><p>Browse the collection and find something you’ll love having around.</p></div>
      <a className="marketing-button light" href="#collection">Find your something <FaArrowRight /></a>
      <span className="cta-decoration">✳</span>
    </section>

    <footer className="marketing-footer">
      <a className="marketing-brand footer-brand" href="/" aria-label="Shopvista home"><img src="/logo.png" alt="Shopvista" /></a>
      <p>Good things, thoughtfully found.</p>
      <div><a href="#benefits">Our story</a><a href="#collection">The collection</a><Link to="/admin/dashboard">Store dashboard</Link></div>
      <small>© 2026 Shopvista. Made with care.</small>
    </footer>
  </main>
  );
};

export default Storefront;
