import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <section className="flex items-center justify-center min-h-screen bg-white">
      <div>
        <SignIn />
      </div>
    </section>
  );
}
