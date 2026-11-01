import "./ProductList.css";

function ProductSliderLoading() {
  return (
    <div className="loading_SlideProduct container">
      <div className="loading_top_slide">
        <div
          className="skeltion"
          style={{ height: "24px", width: "200px", marginBottom: "8px" }}
        />
        <div
          className="skeltion"
          style={{ height: "14px", width: "300px" }}
        />
      </div>

      <div className="prodcuts_loading">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="product-skeleton">
            <div className="img_product_skeleton skeltion" />
            <div className="content_skeleton skeltion" />
            <div className="price_skeleton skeltion" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSliderLoading;
