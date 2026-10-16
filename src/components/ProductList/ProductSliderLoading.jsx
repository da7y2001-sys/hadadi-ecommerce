import "./ProductList.css";

function ProductSliderLoading() {
  return (
    <div className="loading_SlideProduct">
      <div className="slide_products slide">
        <div className="container">
          <div className="top_slide">
            <h2
              className="skeltion"
              style={{
                background: "#eee",
                height: "35px",
                width: "250px",
                marginBottom: "10px",
              }}
            ></h2>
            <p
              className="skeltion"
              style={{ background: "#eee", height: "20px", width: "350px" }}
            ></p>
          </div>

          <div
            className="prodcuts_loading"
            style={{ display: "flex", gap: "20px", overflow: "hidden" }}
          >
            {/* نكرر الهيكل الوهمي 5 مرات */}
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="product"
                style={{
                  minWidth: "250px",
                  height: "350px",
                  background: "#fff",
                  border: "1px solid #eee",
                }}
              >
                <div
                  className="img_product skeltion"
                  style={{
                    height: "180px",
                    background: "#f5f5f5",
                    marginBottom: "20px",
                  }}
                ></div>
                <div
                  className="content skeltion"
                  style={{
                    height: "20px",
                    background: "#f5f5f5",
                    marginBottom: "10px",
                    margin: "0 15px",
                  }}
                ></div>
                <div
                  className="content skeltion"
                  style={{
                    height: "20px",
                    width: "50%",
                    background: "#f5f5f5",
                    margin: "0 15px",
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSliderLoading;
