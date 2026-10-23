import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/Feedback';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16">
      <EmptyState
        title="This page isn't on the map"
        hint="The link may be from an older version of the mapper. Search for what you need, or start from the overview."
        action={
          <Link to="/" className="btn btn-primary mt-2">
            Back to overview
          </Link>
        }
      />
    </div>
  );
}
