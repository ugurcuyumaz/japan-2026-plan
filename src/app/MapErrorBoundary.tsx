import { Component, type ReactNode } from 'react';
import { MapPin, RotateCcw } from 'lucide-react';

interface Props { children: ReactNode; onRetry: () => void }
interface State { failed: boolean }

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  render() {
    if (this.state.failed) return <div className="map-failure" role="alert">
      <MapPin size={22} />
      <strong>The map could not be displayed.</strong>
      <span>Your place list, details and directions are still available below.</span>
      <button type="button" onClick={this.props.onRetry}><RotateCcw size={14} /> Retry map</button>
    </div>;
    return this.props.children;
  }
}
