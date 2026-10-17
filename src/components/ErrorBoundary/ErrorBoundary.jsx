import { Component } from "react";
import ErrorState from "../ErrorState/ErrorState.jsx";

// يمسك أخطاء العرض (render) في الصفحات ويمنع اختفاء الواجهة بالكامل
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unexpected UI error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <ErrorState
            title="Something went wrong"
            message="The page ran into an unexpected problem."
            onRetry={this.handleReset}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
