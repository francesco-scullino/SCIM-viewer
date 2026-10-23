import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
export function NotFoundPage() { return <section><EmptyState title="Page not found" description="This page does not exist. Return to your identity workspace to continue." action={<Link to="/" className="button-link">Back to workspace</Link>} /></section>; }
